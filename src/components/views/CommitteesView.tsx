import React, { useState } from 'react'
import type { Committee } from '../../types/control'
import { Plus, Trash2, Building, Edit3, Users } from 'lucide-react'
import { EditCommitteeModal } from '../modals/EditCommitteeModal'

interface CommitteesViewProps {
  committees: Committee[]
  onAddCommittee: (c: Omit<Committee, 'id'>) => void
  onUpdateCommittee: (id: string, updates: Partial<Committee>) => void
  onDeleteCommittee: (id: string) => void
}

export const CommitteesView: React.FC<CommitteesViewProps> = ({
  committees,
  onAddCommittee,
  onUpdateCommittee,
  onDeleteCommittee,
}) => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCommitteeToEdit, setSelectedCommitteeToEdit] = useState<Committee | null>(null)

  const handleOpenAddModal = () => {
    setSelectedCommitteeToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (c: Committee) => {
    setSelectedCommitteeToEdit(c)
    setIsModalOpen(true)
  }

  const handleSaveModal = (commData: Omit<Committee, 'id'>, id?: string) => {
    if (id) {
      onUpdateCommittee(id, commData)
    } else {
      onAddCommittee(commData)
    }
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف لجنة: "${name}" من قاعدة البيانات؟`)) {
      onDeleteCommittee(id)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-[#dededb] bg-white p-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <Building className="size-4.5 text-[#1f4d78]" />
          <div>
            <h2 className="text-xs font-black text-[#171717]">
              إدارة اللجان والقاعات الامتحانية ({committees.length} لجنة)
            </h2>
            <p className="text-[11px] font-semibold text-[#777]">
              تعيين السعة الاستيعابية ومواقع الأدوار لجميع صالات ومدرجات المعهد
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 rounded-lg bg-[#1f4d78] px-3.5 py-1.5 text-xs font-black text-white shadow-xs hover:bg-[#163756] transition"
        >
          <Plus className="size-3.5" />
          <span>إضافة لجنة جديدة</span>
        </button>
      </div>

      {/* Grid of Committees */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dededb] bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-auto p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {committees.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-[#dededb] bg-[#fafaf8] p-3 shadow-2xs hover:border-[#1f4d78] transition group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-[#1f4d78] px-2 py-0.5 text-xs font-black text-white shrink-0">
                      لجنة {c.roomNum}
                    </span>
                    <span className="text-xs font-bold text-[#171717] truncate">{c.hallName}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-[10.5px] font-semibold text-[#666]">
                    <span className="rounded bg-[#eef3f8] px-1.5 py-0.2 text-[#1f4d78] font-bold">
                      {c.floor}
                    </span>
                    <span className="flex items-center gap-0.5 text-[#555]">
                      <Users className="size-3 text-[#888]" />
                      <span>{c.capacity || 30} طالب</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(c)}
                    className="rounded-lg p-1.5 text-[#1f4d78] hover:bg-[#eef3f8] transition"
                    title="تعديل بيانات اللجنة"
                  >
                    <Edit3 className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id, `لجنة ${c.roomNum} - ${c.hallName}`)}
                    className="rounded-lg p-1.5 text-[#c5221f] hover:bg-[#fee2e2] transition"
                    title="حذف اللجنة"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit / Add Committee Modal */}
      <EditCommitteeModal
        isOpen={isModalOpen}
        committee={selectedCommitteeToEdit}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
      />
    </div>
  )
}
