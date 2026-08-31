import React, { useState, useMemo } from 'react'
import type {
  Observer,
  ScheduleSlot,
  DailyAttendanceRecord,
  PrintSignatures,
  SystemBranding,
} from '../../types/control'
import {
  Activity,
  Users2,
  Clock,
  Award,
  Search,
  Printer,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Plus,
  Download,
  FileUp,
} from 'lucide-react'
import { EditObserverModal } from '../modals/EditObserverModal'
import { exportObserversCSV, parseObserversCSV } from '../../lib/excelUtils'

interface ObserverStatusViewProps {
  observers: Observer[]
  schedules: ScheduleSlot[]
  attendance: DailyAttendanceRecord[]
  signatures: PrintSignatures
  branding: SystemBranding
  currentYear: string
  jobTitles?: string[]
  departments?: string[]
  workDays?: string[]
  roleQuotas?: Record<string, number>
  onUpdateObserver: (id: string, updates: Partial<Observer>) => void
  onAddObserver: (obs: Omit<Observer, 'id'>) => void
  onImportObservers?: (list: Omit<Observer, 'id'>[]) => void
}

export const ObserverStatusView: React.FC<ObserverStatusViewProps> = ({
  observers,
  schedules,
  attendance,
  signatures,
  branding,
  currentYear,
  jobTitles,
  departments,
  workDays,
  roleQuotas,
  onUpdateObserver,
  onAddObserver,
  onImportObservers,
}) => {
  const [search, setSearch] = useState('')
  const [selectedJob, setSelectedJob] = useState('ALL')
  const [selectedWorkload, setSelectedWorkload] = useState('ALL')

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedObserverToEdit, setSelectedObserverToEdit] = useState<Observer | null>(null)

  const primaryColor = branding.primaryColor || '#1f4d78'

  // Calculate schedule allocation count for each observer
  const observerScheduleStats = useMemo(() => {
    const counts = new Map<string, { slots: number; hours: number }>()

    schedules.forEach((slot) => {
      if (slot.rows) {
        slot.rows.forEach((r) => {
          const duration = r.duration || 2
          if (r.obs1) {
            const cur = counts.get(r.obs1) || { slots: 0, hours: 0 }
            counts.set(r.obs1, { slots: cur.slots + 1, hours: cur.hours + duration })
          }
          if (r.obs2) {
            const cur = counts.get(r.obs2) || { slots: 0, hours: 0 }
            counts.set(r.obs2, { slots: cur.slots + 1, hours: cur.hours + duration })
          }
          if (r.obs3) {
            const cur = counts.get(r.obs3) || { slots: 0, hours: 0 }
            counts.set(r.obs3, { slots: cur.slots + 1, hours: cur.hours + duration })
          }
        })
      }
      if (slot.reserves) {
        slot.reserves.forEach((resName) => {
          if (resName) {
            const cur = counts.get(resName) || { slots: 0, hours: 0 }
            counts.set(resName, { slots: cur.slots + 1, hours: cur.hours + 2 })
          }
        })
      }
    })

    return counts
  }, [schedules])

  // Calculate Attendance Stats (Present / Absent)
  const attendanceStats = useMemo(() => {
    const map = new Map<string, { present: number; absent: number; late: number; excused: number }>()

    attendance.forEach((rec) => {
      const cur = map.get(rec.observerName) || { present: 0, absent: 0, late: 0, excused: 0 }
      if (rec.status === 'present') cur.present++
      else if (rec.status === 'absent') cur.absent++
      else if (rec.status === 'late') cur.late++
      else if (rec.status === 'excused') cur.excused++
      map.set(rec.observerName, cur)
    })

    return map
  }, [attendance])

  // KPI Calculations
  const kpi = useMemo(() => {
    const total = observers.length
    let totalHours = 0
    let totalSlots = 0

    observers.forEach((o) => {
      const h = o.hours || 0
      totalHours += h
      const stat = observerScheduleStats.get(o.name)
      if (stat) totalSlots += stat.slots
    })

    const avgHours = total > 0 ? (totalHours / total).toFixed(1) : '0'

    // Department breakdown
    const facultyCount = observers.filter((o) => (o.job || '').includes('هيئة تدريس')).length
    const assistantCount = observers.filter((o) => (o.job || '').includes('معاونة') || (o.job || '').includes('معيد') || (o.job || '').includes('مساعد')).length
    const adminCount = observers.filter((o) => (o.job || '').includes('إداري')).length

    return {
      total,
      totalHours,
      avgHours,
      totalSlots,
      facultyCount,
      assistantCount,
      adminCount,
    }
  }, [observers, observerScheduleStats])

  // Filtered list
  const filtered = useMemo(() => {
    return observers.filter((o) => {
      const matchSearch =
        !search ||
        (o.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.specialization || '').toLowerCase().includes(search.toLowerCase())

      const jobStr = o.job || ''
      const matchJob =
        selectedJob === 'ALL' ||
        (selectedJob === 'FACULTY' && jobStr.includes('هيئة تدريس')) ||
        (selectedJob === 'ASSISTANT' && (jobStr.includes('معاونة') || jobStr.includes('معيد') || jobStr.includes('مساعد'))) ||
        (selectedJob === 'ADMIN' && jobStr.includes('إداري'))

      const hours = o.hours || 0
      const isHigh = hours > parseFloat(kpi.avgHours) * 1.3
      const isLow = hours < parseFloat(kpi.avgHours) * 0.7
      const isBalanced = !isHigh && !isLow

      const matchWorkload =
        selectedWorkload === 'ALL' ||
        (selectedWorkload === 'HIGH' && isHigh) ||
        (selectedWorkload === 'LOW' && isLow) ||
        (selectedWorkload === 'BALANCED' && isBalanced)

      return matchSearch && matchJob && matchWorkload
    })
  }, [observers, search, selectedJob, selectedWorkload, kpi.avgHours])

  const handleOpenAdd = () => {
    setSelectedObserverToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (o: Observer) => {
    setSelectedObserverToEdit(o)
    setIsModalOpen(true)
  }

  const handleSaveModal = (obsData: Omit<Observer, 'id'>, id?: string) => {
    if (id) {
      onUpdateObserver(id, obsData)
    } else {
      onAddObserver(obsData)
    }
  }

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file && onImportObservers) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        if (text) {
          const parsed = parseObserversCSV(text)
          if (parsed.length > 0) {
            onImportObservers(parsed)
            alert(`تم استيراد ${parsed.length} مراقب بنجاح ✓`)
          } else {
            alert('لم يتم العثور على بيانات صالحة في ملف CSV')
          }
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 print-hide">
        {/* Total Observers */}
        <div className="flex items-center gap-2.5 rounded-xl border border-[#dededb] bg-white p-2.5 shadow-2xs">
          <div
            className="grid size-9 place-items-center rounded-lg text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <Users2 className="size-4.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#777]">إجمالي المراقبين</p>
            <h3 className="text-base font-black text-[#171717]">{kpi.total} مراقب</h3>
            <p className="text-[9px] font-semibold text-[#888]">
              {kpi.facultyCount} تدريس • {kpi.assistantCount} معاونة • {kpi.adminCount} إداري
            </p>
          </div>
        </div>

        {/* Total Hours */}
        <div className="flex items-center gap-2.5 rounded-xl border border-[#dededb] bg-white p-2.5 shadow-2xs">
          <div className="grid size-9 place-items-center rounded-lg bg-[#059669] text-white">
            <Clock className="size-4.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#777]">إجمالي الساعات المسجلة</p>
            <h3 className="text-base font-black text-[#171717]">{kpi.totalHours} ساعة</h3>
            <p className="text-[9px] font-semibold text-[#888]">لكل فترات الامتحانات</p>
          </div>
        </div>

        {/* Average Hours per Observer */}
        <div className="flex items-center gap-2.5 rounded-xl border border-[#dededb] bg-white p-2.5 shadow-2xs">
          <div className="grid size-9 place-items-center rounded-lg bg-[#d97706] text-white">
            <TrendingUp className="size-4.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#777]">متوسط نصيب الفرد</p>
            <h3 className="text-base font-black text-[#171717]">{kpi.avgHours} ساعة/مراقب</h3>
            <p className="text-[9px] font-semibold text-[#888]">مؤشر عدالة توزيع الملاحظات</p>
          </div>
        </div>

        {/* Schedule Slots Total */}
        <div className="flex items-center gap-2.5 rounded-xl border border-[#dededb] bg-white p-2.5 shadow-2xs">
          <div className="grid size-9 place-items-center rounded-lg bg-[#7c3aed] text-white">
            <Award className="size-4.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#777]">التكليفات المنفذة</p>
            <h3 className="text-base font-black text-[#171717]">{kpi.totalSlots} لجنة/فترة</h3>
            <p className="text-[9px] font-semibold text-[#888]">موزعة على الجداول الامتحانية</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[#dededb] bg-white p-2.5 shadow-sm print-hide">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <Activity className="size-4" style={{ color: primaryColor }} />
            <h2 className="text-xs font-black text-[#171717]">
              تقارير حالة وعبء المراقبين ({filtered.length} مراقب)
            </h2>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-2.5 top-2 size-3.5 text-[#888]" />
            <input
              type="text"
              placeholder="بحث بالاسم أو التخصص..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7.5 w-44 rounded-lg border border-[#cfcfcb] pr-7.5 pl-2 text-xs font-semibold outline-none focus:border-[#1f4d78]"
            />
          </div>

          {/* Job Filter */}
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="h-7.5 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none cursor-pointer pr-2 pl-6"
          >
            <option value="ALL">جميع الفئات الوظيفية</option>
            <option value="FACULTY">أعضاء هيئة التدريس</option>
            <option value="ASSISTANT">الهيئة المعاونة</option>
            <option value="ADMIN">الجهاز الإداري</option>
          </select>

          {/* Workload Filter */}
          <select
            value={selectedWorkload}
            onChange={(e) => setSelectedWorkload(e.target.value)}
            className="h-7.5 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none cursor-pointer pr-2 pl-6"
          >
            <option value="ALL">جميع حالات العبء</option>
            <option value="BALANCED">عبء متوازن (حول المتوسط)</option>
            <option value="HIGH">عبء مرتفع (&gt; 130%)</option>
            <option value="LOW">عبء منخفض (&lt; 70%)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Export Excel */}
          <button
            type="button"
            onClick={() => exportObserversCSV(filtered)}
            className="flex items-center gap-1 rounded-lg border border-[#cfcfcb] bg-[#fafaf8] px-2.5 py-1.5 text-xs font-bold text-[#333] hover:bg-[#eaeae7] transition cursor-pointer"
            title="تصدير بيانات المراقبين إلى ملف Excel / CSV"
          >
            <Download className="size-3.5 text-[#1f4d78]" />
            <span>تصدير Excel</span>
          </button>

          {/* Import Excel */}
          {onImportObservers && (
            <label className="flex items-center gap-1 rounded-lg border border-[#cfcfcb] bg-[#fafaf8] px-2.5 py-1.5 text-xs font-bold text-[#333] hover:bg-[#eaeae7] transition cursor-pointer">
              <FileUp className="size-3.5 text-[#059669]" />
              <span>استيراد Excel</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleImportCSV}
                className="hidden"
              />
            </label>
          )}

          {/* Add New Proctor Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-lg bg-[#1f4d78] px-3 py-1.5 text-xs font-black text-white shadow-xs hover:bg-[#163756] transition cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>إضافة مراقب</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-[#cfcfcb] bg-[#fafaf8] px-3 py-1.5 text-xs font-bold text-[#333] hover:bg-[#eaeae7] transition cursor-pointer"
          >
            <Printer className="size-3.5" />
            <span>طباعة (A4)</span>
          </button>
        </div>
      </div>

      {/* Printable Official Header */}
      <div className="hidden print:flex print:flex-col print:mb-3 print:border-b-2 print:border-black print:pb-2">
        <div className="flex items-center justify-between text-xs font-black">
          <div className="text-right">
            <p>{branding.headerLine1 || 'وزارة التعليم العالي'}</p>
            <p>{branding.headerLine2 || branding.instituteName || 'المعهد العالي للهندسة والتكنولوجيا'}</p>
            <p>{branding.headerLine3 || 'إدارة الكنترول والجداول الامتحانية'}</p>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            {branding.logoUrl && (
              <img src={branding.logoUrl} alt="Logo" className="h-11 w-auto object-contain mb-1" />
            )}
            <h2 className="text-sm font-black underline">تقرير توزيع الأعباء وحالة المراقبين والملاحظين</h2>
            <p className="text-[11px] font-bold mt-0.5">العام الجامعي: {currentYear}</p>
          </div>
          <div className="text-left">
            <p>إجمالي المراقبين: {kpi.total}</p>
            <p>إجمالي الساعات: {kpi.totalHours}</p>
            <p>متوسط الساعات: {kpi.avgHours} س</p>
          </div>
        </div>
      </div>

      {/* Main Status Table */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dededb] bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-center text-xs">
            <thead className="sticky top-0 z-10 bg-[#eef3f8]">
              <tr className="text-[10px] font-black text-[#171717]">
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-10">م</th>
                <th className="border-b border-l border-[#cfcfcb] px-3 py-1.5 text-right min-w-44">
                  اسم المراقب / عضو هيئة التدريس
                </th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 min-w-32">الوظيفة</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-24">القسم والتخصص</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-20">الساعات الكلية</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-20">لجان الجداول</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-24">نسبة الحضور</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-24">حالة العبء</th>
                <th className="border-b border-[#cfcfcb] px-2 py-1.5 w-18 print-hide">تعديل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecece9]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs font-bold text-[#888]">
                    لا يوجد مراقبين يطابقون شروط البحث
                  </td>
                </tr>
              ) : (
                filtered.map((o, idx) => {
                  const hours = o.hours || 0
                  const avg = parseFloat(kpi.avgHours) || 1
                  const isHigh = hours > avg * 1.3
                  const isLow = hours < avg * 0.7

                  const schedStat = observerScheduleStats.get(o.name) || { slots: 0, hours: 0 }
                  const attStat = attendanceStats.get(o.name) || {
                    present: 0,
                    absent: 0,
                    late: 0,
                    excused: 0,
                  }
                  const totalAttSessions = attStat.present + attStat.absent + attStat.late + attStat.excused
                  const attendanceRate =
                    totalAttSessions > 0
                      ? Math.round((attStat.present / totalAttSessions) * 100)
                      : 100

                  return (
                    <tr key={o.id} className="hover:bg-[#fbfbfa] transition">
                      <td className="border-b border-l border-[#ecece9] px-2 py-1.5 font-bold text-[#888]">
                        {idx + 1}
                      </td>

                      {/* Name */}
                      <td className="border-b border-l border-[#ecece9] px-3 py-1.5 text-right font-black text-[#171717]">
                        <div className="flex items-center gap-1.5">
                          <span>{o.name}</span>
                          {o.days && o.days.trim() && (
                            <span className="rounded bg-[#f0f0ee] px-1.5 py-0.2 text-[9.5px] font-semibold text-[#666]">
                              ({o.days.split(',').map((d) => d.trim()).filter(Boolean).length} أيام)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Job */}
                      <td className="border-b border-l border-[#ecece9] px-2 py-1.5 font-bold text-[#555]">
                        {o.job}
                      </td>

                      {/* Specialization */}
                      <td className="border-b border-l border-[#ecece9] px-2 py-1.5 font-semibold text-[#666]">
                        {o.specialization || '—'}
                      </td>

                      {/* Total Registered Hours */}
                      <td className="border-b border-l border-[#ecece9] px-2 py-1.5 font-mono font-black text-[#171717]">
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs ${
                            isHigh
                              ? 'bg-[#fee2e2] text-[#991b1b]'
                              : isLow
                              ? 'bg-[#fef3c7] text-[#92400e]'
                              : 'bg-[#dcfce7] text-[#166534]'
                          }`}
                        >
                          {hours} س
                        </span>
                      </td>

                      {/* Slots in Schedules */}
                      <td className="border-b border-l border-[#ecece9] px-2 py-1.5 font-mono font-bold text-[#1f4d78]">
                        {schedStat.slots} لجان
                      </td>

                      {/* Attendance Percentage */}
                      <td className="border-b border-l border-[#ecece9] px-2 py-1.5">
                        <div className="flex items-center justify-center gap-1">
                          <span
                            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                              attendanceRate >= 90
                                ? 'bg-[#dcfce7] text-[#166534]'
                                : attendanceRate >= 70
                                ? 'bg-[#fef3c7] text-[#92400e]'
                                : 'bg-[#fee2e2] text-[#991b1b]'
                            }`}
                          >
                            {attendanceRate}%
                          </span>
                          {attStat.absent > 0 && (
                            <span className="text-[9px] font-bold text-[#dc2626]" title="عدد مرات الغياب">
                              ({attStat.absent} غ)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Workload Indicator Badge */}
                      <td className="border-b border-l border-[#ecece9] px-2 py-1.5">
                        {isHigh ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#fee2e2] px-2 py-0.5 text-[10.5px] font-black text-[#991b1b]">
                            <AlertCircle className="size-3" />
                            <span>عبء مرتفع</span>
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#fef3c7] px-2 py-0.5 text-[10.5px] font-black text-[#92400e]">
                            <span>عبء منخفض</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#dcfce7] px-2 py-0.5 text-[10.5px] font-black text-[#166534]">
                            <CheckCircle2 className="size-3" />
                            <span>متوازن</span>
                          </span>
                        )}
                      </td>

                      {/* Edit Button */}
                      <td className="border-b border-[#ecece9] px-2 py-1.5 print-hide">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(o)}
                          className="flex items-center justify-center gap-1 rounded bg-[#eef3f8] px-2 py-1 text-[11px] font-bold text-[#1f4d78] hover:bg-[#dbeafe] transition cursor-pointer"
                          title="تعديل بيانات وساعات المراقب"
                        >
                          <Edit3 className="size-3" />
                          <span>تعديل</span>
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

      {/* Official Print Notice / Directives */}
      {signatures.printNotice && (
        <div className="mt-2 hidden print:block rounded-lg border border-black/20 bg-gray-50 p-2 text-[10.5px] font-bold text-black text-center leading-relaxed">
          {signatures.printNotice}
        </div>
      )}

      {/* Official Signatures Footer (Printable) */}
      <div className="mt-2 hidden print:flex items-center justify-between border-t border-black pt-3 px-4 text-center text-xs font-black text-black print-avoid-break">
        <div>
          <p>{signatures.sigTablesRole || 'رئيس لجنة الجداول'}:</p>
          <p className="mt-1 font-bold">{signatures.sigTables || 'د. حياه سامي على احمد'}</p>
          <p className="mt-3 text-[10px]">التوقيع: .....................</p>
        </div>

        <div>
          <p>{signatures.sigSystemRole || 'مدير النظام ورئيس الكنترول'}:</p>
          <p className="mt-1 font-bold">{signatures.sigSystem || 'أ.م.د. علي سمير عوض'}</p>
          <p className="mt-3 text-[10px]">التوقيع: .....................</p>
        </div>

        <div>
          <p>{signatures.sigDeanRole || 'عميد المعهد'}:</p>
          <p className="mt-1 font-bold">{signatures.sigDean || 'أ.د. رجب عبد العزيز السحيمي'}</p>
          <p className="mt-3 text-[10px]">التوقيع: .....................</p>
        </div>
      </div>

      {/* Edit/Add Modal */}
      <EditObserverModal
        isOpen={isModalOpen}
        observer={selectedObserverToEdit}
        jobTitles={jobTitles}
        departments={departments}
        workDays={workDays}
        roleQuotas={roleQuotas}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
      />
    </div>
  )
}
