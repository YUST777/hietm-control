import React, { useState, useMemo } from 'react'
import type { Subject } from '../../types/control'
import { Search, BookOpen, Plus, Trash2 } from 'lucide-react'

interface SubjectsViewProps {
  subjects: Subject[]
  onAddSubject: (s: Omit<Subject, 'id'>) => void
  onDeleteSubject: (id: string) => void
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  onAddSubject,
  onDeleteSubject,
}) => {
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('ALL')
  const [selectedYear, setSelectedYear] = useState('ALL')

  // New subject state
  const [showAddModal, setShowAddModal] = useState(false)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [dept, setDept] = useState('قسم العلوم الأساسية')
  const [year, setYear] = useState('إعدادي')
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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !code) return alert('يرجى ملء كود واسم المقرر')
    onAddSubject({ code, name, dept, year, semester, spec: dept })
    setCode('')
    setName('')
    setShowAddModal(false)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dededb] bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-[#1f4d78]" />
            <h2 className="text-sm font-black text-[#171717]">
              دليل المقررات الدراسية ({filtered.length} مقرر)
            </h2>
          </div>

          <div className="relative">
            <Search className="absolute right-2.5 top-2.5 size-3.5 text-[#888]" />
            <input
              type="text"
              placeholder="بحث بالكود أو اسم المادة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-56 rounded-lg border border-[#cfcfcb] pr-8 pl-2.5 text-xs font-semibold outline-none focus:border-[#1f4d78]"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-8 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none"
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
            className="h-8 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none"
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
          className="flex items-center gap-1 rounded-lg bg-[#1f4d78] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#163756] transition"
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
                  <option value="قسم العلوم الأساسية">قسم العلوم الأساسية</option>
                  <option value="قسم الهندسة المعمارية">قسم الهندسة المعمارية</option>
                  <option value="قسم الهندسة المدنية">قسم الهندسة المدنية</option>
                  <option value="قسم الهندسة الكهربية">قسم الهندسة الكهربية</option>
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
                    <option value="إعدادي">إعدادي</option>
                    <option value="أولى">أولى</option>
                    <option value="ثانية">ثانية</option>
                    <option value="ثالثة">ثالثة</option>
                    <option value="رابعة">رابعة</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#666]">الفصل:</label>
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

      {/* Main Subjects Table */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dededb] bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-center text-xs">
            <thead className="sticky top-0 z-10 bg-[#eef3f8]">
              <tr className="text-[11px] font-black text-[#171717]">
                <th className="border-b border-l border-[#cfcfcb] px-2 py-2 w-10">م</th>
                <th className="border-b border-l border-[#cfcfcb] px-3 py-2 w-28">كود المقرر</th>
                <th className="border-b border-l border-[#cfcfcb] px-4 py-2 text-right">
                  اسم المقرر الدراسي
                </th>
                <th className="border-b border-l border-[#cfcfcb] px-3 py-2 min-w-36">القسم</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-2 w-20">الفرقة</th>
                <th className="border-b border-l border-[#cfcfcb] px-2 py-2 w-20">الفصل</th>
                <th className="border-b border-[#cfcfcb] px-2 py-2 w-12">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecece9]">
              {filtered.map((s, idx) => (
                <tr key={s.id} className="hover:bg-[#fbfbfa] transition">
                  <td className="border-b border-l border-[#ecece9] px-1 py-2 font-bold text-[#888]">
                    {idx + 1}
                  </td>
                  <td className="border-b border-l border-[#ecece9] px-2 py-2 font-black text-[#1f4d78] tabular-nums">
                    {s.code}
                  </td>
                  <td className="border-b border-l border-[#ecece9] px-4 py-2 text-right font-bold text-[#171717]">
                    {s.name}
                  </td>
                  <td className="border-b border-l border-[#ecece9] px-3 py-2 font-semibold text-[#555]">
                    {s.dept}
                  </td>
                  <td className="border-b border-l border-[#ecece9] px-2 py-2 font-bold text-[#171717]">
                    <span className="rounded bg-[#f0f0ee] px-2 py-0.5 text-[10px]">
                      {s.year}
                    </span>
                  </td>
                  <td className="border-b border-l border-[#ecece9] px-2 py-2 font-semibold text-[#666]">
                    {s.semester === 'اول' ? 'الأول' : 'الثاني'}
                  </td>
                  <td className="border-b border-[#ecece9] px-2 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => onDeleteSubject(s.id)}
                      className="text-[#c5221f] hover:text-[#900] transition"
                    >
                      <Trash2 className="size-4" />
                    </button>
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
