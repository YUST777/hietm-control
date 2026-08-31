import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Pool, PoolClient } from 'pg'

const DB_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres.tuxsmmjbvutlzrpwgkbs:J6cLzUxvmOCtug%40X0@aws-0-eu-central-1.pooler.supabase.com:5432/postgres'

let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: DB_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 15000,
      connectionTimeoutMillis: 5000,
    })

    // Prevent uncaught exceptions on idle connection drops
    pool.on('error', (err) => {
      console.error('Unexpected pool client error:', err.message)
    })
  }
  return pool
}

// Sanitization & bounds helpers to prevent PostgreSQL data type and constraint aborts
function sanitizeText(val: unknown, maxLen = 250, defaultVal = ''): string {
  if (typeof val !== 'string') return defaultVal
  return val.trim().slice(0, maxLen)
}

function sanitizeNumber(val: unknown, min = 0, max = 100000, defaultVal = 0): number {
  const num = typeof val === 'number' ? val : parseFloat(String(val))
  if (isNaN(num) || !isFinite(num)) return defaultVal
  return Math.max(min, Math.min(max, num))
}

function sanitizeInteger(val: unknown, min = 1, max = 10000, defaultVal = 30): number {
  const num = typeof val === 'number' ? Math.floor(val) : parseInt(String(val), 10)
  if (isNaN(num) || !isFinite(num)) return defaultVal
  return Math.max(min, Math.min(max, num))
}

function sanitizeJsonArray(val: unknown, maxItems = 1000): any[] {
  if (!Array.isArray(val)) return []
  return val.slice(0, maxItems)
}

function sanitizeJsonObject(val: unknown): Record<string, any> {
  if (val && typeof val === 'object' && !Array.isArray(val)) {
    return val as Record<string, any>
  }
  return {}
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-Type, Authorization'
  )

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  let client: PoolClient | null = null
  let inTransaction = false
  let hasError = false

  try {
    const p = getPool()
    client = await p.connect()

    // Enforce statement timeout on the active session
    await client.query('SET statement_timeout = 8000;')

    // ----------------------------------------------------
    // GET: Pull all master data & settings
    // ----------------------------------------------------
    if (req.method === 'GET') {
      const [obsRes, subRes, comRes, schRes, ctrlRes, setRes] = await Promise.all([
        client.query('SELECT id, name, job, specialization, days, hours FROM public.observers ORDER BY id ASC;'),
        client.query('SELECT id, code, name, dept, year, semester, spec FROM public.subjects ORDER BY code ASC;'),
        client.query('SELECT id, room_num, hall_name, floor, capacity FROM public.committees ORDER BY room_num ASC;'),
        client.query('SELECT id, date, period, start_time, semester, academic_year, exam_type, reserves, rows FROM public.schedule_slots ORDER BY created_at DESC;'),
        client.query('SELECT subject_id, subject_name, dept, year, checklist FROM public.control_works;'),
        client.query('SELECT key, value FROM public.system_settings;'),
      ])

      const settingsMap: Record<string, any> = {}
      setRes.rows.forEach((row) => {
        settingsMap[row.key] = row.value
      })

      return res.status(200).json({
        success: true,
        data: {
          observers: obsRes.rows.map((o) => ({
            id: o.id,
            name: o.name,
            job: o.job,
            specialization: o.specialization,
            days: o.days || '',
            hours: typeof o.hours === 'number' ? o.hours : parseFloat(o.hours) || 0,
          })),
          subjects: subRes.rows.map((s) => ({
            id: s.id,
            code: s.code,
            name: s.name,
            dept: s.dept,
            year: s.year,
            semester: s.semester,
            spec: s.spec || '',
          })),
          committees: comRes.rows.map((c) => ({
            id: c.id,
            roomNum: c.room_num,
            hallName: c.hall_name,
            floor: c.floor,
            capacity: c.capacity || 30,
          })),
          schedules: schRes.rows.map((slot) => ({
            id: slot.id,
            date: slot.date,
            period: slot.period,
            startTime: slot.start_time,
            semester: slot.semester,
            academicYear: slot.academic_year,
            examType: slot.exam_type || 'تحريري',
            reserves: Array.isArray(slot.reserves) ? slot.reserves : [],
            rows: Array.isArray(slot.rows) ? slot.rows : [],
          })),
          attendance: settingsMap['attendance_records'] || [],
          controlWorks: ctrlRes.rows.map((c) => ({
            subjectId: c.subject_id,
            subjectName: c.subject_name,
            dept: c.dept,
            year: c.year,
            checklist: c.checklist || {},
          })),
          signatures: settingsMap['signatures'] || null,
          branding: settingsMap['branding'] || null,
          academicYears: settingsMap['academic_years'] || null,
          currentYear: settingsMap['current_year'] || null,
          periods: settingsMap['exam_periods'] || null,
          departments: settingsMap['academic_departments'] || null,
          jobTitles: settingsMap['job_titles'] || null,
          controlStages: settingsMap['control_stages'] || null,
          semesters: settingsMap['semesters'] || null,
          currentSemester: settingsMap['current_semester'] || null,
          studyLevels: settingsMap['study_levels'] || null,
          buildings: settingsMap['buildings'] || null,
          floors: settingsMap['floors'] || null,
          workDays: settingsMap['work_days'] || null,
          roleQuotas: settingsMap['role_quotas'] || null,
          printNotice: settingsMap['print_notice'] || null,
        },
        timestamp: new Date().toISOString(),
      })
    }

    // ----------------------------------------------------
    // POST: High-Performance Batch Sync
    // ----------------------------------------------------
    if (req.method === 'POST') {
      const payload = req.body
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return res.status(400).json({ success: false, error: 'Invalid or missing JSON payload' })
      }

      await client.query('BEGIN')
      inTransaction = true

      // 1. Batch Upsert Observers
      if (Array.isArray(payload.observers) && payload.observers.length > 0) {
        const sanitizedObs = payload.observers
          .filter((o: any) => o && typeof o.id === 'string' && o.id.trim().length > 0)
          .slice(0, 5000)
          .map((o: any) => ({
            id: sanitizeText(o.id, 100),
            name: sanitizeText(o.name, 200, 'بدون اسم'),
            job: sanitizeText(o.job, 100, 'عضو هيئة تدريس'),
            specialization: sanitizeText(o.specialization, 150),
            days: sanitizeText(o.days, 250),
            hours: sanitizeNumber(o.hours, 0, 1000, 0),
          }))

        if (sanitizedObs.length > 0) {
          await client.query(
            `INSERT INTO public.observers (id, name, job, specialization, days, hours, updated_at)
             SELECT id, name, job, specialization, COALESCE(days, ''), COALESCE(hours, 0), NOW()
             FROM jsonb_to_recordset($1::jsonb) AS x(id text, name text, job text, specialization text, days text, hours numeric)
             ON CONFLICT (id) DO UPDATE SET
               name = EXCLUDED.name,
               job = EXCLUDED.job,
               specialization = EXCLUDED.specialization,
               days = EXCLUDED.days,
               hours = EXCLUDED.hours,
               updated_at = NOW();`,
            [JSON.stringify(sanitizedObs)]
          )
        }
      }

      // 2. Batch Upsert Subjects
      if (Array.isArray(payload.subjects) && payload.subjects.length > 0) {
        const sanitizedSubs = payload.subjects
          .filter((s: any) => s && typeof s.id === 'string' && s.id.trim().length > 0)
          .slice(0, 5000)
          .map((s: any) => ({
            id: sanitizeText(s.id, 100),
            code: sanitizeText(s.code, 50, s.id),
            name: sanitizeText(s.name, 200, 'مقرر بدون اسم'),
            dept: sanitizeText(s.dept, 150, 'عام'),
            year: sanitizeText(s.year, 100, 'الفرقة الأولى'),
            semester: sanitizeText(s.semester, 100, 'الفصل الأول'),
            spec: sanitizeText(s.spec, 100),
          }))

        if (sanitizedSubs.length > 0) {
          await client.query(
            `INSERT INTO public.subjects (id, code, name, dept, year, semester, spec, updated_at)
             SELECT id, code, name, dept, year, semester, COALESCE(spec, ''), NOW()
             FROM jsonb_to_recordset($1::jsonb) AS x(id text, code text, name text, dept text, year text, semester text, spec text)
             ON CONFLICT (id) DO UPDATE SET
               code = EXCLUDED.code,
               name = EXCLUDED.name,
               dept = EXCLUDED.dept,
               year = EXCLUDED.year,
               semester = EXCLUDED.semester,
               spec = EXCLUDED.spec,
               updated_at = NOW();`,
            [JSON.stringify(sanitizedSubs)]
          )
        }
      }

      // 3. Batch Upsert Committees
      if (Array.isArray(payload.committees) && payload.committees.length > 0) {
        const sanitizedCommittees = payload.committees
          .filter((c: any) => c && typeof c.id === 'string' && c.id.trim().length > 0)
          .slice(0, 500)
          .map((c: any) => ({
            id: sanitizeText(c.id, 100),
            room_num: sanitizeText(c.roomNum || c.room_num, 50, '0'),
            hall_name: sanitizeText(c.hallName || c.hall_name, 150, 'قاعة'),
            floor: sanitizeText(c.floor, 100, 'الدور الأرضي'),
            capacity: sanitizeInteger(c.capacity, 1, 1000, 30),
          }))

        if (sanitizedCommittees.length > 0) {
          await client.query(
            `INSERT INTO public.committees (id, room_num, hall_name, floor, capacity, updated_at)
             SELECT id, room_num, hall_name, floor, COALESCE(capacity, 30), NOW()
             FROM jsonb_to_recordset($1::jsonb) AS x(id text, room_num text, hall_name text, floor text, capacity integer)
             ON CONFLICT (id) DO UPDATE SET
               room_num = EXCLUDED.room_num,
               hall_name = EXCLUDED.hall_name,
               floor = EXCLUDED.floor,
               capacity = EXCLUDED.capacity,
               updated_at = NOW();`,
            [JSON.stringify(sanitizedCommittees)]
          )
        }
      }

      // 4. Batch Upsert Schedule Slots
      if (Array.isArray(payload.schedules) && payload.schedules.length > 0) {
        const validSlots = payload.schedules
          .filter((s: any) => s && typeof s.id === 'string' && s.id.trim().length > 0)
          .slice(0, 1000)
          .map((s: any) => ({
            id: sanitizeText(s.id, 100),
            date: sanitizeText(s.date, 50),
            period: sanitizeText(s.period, 50),
            start_time: sanitizeText(s.startTime || s.start_time, 50),
            semester: sanitizeText(s.semester, 100),
            academic_year: sanitizeText(s.academicYear || s.academic_year, 100),
            exam_type: sanitizeText(s.examType || s.exam_type, 50, 'تحريري'),
            reserves: sanitizeJsonArray(s.reserves, 50),
            rows: sanitizeJsonArray(s.rows, 100),
          }))

        if (validSlots.length > 0) {
          await client.query(
            `INSERT INTO public.schedule_slots (id, date, period, start_time, semester, academic_year, exam_type, reserves, rows, updated_at)
             SELECT id, date, period, start_time, semester, academic_year, exam_type, reserves, rows, NOW()
             FROM jsonb_to_recordset($1::jsonb) AS x(id text, date text, period text, start_time text, semester text, academic_year text, exam_type text, reserves jsonb, rows jsonb)
             ON CONFLICT (id) DO UPDATE SET
               date = EXCLUDED.date,
               period = EXCLUDED.period,
               start_time = EXCLUDED.start_time,
               semester = EXCLUDED.semester,
               academic_year = EXCLUDED.academic_year,
               exam_type = EXCLUDED.exam_type,
               reserves = EXCLUDED.reserves,
               rows = EXCLUDED.rows,
               updated_at = NOW();`,
            [JSON.stringify(validSlots)]
          )
        }
      }

      // 5. Batch Upsert Control Works
      if (Array.isArray(payload.controlWorks) && payload.controlWorks.length > 0) {
        const mappedCW = payload.controlWorks
          .filter((cw: any) => {
            const sid = cw?.subjectId || cw?.subject_id
            return typeof sid === 'string' && sid.trim().length > 0
          })
          .slice(0, 2000)
          .map((cw: any) => ({
            subject_id: sanitizeText(cw.subjectId || cw.subject_id, 100),
            subject_name: sanitizeText(cw.subjectName || cw.subject_name, 200, 'مقرر'),
            dept: sanitizeText(cw.dept, 150),
            year: sanitizeText(cw.year, 100),
            checklist: sanitizeJsonObject(cw.checklist),
          }))

        if (mappedCW.length > 0) {
          await client.query(
            `INSERT INTO public.control_works (subject_id, subject_name, dept, year, checklist, updated_at)
             SELECT subject_id, subject_name, dept, year, checklist, NOW()
             FROM jsonb_to_recordset($1::jsonb) AS x(subject_id text, subject_name text, dept text, year text, checklist jsonb)
             ON CONFLICT (subject_id) DO UPDATE SET
               subject_name = EXCLUDED.subject_name,
               dept = EXCLUDED.dept,
               year = EXCLUDED.year,
               checklist = EXCLUDED.checklist,
               updated_at = NOW();`,
            [JSON.stringify(mappedCW)]
          )
        }
      }

      // 6. Batch Settings Upsert
      const allowedSettingKeys: Record<string, string> = {
        attendance: 'attendance_records',
        signatures: 'signatures',
        branding: 'branding',
        academicYears: 'academic_years',
        currentYear: 'current_year',
        periods: 'exam_periods',
        departments: 'academic_departments',
        jobTitles: 'job_titles',
        controlStages: 'control_stages',
        semesters: 'semesters',
        currentSemester: 'current_semester',
        studyLevels: 'study_levels',
        buildings: 'buildings',
        floors: 'floors',
        workDays: 'work_days',
        roleQuotas: 'role_quotas',
        printNotice: 'print_notice',
      }

      const settingsEntries: { key: string; value: any }[] = []
      for (const [payloadKey, dbKey] of Object.entries(allowedSettingKeys)) {
        if (payload[payloadKey] !== undefined) {
          settingsEntries.push({ key: dbKey, value: payload[payloadKey] })
        }
      }

      if (settingsEntries.length > 0) {
        await client.query(
          `INSERT INTO public.system_settings (key, value, updated_at)
           SELECT key, value, NOW()
           FROM jsonb_to_recordset($1::jsonb) AS x(key text, value jsonb)
           ON CONFLICT (key) DO UPDATE SET
             value = EXCLUDED.value,
             updated_at = NOW();`,
          [JSON.stringify(settingsEntries)]
        )
      }

      await client.query('COMMIT')
      inTransaction = false

      return res.status(200).json({
        success: true,
        message: 'All application data and master settings synced successfully',
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error: any) {
    hasError = true
    if (client && inTransaction) {
      try {
        await client.query('ROLLBACK')
      } catch {}
    }
    console.error('API Sync Error:', error?.message || 'Unknown database error')
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while synchronizing data.',
    })
  } finally {
    if (client) {
      client.release(hasError)
    }
  }
}
