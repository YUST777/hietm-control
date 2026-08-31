import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  Observer,
  Subject,
  Committee,
  ScheduleSlot,
  DailyAttendanceRecord,
  ControlWorkSubject,
  PrintSignatures,
  SystemBranding,
} from '../types/control'
import {
  INITIAL_OBSERVERS,
  INITIAL_SUBJECTS,
  INITIAL_COMMITTEES,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_SIGNATURES,
  INITIAL_PERIODS,
  INITIAL_DEPARTMENTS,
  INITIAL_JOB_TITLES,
  INITIAL_CONTROL_STAGES,
} from './initialData'

const STORAGE_KEYS = {
  OBSERVERS: 'hietm_local_observers_v3',
  SUBJECTS: 'hietm_local_subjects_v3',
  COMMITTEES: 'hietm_local_committees_v3',
  SCHEDULES: 'hietm_local_schedules_v3',
  ATTENDANCE: 'hietm_local_attendance_v3',
  CONTROL_WORKS: 'hietm_local_works_v3',
  SIGNATURES: 'hietm_local_signatures_v3',
  CURRENT_YEAR: 'hietm_local_year_v3',
  ACADEMIC_YEARS: 'hietm_local_academic_years_v3',
  BRANDING: 'hietm_local_branding_v3',
  PERIODS: 'hietm_local_periods_v3',
  DEPARTMENTS: 'hietm_local_departments_v3',
  JOB_TITLES: 'hietm_local_job_titles_v3',
  CONTROL_STAGES: 'hietm_local_control_stages_v3',
}

export const DEFAULT_BRANDING: SystemBranding = {
  appName: 'وحدة التعليم الإلكتروني — الكنترول وتوزيع المراقبات',
  instituteName: 'المعهد العالي للهندسة والتكنولوجيا — إدارة الجداول والامتحانات',
  badgeText: 'H.I.E.T',
  logoUrl: '',
  primaryColor: '#1f4d78',
  headerLine1: 'وزارة التعليم العالي',
  headerLine2: 'المعهد العالي للهندسة والتكنولوجيا',
  headerLine3: 'إدارة الكنترول والجداول الامتحانية',
}

export const DEFAULT_SIGNATURES: PrintSignatures = {
  ...INITIAL_SIGNATURES,
  sigTablesRole: 'رئيس لجنة الجداول',
  sigSystemRole: 'مدير النظام ورئيس الكنترول',
  sigDeanRole: 'عميد المعهد',
}

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key)
    if (data) {
      const parsed = JSON.parse(data)
      if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback
      return parsed
    }
  } catch (e) {
    // ignore
  }
  return fallback
}

function saveLocal<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    // ignore
  }
}

export type SyncStatus = 'synced' | 'syncing' | 'offline'

// API endpoint URL (works locally, in production, and inside Electron)
const API_URL =
  typeof window !== 'undefined' && window.location.origin.includes('http')
    ? `${window.location.origin}/api/sync`
    : 'https://hietm-control.vercel.app/api/sync'

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
    loadLocal(STORAGE_KEYS.SIGNATURES, { ...DEFAULT_SIGNATURES })
  )
  const [branding, setBranding] = useState<SystemBranding>(() =>
    loadLocal(STORAGE_KEYS.BRANDING, { ...DEFAULT_BRANDING })
  )
  const [academicYears, setAcademicYears] = useState<string[]>(() =>
    loadLocal(STORAGE_KEYS.ACADEMIC_YEARS, [...INITIAL_ACADEMIC_YEARS])
  )
  const [currentYear, setCurrentYearState] = useState<string>(() =>
    loadLocal(STORAGE_KEYS.CURRENT_YEAR, INITIAL_ACADEMIC_YEARS[0] || '2024 - 2025')
  )

  const [periods, setPeriods] = useState<string[]>(() =>
    loadLocal(STORAGE_KEYS.PERIODS, [...INITIAL_PERIODS])
  )
  const [departments, setDepartments] = useState<string[]>(() =>
    loadLocal(STORAGE_KEYS.DEPARTMENTS, [...INITIAL_DEPARTMENTS])
  )
  const [jobTitles, setJobTitles] = useState<string[]>(() =>
    loadLocal(STORAGE_KEYS.JOB_TITLES, [...INITIAL_JOB_TITLES])
  )
  const [controlStages, setControlStages] = useState<string[]>(() =>
    loadLocal(STORAGE_KEYS.CONTROL_STAGES, [...INITIAL_CONTROL_STAGES])
  )

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced')
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)

  // Dynamically update document title, favicon and CSS theme variables
  useEffect(() => {
    try {
      const color = branding.primaryColor || '#1f4d78'
      document.documentElement.style.setProperty('--primary-color', color)

      // Set Document / Window Title
      const appTitle = branding.appName || 'نظام الكنترول وتوزيع المراقبات'
      const instTitle = branding.instituteName ? branding.instituteName.split('—')[0].trim() : 'المعهد العالي للهندسة'
      document.title = `${appTitle} | ${instTitle}`

      // Update Favicon if custom logo provided
      if (branding.logoUrl) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']")
        if (!link) {
          link = document.createElement('link')
          link.rel = 'icon'
          document.getElementsByTagName('head')[0].appendChild(link)
        }
        link.href = branding.logoUrl
      }
    } catch {}
  }, [branding.primaryColor, branding.appName, branding.instituteName, branding.logoUrl])

  // Refs to avoid unnecessary effect triggers - Mirror 100% of state
  const stateRef = useRef({
    observers,
    subjects,
    committees,
    schedules,
    attendance,
    controlWorks,
    signatures,
    branding,
    academicYears,
    currentYear,
    periods,
    departments,
    jobTitles,
    controlStages,
  })

  // Keep stateRef in sync
  useEffect(() => {
    stateRef.current = {
      observers,
      subjects,
      committees,
      schedules,
      attendance,
      controlWorks,
      signatures,
      branding,
      academicYears,
      currentYear,
      periods,
      departments,
      jobTitles,
      controlStages,
    }
  }, [
    observers,
    subjects,
    committees,
    schedules,
    attendance,
    controlWorks,
    signatures,
    branding,
    academicYears,
    currentYear,
    periods,
    departments,
    jobTitles,
    controlStages,
  ])

  const isSyncingRef = useRef(false)
  const debounceTimerRef = useRef<any>(null)
  const hasMountedRef = useRef(false)

  // Local storage auto-sync (immediate)
  useEffect(() => saveLocal(STORAGE_KEYS.OBSERVERS, observers), [observers])
  useEffect(() => saveLocal(STORAGE_KEYS.SUBJECTS, subjects), [subjects])
  useEffect(() => saveLocal(STORAGE_KEYS.COMMITTEES, committees), [committees])
  useEffect(() => saveLocal(STORAGE_KEYS.SCHEDULES, schedules), [schedules])
  useEffect(() => saveLocal(STORAGE_KEYS.ATTENDANCE, attendance), [attendance])
  useEffect(() => saveLocal(STORAGE_KEYS.CONTROL_WORKS, controlWorks), [controlWorks])
  useEffect(() => saveLocal(STORAGE_KEYS.SIGNATURES, signatures), [signatures])
  useEffect(() => saveLocal(STORAGE_KEYS.BRANDING, branding), [branding])
  useEffect(() => saveLocal(STORAGE_KEYS.ACADEMIC_YEARS, academicYears), [academicYears])
  useEffect(() => saveLocal(STORAGE_KEYS.CURRENT_YEAR, currentYear), [currentYear])
  useEffect(() => saveLocal(STORAGE_KEYS.PERIODS, periods), [periods])
  useEffect(() => saveLocal(STORAGE_KEYS.DEPARTMENTS, departments), [departments])
  useEffect(() => saveLocal(STORAGE_KEYS.JOB_TITLES, jobTitles), [jobTitles])
  useEffect(() => saveLocal(STORAGE_KEYS.CONTROL_STAGES, controlStages), [controlStages])

  // Push latest stateRef to cloud
  const pushToCloud = useCallback(async (isImmediate = false) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSyncStatus('offline')
      return
    }

    if (isSyncingRef.current && !isImmediate) return
    isSyncingRef.current = true
    setSyncStatus('syncing')

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stateRef.current),
        keepalive: isImmediate,
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      setSyncStatus('synced')
      setLastSyncTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }))
    } catch {
      setSyncStatus('offline')
    } finally {
      isSyncingRef.current = false
    }
  }, [])

  // Trigger debounced cloud push whenever user makes a mutation
  const queuePush = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      pushToCloud()
    }, 1200)
  }, [pushToCloud])

  // Pull once on initial mount
  const pullFromCloud = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSyncStatus('offline')
      return
    }

    try {
      setSyncStatus('syncing')
      const res = await fetch(API_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = await res.json()
      if (json && json.data) {
        const d = json.data
        if (Array.isArray(d.observers) && d.observers.length > 0) setObservers(d.observers)
        if (Array.isArray(d.subjects) && d.subjects.length > 0) setSubjects(d.subjects)
        if (Array.isArray(d.committees) && d.committees.length > 0) setCommittees(d.committees)
        if (Array.isArray(d.schedules) && d.schedules.length > 0) setSchedules(d.schedules)
        if (Array.isArray(d.attendance) && d.attendance.length > 0) setAttendance(d.attendance)
        if (Array.isArray(d.controlWorks) && d.controlWorks.length > 0) setControlWorks(d.controlWorks)
        if (d.signatures && typeof d.signatures === 'object') setSignatures(d.signatures)
        if (d.branding && typeof d.branding === 'object') setBranding(d.branding)
        if (Array.isArray(d.academicYears) && d.academicYears.length > 0) setAcademicYears(d.academicYears)
        if (typeof d.currentYear === 'string') setCurrentYearState(d.currentYear)
        if (Array.isArray(d.periods) && d.periods.length > 0) setPeriods(d.periods)
        if (Array.isArray(d.departments) && d.departments.length > 0) setDepartments(d.departments)
        if (Array.isArray(d.jobTitles) && d.jobTitles.length > 0) setJobTitles(d.jobTitles)
        if (Array.isArray(d.controlStages) && d.controlStages.length > 0) setControlStages(d.controlStages)
      }

      setSyncStatus('synced')
      setLastSyncTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }))
    } catch {
      setSyncStatus('offline')
    }
  }, [])

  // Initial pull once on mount + online/offline + beforeunload flush
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      pullFromCloud()
    }

    const handleOnline = () => {
      pushToCloud()
    }

    const handleOffline = () => {
      setSyncStatus('offline')
    }

    const handleBeforeUnload = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        pushToCloud(true)
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [pullFromCloud, pushToCloud])

  // --- CRUD OPERATIONS (INSTANT LOCAL SAVE + AUTO CLOUD SYNC) ---

  // 1. Observers
  const updateObserver = (id: string, updates: Partial<Observer>) => {
    setObservers((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)))
    queuePush()
  }

  const addObserver = (obs: Omit<Observer, 'id'>) => {
    const newId = String(Date.now())
    setObservers((prev) => [{ id: newId, ...obs }, ...prev])
    queuePush()
  }

  const deleteObserver = (id: string) => {
    setObservers((prev) => prev.filter((o) => o.id !== id))
    queuePush()
  }

  const importObserversList = (newList: Omit<Observer, 'id'>[]) => {
    const prepared: Observer[] = newList.map((item, idx) => ({
      id: `${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
      ...item,
    }))
    setObservers((prev) => [...prepared, ...prev])
    queuePush()
  }

  const resetAllHours = () => {
    if (!window.confirm('هل تريد تصفير جميع ساعات المراقبة المسجلة لجميع المراقبين؟')) return
    setObservers((prev) => prev.map((o) => ({ ...o, hours: 0 })))
    queuePush()
  }

  // 2. Subjects
  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
    queuePush()
  }

  const addSubject = (s: Omit<Subject, 'id'>) => {
    const newId = String(Date.now())
    setSubjects((prev) => [{ id: newId, ...s }, ...prev])
    queuePush()
  }

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id))
    queuePush()
  }

  const importSubjectsList = (newList: Omit<Subject, 'id'>[]) => {
    const prepared: Subject[] = newList.map((item, idx) => ({
      id: `${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
      ...item,
    }))
    setSubjects((prev) => [...prepared, ...prev])
    queuePush()
  }

  // 3. Committees
  const updateCommittee = (id: string, updates: Partial<Committee>) => {
    setCommittees((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
    queuePush()
  }

  const addCommittee = (c: Omit<Committee, 'id'>) => {
    const newId = String(Date.now())
    setCommittees((prev) => [{ id: newId, ...c }, ...prev])
    queuePush()
  }

  const deleteCommittee = (id: string) => {
    setCommittees((prev) => prev.filter((c) => c.id !== id))
    queuePush()
  }

  const importCommitteesList = (newList: Omit<Committee, 'id'>[]) => {
    const prepared: Committee[] = newList.map((item, idx) => ({
      id: `${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
      ...item,
    }))
    setCommittees((prev) => [...prepared, ...prev])
    queuePush()
  }

  // 4. Schedules
  const saveScheduleSlot = (slot: ScheduleSlot) => {
    const slotId = slot.id || String(Date.now())
    const fullSlot = { ...slot, id: slotId }
    setSchedules((prev) => [fullSlot, ...prev.filter((s) => s.id !== slotId)])
    queuePush()
  }

  const deleteScheduleSlot = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id))
    queuePush()
  }

  // 5. Daily Attendance
  const saveAttendanceRecords = (records: DailyAttendanceRecord[]) => {
    setAttendance(records)
    queuePush()
  }

  // 6. Control Works
  const toggleControlStage = (subjectId: string, itemIndex: number) => {
    setControlWorks((prev) => {
      const existing = prev.find((cw) => cw.subjectId === subjectId)
      if (existing) {
        const nextChecklist = {
          ...existing.checklist,
          [itemIndex]: !existing.checklist[itemIndex],
        }
        return prev.map((cw) => (cw.subjectId === subjectId ? { ...existing, checklist: nextChecklist } : cw))
      } else {
        const subj = subjects.find((s) => s.id === subjectId)
        return [
          ...prev,
          {
            subjectId,
            subjectName: subj?.name || '',
            dept: subj?.dept || '',
            year: subj?.year || '',
            checklist: { [itemIndex]: true },
          },
        ]
      }
    })
    queuePush()
  }

  // 7. Signatures & Settings
  const updateSignatures = (sigs: PrintSignatures) => {
    setSignatures(sigs)
    queuePush()
  }

  const updateBranding = (updates: Partial<SystemBranding>) => {
    setBranding((prev) => ({ ...prev, ...updates }))
    queuePush()
  }

  const updateCurrentYear = (year: string) => {
    setCurrentYearState(year)
    queuePush()
  }

  const addAcademicYear = (year: string) => {
    if (!academicYears.includes(year)) {
      setAcademicYears((prev) => [...prev, year])
      queuePush()
    }
  }

  const deleteAcademicYear = (year: string) => {
    if (academicYears.length <= 1) return
    const remaining = academicYears.filter((y) => y !== year)
    setAcademicYears(remaining)
    if (currentYear === year) {
      setCurrentYearState(remaining[0] || '')
    }
    queuePush()
  }

  // 8. Exam Periods Management
  const addPeriod = (period: string) => {
    if (!periods.includes(period)) {
      setPeriods((prev) => [...prev, period])
      queuePush()
    }
  }

  const deletePeriod = (period: string) => {
    if (periods.length <= 1) return
    setPeriods((prev) => prev.filter((p) => p !== period))
    queuePush()
  }

  const updatePeriodsList = (newPeriods: string[]) => {
    setPeriods(newPeriods)
    queuePush()
  }

  // 9. Departments Management
  const addDepartment = (dept: string) => {
    if (!departments.includes(dept)) {
      setDepartments((prev) => [...prev, dept])
      queuePush()
    }
  }

  const deleteDepartment = (dept: string) => {
    if (departments.length <= 1) return
    setDepartments((prev) => prev.filter((d) => d !== dept))
    queuePush()
  }

  const updateDepartmentsList = (newDepts: string[]) => {
    setDepartments(newDepts)
    queuePush()
  }

  // 10. Job Titles Management
  const addJobTitle = (job: string) => {
    if (!jobTitles.includes(job)) {
      setJobTitles((prev) => [...prev, job])
      queuePush()
    }
  }

  const deleteJobTitle = (job: string) => {
    if (jobTitles.length <= 1) return
    setJobTitles((prev) => prev.filter((j) => j !== job))
    queuePush()
  }

  const updateJobTitlesList = (newJobs: string[]) => {
    setJobTitles(newJobs)
    queuePush()
  }

  // 11. 14 Control Stages Customizer
  const updateControlStageTitle = (index: number, newTitle: string) => {
    setControlStages((prev) => {
      const copy = [...prev]
      copy[index] = newTitle
      return copy
    })
    queuePush()
  }

  const updateAllControlStages = (newStages: string[]) => {
    setControlStages(newStages)
    queuePush()
  }

  // Reset to original faculty defaults
  const resetToDefaults = () => {
    if (window.confirm('هل تريد استعادة جميع بيانات النظام الأصلية المعتمدة؟')) {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k))
      setObservers([...INITIAL_OBSERVERS])
      setSubjects([...INITIAL_SUBJECTS])
      setCommittees([...INITIAL_COMMITTEES])
      setSchedules([])
      setAttendance([])
      setControlWorks([])
      setSignatures({ ...DEFAULT_SIGNATURES })
      setBranding({ ...DEFAULT_BRANDING })
      setAcademicYears([...INITIAL_ACADEMIC_YEARS])
      setCurrentYearState(INITIAL_ACADEMIC_YEARS[0] || '2024 - 2025')
      setPeriods([...INITIAL_PERIODS])
      setDepartments([...INITIAL_DEPARTMENTS])
      setJobTitles([...INITIAL_JOB_TITLES])
      setControlStages([...INITIAL_CONTROL_STAGES])
      queuePush()
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
      branding,
      academicYears,
      currentYear,
      periods,
      departments,
      jobTitles,
      controlStages,
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hietm_control_backup_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import JSON backup with full structure validation
  const importBackup = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr)
      if (!parsed || typeof parsed !== 'object') return false

      if (Array.isArray(parsed.observers)) setObservers(parsed.observers)
      if (Array.isArray(parsed.subjects)) setSubjects(parsed.subjects)
      if (Array.isArray(parsed.committees)) setCommittees(parsed.committees)
      if (Array.isArray(parsed.schedules)) setSchedules(parsed.schedules)
      if (Array.isArray(parsed.attendance)) setAttendance(parsed.attendance)
      if (Array.isArray(parsed.controlWorks)) setControlWorks(parsed.controlWorks)
      if (parsed.signatures && typeof parsed.signatures === 'object') setSignatures(parsed.signatures)
      if (parsed.branding && typeof parsed.branding === 'object') setBranding(parsed.branding)
      if (Array.isArray(parsed.academicYears)) setAcademicYears(parsed.academicYears)
      if (typeof parsed.currentYear === 'string') setCurrentYearState(parsed.currentYear)
      if (Array.isArray(parsed.periods)) setPeriods(parsed.periods)
      if (Array.isArray(parsed.departments)) setDepartments(parsed.departments)
      if (Array.isArray(parsed.jobTitles)) setJobTitles(parsed.jobTitles)
      if (Array.isArray(parsed.controlStages)) setControlStages(parsed.controlStages)

      queuePush()
      return true
    } catch {
      return false
    }
  }

  return {
    observers,
    setObservers,
    updateObserver,
    addObserver,
    deleteObserver,
    importObserversList,
    resetAllHours,

    subjects,
    setSubjects,
    updateSubject,
    addSubject,
    deleteSubject,
    importSubjectsList,

    committees,
    setCommittees,
    updateCommittee,
    addCommittee,
    deleteCommittee,
    importCommitteesList,

    schedules,
    setSchedules,
    saveScheduleSlot,
    deleteScheduleSlot,

    attendance,
    setAttendance: saveAttendanceRecords,

    controlWorks,
    setControlWorks,
    toggleControlStage,

    signatures,
    setSignatures,
    updateSignatures,

    branding,
    setBranding,
    updateBranding,

    academicYears,
    addAcademicYear,
    deleteAcademicYear,
    currentYear,
    setCurrentYear: updateCurrentYear,

    periods,
    addPeriod,
    deletePeriod,
    updatePeriodsList,

    departments,
    addDepartment,
    deleteDepartment,
    updateDepartmentsList,

    jobTitles,
    addJobTitle,
    deleteJobTitle,
    updateJobTitlesList,

    controlStages,
    updateControlStageTitle,
    updateAllControlStages,

    syncStatus,
    lastSyncTime,
    manualSync: pushToCloud,
    resetToDefaults,
    exportBackup,
    importBackup,
  }
}
