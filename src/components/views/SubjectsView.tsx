import React, { useState, useMemo } from 'react'
import type { Subject } from '../../types/control'
import { Search, BookOpen, Plus, Trash2, Edit3, Check, X } from 'lucide-react'

interface SubjectsViewProps {
  subjects: Subject[]
  onAddSubject: (s: Omit<Subject, 'id'>) => void
  onUpdateSubject: (id: string, updates: Partial<Subject>) => void
  onDeleteSubject: (id: string) => void
}

const DEPARTMENTS = [
  'قسم العلوم الأساسية',
  'قسم الهندسة المعمارية',
  'قسم الهندسة المدنية',
  'قسم الهندسة الكهربية',
]

const ACADEMIC_YEARS = ['إعدادي', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة']

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
}) => {
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('ALL')
  const [selectedYear, setSelectedYear] = useState('ALL')

  // Edit in place
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCode, setEditCode] = useState('')
  const [editName, setEditName] = useState('')
  const [editDept, setEditDept] = useState('')
  const [editYear, setEditYear] = useState('')
  const [editSemester, setEditSemester] = useState('اول')

  // Add subject state
  const [showAddModal, setShowAddModal] = useState(false)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [dept, setDept] = useState(DEPARTMENTS[0])
  const [year, setYear] = useState(ACADEMIC_YEARS[0])
  const [semester, setSemester] = useState('اول')

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

  const startEdit = (s: Subject) => {
    setEditingId(s.id)
    setEditCode(s.code)
    setEditName(s.name)
    setEditDept(s.dept)
    setEditYear(s.year)
    setEditSemester(s.semester)
  }

  const saveEdit = (id: string) => {
    if (!editName.trim() || !editCode.trim()) return alert('كود واسم المقرر لا يمكن أن يكونا فارغين')
    onUpdateSubject(id, {
      code: editCode.trim(),
      name: editName.trim(),
      dept: editDept.trim(),
      year: editYear.trim(),
      semester: editSemester.trim(),
    })
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !code) return alert('يرجى ملء كود واسم المقرر')
    onAddSubject({ code, name, dept, year, semester, spec: dept })
    setCode('')
    setName('')
    setShowAddModal(false)
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`هل تريد بالتأكيد حذف المقرر: "${name}"؟`)) {
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
            <Search className="absolute right-2 top-2 size-3.5 text-[#888]" />
            <input
              type="text"
              placeholder="بحث بالكود أو اسم المادة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 w-52 rounded-lg border border-[#cfcfcb] pr-7 pl-2 text-xs font-semibold outline-none focus:border-[#1f4d78]"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-7 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none"
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
            className="h-7 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none"
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
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 rounded-lg bg-[#1f4d78] px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-[#163756] transition"
        >
          <Plus className="size-3.5" />
          <span>إضافة مقرر جديد</span>
        </button>
      </div>

      {/* Modal Add Subject */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#dededb] bg-white p-5 shadow-xl">
            <h3 className="text-sm font-black text-[#171717] mb-3">إضافة مقرر دراسي جديد</h3>
            <form onSubmit={handleAdd} className="flex flex-col gap-2.5 text-xs font-bold">
              <div>
                <label className="text-[#666]">كود المقرر:</label>
                <input
                  type="text"
                  placeholder="مثال: BS 011"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1 h-8 w-full rounded-lg border border-[#cfcfcb] px-2.5 outline-none focus:border-[#1f4d78]"
                />
              </div>
              <div>
                <label className="text-[#666]">اسم المقرر:</label>
                <input
                  type="text"
                  placeholder="مثال: رياضيات هندسية (1)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 h-8 w-full rounded-lg border border-[#cfcfcb] px-2.5 outline-none focus:border-[#1f4d78]"
                />
              </div>
              <div>
                <label className="text-[#666]">القسم التابع له:</label>
                <select
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="mt-1 h-8 w-full rounded-lg border border-[#cfcfcb] px-2 outline-none"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#666]">الفرقة:</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="mt-1 h-8 w-full rounded-lg border border-[#cfcfcb] px-2 outline-none"
                  >
                    {ACADEMIC_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#666]">الفصل الدراسي:</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="mt-1 h-8 w-full rounded-lg border border-[#cfcfcb] px-2 outline-none"
                  >
                    <option value="اول">الفصل الأول</option>
                    <option value="ثاني">الفصل الثاني</option>
                  </select>
                </div>
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
                  حفظ المقرر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Subjects Table with Inline Editing */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dededb] bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-center text-xs">
            <thead className="sticky top-0 z-10 bg-[#eef3f8]">
              <tr className="text-[10px] font-black text-[#171717]">
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-10">م</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-24">كود المقرر</th>
                <th className="border-b border-l border-[#cfcfcb] px-3 py-1.5 text-right min-w-44">
                  اسم المقرر الدراسي (انقر للتعديل)
                </th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 min-w-36">القسم</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-20">الفرقة</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-1.5 w-20">الفصل</th>
                <th className="border-b border-[#cfcfcb] px-2 py-1.5 w-16">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecece9]">
              {filtered.map((s, idx) => {
                const isEditing = editingId === s.id

                return (
                  <tr key={s.id} className="hover:bg-[#fbfbfa] transition group">
                    <td className="border-b border-l border-[#ecece9] px-1 py-1 font-bold text-[#888]">
                      {idx + 1}
                    </td>

                    {/* Code */}
                    <td className="border-b border-l border-[#ecece9] px-1.5 py-1 font-black text-[#1f4d78] tabular-nums">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editCode}
                          onChange={(e) => setEditCode(e.target.value)}
                          className="h-6 w-full rounded border border-[#1f4d78] px-1 text-center text-xs font-black text-[#1f4d78] outline-none"
                        />
                      ) : (
                        <span onClick={() => startEdit(s)} className="cursor-pointer">
                          {s.code}
                        </span>
                      )}
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
                          onClick={() => startEdit(s)}
                          className="cursor-pointer hover:text-[#1f4d78] hover:underline flex items-center justify-between gap-1"
                        >
                          <span>{s.name}</span>
                          <Edit3 className="size-3 text-[#aaa] opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      )}
                    </td>

                    {/* Department */}
                    <td className="border-b border-l border-[#ecece9] px-2 py-1 font-semibold text-[#555]">
                      {isEditing ? (
                        <select
                          value={editDept}
                          onChange={(e) => setEditDept(e.target.value)}
                          className="h-6 w-full rounded border border-[#cfcfcb] px-1 text-[10px] outline-none"
                        >
                          {DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span onClick={() => startEdit(s)} className="cursor-pointer text-[10px]">
                          {s.dept}
                        </span>
                      )}
                    </td>

                    {/* Year */}
                    <td className="border-b border-l border-[#ecece9] px-1 py-1 font-bold text-[#171717]">
                      {isEditing ? (
                        <select
                          value={editYear}
                          onChange={(e) => setEditYear(e.target.value)}
                          className="h-6 w-full rounded border border-[#cfcfcb] px-1 text-[10px] outline-none"
                        >
                          {ACADEMIC_YEARS.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          onClick={() => startEdit(s)}
                          className="rounded bg-[#f0f0ee] px-1.5 py-0.5 text-[9px] cursor-pointer"
                        >
                          {s.year}
                        </span>
                      )}
                    </td>

                    {/* Semester */}
                    <td className="border-b border-l border-[#ecece9] px-1 py-1 font-semibold text-[#666]">
                      {isEditing ? (
                        <select
                          value={editSemester}
                          onChange={(e) => setEditSemester(e.target.value)}
                          className="h-6 w-full rounded border border-[#cfcfcb] px-1 text-[10px] outline-none"
                        >
                          <option value="اول">الأول</option>
                          <option value="ثاني">الثاني</option>
                        </select>
                      ) : (
                        <span onClick={() => startEdit(s)} className="cursor-pointer text-[10px]">
                          {s.semester === 'اول' ? 'الأول' : 'الثاني'}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="border-b border-[#ecece9] px-1 py-1 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => saveEdit(s.id)}
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
                            onClick={() => startEdit(s)}
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
