import React, { useState } from 'react'
import type { PrintSignatures } from '../../types/control'
import { Save, UserCog } from 'lucide-react'

interface SignaturesSettingsViewProps {
  signatures: PrintSignatures
  onSaveSignatures: (sigs: PrintSignatures) => void
}

export const SignaturesSettingsView: React.FC<SignaturesSettingsViewProps> = ({
  signatures,
  onSaveSignatures,
}) => {
  const [sigTables, setSigTables] = useState(signatures.sigTables)
  const [sigSystem, setSigSystem] = useState(signatures.sigSystem)
  const [sigDean, setSigDean] = useState(signatures.sigDean)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveSignatures({ sigTables, sigSystem, sigDean })
    alert('تم حفظ إعدادات التوقيعات الرسمية بنجاح!')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl border border-[#dededb] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-[#ecece9] pb-3 mb-4">
          <div className="grid size-10 place-items-center rounded-xl bg-[#e2ecf5] text-[#1f4d78]">
            <UserCog className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-[#171717]">إعدادات التوقيعات الرسمية</h2>
            <p className="text-xs font-semibold text-[#777]">
              هذه الأسماء تظهر تلقائياً أسفل كشوف التوزيع المطبوعة والمصدرة
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs font-bold">
          <div>
            <label className="text-[#555] block mb-1">اسم رئيس لجنة الجداول:</label>
            <input
              type="text"
              value={sigTables}
              onChange={(e) => setSigTables(e.target.value)}
              className="h-9 w-full rounded-xl border border-[#cfcfcb] px-3 font-bold text-[#171717] outline-none focus:border-[#1f4d78]"
            />
          </div>

          <div>
            <label className="text-[#555] block mb-1">اسم مدير النظام ورئيس الكنترول:</label>
            <input
              type="text"
              value={sigSystem}
              onChange={(e) => setSigSystem(e.target.value)}
              className="h-9 w-full rounded-xl border border-[#cfcfcb] px-3 font-bold text-[#171717] outline-none focus:border-[#1f4d78]"
            />
          </div>

          <div>
            <label className="text-[#555] block mb-1">اسم عميد المعهد:</label>
            <input
              type="text"
              value={sigDean}
              onChange={(e) => setSigDean(e.target.value)}
              className="h-9 w-full rounded-xl border border-[#cfcfcb] px-3 font-bold text-[#171717] outline-none focus:border-[#1f4d78]"
            />
          </div>

          <button
            type="submit"
            className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-[#1f4d78] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#163756] transition"
          >
            <Save className="size-4" />
            <span>حفظ واعتماد التوقيعات</span>
          </button>
        </form>
      </div>
    </div>
  )
}
