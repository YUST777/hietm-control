import React, { useState, useEffect } from 'react'
import type { Committee } from '../../types/control'
import { Building, X, Check, Layers, Users } from 'lucide-react'

interface EditCommitteeModalProps {
  isOpen: boolean
  committee: Committee | null // null = create new
  floors?: string[]
  onClose: () => void
  onSave: (commData: Omit<Committee, 'id'>, id?: string) => void
}

const DEFAULT_FLOORS = [
  'البدروم',
  'الدور الأرضي',
  'الدور الأول',
  'الدور الثاني',
  'الدور الثالث',
  'الدور الرابع',
]

export const EditCommitteeModal: React.FC<EditCommitteeModalProps> = ({
  isOpen,
  committee,
  floors = DEFAULT_FLOORS,
  onClose,
  onSave,
}) => {
  const [roomNum, setRoomNum] = useState('')
  const [hallName, setHallName] = useState('')
  const [floor, setFloor] = useState(floors[0] || DEFAULT_FLOORS[0])
  const [capacity, setCapacity] = useState<number>(30)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (committee) {
        setRoomNum(committee.roomNum)
        setHallName(committee.hallName)
        setFloor(committee.floor || floors[0] || DEFAULT_FLOORS[0])
        setCapacity(committee.capacity || 30)
      } else {
        setRoomNum('')
        setHallName('')
        setFloor(floors[0] || DEFAULT_FLOORS[0])
        setCapacity(30)
      }
      setError('')
    }
  }, [isOpen, committee, floors])

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
    if (!roomNum.trim() || !hallName.trim()) {
      setError('يرجى ملء كل من رقم اللجنة واسم القاعة')
      return
    }

    onSave(
      {
        roomNum: roomNum.trim(),
        hallName: hallName.trim(),
        floor: floor.trim(),
        capacity: Number(capacity) || 30,
      },
      committee?.id
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
              <Building className="size-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#171717]">
                {committee ? 'تعديل بيانات اللجنة الامتحانية' : 'إضافة لجنة وقاعة امتحانية'}
              </h3>
              <p className="text-[11px] font-semibold text-[#777]">
                {committee ? `تعديل: لجنة ${committee.roomNum} - ${committee.hallName}` : 'إدخال قاعة جديدة لتوزيع الامتحانات'}
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

          {/* Room Number & Hall Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[#555] block mb-1">رقم اللجنة:</label>
              <input
                type="text"
                placeholder="مثال: 25"
                value={roomNum}
                onChange={(e) => {
                  setRoomNum(e.target.value)
                  if (error) setError('')
                }}
                className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2 text-center text-xs font-black text-[#1f4d78] outline-none focus:border-[#1f4d78]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[#555] block mb-1">اسم القاعة / الصالة:</label>
              <input
                type="text"
                placeholder="مثال: صالة رسم 3"
                value={hallName}
                onChange={(e) => {
                  setHallName(e.target.value)
                  if (error) setError('')
                }}
                autoFocus
                className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2.5 text-xs font-bold text-[#171717] outline-none focus:border-[#1f4d78]"
              />
            </div>
          </div>

          {/* Floor */}
          <div>
            <label className="flex items-center gap-1 text-[#555] mb-1">
              <Layers className="size-3 text-[#1f4d78]" />
              <span>موقع الدور:</span>
            </label>
            <select
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#171717] outline-none focus:border-[#1f4d78]"
            >
              {floors.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Capacity Stepper */}
          <div>
            <label className="flex items-center gap-1 text-[#555] mb-1">
              <Users className="size-3 text-[#1f4d78]" />
              <span>السعة الاستيعابية للطلاب:</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCapacity((prev) => Math.max(5, prev - 5))}
                className="grid size-8 place-items-center rounded-lg border border-[#cfcfcb] bg-[#f7f7f5] text-sm font-black text-[#444] hover:bg-[#eaeae7] transition"
              >
                -5
              </button>
              <input
                type="number"
                min={5}
                value={capacity}
                onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value, 10) || 30))}
                className="h-8 w-20 rounded-lg border border-[#cfcfcb] text-center text-sm font-black text-[#1f4d78] outline-none focus:border-[#1f4d78]"
              />
              <button
                type="button"
                onClick={() => setCapacity((prev) => prev + 5)}
                className="grid size-8 place-items-center rounded-lg border border-[#cfcfcb] bg-[#f7f7f5] text-sm font-black text-[#444] hover:bg-[#eaeae7] transition"
              >
                +5
              </button>
              <span className="text-[11px] font-semibold text-[#777]">طالب</span>
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
              <span>{committee ? 'حفظ التعديلات' : 'إضافة اللجنة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
