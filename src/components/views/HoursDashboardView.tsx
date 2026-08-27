import React, { useState, useMemo } from 'react'
import type { Observer } from '../../types/control'
import { Search, RotateCcw, Clock, Award, Users2 } from 'lucide-react'

interface HoursDashboardViewProps {
  observers: Observer[]
  onUpdateObserver: (id: string, updates: Partial<Observer>) => void
  onResetHours: () => void
}

export const HoursDashboardView: React.FC<HoursDashboardViewProps> = ({
  observers,
  onUpdateObserver,
  onResetHours,
}) => {
  const [search, setSearch] = useState('')
  const [selectedJob, setSelectedJob] = useState('ALL')
  const [selectedSpec, setSelectedSpec] = useState('ALL')

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

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-xl border border-[#dededb] bg-white p-3 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#666]">
            <Clock className="size-4 text-[#1f4d78]" />
            <span>إجمالي ساعات المراقبة</span>
          </div>
          <p className="mt-1 text-2xl font-black text-[#1f4d78] tabular-nums">
            {stats.totalHours} <span className="text-xs font-bold text-[#888]">ساعة</span>
          </p>
        </div>

        <div className="rounded-xl border border-[#dededb] bg-white p-3 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#666]">
            <Users2 className="size-4 text-[#155724]" />
            <span>إجمالي أعضاء المراقبة</span>
          </div>
          <p className="mt-1 text-2xl font-black text-[#155724] tabular-nums">
            {stats.totalCount} <span className="text-xs font-bold text-[#888]">عضو</span>
          </p>
        </div>

        <div className="rounded-xl border border-[#dededb] bg-white p-3 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#666]">
            <Award className="size-4 text-[#856404]" />
            <span>أعضاء هيئة التدريس</span>
          </div>
          <p className="mt-1 text-2xl font-black text-[#856404] tabular-nums">
            {stats.facultyMembers} <span className="text-xs font-bold text-[#888]">عضو</span>
          </p>
        </div>

        <div className="rounded-xl border border-[#dededb] bg-white p-3 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#666]">
            <Clock className="size-4 text-[#563d7c]" />
            <span>متوسط الساعات للعضو</span>
          </div>
          <p className="mt-1 text-2xl font-black text-[#563d7c] tabular-nums">
            {stats.avgHours} <span className="text-xs font-bold text-[#888]">س/عضو</span>
          </p>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[#dededb] bg-white p-2.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute right-2.5 top-2.5 size-3.5 text-[#888]" />
            <input
              type="text"
              placeholder="بحث بالاسم أو التخصص..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-56 rounded-lg border border-[#cfcfcb] pr-8 pl-2.5 text-xs font-semibold outline-none focus:border-[#1f4d78]"
            />
          </div>

          {/* Job Filter */}
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="h-8 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none"
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
            className="h-8 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none"
          >
            <option value="ALL">جميع التخصصات</option>
            {specializations.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onResetHours}
          className="flex items-center gap-1 rounded-lg border border-[#fee2e2] bg-[#fff5f5] px-3 py-1.5 text-xs font-bold text-[#c5221f] hover:bg-[#fee2e2] transition"
        >
          <RotateCcw className="size-3" />
          <span>تصفير عداد الساعات</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dededb] bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-center text-xs">
            <thead className="sticky top-0 z-10 bg-[#eef3f8]">
              <tr className="text-[11px] font-black text-[#171717]">
                <th className="border-b border-l border-[#cfcfcb] px-3 py-2 w-12">م</th>
                <th className="border-b border-l border-[#cfcfcb] px-4 py-2 text-right">
                  اسم المراقب
                </th>
                <th className="border-b border-l border-[#cfcfcb] px-3 py-2">الوظيفة</th>
                <th className="border-b border-l border-[#cfcfcb] px-3 py-2">التخصص</th>
                <th className="border-b border-l border-[#cfcfcb] px-3 py-2">أيام الحضور</th>
                <th className="border-b border-[#cfcfcb] px-3 py-2 w-28">إجمالي الساعات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecece9]">
              {filtered.map((obs, idx) => (
                <tr key={obs.id} className="hover:bg-[#fbfbfa] transition">
                  <td className="border-b border-l border-[#ecece9] px-2 py-2 font-bold text-[#888]">
                    {idx + 1}
                  </td>
                  <td className="border-b border-l border-[#ecece9] px-4 py-2 text-right font-bold text-[#171717]">
                    {obs.name}
                  </td>
                  <td className="border-b border-l border-[#ecece9] px-3 py-2 font-semibold text-[#555]">
                    <span className="rounded bg-[#f0f4f8] px-2 py-0.5 text-[10px] text-[#1f4d78]">
                      {obs.job}
                    </span>
                  </td>
                  <td className="border-b border-l border-[#ecece9] px-3 py-2 font-semibold text-[#555]">
                    {obs.specialization || '—'}
                  </td>
                  <td className="border-b border-l border-[#ecece9] px-3 py-2 font-normal text-[#666]">
                    <div className="flex flex-wrap items-center justify-center gap-1">
                      {obs.days
                        ? obs.days.split(',').map((d) => (
                            <span
                              key={d}
                              className="rounded bg-[#f0f0ee] px-1.5 py-0.2 text-[9px] font-bold text-[#555]"
                            >
                              {d.trim()}
                            </span>
                          ))
                        : '—'}
                    </div>
                  </td>
                  <td className="border-b border-[#ecece9] px-2 py-1.5 font-black text-[#1f4d78] tabular-nums">
                    <input
                      type="number"
                      min={0}
                      value={obs.hours || 0}
                      onChange={(e) =>
                        onUpdateObserver(obs.id, { hours: parseInt(e.target.value, 10) || 0 })
                      }
                      className="h-7 w-16 rounded border border-[#cfcfcb] bg-white text-center font-black text-xs outline-none focus:border-[#1f4d78]"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
