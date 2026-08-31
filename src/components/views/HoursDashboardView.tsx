import React, { useState, useMemo } from 'react'
import type { Observer } from '../../types/control'
import { Search, RotateCcw, Clock, Award, Users2, Plus, Trash2, Edit3, Check, X } from 'lucide-react'

interface HoursDashboardViewProps {
  observers: Observer[]
  onUpdateObserver: (id: string, updates: Partial<Observer>) => void
  onAddObserver: (obs: Omit<Observer, 'id'>) => void
  onDeleteObserver: (id: string) => void
  onResetHours: () => void
}

const JOB_OPTIONS = [
  'عضو هيئة تدريس',
  'أ.د. (عضو هيئة تدريس)',
  'أ.م.د. (عضو هيئة تدريس)',
  'د. (عضو هيئة تدريس)',
  'هيئة معاونة (مدرس مساعد)',
  'م.م. (هيئة معاونة)',
  'هيئة معاونة (معيد)',
  'م. (هيئة معاونة)',
  'إداري / موظف',
]

export const HoursDashboardView: React.FC<HoursDashboardViewProps> = ({
  observers,
  onUpdateObserver,
  onAddObserver,
  onDeleteObserver,
  onResetHours,
}) => {
  const [search, setSearch] = useState('')
  const [selectedJob, setSelectedJob] = useState('ALL')
  const [selectedSpec, setSelectedSpec] = useState('ALL')

  // Edit in place state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editJob, setEditJob] = useState('')
  const [editSpec, setEditSpec] = useState('')
  const [editDays, setEditDays] = useState('')

  // Add observer modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newJob, setNewJob] = useState(JOB_OPTIONS[0])
  const [newSpec, setNewSpec] = useState('')
  const [newDays] = useState('السبت, الأحد, الاثنين, الثلاثاء, الأربعاء, الخميس')

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
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.specialization.toLowerCase().includes(search.toLowerCase())
      const matchJob = selectedJob === 'ALL' || o.job === selectedJob
      const matchSpec = selectedSpec === 'ALL' || o.specialization === selectedSpec
      return matchSearch && matchJob && matchSpec
    })
  }, [observers, search, selectedJob, selectedSpec])

  const stats = useMemo(() => {
    const totalHours = observers.reduce((sum, o) => sum + (o.hours || 0), 0)
    const facultyMembers = observers.filter((o) => o.job.includes('هيئة تدريس')).length
    const assistants = observers.length - facultyMembers
    return {
      totalHours,
      totalCount: observers.length,
      avgHours: observers.length ? (totalHours / observers.length).toFixed(1) : '0',
      facultyMembers,
      assistants,
    }
  }, [observers])

  const startEdit = (obs: Observer) => {
    setEditingId(obs.id)
    setEditName(obs.name)
    setEditJob(obs.job)
    setEditSpec(obs.specialization)
    setEditDays(obs.days)
  }

  const saveEdit = (id: string) => {
    if (!editName.trim()) return alert('اسم المراقب لا يمكن أن يكون فارغاً')
    onUpdateObserver(id, {
      name: editName.trim(),
      job: editJob.trim(),
      specialization: editSpec.trim(),
      days: editDays.trim(),
    })
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return alert('يرجى كتابة اسم المراقب')
    onAddObserver({
      name: newName.trim(),
      job: newJob.trim(),
      specialization: newSpec.trim() || 'قسم العلوم الأساسية',
      days: newDays.trim(),
      hours: 0,
    })
    setNewName('')
    setNewSpec('')
    setShowAddModal(false)
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`هل تريد بالتأكيد حذف المراقب: "${name}"؟`)) {
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
            <Search className="absolute right-2 top-2 size-3.5 text-[#888]" />
            <input
              type="text"
              placeholder="بحث بالاسم أو التخصص..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 w-52 rounded-lg border border-[#cfcfcb] pr-7 pl-2 text-xs font-semibold outline-none focus:border-[#1f4d78]"
            />
          </div>

          {/* Job Filter */}
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="h-7 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none"
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
            className="h-7 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none"
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
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 rounded-lg bg-[#1f4d78] px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-[#163756] transition"
          >
            <Plus className="size-3.5" />
            <span>إضافة مراقب جديد</span>
          </button>

          <button
            type="button"
            onClick={onResetHours}
            className="flex items-center gap-1 rounded-lg border border-[#fee2e2] bg-[#fff5f5] px-2.5 py-1 text-xs font-bold text-[#c5221f] hover:bg-[#fee2e2] transition"
          >
            <RotateCcw className="size-3" />
            <span>تصفير الساعات</span>
          </button>
        </div>
      </div>

      {/* Add Observer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#dededb] bg-white p-5 shadow-xl">
            <h3 className="text-sm font-black text-[#171717] mb-3">إضافة عضو مراقبة جديد</h3>
            <form onSubmit={handleAddSubmit} className="flex flex-col gap-2.5 text-xs font-bold">
              <div>
                <label className="text-[#666]">اسم المراقب:</label>
                <input
                  type="text"
                  placeholder="مثال: د. أحمد محمود"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 h-8 w-full rounded-lg border border-[#cfcfcb] px-2.5 outline-none focus:border-[#1f4d78]"
                  required
                />
              </div>

              <div>
                <label className="text-[#666]">المسمى الوظيفي:</label>
                <select
                  value={newJob}
                  onChange={(e) => setNewJob(e.target.value)}
                  className="mt-1 h-8 w-full rounded-lg border border-[#cfcfcb] px-2 outline-none"
                >
                  {JOB_OPTIONS.map((job) => (
                    <option key={job} value={job}>
                      {job}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#666]">القسم / التخصص:</label>
                <input
                  type="text"
                  placeholder="مثال: قسم العلوم الأساسية"
                  value={newSpec}
                  onChange={(e) => setNewSpec(e.target.value)}
                  className="mt-1 h-8 w-full rounded-lg border border-[#cfcfcb] px-2.5 outline-none focus:border-[#1f4d78]"
                />
              </div>

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-[#cfcfcb] px-3 py-1.5 text-xs text-[#555] hover:bg-[#f0f0ee]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#1f4d78] px-4 py-1.5 text-xs text-white hover:bg-[#163756]"
                >
                  إضافة العضو
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Table with Inline Editing */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dededb] bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-center text-xs">
            <thead className="sticky top-0 z-10 bg-[#eef3f8]">
              <tr className="text-[10px] font-black text-[#171717]">
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-10">م</th>
                <th className="border-b border-l border-[#cfcfcb] px-3 py-1.5 text-right min-w-44">
                  اسم المراقب (انقر للتعديل)
                </th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 min-w-36">الوظيفة</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 min-w-32">التخصص</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5">أيام الحضور</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-24">إجمالي الساعات</th>
                <th className="border-b border-[#cfcfcb] px-2 py-1.5 w-20">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecece9]">
              {filtered.map((obs, idx) => {
                const isEditing = editingId === obs.id

                return (
                  <tr key={obs.id} className="hover:bg-[#fbfbfa] transition group">
                    <td className="border-b border-l border-[#ecece9] px-1 py-1 font-bold text-[#888]">
                      {idx + 1}
                    </td>

                    {/* Name */}
                    <td className="border-b border-l border-[#ecece9] px-3 py-1 text-right font-bold text-[#171717]">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-6 w-full rounded border border-[#1f4d78] px-1.5 text-xs font-bold text-[#171717] outline-none"
                          autoFocus
                        />
                      ) : (
                        <div
                          onClick={() => startEdit(obs)}
                          className="cursor-pointer hover:text-[#1f4d78] hover:underline flex items-center justify-between gap-1"
                        >
                          <span>{obs.name}</span>
                          <Edit3 className="size-3 text-[#aaa] opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      )}
                    </td>

                    {/* Job */}
                    <td className="border-b border-l border-[#ecece9] px-2 py-1 font-semibold text-[#555]">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editJob}
                          onChange={(e) => setEditJob(e.target.value)}
                          className="h-6 w-full rounded border border-[#cfcfcb] px-1 text-[11px] outline-none"
                        />
                      ) : (
                        <span
                          onClick={() => startEdit(obs)}
                          className="rounded bg-[#f0f4f8] px-1.5 py-0.5 text-[9px] text-[#1f4d78] font-bold cursor-pointer"
                        >
                          {obs.job}
                        </span>
                      )}
                    </td>

                    {/* Specialization */}
                    <td className="border-b border-l border-[#ecece9] px-2 py-1 font-semibold text-[#555]">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editSpec}
                          onChange={(e) => setEditSpec(e.target.value)}
                          className="h-6 w-full rounded border border-[#cfcfcb] px-1 text-[11px] outline-none"
                        />
                      ) : (
                        <span onClick={() => startEdit(obs)} className="cursor-pointer text-[11px]">
                          {obs.specialization || '—'}
                        </span>
                      )}
                    </td>

                    {/* Days */}
                    <td className="border-b border-l border-[#ecece9] px-2 py-1 font-normal text-[#666]">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editDays}
                          onChange={(e) => setEditDays(e.target.value)}
                          placeholder="السبت, الأحد..."
                          className="h-6 w-full rounded border border-[#cfcfcb] px-1 text-[10px] outline-none"
                        />
                      ) : (
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
                      )}
                    </td>

                    {/* Hours */}
                    <td className="border-b border-l border-[#ecece9] px-1 py-1 font-black text-[#1f4d78] tabular-nums">
                      <input
                        type="number"
                        min={0}
                        value={obs.hours || 0}
                        onChange={(e) =>
                          onUpdateObserver(obs.id, { hours: parseInt(e.target.value, 10) || 0 })
                        }
                        className="h-6 w-14 rounded border border-[#cfcfcb] bg-white text-center font-black text-xs outline-none focus:border-[#1f4d78]"
                      />
                    </td>

                    {/* Actions */}
                    <td className="border-b border-[#ecece9] px-1 py-1 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => saveEdit(obs.id)}
                            className="rounded p-1 bg-[#155724] text-white hover:bg-[#0f3d19] transition"
                            title="حفظ التعديل"
                          >
                            <Check className="size-3" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded p-1 bg-[#888] text-white hover:bg-[#666] transition"
                            title="إلغاء"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(obs)}
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
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
