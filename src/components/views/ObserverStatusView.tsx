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
} from 'lucide-react'
import { EditObserverModal } from '../modals/EditObserverModal'

interface ObserverStatusViewProps {
  observers: Observer[]
  schedules: ScheduleSlot[]
  attendance: DailyAttendanceRecord[]
  signatures: PrintSignatures
  branding: SystemBranding
  currentYear: string
  onUpdateObserver: (id: string, updates: Partial<Observer>) => void
}

export const ObserverStatusView: React.FC<ObserverStatusViewProps> = ({
  observers,
  schedules,
  attendance,
  signatures,
  branding,
  currentYear,
  onUpdateObserver,
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
          const dur = r.duration || 2
          if (r.obs1) {
            const cur = counts.get(r.obs1) || { slots: 0, hours: 0 }
            counts.set(r.obs1, { slots: cur.slots + 1, hours: cur.hours + dur })
          }
          if (r.obs2) {
            const cur = counts.get(r.obs2) || { slots: 0, hours: 0 }
            counts.set(r.obs2, { slots: cur.slots + 1, hours: cur.hours + dur })
          }
          if (r.obs3) {
            const cur = counts.get(r.obs3) || { slots: 0, hours: 0 }
            counts.set(r.obs3, { slots: cur.slots + 1, hours: cur.hours + dur })
          }
        })
      }
    })

    return counts
  }, [schedules])

  // Calculate Attendance Stats
  const attendanceStats = useMemo(() => {
    const stats = new Map<string, { present: number; absent: number; late: number }>()
    attendance.forEach((a) => {
      const cur = stats.get(a.observerName) || { present: 0, absent: 0, late: 0 }
      if (a.status === 'present') cur.present++
      else if (a.status === 'absent') cur.absent++
      else if (a.status === 'late') cur.late++
      stats.set(a.observerName, cur)
    })
    return stats
  }, [attendance])

  // Overall KPIs
  const kpi = useMemo(() => {
    const total = observers.length
    let totalHours = 0
    let maxHours = 0
    let minHours = Infinity
    let topProctor = '—'
    let bottomProctor = '—'

    observers.forEach((o) => {
      const h = o.hours || 0
      totalHours += h
      if (h > maxHours) {
        maxHours = h
        topProctor = o.name
      }
      if (h < minHours) {
        minHours = h
        bottomProctor = o.name
      }
    })

    const avgHours = total > 0 ? (totalHours / total).toFixed(1) : '0'
    if (minHours === Infinity) minHours = 0

    return { total, totalHours, avgHours: parseFloat(avgHours), maxHours, minHours, topProctor, bottomProctor }
  }, [observers])

  // Filtered proctors
  const filtered = useMemo(() => {
    return observers.filter((o) => {
      const matchSearch =
        !search ||
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.specialization.toLowerCase().includes(search.toLowerCase())

      const matchJob =
        selectedJob === 'ALL' ||
        (selectedJob === 'FACULTY' && o.job.includes('هيئة تدريس')) ||
        (selectedJob === 'ASSISTANT' && (o.job.includes('معاونة') || o.job.includes('معيد') || o.job.includes('مساعد'))) ||
        (selectedJob === 'ADMIN' && o.job.includes('إداري'))

      const hours = o.hours || 0
      const isHigh = hours > kpi.avgHours * 1.3
      const isLow = hours < kpi.avgHours * 0.7
      const isBalanced = !isHigh && !isLow

      const matchWorkload =
        selectedWorkload === 'ALL' ||
        (selectedWorkload === 'HIGH' && isHigh) ||
        (selectedWorkload === 'LOW' && isLow) ||
        (selectedWorkload === 'BALANCED' && isBalanced)

      return matchSearch && matchJob && matchWorkload
    })
  }, [observers, search, selectedJob, selectedWorkload, kpi.avgHours])

  const handleOpenEdit = (o: Observer) => {
    setSelectedObserverToEdit(o)
    setIsModalOpen(true)
  }

  const handleSaveModal = (obsData: Omit<Observer, 'id'>, id?: string) => {
    if (id) {
      onUpdateObserver(id, obsData)
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
            <p className="text-[10.5px] font-bold text-[#777]">إجمالي المراقبين</p>
            <p className="text-sm font-black text-[#171717]">{kpi.total} مراقب</p>
          </div>
        </div>

        {/* Total Assigned Hours */}
        <div className="flex items-center gap-2.5 rounded-xl border border-[#dededb] bg-white p-2.5 shadow-2xs">
          <div className="grid size-9 place-items-center rounded-lg bg-[#155724] text-white">
            <Clock className="size-4.5" />
          </div>
          <div>
            <p className="text-[10.5px] font-bold text-[#777]">إجمالي الساعات</p>
            <p className="text-sm font-black text-[#155724]">{kpi.totalHours} ساعة</p>
          </div>
        </div>

        {/* Average Hours */}
        <div className="flex items-center gap-2.5 rounded-xl border border-[#dededb] bg-white p-2.5 shadow-2xs">
          <div className="grid size-9 place-items-center rounded-lg bg-[#d97706] text-white">
            <TrendingUp className="size-4.5" />
          </div>
          <div>
            <p className="text-[10.5px] font-bold text-[#777]">متوسط العبء</p>
            <p className="text-sm font-black text-[#d97706]">{kpi.avgHours} س / مراقب</p>
          </div>
        </div>

        {/* Top Proctor */}
        <div className="flex items-center gap-2.5 rounded-xl border border-[#dededb] bg-white p-2.5 shadow-2xs">
          <div className="grid size-9 place-items-center rounded-lg bg-[#7c3aed] text-white">
            <Award className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-bold text-[#777]">الأعلى مراقبة ({kpi.maxHours}س)</p>
            <p className="text-xs font-black text-[#171717] truncate">{kpi.topProctor}</p>
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
              className="h-7.5 w-52 rounded-lg border border-[#cfcfcb] pr-7.5 pl-2 text-xs font-semibold outline-none focus:border-[#1f4d78]"
            />
          </div>

          {/* Job Filter */}
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="h-7.5 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none cursor-pointer"
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
            className="h-7.5 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none cursor-pointer"
          >
            <option value="ALL">جميع حالات العبء</option>
            <option value="BALANCED">عبء متوازن (حول المتوسط)</option>
            <option value="HIGH">عبء مرتفع (&gt; 130%)</option>
            <option value="LOW">عبء منخفض (&lt; 70%)</option>
          </select>
        </div>

        {/* Print Button */}
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-black text-white shadow-xs hover:opacity-90 transition"
          style={{ backgroundColor: primaryColor }}
        >
          <Printer className="size-3.5" />
          <span>طباعة تقرير الحالة (A4)</span>
        </button>
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
                  اسم المراقب / عضو الهيئة
                </th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 min-w-32">الوظيفة</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 min-w-28">القسم</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 min-w-36">أيام الحضور</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-28">ساعات المراقبة</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-24">عدد الفترات</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-24">سجل الحضور</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-24">حالة العبء</th>
                <th className="border-b border-[#cfcfcb] px-2 py-1.5 w-14 print-hide">تعديل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecece9]">
              {filtered.map((o, idx) => {
                const hours = o.hours || 0
                const schInfo = observerScheduleStats.get(o.name) || { slots: 0, hours: 0 }
                const attInfo = attendanceStats.get(o.name) || { present: 0, absent: 0, late: 0 }

                const isHigh = hours > kpi.avgHours * 1.3
                const isLow = hours < kpi.avgHours * 0.7

                const targetMax = Math.max(kpi.maxHours, 20)
                const percent = Math.min(100, Math.round((hours / (targetMax || 1)) * 100))

                return (
                  <tr key={o.id} className="hover:bg-[#fbfbfa] transition group">
                    <td className="border-b border-l border-[#ecece9] px-1 py-1 font-bold text-[#888]">
                      {idx + 1}
                    </td>

                    {/* Name */}
                    <td className="border-b border-l border-[#ecece9] px-3 py-1 text-right font-black text-[#171717]">
                      <div
                        onClick={() => handleOpenEdit(o)}
                        className="cursor-pointer hover:underline flex items-center justify-between gap-1"
                        style={{ color: primaryColor }}
                        title="انقر لتعديل بيانات المراقب"
                      >
                        <span>{o.name}</span>
                        <Edit3 className="size-3 text-[#aaa] opacity-0 group-hover:opacity-100 transition" />
                      </div>
                    </td>

                    {/* Job */}
                    <td className="border-b border-l border-[#ecece9] px-2 py-1 font-bold text-[#444] text-[11px]">
                      {o.job}
                    </td>

                    {/* Specialization */}
                    <td className="border-b border-l border-[#ecece9] px-2 py-1 font-semibold text-[#666] text-[11px]">
                      {o.specialization || 'عام'}
                    </td>

                    {/* Days */}
                    <td className="border-b border-l border-[#ecece9] px-1.5 py-1">
                      <div className="flex flex-wrap items-center justify-center gap-0.5">
                        {o.days ? (
                          o.days.split(',').map((d) => (
                            <span
                              key={d}
                              className="rounded bg-[#f0f0ee] px-1.5 py-0.2 text-[9px] font-bold text-[#444]"
                            >
                              {d.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-[#aaa]">غير محدد</span>
                        )}
                      </div>
                    </td>

                    {/* Hours + Progress Bar */}
                    <td className="border-b border-l border-[#ecece9] px-2 py-1">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center justify-between text-[11px] font-black">
                          <span style={{ color: primaryColor }}>{hours} س</span>
                          <span className="text-[9px] font-semibold text-[#888]">{percent}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e2e8f0]">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: isHigh ? '#d97706' : isLow ? '#3b82f6' : '#15803d',
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Slot Count */}
                    <td className="border-b border-l border-[#ecece9] px-1 py-1 font-black text-[#171717]">
                      <span className="rounded-md bg-[#eef3f8] px-2 py-0.5 text-xs text-[#1f4d78]">
                        {schInfo.slots} فترة
                      </span>
                    </td>

                    {/* Attendance Record */}
                    <td className="border-b border-l border-[#ecece9] px-1 py-1 text-[10px] font-bold">
                      {attInfo.present + attInfo.absent + attInfo.late > 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-[#15803d]" title="حاضر">
                            ✓{attInfo.present}
                          </span>
                          {attInfo.absent > 0 && (
                            <span className="text-[#dc2626]" title="غائب">
                              ✗{attInfo.absent}
                            </span>
                          )}
                          {attInfo.late > 0 && (
                            <span className="text-[#d97706]" title="متأخر">
                              ⏳{attInfo.late}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#aaa]">—</span>
                      )}
                    </td>

                    {/* Workload Status Badge */}
                    <td className="border-b border-l border-[#ecece9] px-1 py-1">
                      {isHigh ? (
                        <span className="inline-flex items-center gap-0.5 rounded bg-[#fffbeb] px-1.5 py-0.5 text-[9.5px] font-bold text-[#b45309] border border-[#fde68a]">
                          <AlertCircle className="size-2.5" />
                          <span>مرتفع</span>
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-0.5 rounded bg-[#eff6ff] px-1.5 py-0.5 text-[9.5px] font-bold text-[#1d4ed8] border border-[#bfdbfe]">
                          <span>منخفض</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 rounded bg-[#f0fdf4] px-1.5 py-0.5 text-[9.5px] font-bold text-[#15803d] border border-[#bbf7d0]">
                          <CheckCircle2 className="size-2.5" />
                          <span>متوازن</span>
                        </span>
                      )}
                    </td>

                    {/* Action Edit */}
                    <td className="border-b border-[#ecece9] px-1 py-1 text-center print-hide">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(o)}
                        className="rounded p-1 text-[#1f4d78] hover:bg-[#eef3f8] transition"
                        title="تعديل المراقب"
                      >
                        <Edit3 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Signatures Footer (Printable) */}
      <div className="mt-2 flex items-center justify-between border-t border-[#dededb] pt-2 px-3 text-center text-xs font-black text-[#171717]">
        <div className="flex flex-col items-center">
          <p className="text-[11px] font-bold text-[#666]">رئيس لجنة الجداول:</p>
          <p className="mt-0.5 text-xs font-black">{signatures.sigTables || 'د. حياه سامي على احمد'}</p>
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

      {/* Edit Observer Modal */}
      <EditObserverModal
        isOpen={isModalOpen}
        observer={selectedObserverToEdit}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
      />
    </div>
  )
}
