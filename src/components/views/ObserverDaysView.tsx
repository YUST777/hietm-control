import React, { useState } from 'react'
import type { Observer } from '../../types/control'
import { Search, CalendarCheck } from 'lucide-react'

interface ObserverDaysViewProps {
  observers: Observer[]
  onUpdateObserverDays: (id: string, days: string) => void
}

const WEEK_DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']

export const ObserverDaysView: React.FC<ObserverDaysViewProps> = ({
  observers,
  onUpdateObserverDays,
}) => {
  const [search, setSearch] = useState('')

  const filtered = observers.filter(
    (o) =>
      !search ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.specialization.toLowerCase().includes(search.toLowerCase())
  )

  const toggleDay = (obs: Observer, day: string) => {
    const currentDays = obs.days ? obs.days.split(',').map((d) => d.trim()).filter(Boolean) : []
    let nextDays: string[]
    if (currentDays.includes(day)) {
      nextDays = currentDays.filter((d) => d !== day)
    } else {
      nextDays = [...currentDays, day]
    }
    onUpdateObserverDays(obs.id, nextDays.join(','))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* Header & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dededb] bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <CalendarCheck className="size-5 text-[#1f4d78]" />
          <div>
            <h2 className="text-sm font-black text-[#171717]">أيام التفرغ والحضور للمراقبين</h2>
            <p className="text-xs font-semibold text-[#777]">
              حدد الأيام المتاحة لكل عضو هيئة تدريس ومعاون لتجنب التعارضات أثناء التوزيع
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute right-2.5 top-2.5 size-3.5 text-[#888]" />
          <input
            type="text"
            placeholder="بحث بالاسم أو التخصص..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-60 rounded-lg border border-[#cfcfcb] pr-8 pl-2.5 text-xs font-semibold outline-none focus:border-[#1f4d78]"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dededb] bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-center text-xs">
            <thead className="sticky top-0 z-10 bg-[#eef3f8]">
              <tr className="text-[11px] font-black text-[#171717]">
                <th className="border-b border-l border-[#cfcfcb] px-2 py-2 w-10">م</th>
                <th className="border-b border-l border-[#cfcfcb] px-4 py-2 text-right min-w-44">
                  اسم المراقب
                </th>
                <th className="border-b border-l border-[#cfcfcb] px-3 py-2 min-w-28">الوظيفة</th>
                <th className="border-b border-l border-[#cfcfcb] px-3 py-2 min-w-24">التخصص</th>
                <th className="border-b border-[#cfcfcb] px-4 py-2">أيام الحضور الأسبوعية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecece9]">
              {filtered.map((obs, idx) => {
                const assignedDays = obs.days
                  ? obs.days.split(',').map((d) => d.trim()).filter(Boolean)
                  : []
                return (
                  <tr key={obs.id} className="hover:bg-[#fbfbfa] transition">
                    <td className="border-b border-l border-[#ecece9] px-1 py-2 font-bold text-[#888]">
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
                    <td className="border-b border-[#ecece9] px-4 py-1.5">
                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {WEEK_DAYS.map((d) => {
                          const active = assignedDays.includes(d)
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => toggleDay(obs, d)}
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
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
