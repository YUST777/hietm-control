export interface Observer {
  id: string
  name: string
  job: string
  specialization: string
  days: string
  hours?: number
}

export interface Subject {
  id: string
  code: string
  name: string
  dept: string
  year: string
  semester: string
  spec: string
}

export interface Committee {
  id: string
  roomNum: string
  hallName: string
  floor: string
  capacity?: number
}

export interface ScheduleRow {
  id: string
  committeeId: string
  subjectId: string
  obs1: string
  obs2: string
  obs3: string
  duration: number
  notes?: string
}

export interface ScheduleSlot {
  date: string
  period: string
  startTime: string
  semester: string
  academicYear: string
  examType: string
  reserves: string[]
  rows: ScheduleRow[]
}

export interface DailyAttendanceRecord {
  date: string
  period: string
  observerId: string
  observerName: string
  status: 'present' | 'absent' | 'late' | 'excused'
  notes?: string
}

export interface ControlWorkSubject {
  subjectId: string
  subjectName: string
  dept: string
  year: string
  checklist: Record<number, boolean> // 1 to 14
}

export interface PrintSignatures {
  sigSystem: string
  sigTables: string
  sigDean: string
}

export type MainTab = 'proctoring' | 'subjects' | 'control' | 'settings'

export type ProctoringSubTab = 'hours' | 'schedule' | 'days' | 'committees' | 'attendance' | 'status'
