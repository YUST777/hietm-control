import React, { useState } from 'react'
import type { Committee } from '../../types/control'
import { Plus, Trash2, Building } from 'lucide-react'

interface CommitteesViewProps {
  committees: Committee[]
  onAddCommittee: (c: Omit<Committee, 'id'>) => void
  onDeleteCommittee: (id: string) => void
}

export const CommitteesView: React.FC<CommitteesViewProps> = ({
  committees,
  onAddCommittee,
  onDeleteCommittee,
}) => {
  const [roomNum, setRoomNum] = useState('')
  const [hallName, setHallName] = useState('')
  const [floor, setFloor] = useState('الدور الأرضي')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomNum || !hallName) return alert('يرجى إدخال رقم واسم اللجنة/القاعة')
    onAddCommittee({ roomNum, hallName, floor })
    setRoomNum('')
    setHallName('')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* Add Committee Form */}
      <form
        onSubmit={handleAdd}
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dededb] bg-white p-3 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Building className="size-5 text-[#1f4d78]" />
          <h2 className="text-sm font-black text-[#171717]">إدارة اللجان والقاعات الامتحانية</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="رقم اللجنة (مثال: 25)"
            value={roomNum}
            onChange={(e) => setRoomNum(e.target.value)}
            className="h-8 w-32 rounded-lg border border-[#cfcfcb] px-2.5 text-xs font-semibold outline-none focus:border-[#1f4d78]"
          />
          <input
            type="text"
            placeholder="اسم القاعة / الصالة"
            value={hallName}
            onChange={(e) => setHallName(e.target.value)}
            className="h-8 w-44 rounded-lg border border-[#cfcfcb] px-2.5 text-xs font-semibold outline-none focus:border-[#1f4d78]"
          />
          <select
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className="h-8 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold text-[#333] outline-none"
          >
            <option value="الدور الأرضي">الدور الأرضي</option>
            <option value="الدور الأول">الدور الأول</option>
            <option value="الدور الثاني">الدور الثاني</option>
            <option value="الدور الثالث">الدور الثالث</option>
            <option value="الدور الرابع">الدور الرابع</option>
          </select>
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg bg-[#1f4d78] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#163756] transition"
          >
            <Plus className="size-3.5" />
            <span>إضافة لجنة</span>
          </button>
        </div>
      </form>

      {/* Grid of Committees */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dededb] bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {committees.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-[#dededb] bg-[#fafaf8] p-3 shadow-xs hover:border-[#1f4d78] transition"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-[#1f4d78] px-2 py-0.5 text-xs font-black text-white">
                      لجنة {c.roomNum}
                    </span>
                    <span className="text-xs font-bold text-[#171717]">{c.hallName}</span>
                  </div>
                  <p className="mt-1 text-[11px] font-semibold text-[#777]">{c.floor}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteCommittee(c.id)}
                  className="rounded-lg p-1.5 text-[#c5221f] hover:bg-[#fee2e2] transition"
                  title="حذف اللجنة"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
