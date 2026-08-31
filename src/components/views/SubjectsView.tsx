import React, { useState, useMemo } from 'react'
import type { Subject } from '../../types/control'
import { Search, BookOpen, Plus, Trash2, Edit3 } from 'lucide-react'
import { EditSubjectModal } from '../modals/EditSubjectModal'

interface SubjectsViewProps {
  subjects: Subject[]
  onAddSubject: (s: Omit<Subject, 'id'>) => void
  onUpdateSubject: (id: string, updates: Partial<Subject>) => void
  onDeleteSubject: (id: string) => void
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
}) => {
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('ALL')
  const [selectedYear, setSelectedYear] = useState('ALL')

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSubjectToEdit, setSelectedSubjectToEdit] = useState<Subject | null>(null)

  const departments = useMemo(() => {
    const set = new Set(subjects.map((s) => s.dept).filter(Boolean))
    return Array.from(set)
  }, [subjects])

  const years = useMemo(() => {
    const set = new Set(subjects.map((s) => s.year).filter(Boolean))
    return Array.from(set)
  }, [subjects])

  const filtered = useMemo(() => {
    return subjects.filter((s) => {
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase())
      const matchDept = selectedDept === 'ALL' || s.dept === selectedDept
      const matchYear = selectedYear === 'ALL' || s.year === selectedYear
      return matchSearch && matchDept && matchYear
    })
  }, [subjects, search, selectedDept, selectedYear])

  const handleOpenAddModal = () => {
    setSelectedSubjectToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (s: Subject) => {
    setSelectedSubjectToEdit(s)
    setIsModalOpen(true)
  }

  const handleSaveModal = (subjData: Omit<Subject, 'id'>, id?: string) => {
    if (id) {
      onUpdateSubject(id, subjData)
    } else {
      onAddSubject(subjData)
    }
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف المقرر: "${name}" من قاعدة البيانات؟`)) {
      onDeleteSubject(id)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[#dededb] bg-white p-2.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4.5 text-[#1f4d78]" />
            <h2 className="text-xs font-black text-[#171717]">
              دليل المقررات الدراسية ({filtered.length} مقرر)
            </h2>
          </div>

          <div className="relative">
            <Search className="absolute right-2.5 top-2 size-3.5 text-[#888]" />
            <input
              type="text"
              placeholder="بحث بالكود أو اسم المادة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7.5 w-52 rounded-lg border border-[#cfcfcb] pr-7.5 pl-2 text-xs font-semibold outline-none focus:border-[#1f4d78]"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-7.5 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none"
          >
            <option value="ALL">جميع الأقسام</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Academic Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-7.5 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none"
          >
            <option value="ALL">جميع الفرق</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 rounded-lg bg-[#1f4d78] px-3.5 py-1.5 text-xs font-black text-white shadow-xs hover:bg-[#163756] transition"
        >
          <Plus className="size-3.5" />
          <span>إضافة مقرر جديد</span>
        </button>
      </div>

      {/* Main Subjects Table */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dededb] bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-center text-xs">
            <thead className="sticky top-0 z-10 bg-[#eef3f8]">
              <tr className="text-[10px] font-black text-[#171717]">
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-10">م</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-24">كود المقرر</th>
                <th className="border-b border-l border-[#cfcfcb] px-3 py-1.5 text-right min-w-44">
                  اسم المقرر الدراسي
                </th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 min-w-36">القسم التابع له</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-20">الفرقة</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-20">الفصل</th>
                <th className="border-b border-[#cfcfcb] px-2 py-1.5 w-16">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecece9]">
              {filtered.map((s, idx) => (
                <tr key={s.id} className="hover:bg-[#fbfbfa] transition group">
                  <td className="border-b border-l border-[#ecece9] px-1 py-1 font-bold text-[#888]">
                    {idx + 1}
                  </td>

                  {/* Code */}
                  <td className="border-b border-l border-[#ecece9] px-1.5 py-1 font-black text-[#1f4d78] tabular-nums">
                    {s.code}
                  </td>

                  {/* Name */}
                  <td className="border-b border-l border-[#ecece9] px-3 py-1 text-right font-bold text-[#171717]">
                    <div
                      onClick={() => handleOpenEditModal(s)}
                      className="cursor-pointer hover:text-[#1f4d78] hover:underline flex items-center justify-between gap-1"
                      title="انقر لتعديل بيانات المقرر"
                    >
                      <span>{s.name}</span>
                      <Edit3 className="size-3 text-[#aaa] opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </td>

                  {/* Department */}
                  <td className="border-b border-l border-[#ecece9] px-2 py-1 font-semibold text-[#555] text-[11px]">
                    {s.dept}
                  </td>

                  {/* Year */}
                  <td className="border-b border-l border-[#ecece9] px-1 py-1 font-bold text-[#171717]">
                    <span className="rounded bg-[#f0f0ee] px-2 py-0.5 text-[9.5px]">
                      {s.year}
                    </span>
                  </td>

                  {/* Semester */}
                  <td className="border-b border-l border-[#ecece9] px-1 py-1 font-semibold text-[#666] text-[10px]">
                    {s.semester === 'اول' ? 'الأول' : 'الثاني'}
                  </td>

                  {/* Actions */}
                  <td className="border-b border-[#ecece9] px-1 py-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(s)}
                        className="rounded p-1 text-[#1f4d78] hover:bg-[#eef3f8] transition"
                        title="تعديل المقرر"
                      >
                        <Edit3 className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id, s.name)}
                        className="rounded p-1 text-[#c5221f] hover:bg-[#fee2e2] transition"
                        title="حذف المقرر"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Subject Modal */}
      <EditSubjectModal
        isOpen={isModalOpen}
        subject={selectedSubjectToEdit}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
      />
    </div>
  )
}
