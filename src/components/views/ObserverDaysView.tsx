import React, { useState, useMemo } from 'react'
import type { Observer } from '../../types/control'
import { Search, CalendarCheck, Plus, Edit3, CheckCheck, X } from 'lucide-react'
import { EditObserverModal } from '../modals/EditObserverModal'

interface ObserverDaysViewProps {
  observers: Observer[]
  onUpdateObserver: (id: string, updates: Partial<Observer>) => void
  onAddObserver: (obs: Omit<Observer, 'id'>) => void
  onUpdateObserverDays: (id: string, days: string) => void
}

const WEEK_DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']

export const ObserverDaysView: React.FC<ObserverDaysViewProps> = ({
  observers,
  onUpdateObserver,
  onAddObserver,
  onUpdateObserverDays,
}) => {
  const [search, setSearch] = useState('')
  const [jobFilter, setJobFilter] = useState('ALL')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedObserverToEdit, setSelectedObserverToEdit] = useState<Observer | null>(null)

  const filtered = useMemo(() => {
    return observers.filter((o) => {
      const matchSearch =
        !search ||
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.specialization.toLowerCase().includes(search.toLowerCase())
      const matchJob =
        jobFilter === 'ALL' ||
        (jobFilter === 'FACULTY' && o.job.includes('هيئة تدريس')) ||
        (jobFilter === 'ASSISTANT' && (o.job.includes('معاونة') || o.job.includes('معيد') || o.job.includes('مساعد'))) ||
        (jobFilter === 'ADMIN' && o.job.includes('إداري'))
      return matchSearch && matchJob
    })
  }, [observers, search, jobFilter])

  const toggleDay = (obs: Observer, day: string) => {
    const currentDays = obs.days ? obs.days.split(',').map((d) => d.trim()).filter(Boolean) : []
    let nextDays: string[]
    if (currentDays.includes(day)) {
      nextDays = currentDays.filter((d) => d !== day)
    } else {
      nextDays = [...currentDays, day]
    }
    onUpdateObserverDays(obs.id, nextDays.join(', '))
  }

  const setAllDays = (obs: Observer) => {
    onUpdateObserverDays(obs.id, WEEK_DAYS.join(', '))
  }

  const clearAllDays = (obs: Observer) => {
    onUpdateObserverDays(obs.id, '')
  }

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

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5">
      {/* Header & Search */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[#dededb] bg-white p-2.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <CalendarCheck className="size-4.5 text-[#1f4d78]" />
            <div>
              <h2 className="text-xs font-black text-[#171717]">
                أيام التفرغ والحضور للمراقبين ({filtered.length} مراقب)
              </h2>
              <p className="text-[11px] font-semibold text-[#777]">
                انقر على أي يوم لتفعيل أو إلغاء تفرغ المراقب مع الحفظ الفوري
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute right-2.5 top-2 size-3.5 text-[#888]" />
            <input
              type="text"
              placeholder="بحث بالاسم أو التخصص..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7.5 w-48 rounded-lg border border-[#cfcfcb] pr-7.5 pl-2 text-xs font-semibold outline-none focus:border-[#1f4d78]"
            />
          </div>

          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="h-7.5 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none cursor-pointer"
          >
            <option value="ALL">جميع الفئات</option>
            <option value="FACULTY">هيئة التدريس</option>
            <option value="ASSISTANT">الهيئة المعاونة</option>
            <option value="ADMIN">الجهاز الإداري</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 rounded-lg bg-[#1f4d78] px-3.5 py-1.5 text-xs font-black text-white shadow-xs hover:bg-[#163756] transition"
        >
          <Plus className="size-3.5" />
          <span>إضافة مراقب جديد</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dededb] bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-center text-xs">
            <thead className="sticky top-0 z-10 bg-[#eef3f8]">
              <tr className="text-[10px] font-black text-[#171717]">
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-10">م</th>
                <th className="border-b border-l border-[#cfcfcb] px-3 py-1.5 text-right min-w-44">
                  اسم المراقب
                </th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 min-w-28">الوظيفة</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 min-w-24">القسم</th>
                <th className="border-b border-l border-[#cfcfcb] px-3 py-1.5 min-w-64">
                  أيام الحضور الأسبوعية (انقر للتبديل السريع)
                </th>
                <th className="border-b border-[#cfcfcb] px-2 py-1.5 w-24">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecece9]">
              {filtered.map((obs, idx) => {
                const assignedDays = obs.days
                  ? obs.days.split(',').map((d) => d.trim()).filter(Boolean)
                  : []
                return (
                  <tr key={obs.id} className="hover:bg-[#fbfbfa] transition group">
                    <td className="border-b border-l border-[#ecece9] px-1 py-1 font-bold text-[#888]">
                      {idx + 1}
                    </td>

                    {/* Name with Quick Edit */}
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
                      <span className="rounded bg-[#f0f4f8] px-1.5 py-0.5 text-[9.5px] text-[#1f4d78] font-bold">
                        {obs.job}
                      </span>
                    </td>

                    {/* Specialization */}
                    <td className="border-b border-l border-[#ecece9] px-2 py-1 font-semibold text-[#555] text-[11px]">
                      {obs.specialization || '—'}
                    </td>

                    {/* Interactive Days */}
                    <td className="border-b border-l border-[#ecece9] px-3 py-1">
                      <div className="flex flex-wrap items-center justify-center gap-1">
                        {WEEK_DAYS.map((d) => {
                          const active = assignedDays.includes(d)
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => toggleDay(obs, d)}
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition cursor-pointer ${
                                active
                                  ? 'bg-[#1f4d78] text-white shadow-xs'
                                  : 'bg-[#f0f0ee] text-[#777] hover:bg-[#e4e4e1]'
                              }`}
                            >
                              {d}
                            </button>
                          )
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="border-b border-[#ecece9] px-1 py-1 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setAllDays(obs)}
                          className="rounded p-1 text-[#15803d] hover:bg-[#dcfce7] transition"
                          title="تحديد كل الأيام"
                        >
                          <CheckCheck className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => clearAllDays(obs)}
                          className="rounded p-1 text-[#666] hover:bg-[#fee2e2] hover:text-[#c5221f] transition"
                          title="إلغاء كل الأيام"
                        >
                          <X className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(obs)}
                          className="rounded p-1 text-[#1f4d78] hover:bg-[#eef3f8] transition"
                          title="تعديل المراقب بالكامل"
                        >
                          <Edit3 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      <EditObserverModal
        isOpen={isModalOpen}
        observer={selectedObserverToEdit}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
      />
    </div>
  )
}
