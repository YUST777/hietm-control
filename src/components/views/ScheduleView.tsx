import React, { useState, useMemo } from 'react'
import type {
  Observer,
  Subject,
  Committee,
  ScheduleSlot,
  ScheduleRow,
  PrintSignatures,
  SystemBranding,
} from '../../types/control'
import { Plus, Trash2, Save, Printer, AlertTriangle, UserCheck, RefreshCcw } from 'lucide-react'

interface ScheduleViewProps {
  observers: Observer[]
  subjects: Subject[]
  committees: Committee[]
  schedules: ScheduleSlot[]
  currentYear: string
  signatures: PrintSignatures
  branding?: SystemBranding
  periods?: string[]
  semesters?: string[]
  currentSemester?: string
  onSaveSlot: (slot: ScheduleSlot) => void
}

const DEFAULT_PERIODS = [
  'الفترة الأولى (9:00 - 11:00)',
  'الفترة الثانية (11:30 - 1:30)',
  'الفترة الثالثة (2:00 - 4:00)',
]

const DEFAULT_SEMESTERS = [
  'الفصل الدراسي الأول',
  'الفصل الدراسي الثاني',
  'الفصل الصيفي (Summer)',
  'امتحانات التخلفات والتكميلي',
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

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  observers,
  subjects,
  committees,
  schedules,
  currentYear,
  signatures,
  branding,
  periods = DEFAULT_PERIODS,
  semesters = DEFAULT_SEMESTERS,
  currentSemester = 'الفصل الدراسي الثاني',
  onSaveSlot,
}) => {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [period, setPeriod] = useState(periods[0] || DEFAULT_PERIODS[0])
  const [startTime, setStartTime] = useState('09:00 AM')
  const [semester, setSemester] = useState(currentSemester || semesters[0] || DEFAULT_SEMESTERS[0])
  const [examType, setExamType] = useState('تحريري')

  // Reserves list
  const [reserves, setReserves] = useState<string[]>([])
  const [selectedReserveToAdd, setSelectedReserveToAdd] = useState('')

  const currentDayName = useMemo(() => getArabicDayName(date), [date])

  // Rows for current schedule slot
  const [rows, setRows] = useState<ScheduleRow[]>(() => {
    return committees.slice(0, 8).map((c, i) => ({
      id: `row_${i}_${Date.now()}`,
      committeeId: c.id,
      subjectId: subjects[i % subjects.length]?.id || '',
      obs1: '',
      obs2: '',
      obs3: '',
      duration: 2,
    }))
  })

  // Add new 100% EMPTY row (not prefilled)
  const addEmptyRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `row_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        committeeId: '',
        subjectId: '',
        obs1: '',
        obs2: '',
        obs3: '',
        duration: 2,
      },
    ])
  }

  // Clear all rows
  const clearAllRows = () => {
    if (window.confirm('هل تريد مسح جميع صفوف الجدول والبدء من جديد بجدول فارغ؟')) {
      setRows([])
    }
  }

  // Remove row
  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  // Update row field
  const updateRow = (id: string, field: keyof ScheduleRow, value: any) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  // Add reserve
  const addReserve = () => {
    const trimmed = selectedReserveToAdd.trim()
    if (trimmed && !reserves.includes(trimmed)) {
      setReserves((prev) => [...prev, trimmed])
      setSelectedReserveToAdd('')
    }
  }

  // Remove reserve
  const removeReserve = (name: string) => {
    setReserves((prev) => prev.filter((r) => r !== name))
  }

  // Check for duplicate proctors across committees in this same slot (conflict detection with trimmed names)
  const conflicts = useMemo(() => {
    const assigned = new Map<string, number>()
    rows.forEach((r) => {
      const o1 = (r.obs1 || '').trim()
      const o2 = (r.obs2 || '').trim()
      const o3 = (r.obs3 || '').trim()
      if (o1) assigned.set(o1, (assigned.get(o1) || 0) + 1)
      if (o2) assigned.set(o2, (assigned.get(o2) || 0) + 1)
      if (o3) assigned.set(o3, (assigned.get(o3) || 0) + 1)
    })
    reserves.forEach((res) => {
      const rName = (res || '').trim()
      if (rName) assigned.set(rName, (assigned.get(rName) || 0) + 1)
    })

    const duplicateNames: string[] = []
    assigned.forEach((count, name) => {
      if (count > 1) duplicateNames.push(name)
    })
    return duplicateNames
  }, [rows, reserves])

  // Helper: check if observer is available on the chosen date
  const isObserverAvailableOnDay = (obs: Observer, dayName: string) => {
    if (!obs.days || !dayName) return true
    const dayKeywords = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
    const cleanDay = dayKeywords.find((k) => dayName.includes(k)) || ''
    if (!cleanDay) return true
    return obs.days.includes(cleanDay)
  }

  // Save Schedule Slot
  const handleSave = () => {
    const slotData: ScheduleSlot = {
      id: `${date}_${period}`.replace(/\s+/g, '_'),
      date,
      period,
      startTime,
      semester,
      academicYear: currentYear,
      examType,
      reserves,
      rows,
    }
    onSaveSlot(slotData)
  }

  // Load existing slot if available, or reset to empty template
  const handleDateOrPeriodChange = (newDate: string, newPeriod: string) => {
    setDate(newDate)
    setPeriod(newPeriod)
    const slotId = `${newDate}_${newPeriod}`.replace(/\s+/g, '_')
    const existing = schedules.find((s) => s.id === slotId)
    if (existing && existing.rows && existing.rows.length > 0) {
      setRows(existing.rows)
      setReserves(existing.reserves || [])
      if (existing.startTime) setStartTime(existing.startTime)
      if (existing.semester) setSemester(existing.semester)
      if (existing.examType) setExamType(existing.examType)
    } else {
      // Clean template for uncreated slot
      const initialRows: ScheduleRow[] = committees.slice(0, 8).map((c, i) => ({
        id: `row_${i}_${Date.now()}`,
        committeeId: c.id,
        subjectId: subjects[i % subjects.length]?.id || '',
        obs1: '',
        obs2: '',
        obs3: '',
        duration: 2,
      }))
      setRows(initialRows)
      setReserves([])
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[#dededb] bg-white p-2.5 shadow-sm print-hide">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 rounded-lg border border-[#cfcfcb] bg-[#fafaf8] px-2 py-1">
            <span className="text-[11px] font-bold text-[#555]">التاريخ:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateOrPeriodChange(e.target.value, period)}
              className="bg-transparent text-xs font-bold text-[#171717] outline-none cursor-pointer"
            />
            {currentDayName && (
              <span className="rounded bg-[#1f4d78] px-1.5 py-0.2 text-[10.5px] font-bold text-white">
                {currentDayName}
              </span>
            )}
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-1.5 rounded-lg border border-[#cfcfcb] bg-[#fafaf8] px-2 py-1">
            <span className="text-[11px] font-bold text-[#555]">الفترة:</span>
            <select
              value={period}
              onChange={(e) => handleDateOrPeriodChange(date, e.target.value)}
              className="bg-transparent text-xs font-bold text-[#171717] outline-none cursor-pointer pr-2 pl-6"
            >
              {periods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Start Time */}
          <div className="flex items-center gap-1.5 rounded-lg border border-[#cfcfcb] bg-[#fafaf8] px-2 py-1">
            <span className="text-[11px] font-bold text-[#555]">بداية الفترة:</span>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#171717] outline-none cursor-pointer pr-2 pl-6"
            >
              <option value="09:00 AM">09:00 AM</option>
              <option value="11:30 AM">11:30 AM</option>
              <option value="02:00 PM">02:00 PM</option>
            </select>
          </div>

          {/* Semester */}
          <div className="flex items-center gap-1.5 rounded-lg border border-[#cfcfcb] bg-[#fafaf8] px-2 py-1">
            <span className="text-[11px] font-bold text-[#555]">الفصل:</span>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#171717] outline-none cursor-pointer pr-2 pl-6"
            >
              {semesters.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Type */}
          <div className="flex items-center gap-1.5 rounded-lg border border-[#cfcfcb] bg-[#fafaf8] px-2 py-1">
            <span className="text-[11px] font-bold text-[#555]">نوع الامتحان:</span>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#171717] outline-none cursor-pointer pr-2 pl-6"
            >
              <option value="تحريري">تحريري (نظري)</option>
              <option value="عملي / شفوي">عملي / شفوي</option>
              <option value="منتصف الفصل (Midterm)">منتصف الفصل (Midterm)</option>
              <option value="تخلفات وتكميلي">تخلفات وتكميلي</option>
              <option value="امتحان دور ثاني">امتحان دور ثاني</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Add Empty Committee Row */}
          <button
            type="button"
            onClick={addEmptyRow}
            className="flex items-center gap-1.5 rounded-lg border border-[#cfcfcb] bg-[#fafaf8] px-3 py-1.5 text-xs font-bold text-[#171717] hover:bg-[#eaeae7] transition cursor-pointer"
            title="إضافة صف لجنة فارغ بدون تعبئة مسبقة"
          >
            <Plus className="size-3.5 text-[#1f4d78]" />
            <span>إضافة لجنة</span>
          </button>

          {/* Clear Rows */}
          <button
            type="button"
            onClick={clearAllRows}
            className="flex items-center gap-1 rounded-lg border border-[#fee2e2] bg-[#fff5f5] px-2 py-1.5 text-xs font-bold text-[#c5221f] hover:bg-[#fee2e2] transition cursor-pointer"
            title="إفراغ الجدول للبدء من جديد"
          >
            <RefreshCcw className="size-3" />
          </button>

          {/* Save Schedule */}
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg bg-[#155724] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#0e3c18] transition cursor-pointer"
          >
            <Save className="size-3.5" />
            <span>حفظ التوزيع</span>
          </button>

          {/* Print A4 */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg bg-[#1f4d78] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#163756] transition cursor-pointer"
          >
            <Printer className="size-3.5" />
            <span>طباعة الكشف (A4)</span>
          </button>
        </div>
      </div>

      {/* Conflict Warning Banner */}
      {conflicts.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-[#fca5a5] bg-[#fef2f2] px-3 py-2 text-xs font-bold text-[#991b1b] shadow-2xs print-hide">
          <AlertTriangle className="size-4 shrink-0 text-[#dc2626]" />
          <span>
            تنبيه تعارض في المراقبة: المراقب ({conflicts.join('، ')}) تم توزيعه في أكثر من لجنة بنفس الفترة!
            يرجى تعديل اللجنة لتجنب الازدواج
          </span>
        </div>
      )}

      {/* Printable Official Header */}
      <div className="hidden print:flex print:flex-col print:mb-3 print:border-b-2 print:border-black print:pb-2">
        <div className="flex items-center justify-between text-xs font-black">
          <div className="text-right">
            <p>{branding?.headerLine1 || 'وزارة التعليم العالي'}</p>
            <p>{branding?.headerLine2 || branding?.instituteName || 'المعهد العالي للهندسة والتكنولوجيا'}</p>
            <p>{branding?.headerLine3 || 'إدارة الكنترول والجداول الامتحانية'}</p>
          </div>
          <div className="text-center">
            <h2 className="text-sm font-black underline">كشف توزيع الملاحظات والمراقبات الامتحانية</h2>
            <p className="text-[11px] font-bold mt-0.5">
              العام الجامعي: {currentYear} — {semester} ({examType})
            </p>
          </div>
          <div className="text-left">
            <p>اليوم: {currentDayName}</p>
            <p>التاريخ: {date}</p>
            <p>الفترة: {period}</p>
          </div>
        </div>
      </div>

      {/* Main Examination Table */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dededb] bg-white shadow-xs">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-center text-xs">
            <thead className="sticky top-0 z-10 bg-[#eef3f8]">
              <tr className="text-[10px] font-black text-[#171717]">
                <th className="border-b border-l border-[#cfcfcb] px-1 py-1 w-8">م</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1 min-w-48">اللجنة والقاعة</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1 min-w-52">المقرر الدراسي</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1 min-w-44">مراقب رئيسي (1)</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1 min-w-44">مراقب مساعد (2)</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1 min-w-40">مراقب إضافي (3)</th>
                <th className="border-b border-l border-[#cfcfcb] px-1 py-1 w-14">الزمن (س)</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1 w-20">التوقيع</th>
                <th className="border-b border-[#cfcfcb] px-1 py-1 w-10 print-hide">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecece9]">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs font-bold text-[#888]">
                    لا توجد لجان مضافة حتى الآن. انقر على زر "إضافة لجنة" للبدء.
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => {
                  const hasObs1Conflict = r.obs1 && conflicts.includes(r.obs1.trim())
                  const hasObs2Conflict = r.obs2 && conflicts.includes(r.obs2.trim())
                  const hasObs3Conflict = r.obs3 && conflicts.includes(r.obs3.trim())

                  // Fallback checks for orphaned committee or subject IDs
                  const committeeFound = !r.committeeId || committees.some((c) => c.id === r.committeeId)
                  const subjectFound = !r.subjectId || subjects.some((s) => s.id === r.subjectId)

                  return (
                    <tr key={r.id} className="hover:bg-[#fbfbfa] transition">
                      <td className="border-b border-l border-[#ecece9] px-1 py-1 font-bold text-[#888]">
                        {idx + 1}
                      </td>

                      {/* Committee Selection */}
                      <td className="border-b border-l border-[#ecece9] px-1 py-1">
                        <select
                          value={r.committeeId}
                          onChange={(e) => updateRow(r.id, 'committeeId', e.target.value)}
                          className={`h-7 w-full rounded-lg border px-2 text-[11px] font-bold outline-none focus:border-[#1f4d78] truncate ${
                            !r.committeeId
                              ? 'border-[#f59e0b] bg-[#fffbeb] text-[#b45309]'
                              : 'border-[#cfcfcb] bg-white text-[#171717]'
                          }`}
                        >
                          <option value="">-- اختر اللجنة والقاعة --</option>
                          {!committeeFound && (
                            <option value={r.committeeId}>لجنة سابقة ({r.committeeId})</option>
                          )}
                          {committees.map((c) => (
                            <option key={c.id} value={c.id}>
                              لجنة {c.roomNum} — {c.hallName} ({c.floor})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Subject Selection */}
                      <td className="border-b border-l border-[#ecece9] px-1 py-1">
                        <select
                          value={r.subjectId}
                          onChange={(e) => updateRow(r.id, 'subjectId', e.target.value)}
                          className={`h-7 w-full rounded-lg border px-2 text-[11px] font-bold outline-none focus:border-[#1f4d78] truncate ${
                            !r.subjectId
                              ? 'border-[#f59e0b] bg-[#fffbeb] text-[#b45309]'
                              : 'border-[#cfcfcb] bg-white text-[#171717]'
                          }`}
                        >
                          <option value="">-- اختر المقرر الدراسي --</option>
                          {!subjectFound && (
                            <option value={r.subjectId}>مقرر سابق ({r.subjectId})</option>
                          )}
                          {subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.code}) - {s.dept}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Observer 1 (Primary) */}
                      <td className="border-b border-l border-[#ecece9] px-1 py-1">
                        <select
                          value={r.obs1}
                          onChange={(e) => updateRow(r.id, 'obs1', e.target.value)}
                          className={`h-7 w-full rounded-lg border px-2 text-[11px] font-bold outline-none transition truncate ${
                            hasObs1Conflict
                              ? 'border-[#dc2626] bg-[#fee2e2] text-[#991b1b]'
                              : 'border-[#cfcfcb] bg-white text-[#171717]'
                          }`}
                        >
                          <option value="">-- اختيـاري --</option>
                          {observers.map((o) => {
                            const isAvail = isObserverAvailableOnDay(o, currentDayName)
                            const isConf = conflicts.includes(o.name.trim())
                            const prefix = isConf ? '⚠️ ' : !isAvail ? `⏳ (غير متاح ${currentDayName}) ` : ''
                            return (
                              <option key={o.id} value={o.name}>
                                {prefix}{o.name} ({o.job})
                              </option>
                            )
                          })}
                        </select>
                      </td>

                      {/* Observer 2 (Assistant) */}
                      <td className="border-b border-l border-[#ecece9] px-1 py-1">
                        <select
                          value={r.obs2}
                          onChange={(e) => updateRow(r.id, 'obs2', e.target.value)}
                          className={`h-7 w-full rounded-lg border px-2 text-[11px] font-bold outline-none transition truncate ${
                            hasObs2Conflict
                              ? 'border-[#dc2626] bg-[#fee2e2] text-[#991b1b]'
                              : 'border-[#cfcfcb] bg-white text-[#171717]'
                          }`}
                        >
                          <option value="">-- اختيـاري --</option>
                          {observers.map((o) => {
                            const isAvail = isObserverAvailableOnDay(o, currentDayName)
                            const isConf = conflicts.includes(o.name.trim())
                            const prefix = isConf ? '⚠️ ' : !isAvail ? `⏳ (غير متاح ${currentDayName}) ` : ''
                            return (
                              <option key={o.id} value={o.name}>
                                {prefix}{o.name} ({o.job})
                              </option>
                            )
                          })}
                        </select>
                      </td>

                      {/* Observer 3 (Additional) */}
                      <td className="border-b border-l border-[#ecece9] px-1 py-1">
                        <select
                          value={r.obs3}
                          onChange={(e) => updateRow(r.id, 'obs3', e.target.value)}
                          className={`h-7 w-full rounded-lg border px-2 text-[11px] font-bold outline-none transition truncate ${
                            hasObs3Conflict
                              ? 'border-[#dc2626] bg-[#fee2e2] text-[#991b1b]'
                              : 'border-[#cfcfcb] bg-white text-[#171717]'
                          }`}
                        >
                          <option value="">-- اختيـاري --</option>
                          {observers.map((o) => {
                            const isAvail = isObserverAvailableOnDay(o, currentDayName)
                            const isConf = conflicts.includes(o.name.trim())
                            const prefix = isConf ? '⚠️ ' : !isAvail ? `⏳ (غير متاح ${currentDayName}) ` : ''
                            return (
                              <option key={o.id} value={o.name}>
                                {prefix}{o.name} ({o.job})
                              </option>
                            )
                          })}
                        </select>
                      </td>

                      {/* Duration */}
                      <td className="border-b border-l border-[#ecece9] px-1 py-1">
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="8"
                          value={r.duration}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value)
                            updateRow(r.id, 'duration', isNaN(val) ? 2 : Math.max(0.5, val))
                          }}
                          className="h-7 w-12 rounded-lg border border-[#cfcfcb] bg-white text-center text-xs font-bold text-[#171717] outline-none"
                        />
                      </td>

                      {/* Signature (Printable) */}
                      <td className="border-b border-l border-[#ecece9] px-1 py-1">
                        <div className="h-6.5 w-full border-b border-dotted border-[#aaa]" />
                      </td>

                      {/* Delete Action */}
                      <td className="border-b border-[#ecece9] px-1 py-1 text-center print-hide">
                        <button
                          type="button"
                          onClick={() => removeRow(r.id)}
                          className="rounded p-1 text-[#c5221f] hover:bg-[#fee2e2] transition cursor-pointer"
                          title="حذف هذا الصف"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reserves Section */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[#dededb] bg-[#fafaf8] p-2 text-xs font-bold shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-[#1f4d78]">
            <UserCheck className="size-4" />
            <span>مراقبو الاحتياطي (Reserves):</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {reserves.map((res) => (
              <span
                key={res}
                className="inline-flex items-center gap-1 rounded-md bg-[#eef3f8] px-2 py-0.5 text-xs font-bold text-[#1f4d78] border border-[#cfcfcb]"
              >
                <span>{res}</span>
                <button
                  type="button"
                  onClick={() => removeReserve(res)}
                  className="rounded-full text-[#c5221f] hover:bg-[#fee2e2] p-0.5 print-hide cursor-pointer"
                >
                  <Trash2 className="size-2.5" />
                </button>
              </span>
            ))}
            {reserves.length === 0 && (
              <span className="text-[11px] font-semibold text-[#888]">لم يتم تحديد احتياطي لهذه الفترة</span>
            )}
          </div>
        </div>

        {/* Add Reserve Proctor Dropdown */}
        <div className="flex items-center gap-1.5 print-hide">
          <select
            value={selectedReserveToAdd}
            onChange={(e) => setSelectedReserveToAdd(e.target.value)}
            className="h-7.5 rounded-lg border border-[#cfcfcb] bg-white px-2 text-xs font-bold text-[#333] outline-none cursor-pointer pr-2 pl-6"
          >
            <option value="">-- اختر مراقب احتياطي --</option>
            {observers
              .filter((o) => !reserves.includes(o.name))
              .map((o) => {
                const isAvail = isObserverAvailableOnDay(o, currentDayName)
                const isConf = conflicts.includes(o.name.trim())
                const prefix = isConf ? '⚠️ ' : !isAvail ? `⏳ (غير متاح ${currentDayName}) ` : ''
                return (
                  <option key={o.id} value={o.name}>
                    {prefix}{o.name} ({o.job})
                  </option>
                )
              })}
          </select>
          <button
            type="button"
            onClick={addReserve}
            disabled={!selectedReserveToAdd}
            className="flex items-center gap-1 rounded-lg bg-[#1f4d78] px-2.5 py-1 text-xs font-bold text-white disabled:opacity-50 transition cursor-pointer"
          >
            <Plus className="size-3" />
            <span>إضافة احتياطي</span>
          </button>
        </div>
      </div>

      {/* Official Print Notice / Directives */}
      {signatures.printNotice && (
        <div className="mt-2 hidden print:block rounded-lg border border-black/20 bg-gray-50 p-2 text-[10.5px] font-bold text-black text-center leading-relaxed">
          {signatures.printNotice}
        </div>
      )}

      {/* Official Signatures Footer (Printable) */}
      <div className="mt-2 flex items-center justify-between border-t border-[#dededb] pt-2 px-3 text-center text-xs font-black text-[#171717] print-avoid-break">
        <div className="flex flex-col items-center">
          <p className="text-[11px] font-bold text-[#666]">{signatures.sigTablesRole || 'رئيس لجنة الجداول'}:</p>
          <p className="mt-0.5 text-xs font-black">{signatures.sigTables || 'د. حياه سامي على احمد'}</p>
          <p className="text-[10px] font-normal text-[#888]">التوقيع: .....................</p>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-[11px] font-bold text-[#666]">{signatures.sigSystemRole || 'مدير النظام ورئيس الكنترول'}:</p>
          <p className="mt-0.5 text-xs font-black">{signatures.sigSystem || 'أ.م.د. علي سمير عوض'}</p>
          <p className="text-[10px] font-normal text-[#888]">التوقيع: .....................</p>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-[11px] font-bold text-[#666]">{signatures.sigDeanRole || 'عميد المعهد'}:</p>
          <p className="mt-0.5 text-xs font-black">{signatures.sigDean || 'أ.د. رجب عبد العزيز السحيمي'}</p>
          <p className="text-[10px] font-normal text-[#888]">التوقيع: .....................</p>
        </div>
      </div>
    </div>
  )
}
