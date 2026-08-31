import React, { useState, useMemo } from 'react'
import type { Observer } from '../../types/control'
import { Search, RotateCcw, Clock, Award, Users2, Plus, Trash2, Edit3 } from 'lucide-react'
import { EditObserverModal } from '../modals/EditObserverModal'

interface HoursDashboardViewProps {
  observers: Observer[]
  jobTitles?: string[]
  departments?: string[]
  workDays?: string[]
  roleQuotas?: Record<string, number>
  onUpdateObserver: (id: string, updates: Partial<Observer>) => void
  onAddObserver: (obs: Omit<Observer, 'id'>) => void
  onDeleteObserver: (id: string) => void
  onResetHours: () => void
}

export const HoursDashboardView: React.FC<HoursDashboardViewProps> = ({
  observers,
  jobTitles,
  departments,
  workDays,
  roleQuotas,
  onUpdateObserver,
  onAddObserver,
  onDeleteObserver,
  onResetHours,
}) => {
  const [search, setSearch] = useState('')
  const [selectedJob, setSelectedJob] = useState('ALL')
  const [selectedSpec, setSelectedSpec] = useState('ALL')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedObserverToEdit, setSelectedObserverToEdit] = useState<Observer | null>(null)

  const jobs = useMemo(() => {
    const set = new Set(observers.map((o) => o.job).filter(Boolean))
    return Array.from(set)
  }, [observers])

  const specializations = useMemo(() => {
    const set = new Set(observers.map((o) => o.specialization).filter(Boolean))
    return Array.from(set)
  }, [observers])

  const filtered = useMemo(() => {
    return observers.filter((o) => {
      const matchSearch =
        !search ||
        (o.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.specialization || '').toLowerCase().includes(search.toLowerCase())
      const matchJob = selectedJob === 'ALL' || o.job === selectedJob
      const matchSpec = selectedSpec === 'ALL' || o.specialization === selectedSpec
      return matchSearch && matchJob && matchSpec
    })
  }, [observers, search, selectedJob, selectedSpec])

  const stats = useMemo(() => {
    const totalHours = observers.reduce((sum, o) => sum + (o.hours || 0), 0)
    const facultyMembers = observers.filter((o) => (o.job || '').includes('هيئة تدريس')).length
    const assistants = observers.length - facultyMembers
    return {
      totalHours,
      totalCount: observers.length,
      avgHours: observers.length ? (totalHours / observers.length).toFixed(1) : '0',
      facultyMembers,
      assistants,
    }
  }, [observers])

  const handleOpenAddModal = () => {
    setSelectedObserverToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (obs: Observer) => {
    setSelectedObserverToEdit(obs)
    setIsModalOpen(true)
  }

  const handleSaveModal = (obsData: Omit<Observer, 'id'>, id?: string) => {
    if (id) {
      onUpdateObserver(id, obsData)
    } else {
      onAddObserver(obsData)
    }
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف عضو المراقبة: "${name}" من قاعدة البيانات؟`)) {
      onDeleteObserver(id)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-xl border border-[#dededb] bg-white p-2.5 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#666]">
            <Clock className="size-3.5 text-[#1f4d78]" />
            <span>إجمالي ساعات المراقبة</span>
          </div>
          <p className="mt-0.5 text-xl font-black text-[#1f4d78] tabular-nums">
            {stats.totalHours} <span className="text-[10px] font-bold text-[#888]">ساعة</span>
          </p>
        </div>

        <div className="rounded-xl border border-[#dededb] bg-white p-2.5 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#666]">
            <Users2 className="size-3.5 text-[#155724]" />
            <span>إجمالي أعضاء المراقبة</span>
          </div>
          <p className="mt-0.5 text-xl font-black text-[#155724] tabular-nums">
            {stats.totalCount} <span className="text-[10px] font-bold text-[#888]">عضو</span>
          </p>
        </div>

        <div className="rounded-xl border border-[#dededb] bg-white p-2.5 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#666]">
            <Award className="size-3.5 text-[#856404]" />
            <span>أعضاء هيئة التدريس</span>
          </div>
          <p className="mt-0.5 text-xl font-black text-[#856404] tabular-nums">
            {stats.facultyMembers} <span className="text-[10px] font-bold text-[#888]">عضو</span>
          </p>
        </div>

        <div className="rounded-xl border border-[#dededb] bg-white p-2.5 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#666]">
            <Clock className="size-3.5 text-[#563d7c]" />
            <span>متوسط الساعات للعضو</span>
          </div>
          <p className="mt-0.5 text-xl font-black text-[#563d7c] tabular-nums">
            {stats.avgHours} <span className="text-[10px] font-bold text-[#888]">س/عضو</span>
          </p>
        </div>
      </div>

      {/* Toolbar, Add Button & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#dededb] bg-white p-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
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
            className="h-7.5 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none"
          >
            <option value="ALL">جميع الوظائف</option>
            {jobs.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>

          {/* Specialization Filter */}
          <select
            value={selectedSpec}
            onChange={(e) => setSelectedSpec(e.target.value)}
            className="h-7.5 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none"
          >
            <option value="ALL">جميع التخصصات</option>
            {specializations.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 rounded-lg bg-[#1f4d78] px-3.5 py-1.5 text-xs font-black text-white shadow-xs hover:bg-[#163756] transition"
          >
            <Plus className="size-3.5" />
            <span>إضافة مراقب جديد</span>
          </button>

          <button
            type="button"
            onClick={onResetHours}
            className="flex items-center gap-1 rounded-lg border border-[#fee2e2] bg-[#fff5f5] px-2.5 py-1.5 text-xs font-bold text-[#c5221f] hover:bg-[#fee2e2] transition"
          >
            <RotateCcw className="size-3" />
            <span>تصفير الساعات</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dededb] bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-center text-xs">
            <thead className="sticky top-0 z-10 bg-[#eef3f8]">
              <tr className="text-[10px] font-black text-[#171717]">
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-10">م</th>
                <th className="border-b border-l border-[#cfcfcb] px-3 py-1.5 text-right min-w-44">
                  اسم عضو المراقبة
                </th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 min-w-36">المسمى الوظيفي</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 min-w-32">القسم / التخصص</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 min-w-44">أيام الحضور المعتمدة</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-24">إجمالي الساعات</th>
                <th className="border-b border-[#cfcfcb] px-2 py-1.5 w-20">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecece9]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs font-bold text-[#888]">
                    لا توجد بيانات مطابقة للبحث أو الفلتر المحدد.
                  </td>
                </tr>
              ) : (
                filtered.map((obs, idx) => (
                <tr key={obs.id} className="hover:bg-[#fbfbfa] transition group">
                  <td className="border-b border-l border-[#ecece9] px-1 py-1 font-bold text-[#888]">
                    {idx + 1}
                  </td>

                  {/* Name */}
                  <td className="border-b border-l border-[#ecece9] px-3 py-1 text-right font-bold text-[#171717]">
                    <div
                      onClick={() => handleOpenEditModal(obs)}
                      className="cursor-pointer hover:text-[#1f4d78] hover:underline flex items-center justify-between gap-1"
                      title="انقر لتعديل بيانات المراقب"
                    >
                      <span>{obs.name}</span>
                      <Edit3 className="size-3 text-[#aaa] opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </td>

                  {/* Job */}
                  <td className="border-b border-l border-[#ecece9] px-2 py-1 font-semibold text-[#555]">
                    <span className="rounded bg-[#f0f4f8] px-2 py-0.5 text-[9.5px] text-[#1f4d78] font-black">
                      {obs.job}
                    </span>
                  </td>

                  {/* Specialization */}
                  <td className="border-b border-l border-[#ecece9] px-2 py-1 font-semibold text-[#555] text-[11px]">
                    {obs.specialization || '—'}
                  </td>

                  {/* Days */}
                  <td className="border-b border-l border-[#ecece9] px-2 py-1 font-normal text-[#666]">
                    <div className="flex flex-wrap items-center justify-center gap-1">
                      {obs.days
                        ? obs.days.split(',').map((d) => (
                            <span
                              key={d}
                              className="rounded bg-[#f0f0ee] px-1.5 py-0.2 text-[8.5px] font-bold text-[#555]"
                            >
                              {d.trim()}
                            </span>
                          ))
                        : '—'}
                    </div>
                  </td>

                  {/* Hours with quick stepper */}
                  <td className="border-b border-l border-[#ecece9] px-1 py-1 font-black text-[#1f4d78] tabular-nums">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateObserver(obs.id, { hours: Math.max(0, (obs.hours || 0) - 1) })
                        }
                        className="size-5 rounded bg-[#f0f0ee] text-xs font-black text-[#666] hover:bg-[#e4e4e1] transition"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={obs.hours || 0}
                        onChange={(e) =>
                          onUpdateObserver(obs.id, { hours: Math.max(0, parseInt(e.target.value, 10) || 0) })
                        }
                        className="h-6 w-12 rounded border border-[#cfcfcb] bg-white text-center font-black text-xs outline-none focus:border-[#1f4d78]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateObserver(obs.id, { hours: (obs.hours || 0) + 1 })
                        }
                        className="size-5 rounded bg-[#f0f0ee] text-xs font-black text-[#666] hover:bg-[#e4e4e1] transition"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="border-b border-[#ecece9] px-1 py-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(obs)}
                        className="rounded p-1 text-[#1f4d78] hover:bg-[#eef3f8] transition"
                        title="تعديل المراقب"
                      >
                        <Edit3 className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(obs.id, obs.name)}
                        className="rounded p-1 text-[#c5221f] hover:bg-[#fee2e2] transition"
                        title="حذف المراقب"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Observer Modal */}
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
