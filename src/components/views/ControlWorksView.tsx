import React, { useState, useMemo } from 'react'
import type { Subject, ControlWorkSubject } from '../../types/control'
import { CheckSquare, Search } from 'lucide-react'

interface ControlWorksViewProps {
  subjects: Subject[]
  controlWorks: ControlWorkSubject[]
  onToggleItem: (subjectId: string, itemIndex: number) => void
}

const CONTROL_STAGES = [
  '1) نموذج ورقة الأسئلة',
  '2) الإجابة النموذجية',
  '3) أعمال السنة',
  '4) محضر الفض',
  '5) تقرير السير',
  '6) محاضر الغش',
  '7) استمارات الغياب',
  '8) تسليم ورق الإجابة للمصحح',
  '9) استلام ورقة الإجابة بعد التصحيح',
  '10) المراجعة الأولى لكراسات الإجابة',
  '11) رصد أعمال السنة',
  '12) رصد العملي',
  '13) رصد التحريري',
  '14) مراجعة الرصد للفرقة',
]

export const ControlWorksView: React.FC<ControlWorksViewProps> = ({
  subjects,
  controlWorks,
  onToggleItem,
}) => {
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('ALL')

  // Map checklist state
  const checklistMap = useMemo(() => {
    const map = new Map<string, Record<number, boolean>>()
    controlWorks.forEach((cw) => {
      map.set(cw.subjectId, cw.checklist)
    })
    return map
  }, [controlWorks])

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase())
      const matchDept = deptFilter === 'ALL' || s.dept === deptFilter
      return matchSearch && matchDept
    })
  }, [subjects, search, deptFilter])

  // Institute overall completion rate
  const overallRate = useMemo(() => {
    let totalItems = subjects.length * 14
    if (totalItems === 0) return 0
    let completed = 0
    subjects.forEach((s) => {
      const chk = checklistMap.get(s.id) || {}
      for (let i = 1; i <= 14; i++) {
        if (chk[i]) completed++
      }
    })
    return ((completed / totalItems) * 100).toFixed(1)
  }, [subjects, checklistMap])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5">
      {/* Top Banner & Overall Completion */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[#dededb] bg-white p-2.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-[#e2ecf5] text-[#1f4d78]">
            <CheckSquare className="size-4.5" />
          </div>
          <div>
            <h2 className="text-xs font-black text-[#171717]">
              لوحة متابعة مراحل أعمال الكنترول (14 بند رسمي)
            </h2>
            <p className="text-[11px] font-semibold text-[#777]">
              متابعة استلام أوراق الأسئلة، نماذج الإجابة، التصحيح، ورصد الدرجات لجميع المواد
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-left">
            <span className="text-[9px] font-bold text-[#777] uppercase">نسبة الإنجاز الكلي</span>
            <p className="text-base font-black text-[#155724] tabular-nums">{overallRate}%</p>
          </div>
          <div className="h-7 w-32 rounded-full bg-[#f0f0ee] p-1">
            <div
              className="h-full rounded-full bg-[#155724] transition-all"
              style={{ width: `${overallRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#dededb] bg-white p-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute right-2 top-2 size-3.5 text-[#888]" />
            <input
              type="text"
              placeholder="بحث في المقررات..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 w-52 rounded-lg border border-[#cfcfcb] pr-7 pl-2 text-xs font-semibold outline-none focus:border-[#1f4d78]"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="h-7 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none"
          >
            <option value="ALL">جميع الأقسام</option>
            <option value="قسم العلوم الأساسية">قسم العلوم الأساسية</option>
            <option value="قسم الهندسة المعمارية">قسم الهندسة المعمارية</option>
            <option value="قسم الهندسة المدنية">قسم الهندسة المدنية</option>
            <option value="قسم الهندسة الكهربية">قسم الهندسة الكهربية</option>
          </select>
        </div>
      </div>

      {/* 14 Stages Table */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dededb] bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-center text-xs">
            <thead className="sticky top-0 z-10 bg-[#eef3f8]">
              <tr className="text-[10px] font-black text-[#171717]">
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-10">م</th>
                <th className="border-b border-l border-[#cfcfcb] px-3 py-1.5 text-right min-w-36">
                  المقرر الدراسي
                </th>
                <th className="border-b border-l border-[#cfcfcb] px-1 py-1.5 w-14">الفرقة</th>
                {CONTROL_STAGES.map((stg, i) => (
                  <th
                    key={i}
                    title={stg}
                    className="border-b border-l border-[#cfcfcb] px-1 py-1.5 text-[9px] min-w-16 whitespace-normal"
                  >
                    {stg}
                  </th>
                ))}
                <th className="border-b border-[#cfcfcb] px-2 py-1.5 w-14">الإنجاز</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecece9]">
              {filteredSubjects.map((s, idx) => {
                const chk = checklistMap.get(s.id) || {}
                let count = 0
                for (let i = 1; i <= 14; i++) {
                  if (chk[i]) count++
                }
                const pct = Math.round((count / 14) * 100)
                return (
                  <tr key={s.id} className="hover:bg-[#fbfbfa] transition">
                    <td className="border-b border-l border-[#ecece9] px-1 py-1 font-bold text-[#888]">
                      {idx + 1}
                    </td>
                    <td className="border-b border-l border-[#ecece9] px-3 py-1 text-right font-bold text-[#171717]">
                      {s.name} ({s.code})
                    </td>
                    <td className="border-b border-l border-[#ecece9] px-1 py-1 font-semibold text-[#666]">
                      {s.year}
                    </td>
                    {CONTROL_STAGES.map((_, i) => {
                      const itemIdx = i + 1
                      const done = !!chk[itemIdx]
                      return (
                        <td
                          key={i}
                          onClick={() => onToggleItem(s.id, itemIdx)}
                          className={`border-b border-l border-[#ecece9] px-1 py-1 cursor-pointer transition ${
                            done ? 'bg-[#f0fdf4] text-[#155724]' : 'hover:bg-[#f5f5f3]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={done}
                            onChange={() => {}}
                            className="size-3.5 rounded accent-[#155724] cursor-pointer"
                          />
                        </td>
                      )
                    })}
                    <td className="border-b border-[#ecece9] px-1 py-1 font-bold text-[11px] tabular-nums">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] ${
                          pct === 100
                            ? 'bg-[#dcfce7] text-[#155724]'
                            : pct > 0
                            ? 'bg-[#fef9c3] text-[#854d0e]'
                            : 'text-[#888]'
                        }`}
                      >
                        {pct}%
                      </span>
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
