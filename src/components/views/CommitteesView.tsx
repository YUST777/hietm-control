import React, { useState } from 'react'
import type { Committee } from '../../types/control'
import { Plus, Trash2, Building, Edit3, Check, X } from 'lucide-react'

interface CommitteesViewProps {
  committees: Committee[]
  onAddCommittee: (c: Omit<Committee, 'id'>) => void
  onUpdateCommittee: (id: string, updates: Partial<Committee>) => void
  onDeleteCommittee: (id: string) => void
}

const FLOORS = [
  'الدور الأرضي',
  'الدور الأول',
  'الدور الثاني',
  'الدور الثالث',
  'الدور الرابع',
  'الدور الخامس',
]

export const CommitteesView: React.FC<CommitteesViewProps> = ({
  committees,
  onAddCommittee,
  onUpdateCommittee,
  onDeleteCommittee,
}) => {
  const [roomNum, setRoomNum] = useState('')
  const [hallName, setHallName] = useState('')
  const [floor, setFloor] = useState('الدور الأرضي')
  const [capacity, setCapacity] = useState(30)

  // Edit committee state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRoomNum, setEditRoomNum] = useState('')
  const [editHallName, setEditHallName] = useState('')
  const [editFloor, setEditFloor] = useState('')
  const [editCapacity, setEditCapacity] = useState(30)

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomNum || !hallName) return alert('يرجى إدخال رقم واسم اللجنة/القاعة')
    onAddCommittee({ roomNum, hallName, floor, capacity })
    setRoomNum('')
    setHallName('')
    setCapacity(30)
  }

  const startEdit = (c: Committee) => {
    setEditingId(c.id)
    setEditRoomNum(c.roomNum)
    setEditHallName(c.hallName)
    setEditFloor(c.floor)
    setEditCapacity(c.capacity || 30)
  }

  const saveEdit = (id: string) => {
    if (!editRoomNum.trim() || !editHallName.trim()) return alert('رقم واسم اللجنة لا يمكن أن يكونا فارغين')
    onUpdateCommittee(id, {
      roomNum: editRoomNum.trim(),
      hallName: editHallName.trim(),
      floor: editFloor.trim(),
      capacity: editCapacity || 30,
    })
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`هل تريد بالتأكيد حذف لجنة "${name}"؟`)) {
      onDeleteCommittee(id)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5">
      {/* Add Committee Form */}
      <form
        onSubmit={handleAdd}
        className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[#dededb] bg-white p-2.5 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Building className="size-4.5 text-[#1f4d78]" />
          <h2 className="text-xs font-black text-[#171717]">
            إدارة اللجان والقاعات الامتحانية ({committees.length} لجنة)
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="رقم اللجنة (مثال: 25)"
            value={roomNum}
            onChange={(e) => setRoomNum(e.target.value)}
            className="h-7 w-28 rounded-lg border border-[#cfcfcb] px-2 text-xs font-semibold outline-none focus:border-[#1f4d78]"
          />
          <input
            type="text"
            placeholder="اسم القاعة / الصالة"
            value={hallName}
            onChange={(e) => setHallName(e.target.value)}
            className="h-7 w-40 rounded-lg border border-[#cfcfcb] px-2 text-xs font-semibold outline-none focus:border-[#1f4d78]"
          />
          <select
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className="h-7 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none"
          >
            {FLOORS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="السعة"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 30)}
            className="h-7 w-16 rounded-lg border border-[#cfcfcb] px-2 text-center text-xs font-bold text-[#333] outline-none"
            title="السعة الاستيعابية للطلاب"
          />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg bg-[#1f4d78] px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-[#163756] transition"
          >
            <Plus className="size-3.5" />
            <span>إضافة لجنة</span>
          </button>
        </div>
      </form>

      {/* Grid of Committees with Inline Editing */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dededb] bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-auto p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {committees.map((c) => {
              const isEditing = editingId === c.id

              if (isEditing) {
                return (
                  <div
                    key={c.id}
                    className="flex flex-col gap-2 rounded-xl border-2 border-[#1f4d78] bg-white p-2.5 shadow-md"
                  >
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="رقم"
                        value={editRoomNum}
                        onChange={(e) => setEditRoomNum(e.target.value)}
                        className="h-6 w-16 rounded border border-[#cfcfcb] px-1 text-xs font-black text-[#1f4d78]"
                      />
                      <input
                        type="text"
                        placeholder="اسم القاعة"
                        value={editHallName}
                        onChange={(e) => setEditHallName(e.target.value)}
                        className="h-6 flex-1 rounded border border-[#cfcfcb] px-1 text-xs font-bold text-[#111]"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={editFloor}
                        onChange={(e) => setEditFloor(e.target.value)}
                        className="h-6 flex-1 rounded border border-[#cfcfcb] px-1 text-[11px]"
                      >
                        {FLOORS.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="السعة"
                        value={editCapacity}
                        onChange={(e) => setEditCapacity(parseInt(e.target.value, 10) || 30)}
                        className="h-6 w-14 rounded border border-[#cfcfcb] px-1 text-center text-xs"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => saveEdit(c.id)}
                        className="flex items-center gap-0.5 rounded px-2 py-0.5 bg-[#155724] text-white text-[11px] font-bold hover:bg-[#0f3d19]"
                      >
                        <Check className="size-3" />
                        <span>حفظ</span>
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex items-center gap-0.5 rounded px-2 py-0.5 bg-[#888] text-white text-[11px] hover:bg-[#666]"
                      >
                        <X className="size-3" />
                        <span>إلغاء</span>
                      </button>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-[#dededb] bg-[#fafaf8] p-2.5 shadow-xs hover:border-[#1f4d78] transition group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-[#1f4d78] px-1.5 py-0.2 text-[11px] font-black text-white shrink-0">
                        لجنة {c.roomNum}
                      </span>
                      <span className="text-xs font-bold text-[#171717] truncate">{c.hallName}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] font-semibold text-[#777]">
                      <span>{c.floor}</span>
                      {c.capacity && <span>• سعة {c.capacity} طالب</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="rounded-lg p-1 text-[#1f4d78] hover:bg-[#eef3f8] transition"
                      title="تعديل اللجنة"
                    >
                      <Edit3 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id, `لجنة ${c.roomNum} - ${c.hallName}`)}
                      className="rounded-lg p-1 text-[#c5221f] hover:bg-[#fee2e2] transition"
                      title="حذف اللجنة"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
