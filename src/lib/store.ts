import { useState, useEffect } from 'react'
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
  OBSERVERS: 'hietm_control_observers_v1',
  SUBJECTS: 'hietm_control_subjects_v1',
  COMMITTEES: 'hietm_control_committees_v1',
  SCHEDULES: 'hietm_control_schedules_v1',
  ATTENDANCE: 'hietm_control_attendance_v1',
  CONTROL_WORKS: 'hietm_control_works_v1',
  SIGNATURES: 'hietm_control_signatures_v1',
  CURRENT_YEAR: 'hietm_control_year_v1',
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
  const [academicYears] = useState<string[]>([...INITIAL_ACADEMIC_YEARS])
  const [currentYear, setCurrentYear] = useState<string>(() =>
    loadLocal(STORAGE_KEYS.CURRENT_YEAR, INITIAL_ACADEMIC_YEARS[0] || '2024 - 2025')
  )

  useEffect(() => saveLocal(STORAGE_KEYS.OBSERVERS, observers), [observers])
  useEffect(() => saveLocal(STORAGE_KEYS.SUBJECTS, subjects), [subjects])
  useEffect(() => saveLocal(STORAGE_KEYS.COMMITTEES, committees), [committees])
  useEffect(() => saveLocal(STORAGE_KEYS.SCHEDULES, schedules), [schedules])
  useEffect(() => saveLocal(STORAGE_KEYS.ATTENDANCE, attendance), [attendance])
  useEffect(() => saveLocal(STORAGE_KEYS.CONTROL_WORKS, controlWorks), [controlWorks])
  useEffect(() => saveLocal(STORAGE_KEYS.SIGNATURES, signatures), [signatures])
  useEffect(() => saveLocal(STORAGE_KEYS.CURRENT_YEAR, currentYear), [currentYear])

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
      setCurrentYear(INITIAL_ACADEMIC_YEARS[0] || '2024 - 2025')
    }
  }

  // Export database as JSON backup
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
    subjects,
    setSubjects,
    committees,
    setCommittees,
    schedules,
    setSchedules,
    attendance,
    setAttendance,
    controlWorks,
    setControlWorks,
    signatures,
    setSignatures,
    academicYears,
    currentYear,
    setCurrentYear,
    resetToDefaults,
    exportBackup,
  }
}
