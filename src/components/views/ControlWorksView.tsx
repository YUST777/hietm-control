import React, { useState, useMemo } from 'react'
import type { Subject, ControlWorkSubject } from '../../types/control'
import { CheckSquare, Search, Plus, Edit3, CheckCheck } from 'lucide-react'
import { EditSubjectModal } from '../modals/EditSubjectModal'

interface ControlWorksViewProps {
  subjects: Subject[]
  controlWorks: ControlWorkSubject[]
  controlStages?: string[]
  onToggleItem: (subjectId: string, itemIndex: number) => void
  onToggleAllItems?: (subjectId: string, setAll: boolean) => void
  onUpdateSubject: (id: string, updates: Partial<Subject>) => void
  onAddSubject: (s: Omit<Subject, 'id'>) => void
}

const DEFAULT_STAGES = [
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
  controlStages = DEFAULT_STAGES,
  onToggleItem,
  onUpdateSubject,
  onAddSubject,
}) => {
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('ALL')

  // Subject Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSubjectToEdit, setSelectedSubjectToEdit] = useState<Subject | null>(null)

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

  const departments = useMemo(() => {
    const set = new Set(subjects.map((s) => s.dept).filter(Boolean))
    return Array.from(set)
  }, [subjects])

  // Stats calculation
  const stats = useMemo(() => {
    let totalItems = subjects.length * controlStages.length
    let completedItems = 0
    let completedSubjects = 0

    subjects.forEach((s) => {
      const ch = checklistMap.get(s.id) || {}
      let subjCompleted = 0
      for (let i = 1; i <= controlStages.length; i++) {
        if (ch[i]) {
          completedItems++
          subjCompleted++
        }
      }
      if (subjCompleted === controlStages.length && controlStages.length > 0) completedSubjects++
    })

    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
    return { totalItems, completedItems, completedSubjects, percentage }
  }, [subjects, checklistMap, controlStages])

  // Batch toggle all stages for a single subject
  const handleToggleRowAll = (subjectId: string) => {
    const ch = checklistMap.get(subjectId) || {}
    let allChecked = true
    for (let i = 1; i <= controlStages.length; i++) {
      if (!ch[i]) {
        allChecked = false
        break
      }
    }
    for (let i = 1; i <= controlStages.length; i++) {
      if (ch[i] === allChecked) {
        onToggleItem(subjectId, i)
      }
    }
  }

  const handleOpenEdit = (s: Subject) => {
    setSelectedSubjectToEdit(s)
    setIsModalOpen(true)
  }

  const handleOpenAdd = () => {
    setSelectedSubjectToEdit(null)
    setIsModalOpen(true)
  }

  const handleSaveModal = (subjData: Omit<Subject, 'id'>, id?: string) => {
    if (id) {
      onUpdateSubject(id, subjData)
    } else {
      onAddSubject(subjData)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[#dededb] bg-white p-2.5 shadow-sm print-hide">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <CheckSquare className="size-4.5 text-[#1f4d78]" />
            <h2 className="text-xs font-black text-[#171717]">
              متابعة مراحل أعمال الكنترول ({controlStages.length} بنداً)
            </h2>
          </div>

          <div className="relative">
            <Search className="absolute right-2.5 top-2 size-3.5 text-[#888]" />
            <input
              type="text"
              placeholder="بحث بالكود أو اسم المادة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7.5 w-48 rounded-lg border border-[#cfcfcb] pr-7.5 pl-2 text-xs font-semibold outline-none focus:border-[#1f4d78]"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="h-7.5 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none cursor-pointer pr-2 pl-6"
          >
            <option value="ALL">جميع الأقسام</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons & Progress Badge */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-lg bg-[#eef3f8] px-3 py-1 text-xs font-bold text-[#1f4d78] border border-[#cfcfcb]">
            <span>نسبة إنجاز الكنترول:</span>
            <span className="font-mono font-black text-[#155724]">{stats.percentage}%</span>
            <span className="text-[10px] text-[#666]">
              ({stats.completedItems}/{stats.totalItems} بند)
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-lg bg-[#1f4d78] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#163756] transition cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>إضافة مقرر</span>
          </button>
        </div>
      </div>

      {/* Main Checklist Matrix Table */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dededb] bg-white shadow-xs">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-center text-xs">
            <thead className="sticky top-0 z-10 bg-[#eef3f8]">
              <tr className="text-[10px] font-black text-[#171717]">
                <th className="border-b border-l border-[#cfcfcb] px-1 py-1.5 w-8">م</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-20">الكود</th>
                <th className="border-b border-l border-[#cfcfcb] px-2.5 py-1.5 text-right min-w-44">
                  المقرر الدراسي
                </th>
                <th className="border-b border-l border-[#cfcfcb] px-1 py-1.5 w-10 print-hide" title="تحديد / إلغاء تحديد الكل">
                  الكل
                </th>

                {/* Dynamic 14 Stages Headers */}
                {controlStages.map((title, idx) => (
                  <th
                    key={idx}
                    className="border-b border-l border-[#cfcfcb] px-1 py-1.5 w-9 cursor-help transition hover:bg-[#dbeafe]"
                    title={title}
                  >
                    <span className="inline-block size-5 rounded-full bg-white border border-[#cfcfcb] leading-5 text-[10px] font-black text-[#1f4d78]">
                      {idx + 1}
                    </span>
                  </th>
                ))}

                <th className="border-b border-l border-[#cfcfcb] px-1.5 py-1.5 w-14">الإنجاز</th>
                <th className="border-b border-[#cfcfcb] px-1 py-1.5 w-12 print-hide">تعديل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecece9]">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={6 + controlStages.length} className="py-8 text-center text-xs font-bold text-[#888]">
                    لا توجد مقررات دراسية مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((s, idx) => {
                  const ch = checklistMap.get(s.id) || {}
                  let completedCount = 0
                  for (let i = 1; i <= controlStages.length; i++) {
                    if (ch[i]) completedCount++
                  }
                  const rowPercentage =
                    controlStages.length > 0 ? Math.round((completedCount / controlStages.length) * 100) : 0
                  const isAllChecked = completedCount === controlStages.length && controlStages.length > 0

                  return (
                    <tr key={s.id} className="hover:bg-[#fbfbfa] transition">
                      <td className="border-b border-l border-[#ecece9] px-1 py-1 font-bold text-[#888]">
                        {idx + 1}
                      </td>

                      <td className="border-b border-l border-[#ecece9] px-1.5 py-1 font-mono font-bold text-[#1f4d78]">
                        {s.code}
                      </td>

                      <td className="border-b border-l border-[#ecece9] px-2 py-1 text-right">
                        <div className="font-black text-[#171717]">{s.name}</div>
                        <div className="text-[10px] text-[#666]">{s.dept} - {s.year}</div>
                      </td>

                      {/* Select All Toggle for this row */}
                      <td className="border-b border-l border-[#ecece9] px-1 py-1 print-hide">
                        <button
                          type="button"
                          onClick={() => handleToggleRowAll(s.id)}
                          className={`grid size-6 place-items-center rounded transition cursor-pointer ${
                            isAllChecked
                              ? 'bg-[#155724] text-white hover:bg-[#0e3c18]'
                              : 'border border-[#cfcfcb] bg-[#fafaf8] text-[#555] hover:bg-[#eef3f8]'
                          }`}
                          title={isAllChecked ? 'إلغاء تحديد جميع المراحل' : 'تحديد جميع المراحل كاملة'}
                        >
                          <CheckCheck className="size-3.5" />
                        </button>
                      </td>

                      {/* 14 Interactive Stage Checkboxes */}
                      {controlStages.map((stageTitle, stageIdx) => {
                        const stageNumber = stageIdx + 1
                        const isChecked = !!ch[stageNumber]

                        return (
                          <td
                            key={stageIdx}
                            className="border-b border-l border-[#ecece9] px-1 py-1"
                          >
                            <button
                              type="button"
                              onClick={() => onToggleItem(s.id, stageNumber)}
                              className={`grid size-6.5 mx-auto place-items-center rounded-lg transition cursor-pointer ${
                                isChecked
                                  ? 'bg-[#155724] text-white shadow-2xs hover:bg-[#0e3c18]'
                                  : 'border border-[#cfcfcb] bg-white text-transparent hover:border-[#155724]'
                              }`}
                              title={`${stageTitle}: ${isChecked ? 'مكتمل ✓ (انقر للإلغاء)' : 'غير مكتمل (انقر للتعليم)'}`}
                            >
                              <span className="text-xs font-black">✓</span>
                            </button>
                          </td>
                        )
                      })}

                      {/* Percentage Badge */}
                      <td className="border-b border-l border-[#ecece9] px-1 py-1">
                        <span
                          className={`inline-block rounded-md px-1.5 py-0.5 font-mono text-[10.5px] font-black ${
                            rowPercentage === 100
                              ? 'bg-[#dcfce7] text-[#166534]'
                              : rowPercentage > 0
                              ? 'bg-[#fef3c7] text-[#92400e]'
                              : 'bg-[#fee2e2] text-[#991b1b]'
                          }`}
                        >
                          {rowPercentage}%
                        </span>
                      </td>

                      {/* Row Edit Modal Trigger */}
                      <td className="border-b border-[#ecece9] px-1 py-1 print-hide">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(s)}
                          className="rounded p-1 text-[#1f4d78] hover:bg-[#eef3f8] transition cursor-pointer"
                          title="تعديل بيانات هذا المقرر"
                        >
                          <Edit3 className="size-3.5" />
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

      {/* Edit/Add Subject Modal */}
      <EditSubjectModal
        isOpen={isModalOpen}
        subject={selectedSubjectToEdit}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
      />
    </div>
  )
}
