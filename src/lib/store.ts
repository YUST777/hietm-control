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
  INITIAL_SEMESTERS,
  INITIAL_STUDY_LEVELS,
  INITIAL_BUILDINGS,
  INITIAL_FLOORS,
  INITIAL_WORK_DAYS,
  INITIAL_ROLE_QUOTAS,
  DEFAULT_PRINT_NOTICE,
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
  SEMESTERS: 'hietm_local_semesters_v3',
  CURRENT_SEMESTER: 'hietm_local_current_semester_v3',
  STUDY_LEVELS: 'hietm_local_study_levels_v3',
  BUILDINGS: 'hietm_local_buildings_v3',
  FLOORS: 'hietm_local_floors_v3',
  WORK_DAYS: 'hietm_local_work_days_v3',
  ROLE_QUOTAS: 'hietm_local_role_quotas_v3',
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
  printNotice: DEFAULT_PRINT_NOTICE,
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

// API endpoint URL
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

  // Extended Doctor Customization States
  const [semesters, setSemesters] = useState<string[]>(() =>
    loadLocal(STORAGE_KEYS.SEMESTERS, [...INITIAL_SEMESTERS])
  )
  const [currentSemester, setCurrentSemesterState] = useState<string>(() =>
    loadLocal(STORAGE_KEYS.CURRENT_SEMESTER, INITIAL_SEMESTERS[1] || 'الفصل الدراسي الثاني')
  )
  const [studyLevels, setStudyLevels] = useState<string[]>(() =>
    loadLocal(STORAGE_KEYS.STUDY_LEVELS, [...INITIAL_STUDY_LEVELS])
  )
  const [buildings, setBuildings] = useState<string[]>(() =>
    loadLocal(STORAGE_KEYS.BUILDINGS, [...INITIAL_BUILDINGS])
  )
  const [floors, setFloors] = useState<string[]>(() =>
    loadLocal(STORAGE_KEYS.FLOORS, [...INITIAL_FLOORS])
  )
  const [workDays, setWorkDays] = useState<string[]>(() =>
    loadLocal(STORAGE_KEYS.WORK_DAYS, [...INITIAL_WORK_DAYS])
  )
  const [roleQuotas, setRoleQuotas] = useState<Record<string, number>>(() =>
    loadLocal(STORAGE_KEYS.ROLE_QUOTAS, { ...INITIAL_ROLE_QUOTAS })
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

  // Refs to mirror 100% of state
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
    semesters,
    currentSemester,
    studyLevels,
    buildings,
    floors,
    workDays,
    roleQuotas,
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
      semesters,
      currentSemester,
      studyLevels,
      buildings,
      floors,
      workDays,
      roleQuotas,
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
    semesters,
    currentSemester,
    studyLevels,
    buildings,
    floors,
    workDays,
    roleQuotas,
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
  useEffect(() => saveLocal(STORAGE_KEYS.SEMESTERS, semesters), [semesters])
  useEffect(() => saveLocal(STORAGE_KEYS.CURRENT_SEMESTER, currentSemester), [currentSemester])
  useEffect(() => saveLocal(STORAGE_KEYS.STUDY_LEVELS, studyLevels), [studyLevels])
  useEffect(() => saveLocal(STORAGE_KEYS.BUILDINGS, buildings), [buildings])
  useEffect(() => saveLocal(STORAGE_KEYS.FLOORS, floors), [floors])
  useEffect(() => saveLocal(STORAGE_KEYS.WORK_DAYS, workDays), [workDays])
  useEffect(() => saveLocal(STORAGE_KEYS.ROLE_QUOTAS, roleQuotas), [roleQuotas])

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
        if (d.signatures && typeof d.signatures === 'object') setSignatures({ ...DEFAULT_SIGNATURES, ...d.signatures })
        if (d.branding && typeof d.branding === 'object') setBranding({ ...DEFAULT_BRANDING, ...d.branding })
        if (Array.isArray(d.academicYears) && d.academicYears.length > 0) setAcademicYears(d.academicYears)
        if (typeof d.currentYear === 'string') setCurrentYearState(d.currentYear)
        if (Array.isArray(d.periods) && d.periods.length > 0) setPeriods(d.periods)
        if (Array.isArray(d.departments) && d.departments.length > 0) setDepartments(d.departments)
        if (Array.isArray(d.jobTitles) && d.jobTitles.length > 0) setJobTitles(d.jobTitles)
        if (Array.isArray(d.controlStages) && d.controlStages.length > 0) setControlStages(d.controlStages)
        if (Array.isArray(d.semesters) && d.semesters.length > 0) setSemesters(d.semesters)
        if (typeof d.currentSemester === 'string') setCurrentSemesterState(d.currentSemester)
        if (Array.isArray(d.studyLevels) && d.studyLevels.length > 0) setStudyLevels(d.studyLevels)
        if (Array.isArray(d.buildings) && d.buildings.length > 0) setBuildings(d.buildings)
        if (Array.isArray(d.floors) && d.floors.length > 0) setFloors(d.floors)
        if (Array.isArray(d.workDays) && d.workDays.length > 0) setWorkDays(d.workDays)
        if (d.roleQuotas && typeof d.roleQuotas === 'object') setRoleQuotas({ ...INITIAL_ROLE_QUOTAS, ...d.roleQuotas })

        setSyncStatus('synced')
        setLastSyncTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }))
      }
    } catch {
      setSyncStatus('offline')
    }
  }, [])

  // Mount effect
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      pullFromCloud()
    }
  }, [pullFromCloud])

  // Sync on online event
  useEffect(() => {
    const handleOnline = () => {
      pushToCloud()
      pullFromCloud()
    }
    const handleOffline = () => setSyncStatus('offline')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [pushToCloud, pullFromCloud])

  // ================= MUTATIONS ================= //

  // 1. Observers
  const updateObserver = (id: string, updates: Partial<Observer>) => {
    setObservers((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)))
    queuePush()
  }

  const addObserver = (obs: Omit<Observer, 'id'>) => {
    const newId = String(Date.now())
    // Auto-populate target hours if roleQuotas has value
    const defaultHours = roleQuotas[obs.job] || obs.hours || 16
    setObservers((prev) => [{ id: newId, hours: defaultHours, ...obs }, ...prev])
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
    setObservers((prev) => prev.map((o) => ({ ...o, hours: roleQuotas[o.job] || 16 })))
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

  // 11. Control Stages Customizer
  const updateControlStageTitle = (index: number, newTitle: string) => {
    setControlStages((prev) => {
      const copy = [...prev]
      copy[index] = newTitle
      return copy
    })
    queuePush()
  }

  const addControlStage = (stage: string) => {
    setControlStages((prev) => [...prev, stage])
    queuePush()
  }

  const deleteControlStage = (index: number) => {
    if (controlStages.length <= 1) return
    setControlStages((prev) => prev.filter((_, idx) => idx !== index))
    queuePush()
  }

  const updateAllControlStages = (newStages: string[]) => {
    setControlStages(newStages)
    queuePush()
  }

  // 12. Semesters Management
  const addSemester = (sem: string) => {
    if (!semesters.includes(sem)) {
      setSemesters((prev) => [...prev, sem])
      queuePush()
    }
  }

  const deleteSemester = (sem: string) => {
    if (semesters.length <= 1) return
    const next = semesters.filter((s) => s !== sem)
    setSemesters(next)
    if (currentSemester === sem) {
      setCurrentSemesterState(next[0] || '')
    }
    queuePush()
  }

  const updateCurrentSemester = (sem: string) => {
    setCurrentSemesterState(sem)
    queuePush()
  }

  // 13. Study Levels Management
  const addStudyLevel = (level: string) => {
    if (!studyLevels.includes(level)) {
      setStudyLevels((prev) => [...prev, level])
      queuePush()
    }
  }

  const deleteStudyLevel = (level: string) => {
    if (studyLevels.length <= 1) return
    setStudyLevels((prev) => prev.filter((l) => l !== level))
    queuePush()
  }

  // 14. Buildings & Floors Management
  const addBuilding = (b: string) => {
    if (!buildings.includes(b)) {
      setBuildings((prev) => [...prev, b])
      queuePush()
    }
  }

  const deleteBuilding = (b: string) => {
    if (buildings.length <= 1) return
    setBuildings((prev) => prev.filter((item) => item !== b))
    queuePush()
  }

  const addFloor = (f: string) => {
    if (!floors.includes(f)) {
      setFloors((prev) => [...prev, f])
      queuePush()
    }
  }

  const deleteFloor = (f: string) => {
    if (floors.length <= 1) return
    setFloors((prev) => prev.filter((item) => item !== f))
    queuePush()
  }

  // 15. Working Days Management
  const toggleWorkDay = (day: string) => {
    setWorkDays((prev) => {
      if (prev.includes(day)) {
        if (prev.length <= 1) return prev
        return prev.filter((d) => d !== day)
      } else {
        return [...prev, day]
      }
    })
    queuePush()
  }

  // 16. Target Role Quotas Management
  const updateRoleQuota = (job: string, hours: number) => {
    setRoleQuotas((prev) => ({
      ...prev,
      [job]: hours,
    }))
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
      setSemesters([...INITIAL_SEMESTERS])
      setCurrentSemesterState(INITIAL_SEMESTERS[1] || 'الفصل الدراسي الثاني')
      setStudyLevels([...INITIAL_STUDY_LEVELS])
      setBuildings([...INITIAL_BUILDINGS])
      setFloors([...INITIAL_FLOORS])
      setWorkDays([...INITIAL_WORK_DAYS])
      setRoleQuotas({ ...INITIAL_ROLE_QUOTAS })
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
      semesters,
      currentSemester,
      studyLevels,
      buildings,
      floors,
      workDays,
      roleQuotas,
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
      if (parsed.signatures && typeof parsed.signatures === 'object') setSignatures({ ...DEFAULT_SIGNATURES, ...parsed.signatures })
      if (parsed.branding && typeof parsed.branding === 'object') setBranding({ ...DEFAULT_BRANDING, ...parsed.branding })
      if (Array.isArray(parsed.academicYears)) setAcademicYears(parsed.academicYears)
      if (typeof parsed.currentYear === 'string') setCurrentYearState(parsed.currentYear)
      if (Array.isArray(parsed.periods)) setPeriods(parsed.periods)
      if (Array.isArray(parsed.departments)) setDepartments(parsed.departments)
      if (Array.isArray(parsed.jobTitles)) setJobTitles(parsed.jobTitles)
      if (Array.isArray(parsed.controlStages)) setControlStages(parsed.controlStages)
      if (Array.isArray(parsed.semesters)) setSemesters(parsed.semesters)
      if (typeof parsed.currentSemester === 'string') setCurrentSemesterState(parsed.currentSemester)
      if (Array.isArray(parsed.studyLevels)) setStudyLevels(parsed.studyLevels)
      if (Array.isArray(parsed.buildings)) setBuildings(parsed.buildings)
      if (Array.isArray(parsed.floors)) setFloors(parsed.floors)
      if (Array.isArray(parsed.workDays)) setWorkDays(parsed.workDays)
      if (parsed.roleQuotas && typeof parsed.roleQuotas === 'object') setRoleQuotas({ ...INITIAL_ROLE_QUOTAS, ...parsed.roleQuotas })

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
    addControlStage,
    deleteControlStage,
    updateControlStageTitle,
    updateAllControlStages,

    semesters,
    addSemester,
    deleteSemester,
    currentSemester,
    setCurrentSemester: updateCurrentSemester,

    studyLevels,
    addStudyLevel,
    deleteStudyLevel,

    buildings,
    addBuilding,
    deleteBuilding,

    floors,
    addFloor,
    deleteFloor,

    workDays,
    toggleWorkDay,

    roleQuotas,
    updateRoleQuota,

    syncStatus,
    lastSyncTime,
    manualSync: pushToCloud,
    resetToDefaults,
    exportBackup,
    importBackup,
  }
}
