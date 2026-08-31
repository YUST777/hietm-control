import React, { useState, useEffect } from 'react'
import type { Observer } from '../../types/control'
import { UserCheck, X, Check, Clock, Calendar, Briefcase, Building } from 'lucide-react'

interface EditObserverModalProps {
  isOpen: boolean
  observer: Observer | null // null = create new
  jobTitles?: string[]
  departments?: string[]
  workDays?: string[]
  roleQuotas?: Record<string, number>
  onClose: () => void
  onSave: (obsData: Omit<Observer, 'id'>, id?: string) => void
}

const DEFAULT_JOBS = [
  'عضو هيئة تدريس',
  'أستاذ دكتور',
  'أستاذ مساعد',
  'مدرس',
  'مدرس مساعد',
  'معيد',
  'جهاز إداري',
  'فني معمل',
  'أمين سر لجنة',
]

const DEFAULT_DEPTS = [
  'قسم العلوم الأساسية',
  'قسم الهندسة المعمارية',
  'قسم الهندسة المدنية',
  'قسم الهندسة الكهربية',
  'إدارة الكنترول وشؤون الطلاب',
]

const DEFAULT_DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']

export const EditObserverModal: React.FC<EditObserverModalProps> = ({
  isOpen,
  observer,
  jobTitles = DEFAULT_JOBS,
  departments = DEFAULT_DEPTS,
  workDays = DEFAULT_DAYS,
  roleQuotas = {},
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('')
  const [job, setJob] = useState(jobTitles[0] || DEFAULT_JOBS[0])
  const [specialization, setSpecialization] = useState(departments[0] || DEFAULT_DEPTS[0])
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [hours, setHours] = useState<number>(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (observer) {
        setName(observer.name)
        setJob(observer.job || jobTitles[0] || DEFAULT_JOBS[0])
        setSpecialization(observer.specialization || departments[0] || DEFAULT_DEPTS[0])
        const daysArray = observer.days
          ? observer.days.split(',').map((d) => d.trim()).filter(Boolean)
          : []
        setSelectedDays(daysArray)
        setHours(observer.hours || 0)
      } else {
        const initialJob = jobTitles[0] || DEFAULT_JOBS[0]
        const defaultHours = roleQuotas[initialJob] || 16
        setName('')
        setJob(initialJob)
        setSpecialization(departments[0] || DEFAULT_DEPTS[0])
        setSelectedDays([...workDays])
        setHours(defaultHours)
      }
      setError('')
    }
  }, [isOpen, observer, jobTitles, departments, workDays, roleQuotas])

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

  const handleJobChange = (newJob: string) => {
    setJob(newJob)
    if (!observer) {
      const quota = roleQuotas[newJob] || 16
      setHours(quota)
    }
  }

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const selectAllDays = () => setSelectedDays([...workDays])
  const clearAllDays = () => setSelectedDays([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('يرجى إدخال اسم المراقب بالكامل')
      return
    }

    onSave(
      {
        name: name.trim(),
        job: job.trim(),
        specialization: specialization.trim(),
        days: selectedDays.join(', '),
        hours: Number(hours) || 0,
      },
      observer?.id
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
        className="w-full max-w-lg rounded-2xl border border-[#dededb] bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ecece9] pb-3">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-[#e2ecf5] text-[#1f4d78]">
              <UserCheck className="size-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#171717]">
                {observer ? 'تعديل بيانات المراقب' : 'إضافة مراقب جديد إلى الكادر'}
              </h3>
              <p className="text-[11px] font-semibold text-[#777]">
                {observer ? `تعديل السجل الخاص بـ: ${observer.name}` : 'إدخال عضو هيئة تدريس أو هيئة معاونة أو جهاز إداري'}
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

          {/* Full Name */}
          <div>
            <label className="text-[#555] block mb-1">الاسم بالكامل:</label>
            <input
              type="text"
              placeholder="مثال: د. جرجس سيدهم أو م. غدير طارق"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError('')
              }}
              autoFocus
              className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2.5 text-xs font-bold text-[#171717] outline-none focus:border-[#1f4d78]"
            />
          </div>

          {/* Job Title & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-[#555] mb-1">
                <Briefcase className="size-3 text-[#1f4d78]" />
                <span>الدرجة الوظيفية:</span>
              </label>
              <select
                value={job}
                onChange={(e) => handleJobChange(e.target.value)}
                className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#171717] outline-none focus:border-[#1f4d78]"
              >
                {jobTitles.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1 text-[#555] mb-1">
                <Building className="size-3 text-[#1f4d78]" />
                <span>القسم / التخصص:</span>
              </label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#171717] outline-none focus:border-[#1f4d78]"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Hours */}
          <div>
            <label className="flex items-center gap-1 text-[#555] mb-1">
              <Clock className="size-3 text-[#1f4d78]" />
              <span>نصاب ساعات المراقبة المستهدفة (Target Hours):</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={hours}
                onChange={(e) => setHours(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="h-8.5 w-24 rounded-lg border border-[#cfcfcb] px-2.5 text-center text-xs font-black text-[#1f4d78] outline-none focus:border-[#1f4d78]"
              />
              <span className="text-xs font-semibold text-[#777]">ساعة مراقبة خلال دور الامتحانات</span>
            </div>
          </div>

          {/* Days Available */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1 text-[#555]">
                <Calendar className="size-3 text-[#1f4d78]" />
                <span>أيام التواجد والمراقبة المتاحة:</span>
              </label>
              <div className="flex items-center gap-2 text-[10.5px]">
                <button
                  type="button"
                  onClick={selectAllDays}
                  className="text-[#1f4d78] hover:underline cursor-pointer"
                >
                  تحديد الكل
                </button>
                <span className="text-[#ccc]">|</span>
                <button
                  type="button"
                  onClick={clearAllDays}
                  className="text-[#c5221f] hover:underline cursor-pointer"
                >
                  إلغاء الكل
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {workDays.map((day) => {
                const isSelected = selectedDays.includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-bold transition border cursor-pointer ${
                      isSelected
                        ? 'border-[#1f4d78] bg-[#eef3f8] text-[#1f4d78]'
                        : 'border-[#e5e5e3] bg-[#f7f7f5] text-[#888] hover:bg-[#eaeae7]'
                    }`}
                  >
                    <span
                      className={`size-2 rounded-full ${
                        isSelected ? 'bg-[#1f4d78]' : 'bg-[#ccc]'
                      }`}
                    />
                    <span>{day}</span>
                  </button>
                )
              })}
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
              <span>{observer ? 'حفظ التعديلات' : 'إضافة المراقب'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
