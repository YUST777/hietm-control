import React, { useState, useEffect } from 'react'
import type { Subject } from '../../types/control'
import { BookOpen, X, Check, Building, GraduationCap } from 'lucide-react'

interface EditSubjectModalProps {
  isOpen: boolean
  subject: Subject | null // null = create new
  departments?: string[]
  studyLevels?: string[]
  onClose: () => void
  onSave: (subjData: Omit<Subject, 'id'>, id?: string) => void
}

const DEFAULT_DEPTS = [
  'قسم العلوم الأساسية',
  'قسم الهندسة المعمارية',
  'قسم الهندسة المدنية',
  'قسم الهندسة الكهربية',
]

const DEFAULT_LEVELS = ['إعدادي', 'الفرقة الأولى', 'الفرقة الثانية', 'الفرقة الثالثة', 'الفرقة الرابعة']

export const EditSubjectModal: React.FC<EditSubjectModalProps> = ({
  isOpen,
  subject,
  departments = DEFAULT_DEPTS,
  studyLevels = DEFAULT_LEVELS,
  onClose,
  onSave,
}) => {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [dept, setDept] = useState(departments[0] || DEFAULT_DEPTS[0])
  const [year, setYear] = useState(studyLevels[0] || DEFAULT_LEVELS[0])
  const [semester, setSemester] = useState('اول')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (subject) {
        setCode(subject.code)
        setName(subject.name)
        setDept(subject.dept || departments[0] || DEFAULT_DEPTS[0])
        setYear(subject.year || studyLevels[0] || DEFAULT_LEVELS[0])
        setSemester(subject.semester || 'اول')
      } else {
        setCode('')
        setName('')
        setDept(departments[0] || DEFAULT_DEPTS[0])
        setYear(studyLevels[0] || DEFAULT_LEVELS[0])
        setSemester('اول')
      }
      setError('')
    }
  }, [isOpen, subject, departments, studyLevels])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || !name.trim()) {
      setError('يرجى ملء كل من كود المقرر واسم المقرر الدراسي')
      return
    }

    onSave(
      {
        code: code.trim(),
        name: name.trim(),
        dept: dept.trim(),
        year: year.trim(),
        semester: semester.trim(),
        spec: dept.trim(),
      },
      subject?.id
    )
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 print-hide"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#dededb] bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ecece9] pb-3">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-[#e2ecf5] text-[#1f4d78]">
              <BookOpen className="size-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#171717]">
                {subject ? 'تعديل بيانات المقرر الدراسي' : 'إضافة مقرر دراسي جديد'}
              </h3>
              <p className="text-[11px] font-semibold text-[#777]">
                {subject ? `تعديل مقرر: ${subject.name}` : 'إضافة مادة جديدة إلى لائحة المقررات'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#888] hover:bg-[#f0f0ee] transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3.5 text-xs font-bold">
          {error && (
            <div className="rounded-lg bg-[#fce8e6] p-2 text-center text-xs font-bold text-[#c5221f]">
              {error}
            </div>
          )}

          {/* Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[#555] block mb-1">كود المقرر:</label>
              <input
                type="text"
                placeholder="مثال: BAS01"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                  if (error) setError('')
                }}
                className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2 text-center text-xs font-black text-[#1f4d78] outline-none focus:border-[#1f4d78]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[#555] block mb-1">اسم المقرر الدراسي:</label>
              <input
                type="text"
                placeholder="مثال: رياضيات هندسية (1)"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (error) setError('')
                }}
                autoFocus
                className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2.5 text-xs font-bold text-[#171717] outline-none focus:border-[#1f4d78]"
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="flex items-center gap-1 text-[#555] mb-1">
              <Building className="size-3 text-[#1f4d78]" />
              <span>القسم التابع له:</span>
            </label>
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#171717] outline-none focus:border-[#1f4d78]"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year / Study Level Pills */}
          <div>
            <label className="flex items-center gap-1 text-[#555] mb-1.5">
              <GraduationCap className="size-3 text-[#1f4d78]" />
              <span>الفرقة / المستوى الدراسي:</span>
            </label>
            <div className="flex flex-wrap gap-1">
              {studyLevels.map((y) => {
                const isSelected = year === y
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setYear(y)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition border cursor-pointer ${
                      isSelected
                        ? 'border-[#1f4d78] bg-[#1f4d78] text-white shadow-xs'
                        : 'border-[#e5e5e3] bg-[#f7f7f5] text-[#666] hover:bg-[#eaeae7]'
                    }`}
                  >
                    {y}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Semester */}
          <div>
            <label className="text-[#555] block mb-1.5">الفصل الدراسي:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSemester('اول')}
                className={`rounded-lg py-1.5 text-xs font-bold transition border cursor-pointer ${
                  semester === 'اول'
                    ? 'border-[#1f4d78] bg-[#eef3f8] text-[#1f4d78] font-black'
                    : 'border-[#e5e5e3] bg-[#f7f7f5] text-[#666] hover:bg-[#eaeae7]'
                }`}
              >
                الفصل الدراسي الأول
              </button>

              <button
                type="button"
                onClick={() => setSemester('ثان')}
                className={`rounded-lg py-1.5 text-xs font-bold transition border cursor-pointer ${
                  semester === 'ثان'
                    ? 'border-[#1f4d78] bg-[#eef3f8] text-[#1f4d78] font-black'
                    : 'border-[#e5e5e3] bg-[#f7f7f5] text-[#666] hover:bg-[#eaeae7]'
                }`}
              >
                الفصل الدراسي الثاني
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-2 flex items-center justify-end gap-2 border-t border-[#ecece9] pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#cfcfcb] px-3.5 py-1.5 text-xs font-bold text-[#666] hover:bg-[#f0f0ee] transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 rounded-lg bg-[#1f4d78] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#183d5f] transition cursor-pointer"
            >
              <Check className="size-3.5" />
              <span>{subject ? 'حفظ التعديلات' : 'إضافة المقرر'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
