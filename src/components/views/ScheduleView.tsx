import React, { useState, useMemo } from 'react'
import type {
  Observer,
  Subject,
  Committee,
  ScheduleSlot,
  ScheduleRow,
  PrintSignatures,
} from '../../types/control'
import { Plus, Trash2, Save, Printer, AlertTriangle, UserCheck } from 'lucide-react'

interface ScheduleViewProps {
  observers: Observer[]
  subjects: Subject[]
  committees: Committee[]
  schedules: ScheduleSlot[]
  currentYear: string
  signatures: PrintSignatures
  onSaveSlot: (slot: ScheduleSlot) => void
}

const ARABIC_WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

function getArabicDayName(dateString: string): string {
  try {
    const d = new Date(dateString)
    if (!isNaN(d.getTime())) {
      return ARABIC_WEEKDAYS[d.getDay()]
    }
  } catch (e) {
    console.error(e)
  }
  return 'السبت'
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  observers,
  subjects,
  committees,
  currentYear,
  signatures,
  onSaveSlot,
}) => {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [period, setPeriod] = useState('الفترة الأولى (9:00 - 11:00)')
  const [startTime, setStartTime] = useState('09:00 AM')
  const [semester, setSemester] = useState('الفصل الأول')
  const [examType] = useState('امتحانات نهاية الفصل الدراسي')
  const [reserves, setReserves] = useState<string[]>([])
  const [selectedReserveToAdd, setSelectedReserveToAdd] = useState('')

  const currentDayName = useMemo(() => getArabicDayName(date), [date])

  // Rows for current schedule slot
  const [rows, setRows] = useState<ScheduleRow[]>(() => {
    return committees.slice(0, 8).map((c, i) => ({
      id: `row_${i}_${Date.now()}`,
      committeeId: c.id,
      subjectId: subjects[i % subjects.length]?.id || '',
      obs1: observers[i % observers.length]?.name || '',
      obs2: observers[(i + 8) % observers.length]?.name || '',
      obs3: '',
      duration: 2,
    }))
  })

  // Add new row
  const addRow = () => {
    // Find next unused committee
    const usedCommitteeIds = new Set(rows.map((r) => r.committeeId))
    const nextCommittee = committees.find((c) => !usedCommitteeIds.has(c.id)) || committees[0]

    setRows((prev) => [
      ...prev,
      {
        id: `row_${Date.now()}`,
        committeeId: nextCommittee?.id || '',
        subjectId: subjects[0]?.id || '',
        obs1: '',
        obs2: '',
        obs3: '',
        duration: 2,
      },
    ])
  }

  // Remove row
  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  // Update row
  const updateRow = (id: string, field: keyof ScheduleRow, value: string | number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  // Detect duplicated observers across all committees in this slot
  const conflicts = useMemo(() => {
    const assigned = new Map<string, number>()
    rows.forEach((r) => {
      if (r.obs1) assigned.set(r.obs1, (assigned.get(r.obs1) || 0) + 1)
      if (r.obs2) assigned.set(r.obs2, (assigned.get(r.obs2) || 0) + 1)
      if (r.obs3) assigned.set(r.obs3, (assigned.get(r.obs3) || 0) + 1)
    })
    reserves.forEach((res) => {
      if (res) assigned.set(res, (assigned.get(res) || 0) + 1)
    })
    const duplicated: string[] = []
    assigned.forEach((count, name) => {
      if (count > 1) duplicated.push(name)
    })
    return duplicated
  }, [rows, reserves])

  // Helper to render proctor dropdown options with intelligence tags
  const renderObserverOptions = (currentSelectedName: string) => {
    return (
      <>
        <option value="">-- اختيـاري --</option>
        {observers.map((obs) => {
          const isAvailableToday = obs.days ? obs.days.includes(currentDayName) : true
          const isSelectedElsewhere = conflicts.includes(obs.name) && obs.name !== currentSelectedName
          
          let prefix = ''
          if (isSelectedElsewhere) prefix = '⚠️ (تعارض) '
          else if (!isAvailableToday) prefix = `⏳ (غير متاح ${currentDayName}) `

          return (
            <option key={obs.id} value={obs.name}>
              {prefix}{obs.name} ({obs.job})
            </option>
          )
        })}
      </>
    )
  }

  const handleAddReserve = () => {
    if (!selectedReserveToAdd) return
    if (!reserves.includes(selectedReserveToAdd)) {
      setReserves((prev) => [...prev, selectedReserveToAdd])
    }
    setSelectedReserveToAdd('')
  }

  const handleRemoveReserve = (name: string) => {
    setReserves((prev) => prev.filter((r) => r !== name))
  }

  const handleSave = () => {
    onSaveSlot({
      date,
      period,
      startTime,
      semester,
      academicYear: currentYear,
      examType,
      reserves,
      rows,
    })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      {/* Top Filter & Slot Configuration Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#dededb] bg-white p-2 shadow-xs print-hide">
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Picker with Weekday Badge */}
          <div className="flex items-center gap-1.5 rounded-lg border border-[#cfcfcb] bg-[#fbfbfa] px-2 py-1">
            <span className="text-[11px] font-bold text-[#666]">التاريخ:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#171717] outline-none cursor-pointer"
            />
            <span className="rounded bg-[#1f4d78] px-1.5 py-0.2 text-[10px] font-black text-white">
              يوم {currentDayName}
            </span>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-1 rounded-lg border border-[#cfcfcb] bg-[#fbfbfa] px-2 py-1">
            <span className="text-[11px] font-bold text-[#666]">الفترة:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#171717] outline-none cursor-pointer"
            >
              <option value="الفترة الأولى (9:00 - 11:00)">الفترة الأولى (9:00 - 11:00)</option>
              <option value="الفترة الثانية (11:30 - 1:30)">الفترة الثانية (11:30 - 1:30)</option>
              <option value="الفترة الثالثة (2:00 - 4:00)">الفترة الثالثة (2:00 - 4:00)</option>
            </select>
          </div>

          {/* Start Time */}
          <div className="flex items-center gap-1 rounded-lg border border-[#cfcfcb] bg-[#fbfbfa] px-2 py-1">
            <span className="text-[11px] font-bold text-[#666]">بداية الفترة:</span>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#171717] outline-none cursor-pointer"
            >
              <option value="09:00 AM">09:00 AM</option>
              <option value="11:30 AM">11:30 AM</option>
              <option value="02:00 PM">02:00 PM</option>
            </select>
          </div>

          {/* Semester */}
          <div className="flex items-center gap-1 rounded-lg border border-[#cfcfcb] bg-[#fbfbfa] px-2 py-1">
            <span className="text-[11px] font-bold text-[#666]">الفصل:</span>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#171717] outline-none cursor-pointer"
            >
              <option value="الفصل الأول">الفصل الأول</option>
              <option value="الفصل الثاني">الفصل الثاني</option>
              <option value="الفصل الصيفي">الفصل الصيفي</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 rounded-lg border border-[#cfcfcb] bg-white px-2.5 py-1 text-xs font-bold text-[#171717] hover:bg-[#f0f0ee] transition shadow-2xs"
          >
            <Plus className="size-3.5 text-[#1f4d78]" />
            <span>إضافة لجنة</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1 rounded-lg bg-[#155724] px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-[#0f3d19] transition"
          >
            <Save className="size-3.5" />
            <span>حفظ التوزيع</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1 rounded-lg bg-[#1f4d78] px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-[#163756] transition"
          >
            <Printer className="size-3.5" />
            <span>طباعة الكشف (A4)</span>
          </button>
        </div>
      </div>

      {/* Conflict Warning Alert Banner */}
      {conflicts.length > 0 && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-3 py-1.5 text-xs font-bold text-[#991b1b] shadow-2xs animate-in fade-in duration-200 print-hide">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0 text-[#dc2626]" />
            <span>
              تنبيه تعارض في التوزيع: المراقب (
              {conflicts.map((c) => `"${c}"`).join('، ')}
              ) مسجل في أكثر من لجنة امتحانية في نفس الوقت!
            </span>
          </div>
          <span className="rounded bg-[#fee2e2] px-2 py-0.5 text-[10px] text-[#991b1b]">
            يرجى تعديل اللجنة لتجنب الازدواج
          </span>
        </div>
      )}

      {/* Printable Official Header */}
      <div className="hidden print:flex print:flex-col print:mb-3 print:border-b-2 print:border-black print:pb-2">
        <div className="flex items-center justify-between text-xs font-black">
          <div className="text-right">
            <p>وزارة التعليم العالي</p>
            <p>المعهد العالي للهندسة والتكنولوجيا</p>
            <p>إدارة الكنترول والجداول الامتحانية</p>
          </div>
          <div className="text-center">
            <h2 className="text-sm font-black underline">كشف توزيع الملاحظات والمراقبات الامتحانية</h2>
            <p className="text-[11px] font-bold mt-0.5">
              العام الجامعي: {currentYear} — {semester}
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
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1 min-w-36">اللجنة والقاعة</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1 min-w-44">المقرر الدراسي</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1 min-w-40">مراقب رئيسي (1)</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1 min-w-40">مراقب مساعد (2)</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1 min-w-36">مراقب إضافي (3)</th>
                <th className="border-b border-l border-[#cfcfcb] px-1 py-1 w-14">الزمن (س)</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1 w-20">التوقيع</th>
                <th className="border-b border-[#cfcfcb] px-1 py-1 w-10 print-hide">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecece9]">
              {rows.map((r, idx) => {
                const hasObs1Conflict = r.obs1 && conflicts.includes(r.obs1)
                const hasObs2Conflict = r.obs2 && conflicts.includes(r.obs2)
                const hasObs3Conflict = r.obs3 && conflicts.includes(r.obs3)

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
                        className="h-6.5 w-full rounded border border-[#cfcfcb] bg-white px-1.5 text-[11px] font-bold text-[#171717] outline-none focus:border-[#1f4d78]"
                      >
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
                        className="h-6.5 w-full rounded border border-[#cfcfcb] bg-white px-1.5 text-[11px] font-bold text-[#171717] outline-none focus:border-[#1f4d78]"
                      >
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
                        className={`h-6.5 w-full rounded border px-1.5 text-[11px] font-bold outline-none ${
                          hasObs1Conflict
                            ? 'border-[#dc2626] bg-[#fef2f2] text-[#dc2626]'
                            : 'border-[#cfcfcb] bg-white text-[#171717] focus:border-[#1f4d78]'
                        }`}
                      >
                        {renderObserverOptions(r.obs1)}
                      </select>
                    </td>

                    {/* Observer 2 (Assistant) */}
                    <td className="border-b border-l border-[#ecece9] px-1 py-1">
                      <select
                        value={r.obs2}
                        onChange={(e) => updateRow(r.id, 'obs2', e.target.value)}
                        className={`h-6.5 w-full rounded border px-1.5 text-[11px] font-bold outline-none ${
                          hasObs2Conflict
                            ? 'border-[#dc2626] bg-[#fef2f2] text-[#dc2626]'
                            : 'border-[#cfcfcb] bg-white text-[#171717] focus:border-[#1f4d78]'
                        }`}
                      >
                        {renderObserverOptions(r.obs2)}
                      </select>
                    </td>

                    {/* Observer 3 (Additional) */}
                    <td className="border-b border-l border-[#ecece9] px-1 py-1">
                      <select
                        value={r.obs3}
                        onChange={(e) => updateRow(r.id, 'obs3', e.target.value)}
                        className={`h-6.5 w-full rounded border px-1.5 text-[11px] font-bold outline-none ${
                          hasObs3Conflict
                            ? 'border-[#dc2626] bg-[#fef2f2] text-[#dc2626]'
                            : 'border-[#cfcfcb] bg-white text-[#171717] focus:border-[#1f4d78]'
                        }`}
                      >
                        {renderObserverOptions(r.obs3)}
                      </select>
                    </td>

                    {/* Duration */}
                    <td className="border-b border-l border-[#ecece9] px-1 py-1">
                      <input
                        type="number"
                        min={1}
                        max={4}
                        value={r.duration}
                        onChange={(e) =>
                          updateRow(r.id, 'duration', parseInt(e.target.value, 10) || 2)
                        }
                        className="h-6.5 w-12 rounded border border-[#cfcfcb] bg-white text-center text-xs font-black outline-none focus:border-[#1f4d78]"
                      />
                    </td>

                    {/* Signature line for print */}
                    <td className="border-b border-l border-[#ecece9] px-1 py-1 font-serif text-[10px] text-[#999]">
                      ...................
                    </td>

                    {/* Remove Row */}
                    <td className="border-b border-[#ecece9] px-1 py-1 text-center print-hide">
                      <button
                        type="button"
                        onClick={() => removeRow(r.id)}
                        className="text-[#c5221f] hover:text-[#900] transition p-1"
                        title="حذف هذا الصف"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reserves Section & Visual Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#dededb] bg-white p-2 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#171717]">
            <UserCheck className="size-4 text-[#1f4d78]" />
            <span>مراقبو الاحتياطي (Reserves):</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {reserves.length === 0 ? (
              <span className="text-[11px] font-semibold text-[#888]">لم يتم تحديد احتياطي لهذه الفترة</span>
            ) : (
              reserves.map((res) => (
                <span
                  key={res}
                  className="flex items-center gap-1 rounded-lg border border-[#cfcfcb] bg-[#f0f4f8] px-2 py-0.5 text-xs font-bold text-[#1f4d78]"
                >
                  <span>{res}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveReserve(res)}
                    className="text-[#888] hover:text-[#c5221f] print-hide"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Add Reserve Dropdown */}
        <div className="flex items-center gap-1.5 print-hide">
          <select
            value={selectedReserveToAdd}
            onChange={(e) => setSelectedReserveToAdd(e.target.value)}
            className="h-7 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#171717] outline-none"
          >
            <option value="">-- اختر مراقب احتياطي --</option>
            {observers.map((o) => (
              <option key={o.id} value={o.name}>
                {o.name} ({o.job})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddReserve}
            disabled={!selectedReserveToAdd}
            className="flex items-center gap-0.5 rounded-lg bg-[#1f4d78] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#163756] transition disabled:opacity-40"
          >
            <Plus className="size-3" />
            <span>إضافة احتياطي</span>
          </button>
        </div>
      </div>

      {/* Official Signatures Block (Visible in UI & Printed A4) */}
      <div className="mt-1 flex items-center justify-between rounded-xl border border-[#dededb] bg-white p-3 text-center text-xs font-bold shadow-2xs">
        <div>
          <p className="text-[11px] text-[#666]">رئيس لجنة الجداول:</p>
          <p className="font-black text-[#171717] mt-0.5">{signatures.sigTables}</p>
          <p className="mt-1 text-[10px] text-[#aaa]">التوقيع: .....................</p>
        </div>

        <div>
          <p className="text-[11px] text-[#666]">مدير النظام ورئيس الكنترول:</p>
          <p className="font-black text-[#171717] mt-0.5">{signatures.sigSystem}</p>
          <p className="mt-1 text-[10px] text-[#aaa]">التوقيع: .....................</p>
        </div>

        <div>
          <p className="text-[11px] text-[#666]">عميد المعهد:</p>
          <p className="font-black text-[#171717] mt-0.5">{signatures.sigDean}</p>
          <p className="mt-1 text-[10px] text-[#aaa]">التوقيع: .....................</p>
        </div>
      </div>
    </div>
  )
}
