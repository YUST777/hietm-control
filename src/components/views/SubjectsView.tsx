import React, { useState, useMemo } from 'react'
import type { Subject } from '../../types/control'
import { Search, BookOpen, Plus, Trash2, Edit3, Download, FileUp } from 'lucide-react'
import { EditSubjectModal } from '../modals/EditSubjectModal'
import { exportSubjectsCSV, parseSubjectsCSV } from '../../lib/excelUtils'

interface SubjectsViewProps {
  subjects: Subject[]
  onAddSubject: (s: Omit<Subject, 'id'>) => void
  onUpdateSubject: (id: string, updates: Partial<Subject>) => void
  onDeleteSubject: (id: string) => void
  onImportSubjects?: (list: Omit<Subject, 'id'>[]) => void
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onImportSubjects,
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

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImportSubjects) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        if (text) {
          const parsed = parseSubjectsCSV(text)
          if (parsed.length > 0) {
            onImportSubjects(parsed)
            alert(`تم استيراد ${parsed.length} مقرر دراسي بنجاح ✓`)
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
            className="h-7.5 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none cursor-pointer pr-2 pl-6"
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
            className="h-7.5 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none cursor-pointer pr-2 pl-6"
          >
            <option value="ALL">جميع الفرق</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Export Excel/CSV */}
          <button
            type="button"
            onClick={() => exportSubjectsCSV(filtered)}
            className="flex items-center gap-1 rounded-lg border border-[#cfcfcb] bg-[#fafaf8] px-2.5 py-1.5 text-xs font-bold text-[#333] hover:bg-[#eaeae7] transition cursor-pointer"
            title="تصدير المقررات الحالية إلى ملف Excel / CSV"
          >
            <Download className="size-3.5 text-[#1f4d78]" />
            <span>تصدير Excel</span>
          </button>

          {/* Import Excel/CSV */}
          {onImportSubjects && (
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

          {/* Add Subject Button */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 rounded-lg bg-[#1f4d78] px-3 py-1.5 text-xs font-black text-white shadow-xs hover:bg-[#163756] transition cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>إضافة مقرر</span>
          </button>
        </div>
      </div>

      {/* Main Subjects Table */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dededb] bg-white shadow-xs">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-center text-xs">
            <thead className="sticky top-0 z-10 bg-[#eef3f8]">
              <tr className="text-[10.5px] font-black text-[#171717]">
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-10">م</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-24">كود المقرر</th>
                <th className="border-b border-l border-[#cfcfcb] px-3 py-1.5 text-right">اسم المقرر</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-44">القسم العلمي</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-28">الفرقة</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-24">الفصل</th>
                <th className="border-b border-[#cfcfcb] px-2 py-1.5 w-24">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecece9]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs font-bold text-[#888]">
                    لا توجد مقررات مطابقة لمعايير البحث
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-[#fbfbfa] transition">
                    <td className="border-b border-l border-[#ecece9] px-2 py-1.5 font-bold text-[#888]">
                      {idx + 1}
                    </td>
                    <td className="border-b border-l border-[#ecece9] px-2 py-1.5 font-mono font-bold text-[#1f4d78]">
                      {s.code}
                    </td>
                    <td className="border-b border-l border-[#ecece9] px-3 py-1.5 text-right font-black text-[#171717]">
                      {s.name}
                    </td>
                    <td className="border-b border-l border-[#ecece9] px-2 py-1.5 font-bold text-[#555]">
                      {s.dept}
                    </td>
                    <td className="border-b border-l border-[#ecece9] px-2 py-1.5 font-semibold text-[#555]">
                      {s.year}
                    </td>
                    <td className="border-b border-l border-[#ecece9] px-2 py-1.5 font-semibold text-[#555]">
                      {s.semester}
                    </td>
                    <td className="border-b border-[#ecece9] px-2 py-1.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(s)}
                          className="flex items-center gap-1 rounded bg-[#eef3f8] px-2 py-1 text-[11px] font-bold text-[#1f4d78] hover:bg-[#dbeafe] transition cursor-pointer"
                          title="تعديل بيانات المقرر"
                        >
                          <Edit3 className="size-3" />
                          <span>تعديل</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(s.id, s.name)}
                          className="rounded p-1 text-[#c5221f] hover:bg-[#fee2e2] transition cursor-pointer"
                          title="حذف هذا المقرر"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
