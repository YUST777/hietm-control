import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Client } from 'pg'

const DB_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres.tuxsmmjbvutlzrpwgkbs:J6cLzUxvmOCtug%40X0@aws-0-eu-central-1.pooler.supabase.com:5432/postgres'

function getDbClient() {
  return new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const client = getDbClient()

  try {
    await client.connect()

    if (req.method === 'GET') {
      // 1. Fetch Observers
      const obsRes = await client.query('SELECT * FROM public.observers ORDER BY id ASC;')
      // 2. Fetch Subjects
      const subRes = await client.query('SELECT * FROM public.subjects ORDER BY code ASC;')
      // 3. Fetch Committees
      const comRes = await client.query('SELECT * FROM public.committees ORDER BY room_num ASC;')
      // 4. Fetch Schedules
      const schRes = await client.query('SELECT * FROM public.schedule_slots ORDER BY created_at DESC;')
      // 5. Fetch Control Works
      const ctrlRes = await client.query('SELECT * FROM public.control_works;')
      // 6. Fetch Settings
      const setRes = await client.query('SELECT * FROM public.system_settings;')

      const settingsMap: Record<string, any> = {}
      setRes.rows.forEach((row: any) => {
        settingsMap[row.key] = row.value
      })

      await client.end()

      return res.status(200).json({
        success: true,
        data: {
          observers: obsRes.rows.map((o: any) => ({
            id: o.id,
            name: o.name,
            job: o.job,
            specialization: o.specialization,
            days: o.days || '',
            hours: typeof o.hours === 'number' ? o.hours : parseFloat(o.hours) || 0,
          })),
          subjects: subRes.rows.map((s: any) => ({
            id: s.id,
            code: s.code,
            name: s.name,
            dept: s.dept,
            year: s.year,
            semester: s.semester,
            spec: s.spec || '',
          })),
          committees: comRes.rows.map((c: any) => ({
            id: c.id,
            roomNum: c.room_num,
            hallName: c.hall_name,
            floor: c.floor,
            capacity: c.capacity || 30,
          })),
          schedules: schRes.rows.map((slot: any) => ({
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
          controlWorks: ctrlRes.rows.map((c: any) => ({
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
        },
        timestamp: new Date().toISOString(),
      })
    }

    if (req.method === 'POST') {
      const payload = req.body || {}

      await client.query('BEGIN;')

      // 1. Sync Observers
      if (Array.isArray(payload.observers)) {
        for (const o of payload.observers) {
          await client.query(
            `INSERT INTO public.observers (id, name, job, specialization, days, hours, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())
             ON CONFLICT (id) DO UPDATE SET
               name = EXCLUDED.name,
               job = EXCLUDED.job,
               specialization = EXCLUDED.specialization,
               days = EXCLUDED.days,
               hours = EXCLUDED.hours,
               updated_at = NOW();`,
            [o.id, o.name, o.job, o.specialization, o.days || '', o.hours || 0]
          )
        }
      }

      // 2. Sync Subjects
      if (Array.isArray(payload.subjects)) {
        for (const s of payload.subjects) {
          await client.query(
            `INSERT INTO public.subjects (id, code, name, dept, year, semester, spec, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
             ON CONFLICT (id) DO UPDATE SET
               code = EXCLUDED.code,
               name = EXCLUDED.name,
               dept = EXCLUDED.dept,
               year = EXCLUDED.year,
               semester = EXCLUDED.semester,
               spec = EXCLUDED.spec,
               updated_at = NOW();`,
            [s.id, s.code, s.name, s.dept, s.year, s.semester, s.spec || '']
          )
        }
      }

      // 3. Sync Committees
      if (Array.isArray(payload.committees)) {
        for (const c of payload.committees) {
          await client.query(
            `INSERT INTO public.committees (id, room_num, hall_name, floor, capacity, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW())
             ON CONFLICT (id) DO UPDATE SET
               room_num = EXCLUDED.room_num,
               hall_name = EXCLUDED.hall_name,
               floor = EXCLUDED.floor,
               capacity = EXCLUDED.capacity,
               updated_at = NOW();`,
            [c.id, c.roomNum, c.hallName, c.floor, c.capacity || 30]
          )
        }
      }

      // 4. Sync Schedules
      if (Array.isArray(payload.schedules)) {
        for (const slot of payload.schedules) {
          if (!slot.id) continue
          await client.query(
            `INSERT INTO public.schedule_slots (id, date, period, start_time, semester, academic_year, exam_type, reserves, rows, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
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
            [
              slot.id,
              slot.date,
              slot.period,
              slot.startTime,
              slot.semester,
              slot.academicYear,
              slot.examType || 'تحريري',
              JSON.stringify(slot.reserves || []),
              JSON.stringify(slot.rows || []),
            ]
          )
        }
      }

      // 5. Sync Control Works
      if (Array.isArray(payload.controlWorks)) {
        for (const cw of payload.controlWorks) {
          await client.query(
            `INSERT INTO public.control_works (subject_id, subject_name, dept, year, checklist, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW())
             ON CONFLICT (subject_id) DO UPDATE SET
               subject_name = EXCLUDED.subject_name,
               dept = EXCLUDED.dept,
               year = EXCLUDED.year,
               checklist = EXCLUDED.checklist,
               updated_at = NOW();`,
            [cw.subjectId, cw.subjectName, cw.dept, cw.year, JSON.stringify(cw.checklist || {})]
          )
        }
      }

      // 6. Sync Signatures & Settings
      if (payload.signatures) {
        await client.query(
          `INSERT INTO public.system_settings (key, value, updated_at)
           VALUES ('signatures', $1, NOW())
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();`,
          [JSON.stringify(payload.signatures)]
        )
      }

      if (payload.branding) {
        await client.query(
          `INSERT INTO public.system_settings (key, value, updated_at)
           VALUES ('branding', $1, NOW())
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();`,
          [JSON.stringify(payload.branding)]
        )
      }

      if (payload.currentYear) {
        await client.query(
          `INSERT INTO public.system_settings (key, value, updated_at)
           VALUES ('current_year', $1, NOW())
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();`,
          [JSON.stringify(payload.currentYear)]
        )
      }

      await client.query('COMMIT;')
      await client.end()

      return res.status(200).json({
        success: true,
        message: 'Data synced successfully to cloud PostgreSQL',
        timestamp: new Date().toISOString(),
      })
    }

    await client.end()
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    try {
      await client.query('ROLLBACK;')
      await client.end()
    } catch {}
    console.error('API Sync Error:', error)
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' })
  }
}
