import React, { useState, useMemo } from 'react'
import type {
  Observer,
  ScheduleSlot,
  DailyAttendanceRecord,
  PrintSignatures,
  SystemBranding,
} from '../../types/control'
import {
  UserCheck,
  Calendar,
  Clock,
  Printer,
  Save,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock4,
  Search,
} from 'lucide-react'

interface AttendanceViewProps {
  observers: Observer[]
  schedules: ScheduleSlot[]
  attendance: DailyAttendanceRecord[]
  signatures: PrintSignatures
  branding: SystemBranding
  currentYear: string
  onSaveAttendance: (records: DailyAttendanceRecord[]) => void
}

const PERIODS = [
  'الفترة الأولى (9:00 - 11:00)',
  'الفترة الثانية (11:30 - 1:30)',
  'الفترة الثالثة (2:00 - 4:00)',
]

// Helper to determine day of week in Arabic from date string (YYYY-MM-DD)
function getArabicDayName(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('ar-EG', { weekday: 'long' })
  } catch {
    return ''
  }
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  observers,
  schedules,
  attendance,
  signatures,
  branding,
  currentYear,
  onSaveAttendance,
}) => {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [period, setPeriod] = useState(PERIODS[0])
  const [search, setSearch] = useState('')

  const currentDayName = useMemo(() => getArabicDayName(date), [date])
  const primaryColor = branding.primaryColor || '#1f4d78'

  // Find corresponding schedule slot for current date and period
  const currentSlot = useMemo(() => {
    const slotId = `${date}_${period}`.replace(/\s+/g, '_')
    return (
      schedules.find((s) => s.id === slotId || (s.date === date && s.period === period)) || null
    )
  }, [schedules, date, period])

  // Extract all assigned observers for this slot (from rows + reserves)
  const slotAssignedProctors = useMemo(() => {
    if (!currentSlot) return []

    const list: {
      observerName: string
      roleType: string
      committeeName: string
    }[] = []

    const addedNames = new Set<string>()

    // 1. From Rows
    if (currentSlot.rows && currentSlot.rows.length > 0) {
      currentSlot.rows.forEach((r, idx) => {
        const commLabel = `لجنة ${idx + 1}`
        if (r.obs1 && !addedNames.has(r.obs1)) {
          addedNames.add(r.obs1)
          list.push({ observerName: r.obs1, roleType: 'مراقب رئيسي', committeeName: commLabel })
        }
        if (r.obs2 && !addedNames.has(r.obs2)) {
          addedNames.add(r.obs2)
          list.push({ observerName: r.obs2, roleType: 'مراقب مساعد', committeeName: commLabel })
        }
        if (r.obs3 && !addedNames.has(r.obs3)) {
          addedNames.add(r.obs3)
          list.push({ observerName: r.obs3, roleType: 'مراقب إضافي', committeeName: commLabel })
        }
      })
    }

    // 2. From Reserves
    if (currentSlot.reserves && currentSlot.reserves.length > 0) {
      currentSlot.reserves.forEach((resName) => {
        if (resName && !addedNames.has(resName)) {
          addedNames.add(resName)
          list.push({ observerName: resName, roleType: 'احتياطي فترة', committeeName: 'غرفة الكنترول' })
        }
      })
    }

    return list
  }, [currentSlot])

  // Local attendance state for current date & period
  const [localRecords, setLocalRecords] = useState<DailyAttendanceRecord[]>([])

  // Synchronize localRecords when date/period changes or when slot changes
  React.useEffect(() => {
    // Check if we already have saved records for this date & period
    const existing = attendance.filter((a) => a.date === date && a.period === period)

    if (existing.length > 0) {
      setLocalRecords(existing)
    } else if (slotAssignedProctors.length > 0) {
      // Initialize from slot proctors with default 'present'
      const initial: DailyAttendanceRecord[] = slotAssignedProctors.map((p) => {
        const obsObj = observers.find((o) => o.name === p.observerName)
        return {
          date,
          period,
          observerId: obsObj?.id || p.observerName,
          observerName: p.observerName,
          status: 'present',
          notes: `${p.roleType} - ${p.committeeName}`,
        }
      })
      setLocalRecords(initial)
    } else {
      // Fallback: If no slot created yet, list all observers
      const initial: DailyAttendanceRecord[] = observers.slice(0, 15).map((o) => ({
        date,
        period,
        observerId: o.id,
        observerName: o.name,
        status: 'present',
        notes: o.job,
      }))
      setLocalRecords(initial)
    }
  }, [date, period, slotAssignedProctors, attendance, observers])

  // Update single record status
  const updateStatus = (
    observerName: string,
    status: 'present' | 'absent' | 'late' | 'excused'
  ) => {
    setLocalRecords((prev) =>
      prev.map((r) => (r.observerName === observerName ? { ...r, status } : r))
    )
  }

  // Update notes
  const updateNotes = (observerName: string, notes: string) => {
    setLocalRecords((prev) =>
      prev.map((r) => (r.observerName === observerName ? { ...r, notes } : r))
    )
  }

  // Mark all present
  const handleMarkAllPresent = () => {
    setLocalRecords((prev) => prev.map((r) => ({ ...r, status: 'present' })))
  }

  // Save current sheet
  const handleSave = () => {
    // Remove old records for this slot, append updated ones
    const otherRecords = attendance.filter((a) => !(a.date === date && a.period === period))
    onSaveAttendance([...otherRecords, ...localRecords])
  }

  // Filtered display
  const filteredRecords = useMemo(() => {
    return localRecords.filter((r) => !search || r.observerName.toLowerCase().includes(search.toLowerCase()))
  }, [localRecords, search])

  // KPI Summary
  const stats = useMemo(() => {
    let present = 0,
      absent = 0,
      late = 0,
      excused = 0
    localRecords.forEach((r) => {
      if (r.status === 'present') present++
      else if (r.status === 'absent') absent++
      else if (r.status === 'late') late++
      else if (r.status === 'excused') excused++
    })
    return { total: localRecords.length, present, absent, late, excused }
  }, [localRecords])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[#dededb] bg-white p-2.5 shadow-sm print-hide">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Header Title */}
          <div className="flex items-center gap-2">
            <UserCheck className="size-4.5" style={{ color: primaryColor }} />
            <h2 className="text-xs font-black text-[#171717]">
              تسجيل الحضور اليومي للمراقبات
            </h2>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 rounded-lg border border-[#cfcfcb] bg-[#fafaf8] px-2 py-1">
            <Calendar className="size-3.5 text-[#666]" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#171717] outline-none cursor-pointer"
            />
            {currentDayName && (
              <span
                className="rounded px-1.5 py-0.2 text-[10px] font-bold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {currentDayName}
              </span>
            )}
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-1.5 rounded-lg border border-[#cfcfcb] bg-[#fafaf8] px-2 py-1">
            <Clock className="size-3.5 text-[#666]" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#171717] outline-none cursor-pointer"
            >
              {PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-2 top-2 size-3 text-[#888]" />
            <input
              type="text"
              placeholder="بحث باسم المراقب..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 w-40 rounded-lg border border-[#cfcfcb] pr-6 pl-2 text-xs font-semibold outline-none focus:border-[#1f4d78]"
            />
          </div>
        </div>

        {/* Stats Badges & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick stats pills */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold">
            <span className="rounded-md bg-[#f0fdf4] text-[#15803d] px-2 py-0.5 border border-[#bbf7d0]">
              حاضر: {stats.present}
            </span>
            <span className="rounded-md bg-[#fef2f2] text-[#b91c1c] px-2 py-0.5 border border-[#fecaca]">
              غائب: {stats.absent}
            </span>
            <span className="rounded-md bg-[#fffbeb] text-[#b45309] px-2 py-0.5 border border-[#fde68a]">
              متأخر: {stats.late}
            </span>
          </div>

          {/* Mark All Present */}
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="flex items-center gap-1 rounded-lg border border-[#cfcfcb] bg-[#fafaf8] px-2.5 py-1.5 text-xs font-bold text-[#333] hover:bg-[#eaeae7] transition"
          >
            <CheckCircle2 className="size-3.5 text-[#15803d]" />
            <span>تسجيل الكل حاضر</span>
          </button>

          {/* Save Sheet */}
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-90 transition"
            style={{ backgroundColor: '#155724' }}
          >
            <Save className="size-3.5" />
            <span>حفظ الكشف</span>
          </button>

          {/* Print Attendance Sheet */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-90 transition"
            style={{ backgroundColor: primaryColor }}
          >
            <Printer className="size-3.5" />
            <span>طباعة كشف الحضور (A4)</span>
          </button>
        </div>
      </div>

      {/* Printable Official Header */}
      <div className="hidden print:flex print:flex-col print:mb-3 print:border-b-2 print:border-black print:pb-2">
        <div className="flex items-center justify-between text-xs font-black">
          <div className="text-right">
            <p>وزارة التعليم العالي</p>
            <p>{branding.instituteName || 'المعهد العالي للهندسة والتكنولوجيا'}</p>
            <p>إدارة الكنترول والجداول الامتحانية</p>
          </div>
          <div className="text-center">
            <h2 className="text-sm font-black underline">كشف توثيق حضور وانصراف المراقبين والملاحظين</h2>
            <p className="text-[11px] font-bold mt-0.5">
              العام الجامعي: {currentYear} — {currentDayName} ({date})
            </p>
          </div>
          <div className="text-left">
            <p>الفترة: {period}</p>
            <p>إجمالي المكلفين: {stats.total}</p>
            <p>نسبة الحضور: {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 100}%</p>
          </div>
        </div>
      </div>

      {/* Main Attendance Table */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dededb] bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-center text-xs">
            <thead className="sticky top-0 z-10 bg-[#eef3f8]">
              <tr className="text-[10px] font-black text-[#171717]">
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-10">م</th>
                <th className="border-b border-l border-[#cfcfcb] px-3 py-1.5 text-right min-w-48">
                  اسم المراقب / الملاحظ
                </th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 min-w-36">
                  الوظيفة / التكليف
                </th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 min-w-44 print-hide">
                  حالة الحضور
                </th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 min-w-36">ملاحظات والتكليف البديل</th>
                <th className="border-b border-[#cfcfcb] px-2 py-1.5 w-32">توقيع الحضور الرسمي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecece9]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs font-bold text-[#888]">
                    لا توجد سجلات حضور لهذه الفترة. تأكد من تحديد التاريخ والفترة الصحيحة.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => {
                  const obsObj = observers.find((o) => o.name === r.observerName)
                  return (
                    <tr key={r.observerName} className="hover:bg-[#fbfbfa] transition">
                      <td className="border-b border-l border-[#ecece9] px-1 py-1 font-bold text-[#888]">
                        {idx + 1}
                      </td>

                      {/* Proctor Name */}
                      <td className="border-b border-l border-[#ecece9] px-3 py-1 text-right font-black text-[#171717]">
                        <div className="flex items-center gap-1.5">
                          <span>{r.observerName}</span>
                          {obsObj && (
                            <span className="text-[10px] font-semibold text-[#666]">
                              ({obsObj.specialization || obsObj.job})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Job / Assignment */}
                      <td className="border-b border-l border-[#ecece9] px-2 py-1 text-xs font-semibold text-[#555]">
                        <span className="rounded bg-[#f1f5f9] px-2 py-0.5 text-[10.5px] font-bold text-[#334155]">
                          {r.notes || obsObj?.job || 'مراقب'}
                        </span>
                      </td>

                      {/* Status Toggle Buttons (Print-Hide) */}
                      <td className="border-b border-l border-[#ecece9] px-2 py-1 print-hide">
                        <div className="inline-flex items-center gap-1 rounded-lg border border-[#cfcfcb] bg-[#fafaf8] p-0.5 text-[10.5px] font-bold">
                          <button
                            type="button"
                            onClick={() => updateStatus(r.observerName, 'present')}
                            className={`flex items-center gap-1 rounded-md px-2 py-0.5 transition ${
                              r.status === 'present'
                                ? 'bg-[#15803d] text-white shadow-xs'
                                : 'text-[#555] hover:bg-[#e6e6e3]'
                            }`}
                          >
                            <CheckCircle2 className="size-3" />
                            <span>حاضر</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => updateStatus(r.observerName, 'absent')}
                            className={`flex items-center gap-1 rounded-md px-2 py-0.5 transition ${
                              r.status === 'absent'
                                ? 'bg-[#dc2626] text-white shadow-xs'
                                : 'text-[#555] hover:bg-[#e6e6e3]'
                            }`}
                          >
                            <XCircle className="size-3" />
                            <span>غائب</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => updateStatus(r.observerName, 'late')}
                            className={`flex items-center gap-1 rounded-md px-2 py-0.5 transition ${
                              r.status === 'late'
                                ? 'bg-[#d97706] text-white shadow-xs'
                                : 'text-[#555] hover:bg-[#e6e6e3]'
                            }`}
                          >
                            <Clock4 className="size-3" />
                            <span>متأخر</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => updateStatus(r.observerName, 'excused')}
                            className={`flex items-center gap-1 rounded-md px-2 py-0.5 transition ${
                              r.status === 'excused'
                                ? 'bg-[#2563eb] text-white shadow-xs'
                                : 'text-[#555] hover:bg-[#e6e6e3]'
                            }`}
                          >
                            <AlertCircle className="size-3" />
                            <span>معتذر</span>
                          </button>
                        </div>
                      </td>

                      {/* Notes / Replacement */}
                      <td className="border-b border-l border-[#ecece9] px-2 py-1">
                        <input
                          type="text"
                          value={r.notes || ''}
                          onChange={(e) => updateNotes(r.observerName, e.target.value)}
                          placeholder="ملاحظات أو بديل..."
                          className="h-6.5 w-full rounded border border-transparent bg-transparent px-1.5 text-xs font-semibold text-[#333] hover:border-[#cfcfcb] focus:border-[#1f4d78] focus:bg-white outline-none"
                        />
                      </td>

                      {/* Signature Cell */}
                      <td className="border-b border-[#ecece9] px-2 py-1">
                        <div className="h-6 w-full border-b border-dotted border-[#aaa]" />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Signatures Footer (Printable) */}
      <div className="mt-2 flex items-center justify-between border-t border-[#dededb] pt-2 px-3 text-center text-xs font-black text-[#171717]">
        <div className="flex flex-col items-center">
          <p className="text-[11px] font-bold text-[#666]">مسؤول تسجيل الحضور:</p>
          <p className="mt-0.5 text-xs font-black">.......................................</p>
          <p className="text-[10px] font-normal text-[#888]">التوقيع: .....................</p>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-[11px] font-bold text-[#666]">مدير النظام ورئيس الكنترول:</p>
          <p className="mt-0.5 text-xs font-black">{signatures.sigSystem || 'أ.م.د. علي سمير عوض'}</p>
          <p className="text-[10px] font-normal text-[#888]">التوقيع: .....................</p>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-[11px] font-bold text-[#666]">عميد المعهد:</p>
          <p className="mt-0.5 text-xs font-black">{signatures.sigDean || 'أ.د. رجب عبد العزيز السحيمي'}</p>
          <p className="text-[10px] font-normal text-[#888]">التوقيع: .....................</p>
        </div>
      </div>
    </div>
  )
}
