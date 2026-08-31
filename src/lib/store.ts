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

const STORAGE_KEYS = {
  OBSERVERS: 'hietm_local_observers_v3',
  SUBJECTS: 'hietm_local_subjects_v3',
  COMMITTEES: 'hietm_local_committees_v3',
  SCHEDULES: 'hietm_local_schedules_v3',
  ATTENDANCE: 'hietm_local_attendance_v3',
  CONTROL_WORKS: 'hietm_local_works_v3',
  SIGNATURES: 'hietm_local_signatures_v3',
  CURRENT_YEAR: 'hietm_local_year_v3',
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
    loadLocal(STORAGE_KEYS.SIGNATURES, { ...INITIAL_SIGNATURES })
  )
  const [academicYears, setAcademicYears] = useState<string[]>([...INITIAL_ACADEMIC_YEARS])
  const [currentYear, setCurrentYearState] = useState<string>(() =>
    loadLocal(STORAGE_KEYS.CURRENT_YEAR, INITIAL_ACADEMIC_YEARS[0] || '2024 - 2025')
  )

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('syncing')
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const isSyncingRef = useRef(false)
  const debounceTimerRef = useRef<any>(null)

  // Local storage auto-sync (always immediate)
  useEffect(() => saveLocal(STORAGE_KEYS.OBSERVERS, observers), [observers])
  useEffect(() => saveLocal(STORAGE_KEYS.SUBJECTS, subjects), [subjects])
  useEffect(() => saveLocal(STORAGE_KEYS.COMMITTEES, committees), [committees])
  useEffect(() => saveLocal(STORAGE_KEYS.SCHEDULES, schedules), [schedules])
  useEffect(() => saveLocal(STORAGE_KEYS.ATTENDANCE, attendance), [attendance])
  useEffect(() => saveLocal(STORAGE_KEYS.CONTROL_WORKS, controlWorks), [controlWorks])
  useEffect(() => saveLocal(STORAGE_KEYS.SIGNATURES, signatures), [signatures])
  useEffect(() => saveLocal(STORAGE_KEYS.CURRENT_YEAR, currentYear), [currentYear])

  // --- AUTOMATIC BACKGROUND CLOUD SYNC ---

  // 1. Pull latest data from cloud database
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

      if (!res.ok) throw new Error(`HTTP error ${res.status}`)

      const json = await res.json()
      if (json && json.data) {
        const d = json.data
        if (d.observers && d.observers.length > 0) setObservers(d.observers)
        if (d.subjects && d.subjects.length > 0) setSubjects(d.subjects)
        if (d.committees && d.committees.length > 0) setCommittees(d.committees)
        if (d.schedules && d.schedules.length > 0) setSchedules(d.schedules)
        if (d.controlWorks && d.controlWorks.length > 0) setControlWorks(d.controlWorks)
        if (d.signatures) setSignatures(d.signatures)
        if (d.academicYears) setAcademicYears(d.academicYears)
        if (d.currentYear) setCurrentYearState(d.currentYear)
      }

      setSyncStatus('synced')
      setLastSyncTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }))
    } catch (e) {
      console.warn('Could not fetch from cloud, running in local-first mode:', e)
      setSyncStatus('offline')
    }
  }, [])

  // 2. Push local state to cloud database
  const pushToCloud = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSyncStatus('offline')
      return
    }

    if (isSyncingRef.current) return
    isSyncingRef.current = true
    setSyncStatus('syncing')

    try {
      const payload = {
        observers,
        subjects,
        committees,
        schedules,
        controlWorks,
        signatures,
        currentYear,
      }

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error(`HTTP error ${res.status}`)

      setSyncStatus('synced')
      setLastSyncTime(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }))
    } catch (e) {
      console.warn('Could not push to cloud, queued locally:', e)
      setSyncStatus('offline')
    } finally {
      isSyncingRef.current = false
    }
  }, [observers, subjects, committees, schedules, controlWorks, signatures, currentYear])

  // Trigger debounced cloud push whenever data changes
  const queuePush = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      pushToCloud()
    }, 800)
  }, [pushToCloud])

  // Initial pull and network listener
  useEffect(() => {
    pullFromCloud()

    const handleOnline = () => {
      console.log('Network connected! Syncing with cloud database...')
      pushToCloud()
    }

    const handleOffline = () => {
      setSyncStatus('offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
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

  // 5. Control Works
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

  // 6. Signatures & Settings
  const updateSignatures = (sigs: PrintSignatures) => {
    setSignatures(sigs)
    queuePush()
  }

  const updateCurrentYear = (year: string) => {
    setCurrentYearState(year)
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
      setSignatures({ ...INITIAL_SIGNATURES })
      setCurrentYearState(INITIAL_ACADEMIC_YEARS[0] || '2024 - 2025')
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

    syncStatus,
    lastSyncTime,
    manualSync: pushToCloud,
    resetToDefaults,
    exportBackup,
  }
}
