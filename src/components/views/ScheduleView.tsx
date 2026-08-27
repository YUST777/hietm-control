import React, { useState, useMemo } from 'react'
import type {
  Observer,
  Subject,
  Committee,
  ScheduleSlot,
  ScheduleRow,
  PrintSignatures,
} from '../../types/control'
import { Plus, Trash2, Save, Printer, AlertTriangle } from 'lucide-react'

interface ScheduleViewProps {
  observers: Observer[]
  subjects: Subject[]
  committees: Committee[]
  schedules: ScheduleSlot[]
  currentYear: string
  signatures: PrintSignatures
  onSaveSlot: (slot: ScheduleSlot) => void
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
  const [period, setPeriod] = useState('الفترة الأولى')
  const [startTime, setStartTime] = useState('09:00')
  const [semester, setSemester] = useState('الفصل الدراسي الأول')
  const [examType] = useState('امتحانات نهاية الفصل الدراسي')
  const [reserves, setReserves] = useState<string[]>([])

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
    setRows((prev) => [
      ...prev,
      {
        id: `row_${Date.now()}`,
        committeeId: committees[0]?.id || '',
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

  // Detect duplicated observers (conflict check)
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
    alert('تم حفظ كشف توزيع المراقبات بنجاح في قاعدة البيانات المحلية!')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* Schedule Parameters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dededb] bg-white p-3 shadow-sm print-hide">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#666]">التاريخ:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-8 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#171717] outline-none"
            />
          </div>

          {/* Period */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#666]">الفترة:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="h-8 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#171717] outline-none"
            >
              <option value="الفترة الأولى">الفترة الأولى (9:00 - 11:00)</option>
              <option value="الفترة الثانية">الفترة الثانية (11:30 - 1:30)</option>
              <option value="الفترة الثالثة">الفترة الثالثة (2:00 - 4:00)</option>
            </select>
          </div>

          {/* Start Time */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#666]">بداية الفترة:</span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="h-8 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#171717] outline-none"
            />
          </div>

          {/* Semester */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#666]">الفصل:</span>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="h-8 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#171717] outline-none"
            >
              <option value="الفصل الدراسي الأول">الفصل الأول</option>
              <option value="الفصل الدراسي الثاني">الفصل الثاني</option>
              <option value="الفصل الصيفي">فصل صيفي</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 rounded-lg border border-[#cfcfcb] bg-white px-3 py-1.5 text-xs font-bold text-[#333] hover:bg-[#f0f0ee] transition"
          >
            <Plus className="size-3.5" />
            <span>إضافة لجنة</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1 rounded-lg bg-[#155724] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#0e3a18] transition"
          >
            <Save className="size-3.5" />
            <span>حفظ التوزيع</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1 rounded-lg bg-[#1f4d78] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#163756] transition"
          >
            <Printer className="size-3.5" />
            <span>طباعة الكشف (A4)</span>
          </button>
        </div>
      </div>

      {/* Conflict Warning Banner */}
      {conflicts.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-[#fed7aa] bg-[#fff7ed] p-2.5 text-xs font-bold text-[#c2410c] shadow-sm print-hide">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            تنبيه تعارض: تم تعيين المراقب التالي في أكثر من مكان بنفس الفترة:{' '}
            <span className="underline">{conflicts.join(', ')}</span>
          </span>
        </div>
      )}

      {/* Print Official Header */}
      <div className="hidden print-only mb-4 text-center">
        <h2 className="text-lg font-black text-black">
          المعهد العالي للهندسة والتكنولوجيا — وحدة التعليم الإلكتروني والكنترول
        </h2>
        <h3 className="text-sm font-bold text-black mt-1">
          كشف توزيع السادة أعضاء هيئة التدريس ومعاونيهم على لجان المراقبة
        </h3>
        <p className="text-xs font-semibold text-black mt-1">
          العام الجامعي: {currentYear} | {semester} | التاريخ: {date} ({period})
        </p>
      </div>

      {/* Main Schedule Allocation Table */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dededb] bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-center text-xs">
            <thead className="sticky top-0 z-10 bg-[#eef3f8]">
              <tr className="text-[11px] font-black text-[#171717]">
                <th className="border-b border-l border-[#cfcfcb] px-2 py-2 w-10">م</th>
                <th className="border-b border-l border-[#cfcfcb] px-3 py-2 text-right min-w-36">
                  اللجنة والقاعة
                </th>
                <th className="border-b border-l border-[#cfcfcb] px-3 py-2 text-right min-w-44">
                  المقرر الدراسي
                </th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-2 min-w-36">
                  مراقب رئيسي (1)
                </th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-2 min-w-36">
                  مراقب مساعد (2)
                </th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-2 min-w-36">
                  مراقب إضافي (3)
                </th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-2 w-20">الزمن (س)</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-2 w-24">التوقيع</th>
                <th className="border-b border-[#cfcfcb] px-2 py-2 w-12 print-hide">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecece9]">
              {rows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-[#fbfbfa] transition">
                  <td className="border-b border-l border-[#ecece9] px-1 py-2 font-bold text-[#888]">
                    {idx + 1}
                  </td>
                  {/* Committee */}
                  <td className="border-b border-l border-[#ecece9] px-2 py-1.5 text-right font-bold text-[#171717]">
                    <select
                      value={row.committeeId}
                      onChange={(e) => updateRow(row.id, 'committeeId', e.target.value)}
                      className="w-full rounded border border-[#cfcfcb] bg-white p-1 text-xs font-bold text-[#111] outline-none"
                    >
                      {committees.map((c) => (
                        <option key={c.id} value={c.id}>
                          لجنة {c.roomNum} — {c.hallName} ({c.floor})
                        </option>
                      ))}
                    </select>
                  </td>
                  {/* Subject */}
                  <td className="border-b border-l border-[#ecece9] px-2 py-1.5 text-right">
                    <select
                      value={row.subjectId}
                      onChange={(e) => updateRow(row.id, 'subjectId', e.target.value)}
                      className="w-full rounded border border-[#cfcfcb] bg-white p-1 text-xs font-bold text-[#111] outline-none"
                    >
                      <option value="">-- اختر المقرر الدراسي --</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code}) - {s.dept}
                        </option>
                      ))}
                    </select>
                  </td>
                  {/* Proctor 1 */}
                  <td className="border-b border-l border-[#ecece9] px-1 py-1.5">
                    <select
                      value={row.obs1}
                      onChange={(e) => updateRow(row.id, 'obs1', e.target.value)}
                      className="w-full rounded border border-[#cfcfcb] bg-white p-1 text-xs font-semibold text-[#111] outline-none"
                    >
                      <option value="">-- اختر المراقب --</option>
                      {observers.map((o) => (
                        <option key={o.id} value={o.name}>
                          {o.name} ({o.job})
                        </option>
                      ))}
                    </select>
                  </td>
                  {/* Proctor 2 */}
                  <td className="border-b border-l border-[#ecece9] px-1 py-1.5">
                    <select
                      value={row.obs2}
                      onChange={(e) => updateRow(row.id, 'obs2', e.target.value)}
                      className="w-full rounded border border-[#cfcfcb] bg-white p-1 text-xs font-semibold text-[#111] outline-none"
                    >
                      <option value="">-- اختياري --</option>
                      {observers.map((o) => (
                        <option key={o.id} value={o.name}>
                          {o.name} ({o.job})
                        </option>
                      ))}
                    </select>
                  </td>
                  {/* Proctor 3 */}
                  <td className="border-b border-l border-[#ecece9] px-1 py-1.5">
                    <select
                      value={row.obs3}
                      onChange={(e) => updateRow(row.id, 'obs3', e.target.value)}
                      className="w-full rounded border border-[#cfcfcb] bg-white p-1 text-xs font-semibold text-[#111] outline-none"
                    >
                      <option value="">-- اختياري --</option>
                      {observers.map((o) => (
                        <option key={o.id} value={o.name}>
                          {o.name} ({o.job})
                        </option>
                      ))}
                    </select>
                  </td>
                  {/* Duration */}
                  <td className="border-b border-l border-[#ecece9] px-1 py-1.5">
                    <input
                      type="number"
                      step={0.5}
                      min={1}
                      max={4}
                      value={row.duration}
                      onChange={(e) =>
                        updateRow(row.id, 'duration', parseFloat(e.target.value) || 2)
                      }
                      className="w-14 rounded border border-[#cfcfcb] bg-white p-1 text-center font-bold text-xs outline-none"
                    />
                  </td>
                  {/* Signature line for print */}
                  <td className="border-b border-l border-[#ecece9] px-1 py-1.5 text-center text-[#888]">
                    ....................
                  </td>
                  {/* Delete Action */}
                  <td className="border-b border-[#ecece9] px-1 py-1.5 text-center print-hide">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="text-[#c5221f] hover:text-[#900] transition"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reserves Section */}
      <div className="rounded-xl border border-[#dededb] bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-[#171717]">مراقبو الاحتياطي (Reserves):</span>
          <button
            type="button"
            onClick={() => setReserves((prev) => [...prev, ''])}
            className="flex items-center gap-1 rounded bg-[#f0f4f8] px-2.5 py-1 text-[11px] font-bold text-[#1f4d78] hover:bg-[#e2ecf5] transition print-hide"
          >
            <Plus className="size-3" />
            <span>إضافة احتياطي</span>
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {reserves.map((res, i) => (
            <div key={i} className="flex items-center gap-1 rounded-lg border border-[#cfcfcb] bg-[#f8fafc] p-1">
              <select
                value={res}
                onChange={(e) => {
                  const val = e.target.value
                  setReserves((prev) => prev.map((r, idx) => (idx === i ? val : r)))
                }}
                className="bg-transparent text-xs font-bold text-[#111] outline-none"
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
                onClick={() => setReserves((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-[#c5221f] hover:text-red-800 text-xs px-1 print-hide"
              >
                ×
              </button>
            </div>
          ))}
          {reserves.length === 0 && (
            <span className="text-xs font-semibold text-[#888]">لم يتم تحديد مراقبي احتياطي لهذه الفترة بعد.</span>
          )}
        </div>
      </div>

      {/* Official Signatures Box (Always visible at print bottom) */}
      <div className="mt-2 rounded-xl border border-[#dededb] bg-white p-3 shadow-sm">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <span className="text-xs font-bold text-[#666]">رئيس لجنة الجداول:</span>
            <p className="mt-1 text-xs font-black text-[#111]">{signatures.sigTables}</p>
            <div className="mt-3 text-[10px] text-[#888]">التوقيع: .....................</div>
          </div>
          <div>
            <span className="text-xs font-bold text-[#666]">مدير النظام ورئيس الكنترول:</span>
            <p className="mt-1 text-xs font-black text-[#111]">{signatures.sigSystem}</p>
            <div className="mt-3 text-[10px] text-[#888]">التوقيع: .....................</div>
          </div>
          <div>
            <span className="text-xs font-bold text-[#666]">عميد المعهد:</span>
            <p className="mt-1 text-xs font-black text-[#111]">{signatures.sigDean}</p>
            <div className="mt-3 text-[10px] text-[#888]">التوقيع: .....................</div>
          </div>
        </div>
      </div>
    </div>
  )
}
