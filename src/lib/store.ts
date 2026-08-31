import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  Observer,
  Subject,
  Committee,
  ScheduleSlot,
  DailyAttendanceRecord,
  ControlWorkSubject,
  PrintSignatures,
} from '../types/control'
import {
  INITIAL_OBSERVERS,
  INITIAL_SUBJECTS,
  INITIAL_COMMITTEES,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_SIGNATURES,
} from './initialData'
import { getSupabaseClient, resetSupabaseClient } from './supabase'

const STORAGE_KEYS = {
  OBSERVERS: 'hietm_control_observers_v2',
  SUBJECTS: 'hietm_control_subjects_v2',
  COMMITTEES: 'hietm_control_committees_v2',
  SCHEDULES: 'hietm_control_schedules_v2',
  ATTENDANCE: 'hietm_control_attendance_v2',
  CONTROL_WORKS: 'hietm_control_works_v2',
  SIGNATURES: 'hietm_control_signatures_v2',
  CURRENT_YEAR: 'hietm_control_year_v2',
}

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error(`Failed to load ${key}`, e)
  }
  return fallback
}

function saveLocal<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(`Failed to save ${key}`, e)
  }
}

export type ConnectionStatus = 'connected' | 'connecting' | 'local_only' | 'error'

export function useControlStore() {
  const [observers, setObservers] = useState<Observer[]>(() =>
    loadLocal(STORAGE_KEYS.OBSERVERS, [...INITIAL_OBSERVERS])
  )
  const [subjects, setSubjects] = useState<Subject[]>(() =>
    loadLocal(STORAGE_KEYS.SUBJECTS, [...INITIAL_SUBJECTS])
  )
  const [committees, setCommittees] = useState<Committee[]>(() =>
    loadLocal(STORAGE_KEYS.COMMITTEES, [...INITIAL_COMMITTEES])
  )
  const [schedules, setSchedules] = useState<ScheduleSlot[]>(() =>
    loadLocal(STORAGE_KEYS.SCHEDULES, [])
  )
  const [attendance, setAttendance] = useState<DailyAttendanceRecord[]>(() =>
    loadLocal(STORAGE_KEYS.ATTENDANCE, [])
  )
  const [controlWorks, setControlWorks] = useState<ControlWorkSubject[]>(() =>
    loadLocal(STORAGE_KEYS.CONTROL_WORKS, [])
  )
  const [signatures, setSignatures] = useState<PrintSignatures>(() =>
    loadLocal(STORAGE_KEYS.SIGNATURES, { ...INITIAL_SIGNATURES })
  )
  const [academicYears, setAcademicYears] = useState<string[]>([...INITIAL_ACADEMIC_YEARS])
  const [currentYear, setCurrentYearState] = useState<string>(() =>
    loadLocal(STORAGE_KEYS.CURRENT_YEAR, INITIAL_ACADEMIC_YEARS[0] || '2024 - 2025')
  )

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting')
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const isFetchingRef = useRef(false)

  // Local storage auto-sync
  useEffect(() => saveLocal(STORAGE_KEYS.OBSERVERS, observers), [observers])
  useEffect(() => saveLocal(STORAGE_KEYS.SUBJECTS, subjects), [subjects])
  useEffect(() => saveLocal(STORAGE_KEYS.COMMITTEES, committees), [committees])
  useEffect(() => saveLocal(STORAGE_KEYS.SCHEDULES, schedules), [schedules])
  useEffect(() => saveLocal(STORAGE_KEYS.ATTENDANCE, attendance), [attendance])
  useEffect(() => saveLocal(STORAGE_KEYS.CONTROL_WORKS, controlWorks), [controlWorks])
  useEffect(() => saveLocal(STORAGE_KEYS.SIGNATURES, signatures), [signatures])
  useEffect(() => saveLocal(STORAGE_KEYS.CURRENT_YEAR, currentYear), [currentYear])

  // --- SUPABASE SYNC LOGIC ---

  // Fetch all data from Supabase
  const fetchFromSupabase = useCallback(async () => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      setConnectionStatus('local_only')
      return
    }

    if (isFetchingRef.current) return
    isFetchingRef.current = true
    setConnectionStatus('connecting')

    try {
      // 1. Fetch Observers
      const { data: obsData, error: obsErr } = await supabase
        .from('observers')
        .select('*')
        .order('id', { ascending: true })

      if (obsErr) throw obsErr

      // 2. Fetch Subjects
      const { data: subData, error: subErr } = await supabase
        .from('subjects')
        .select('*')
        .order('code', { ascending: true })

      if (subErr) throw subErr

      // 3. Fetch Committees
      const { data: comData, error: comErr } = await supabase
        .from('committees')
        .select('*')
        .order('room_num', { ascending: true })

      if (comErr) throw comErr

      // 4. Fetch Schedules
      const { data: schData, error: schErr } = await supabase
        .from('schedule_slots')
        .select('*')
        .order('created_at', { ascending: false })

      if (schErr) throw schErr

      // 5. Fetch Control Works
      const { data: ctrlData, error: ctrlErr } = await supabase
        .from('control_works')
        .select('*')

      if (ctrlErr) throw ctrlErr

      // 6. Fetch Settings
      const { data: setData, error: setErr } = await supabase
        .from('system_settings')
        .select('*')

      if (setErr) throw setErr

      // Update state with cloud data if available
      if (obsData && obsData.length > 0) {
        setObservers(
          obsData.map((o: any) => ({
            id: o.id,
            name: o.name,
            job: o.job,
            specialization: o.specialization,
            days: o.days || '',
            hours: typeof o.hours === 'number' ? o.hours : parseFloat(o.hours) || 0,
          }))
        )
      }

      if (subData && subData.length > 0) {
        setSubjects(
          subData.map((s: any) => ({
            id: s.id,
            code: s.code,
            name: s.name,
            dept: s.dept,
            year: s.year,
            semester: s.semester,
            spec: s.spec || '',
          }))
        )
      }

      if (comData && comData.length > 0) {
        setCommittees(
          comData.map((c: any) => ({
            id: c.id,
            roomNum: c.room_num,
            hallName: c.hall_name,
            floor: c.floor,
            capacity: (c as any).capacity || 30,
          }))
        )
      }

      if (schData) {
        setSchedules(
          schData.map((slot: any) => ({
            id: slot.id,
            date: slot.date,
            period: slot.period,
            startTime: slot.start_time,
            semester: slot.semester,
            academicYear: slot.academic_year,
            examType: slot.exam_type || 'تحريري',
            reserves: Array.isArray(slot.reserves) ? slot.reserves : [],
            rows: Array.isArray(slot.rows) ? slot.rows : [],
          }))
        )
      }

      if (ctrlData) {
        setControlWorks(
          ctrlData.map((c: any) => ({
            subjectId: c.subject_id,
            subjectName: c.subject_name,
            dept: c.dept,
            year: c.year,
            checklist: c.checklist || {},
          }))
        )
      }

      if (setData) {
        setData.forEach((item: any) => {
          if (item.key === 'signatures' && item.value) {
            setSignatures(item.value)
          }
          if (item.key === 'academic_years' && Array.isArray(item.value)) {
            setAcademicYears(item.value)
          }
          if (item.key === 'current_year' && typeof item.value === 'string') {
            setCurrentYearState(item.value)
          }
        })
      }

      setConnectionStatus('connected')
      setLastSyncTime(new Date().toLocaleTimeString('ar-EG'))
    } catch (error) {
      console.error('Error syncing with Supabase:', error)
      setConnectionStatus('error')
    } finally {
      isFetchingRef.current = false
    }
  }, [])

  // Initial fetch and Realtime subscriptions
  useEffect(() => {
    fetchFromSupabase()

    const supabase = getSupabaseClient()
    if (!supabase) return

    // Realtime channel listener
    const channel = supabase
      .channel('hietm_realtime_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          console.log('Realtime change received:', payload)
          // Refetch to sync state immediately
          fetchFromSupabase()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchFromSupabase])

  // --- CRUD OPERATIONS WITH OPTIMISTIC UPDATES & CLOUD SYNC ---

  // 1. Observers
  const updateObserver = async (id: string, updates: Partial<Observer>) => {
    // Optimistic UI update
    setObservers((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)))

    const supabase = getSupabaseClient()
    if (!supabase) return

    const payload: any = {}
    if (updates.name !== undefined) payload.name = updates.name
    if (updates.job !== undefined) payload.job = updates.job
    if (updates.specialization !== undefined) payload.specialization = updates.specialization
    if (updates.days !== undefined) payload.days = updates.days
    if (updates.hours !== undefined) payload.hours = updates.hours
    payload.updated_at = new Date().toISOString()

    try {
      await supabase.from('observers').update(payload).eq('id', id)
    } catch (e) {
      console.error('Failed to update observer in cloud', e)
    }
  }

  const addObserver = async (obs: Omit<Observer, 'id'>) => {
    const newId = String(Date.now())
    const newObs: Observer = { id: newId, ...obs }
    setObservers((prev) => [newObs, ...prev])

    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      await supabase.from('observers').insert({
        id: newId,
        name: obs.name,
        job: obs.job,
        specialization: obs.specialization,
        days: obs.days || '',
        hours: obs.hours || 0,
      })
    } catch (e) {
      console.error('Failed to add observer in cloud', e)
    }
  }

  const deleteObserver = async (id: string) => {
    setObservers((prev) => prev.filter((o) => o.id !== id))

    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      await supabase.from('observers').delete().eq('id', id)
    } catch (e) {
      console.error('Failed to delete observer in cloud', e)
    }
  }

  const resetAllHours = async () => {
    if (!window.confirm('هل تريد تصفير جميع ساعات المراقبة المسجلة لجميع المراقبين؟')) return

    setObservers((prev) => prev.map((o) => ({ ...o, hours: 0 })))

    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      await supabase.from('observers').update({ hours: 0, updated_at: new Date().toISOString() }).neq('id', '')
    } catch (e) {
      console.error('Failed to reset hours in cloud', e)
    }
  }

  // 2. Subjects
  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))

    const supabase = getSupabaseClient()
    if (!supabase) return

    const payload: any = {}
    if (updates.code !== undefined) payload.code = updates.code
    if (updates.name !== undefined) payload.name = updates.name
    if (updates.dept !== undefined) payload.dept = updates.dept
    if (updates.year !== undefined) payload.year = updates.year
    if (updates.semester !== undefined) payload.semester = updates.semester
    if (updates.spec !== undefined) payload.spec = updates.spec
    payload.updated_at = new Date().toISOString()

    try {
      await supabase.from('subjects').update(payload).eq('id', id)
    } catch (e) {
      console.error('Failed to update subject in cloud', e)
    }
  }

  const addSubject = async (s: Omit<Subject, 'id'>) => {
    const newId = String(Date.now())
    const newSubj: Subject = { id: newId, ...s }
    setSubjects((prev) => [newSubj, ...prev])

    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      await supabase.from('subjects').insert({
        id: newId,
        code: s.code,
        name: s.name,
        dept: s.dept,
        year: s.year,
        semester: s.semester,
        spec: s.spec || '',
      })
    } catch (e) {
      console.error('Failed to add subject in cloud', e)
    }
  }

  const deleteSubject = async (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id))

    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      await supabase.from('subjects').delete().eq('id', id)
    } catch (e) {
      console.error('Failed to delete subject in cloud', e)
    }
  }

  // 3. Committees
  const updateCommittee = async (id: string, updates: Partial<Committee>) => {
    setCommittees((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))

    const supabase = getSupabaseClient()
    if (!supabase) return

    const payload: any = {}
    if (updates.roomNum !== undefined) payload.room_num = updates.roomNum
    if (updates.hallName !== undefined) payload.hall_name = updates.hallName
    if (updates.floor !== undefined) payload.floor = updates.floor
    if (updates.capacity !== undefined) payload.capacity = updates.capacity
    payload.updated_at = new Date().toISOString()

    try {
      await supabase.from('committees').update(payload).eq('id', id)
    } catch (e) {
      console.error('Failed to update committee in cloud', e)
    }
  }

  const addCommittee = async (c: Omit<Committee, 'id'>) => {
    const newId = String(Date.now())
    const newCom: Committee = { id: newId, ...c }
    setCommittees((prev) => [newCom, ...prev])

    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      await supabase.from('committees').insert({
        id: newId,
        room_num: c.roomNum,
        hall_name: c.hallName,
        floor: c.floor,
        capacity: (c as any).capacity || 30,
      })
    } catch (e) {
      console.error('Failed to add committee in cloud', e)
    }
  }

  const deleteCommittee = async (id: string) => {
    setCommittees((prev) => prev.filter((c) => c.id !== id))

    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      await supabase.from('committees').delete().eq('id', id)
    } catch (e) {
      console.error('Failed to delete committee in cloud', e)
    }
  }

  // 4. Schedules
  const saveScheduleSlot = async (slot: ScheduleSlot) => {
    const slotId = slot.id || String(Date.now())
    const fullSlot = { ...slot, id: slotId }

    setSchedules((prev) => [fullSlot, ...prev.filter((s) => s.id !== slotId)])

    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      await supabase.from('schedule_slots').upsert({
        id: slotId,
        date: fullSlot.date,
        period: fullSlot.period,
        start_time: fullSlot.startTime,
        semester: fullSlot.semester,
        academic_year: fullSlot.academicYear,
        exam_type: fullSlot.examType || 'تحريري',
        reserves: fullSlot.reserves || [],
        rows: fullSlot.rows || [],
        updated_at: new Date().toISOString(),
      })
    } catch (e) {
      console.error('Failed to save schedule slot in cloud', e)
    }
  }

  const deleteScheduleSlot = async (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id))

    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      await supabase.from('schedule_slots').delete().eq('id', id)
    } catch (e) {
      console.error('Failed to delete schedule slot in cloud', e)
    }
  }

  // 5. Control Works
  const toggleControlStage = async (subjectId: string, itemIndex: number) => {
    let nextItem: ControlWorkSubject | null = null

    setControlWorks((prev) => {
      const existing = prev.find((cw) => cw.subjectId === subjectId)
      if (existing) {
        const nextChecklist = {
          ...existing.checklist,
          [itemIndex]: !existing.checklist[itemIndex],
        }
        nextItem = { ...existing, checklist: nextChecklist }
        return prev.map((cw) => (cw.subjectId === subjectId ? nextItem! : cw))
      } else {
        const subj = subjects.find((s) => s.id === subjectId)
        nextItem = {
          subjectId,
          subjectName: subj?.name || '',
          dept: subj?.dept || '',
          year: subj?.year || '',
          checklist: { [itemIndex]: true },
        }
        return [...prev, nextItem]
      }
    })

    const supabase = getSupabaseClient()
    if (!supabase || !nextItem) return

    try {
      const itemToSave = nextItem as ControlWorkSubject
      await supabase.from('control_works').upsert({
        subject_id: itemToSave.subjectId,
        subject_name: itemToSave.subjectName,
        dept: itemToSave.dept,
        year: itemToSave.year,
        checklist: itemToSave.checklist,
        updated_at: new Date().toISOString(),
      })
    } catch (e) {
      console.error('Failed to update control checklist in cloud', e)
    }
  }

  // 6. Signatures & Settings
  const updateSignatures = async (sigs: PrintSignatures) => {
    setSignatures(sigs)

    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      await supabase.from('system_settings').upsert({
        key: 'signatures',
        value: sigs,
        updated_at: new Date().toISOString(),
      })
    } catch (e) {
      console.error('Failed to save signatures in cloud', e)
    }
  }

  const updateCurrentYear = async (year: string) => {
    setCurrentYearState(year)

    const supabase = getSupabaseClient()
    if (!supabase) return

    try {
      await supabase.from('system_settings').upsert({
        key: 'current_year',
        value: year,
        updated_at: new Date().toISOString(),
      })
    } catch (e) {
      console.error('Failed to save current year in cloud', e)
    }
  }

  // 7. 1-Click Database Seeding from App
  const seedDatabaseFromDefaults = async (): Promise<{ success: boolean; message: string }> => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { success: false, message: 'يرجى ربط Supabase أولاً من إعدادات السحابة.' }
    }

    try {
      setConnectionStatus('connecting')

      // Insert Observers
      const obsPayload = INITIAL_OBSERVERS.map((o) => ({
        id: o.id,
        name: o.name,
        job: o.job,
        specialization: o.specialization,
        days: o.days,
        hours: (o as any).hours || 0,
      }))
      await supabase.from('observers').upsert(obsPayload)

      // Insert Subjects
      const subPayload = INITIAL_SUBJECTS.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        dept: s.dept,
        year: s.year,
        semester: s.semester,
        spec: s.spec || '',
      }))
      await supabase.from('subjects').upsert(subPayload)

      // Insert Committees
      const comPayload = INITIAL_COMMITTEES.map((c) => ({
        id: c.id,
        room_num: c.roomNum,
        hall_name: c.hallName,
        floor: c.floor,
        capacity: (c as any).capacity || 30,
      }))
      await supabase.from('committees').upsert(comPayload)

      // Insert Settings
      await supabase.from('system_settings').upsert([
        { key: 'signatures', value: INITIAL_SIGNATURES },
        { key: 'academic_years', value: INITIAL_ACADEMIC_YEARS },
        { key: 'current_year', value: INITIAL_ACADEMIC_YEARS[0] || '2024 - 2025' },
      ])

      await fetchFromSupabase()
      return { success: true, message: 'تم رفع وتعبئة قاعدة البيانات بنجاح في Supabase!' }
    } catch (error: any) {
      console.error('Error seeding database:', error)
      return { success: false, message: error.message || 'حدث خطأ أثناء رفع البيانات' }
    }
  }

  // Reset to original factory defaults
  const resetToDefaults = () => {
    if (window.confirm('هل تريد استعادة جميع بيانات النظام الأصلية المعتمدة؟')) {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k))
      setObservers([...INITIAL_OBSERVERS])
      setSubjects([...INITIAL_SUBJECTS])
      setCommittees([...INITIAL_COMMITTEES])
      setSchedules([])
      setAttendance([])
      setControlWorks([])
      setSignatures({ ...INITIAL_SIGNATURES })
      setCurrentYearState(INITIAL_ACADEMIC_YEARS[0] || '2024 - 2025')
      resetSupabaseClient()
    }
  }

  // Export JSON backup
  const exportBackup = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      observers,
      subjects,
      committees,
      schedules,
      attendance,
      controlWorks,
      signatures,
      currentYear,
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hietm_control_backup_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    observers,
    setObservers,
    updateObserver,
    addObserver,
    deleteObserver,
    resetAllHours,

    subjects,
    setSubjects,
    updateSubject,
    addSubject,
    deleteSubject,

    committees,
    setCommittees,
    updateCommittee,
    addCommittee,
    deleteCommittee,

    schedules,
    setSchedules,
    saveScheduleSlot,
    deleteScheduleSlot,

    attendance,
    setAttendance,

    controlWorks,
    setControlWorks,
    toggleControlStage,

    signatures,
    setSignatures,
    updateSignatures,

    academicYears,
    currentYear,
    setCurrentYear: updateCurrentYear,

    connectionStatus,
    lastSyncTime,
    fetchFromSupabase,
    seedDatabaseFromDefaults,
    resetToDefaults,
    exportBackup,
  }
}
