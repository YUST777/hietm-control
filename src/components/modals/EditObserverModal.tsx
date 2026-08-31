import React, { useState, useEffect } from 'react'
import type { Observer } from '../../types/control'
import { UserCheck, X, Check, Clock, Calendar, Briefcase, Building } from 'lucide-react'

interface EditObserverModalProps {
  isOpen: boolean
  observer: Observer | null // null = create new
  onClose: () => void
  onSave: (obsData: Omit<Observer, 'id'>, id?: string) => void
}

const JOB_OPTIONS = [
  'عضو هيئة تدريس',
  'أ.د. (عضو هيئة تدريس)',
  'أ.م.د. (عضو هيئة تدريس)',
  'د. (عضو هيئة تدريس)',
  'هيئة معاونة (مدرس مساعد)',
  'م.م. (هيئة معاونة)',
  'هيئة معاونة (معيد)',
  'م. (هيئة معاونة)',
  'إداري / موظف',
]

const DEPARTMENTS = [
  'قسم العلوم الأساسية',
  'قسم الهندسة المعمارية',
  'قسم الهندسة المدنية',
  'قسم الهندسة الكهربية',
  'إدارة الكنترول وشؤون الطلاب',
]

const ALL_DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']

export const EditObserverModal: React.FC<EditObserverModalProps> = ({
  isOpen,
  observer,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('')
  const [job, setJob] = useState(JOB_OPTIONS[0])
  const [specialization, setSpecialization] = useState(DEPARTMENTS[0])
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [hours, setHours] = useState<number>(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (observer) {
        setName(observer.name)
        setJob(observer.job || JOB_OPTIONS[0])
        setSpecialization(observer.specialization || DEPARTMENTS[0])
        const daysArray = observer.days
          ? observer.days.split(',').map((d) => d.trim()).filter(Boolean)
          : []
        setSelectedDays(daysArray)
        setHours(observer.hours || 0)
      } else {
        setName('')
        setJob(JOB_OPTIONS[0])
        setSpecialization(DEPARTMENTS[0])
        setSelectedDays([...ALL_DAYS])
        setHours(0)
      }
      setError('')
    }
  }, [isOpen, observer])

  if (!isOpen) return null

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const selectAllDays = () => setSelectedDays([...ALL_DAYS])
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 print-hide">
      <div className="w-full max-w-lg rounded-2xl border border-[#dededb] bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ecece9] pb-3">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-[#e2ecf5] text-[#1f4d78]">
              <UserCheck className="size-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#171717]">
                {observer ? 'تعديل بيانات عضو المراقبة' : 'إضافة عضو مراقبة جديد'}
              </h3>
              <p className="text-[11px] font-semibold text-[#777]">
                {observer ? `تعديل السجل الخاص بـ: ${observer.name}` : 'إدخال عضو جديد إلى قاعدة البيانات'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#888] hover:bg-[#f0f0ee] transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 text-xs font-bold">
          {error && (
            <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] p-2 text-xs font-bold text-[#b91c1c]">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-[#555] block mb-1">الاسم الكامل:</label>
            <input
              type="text"
              placeholder="مثال: د. أحمد محمد علي"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError('')
              }}
              autoFocus
              className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2.5 text-xs font-bold text-[#171717] outline-none focus:border-[#1f4d78] focus:ring-1 focus:ring-[#1f4d78]"
            />
          </div>

          {/* Job & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="flex items-center gap-1 text-[#555] mb-1">
                <Briefcase className="size-3 text-[#1f4d78]" />
                <span>المسمى الوظيفي:</span>
              </label>
              <select
                value={job}
                onChange={(e) => setJob(e.target.value)}
                className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#171717] outline-none focus:border-[#1f4d78]"
              >
                {JOB_OPTIONS.map((j) => (
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
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Working Days Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1 text-[#555]">
                <Calendar className="size-3 text-[#1f4d78]" />
                <span>أيام التفرغ والحضور الأسبوعية:</span>
              </label>
              <div className="flex items-center gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={selectAllDays}
                  className="text-[#1f4d78] hover:underline"
                >
                  تحديد الكل
                </button>
                <span className="text-[#ccc]">•</span>
                <button
                  type="button"
                  onClick={clearAllDays}
                  className="text-[#888] hover:underline"
                >
                  إلغاء الكل
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {ALL_DAYS.map((day) => {
                const isSelected = selectedDays.includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-bold transition cursor-pointer border ${
                      isSelected
                        ? 'border-[#1f4d78] bg-[#1f4d78] text-white shadow-xs'
                        : 'border-[#e5e5e3] bg-[#f7f7f5] text-[#666] hover:bg-[#eaeae7]'
                    }`}
                  >
                    {isSelected && <Check className="size-3" />}
                    <span>{day}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Hours Stepper */}
          <div>
            <label className="flex items-center gap-1 text-[#555] mb-1">
              <Clock className="size-3 text-[#1f4d78]" />
              <span>إجمالي ساعات المراقبة المسجلة:</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHours((prev) => Math.max(0, prev - 1))}
                className="grid size-8 place-items-center rounded-lg border border-[#cfcfcb] bg-[#f7f7f5] text-sm font-black text-[#444] hover:bg-[#eaeae7] transition"
              >
                -
              </button>
              <input
                type="number"
                min={0}
                value={hours}
                onChange={(e) => setHours(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="h-8 w-20 rounded-lg border border-[#cfcfcb] text-center text-sm font-black text-[#1f4d78] outline-none focus:border-[#1f4d78]"
              />
              <button
                type="button"
                onClick={() => setHours((prev) => prev + 1)}
                className="grid size-8 place-items-center rounded-lg border border-[#cfcfcb] bg-[#f7f7f5] text-sm font-black text-[#444] hover:bg-[#eaeae7] transition"
              >
                +
              </button>
              <span className="text-[11px] font-semibold text-[#777]">ساعة معتمدة</span>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="mt-3 flex items-center justify-end gap-2 border-t border-[#ecece9] pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#cfcfcb] px-3.5 py-1.5 text-xs font-bold text-[#555] hover:bg-[#f0f0ee] transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 rounded-lg bg-[#1f4d78] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#163756] shadow-sm transition"
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
