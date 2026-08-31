import React, { useState } from 'react'
import type { Committee } from '../../types/control'
import { Plus, Trash2, Building, Edit3, Users, Download, FileUp } from 'lucide-react'
import { EditCommitteeModal } from '../modals/EditCommitteeModal'
import { exportCommitteesCSV, parseCommitteesCSV } from '../../lib/excelUtils'

interface CommitteesViewProps {
  committees: Committee[]
  onAddCommittee: (c: Omit<Committee, 'id'>) => void
  onUpdateCommittee: (id: string, updates: Partial<Committee>) => void
  onDeleteCommittee: (id: string) => void
  onImportCommittees?: (list: Omit<Committee, 'id'>[]) => void
}

export const CommitteesView: React.FC<CommitteesViewProps> = ({
  committees,
  onAddCommittee,
  onUpdateCommittee,
  onDeleteCommittee,
  onImportCommittees,
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

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImportCommittees) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        if (text) {
          const parsed = parseCommitteesCSV(text)
          if (parsed.length > 0) {
            onImportCommittees(parsed)
            alert(`تم استيراد ${parsed.length} قاعة ولجنة بنجاح ✓`)
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

        <div className="flex items-center gap-2">
          {/* Export Excel */}
          <button
            type="button"
            onClick={() => exportCommitteesCSV(committees)}
            className="flex items-center gap-1 rounded-lg border border-[#cfcfcb] bg-[#fafaf8] px-2.5 py-1.5 text-xs font-bold text-[#333] hover:bg-[#eaeae7] transition cursor-pointer"
            title="تصدير اللجان إلى ملف Excel / CSV"
          >
            <Download className="size-3.5 text-[#1f4d78]" />
            <span>تصدير Excel</span>
          </button>

          {/* Import Excel */}
          {onImportCommittees && (
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

          {/* Add Committee Button */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 rounded-lg bg-[#1f4d78] px-3.5 py-1.5 text-xs font-black text-white shadow-xs hover:bg-[#163756] transition cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>إضافة لجنة / قاعة</span>
          </button>
        </div>
      </div>

      {/* Grid of Committees */}
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {committees.map((c) => (
            <div
              key={c.id}
              className="flex flex-col justify-between rounded-xl border border-[#dededb] bg-white p-3 shadow-xs hover:border-[#1f4d78] hover:shadow-sm transition"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#ecece9] pb-2 mb-2">
                  <span className="rounded-lg bg-[#eef3f8] px-2 py-0.5 font-mono text-xs font-black text-[#1f4d78]">
                    لجنة {c.roomNum}
                  </span>
                  <span className="text-[11px] font-semibold text-[#666]">{c.floor}</span>
                </div>

                <h3 className="text-xs font-black text-[#171717]">{c.hallName}</h3>

                <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#555]">
                  <Users className="size-3.5 text-[#888]" />
                  <span>السعة: {c.capacity || 30} طالب</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[#ecece9] pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(c)}
                  className="flex items-center gap-1 rounded bg-[#fafaf8] px-2.5 py-1 text-[11px] font-bold text-[#1f4d78] hover:bg-[#eef3f8] transition cursor-pointer"
                >
                  <Edit3 className="size-3" />
                  <span>تعديل</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(c.id, `${c.roomNum} - ${c.hallName}`)}
                  className="rounded p-1 text-[#c5221f] hover:bg-[#fee2e2] transition cursor-pointer"
                  title="حذف اللجنة"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit/Add Committee Modal */}
      <EditCommitteeModal
        isOpen={isModalOpen}
        committee={selectedCommitteeToEdit}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
      />
    </div>
  )
}
