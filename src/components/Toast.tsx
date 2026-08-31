import React, { useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  text: string
}

interface ToastProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 left-4 z-[100] flex flex-col gap-2 pointer-events-none print-hide">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, 2800)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div
      className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs font-bold shadow-lg transition-all transform duration-200 animate-in slide-in-from-bottom-3 ${
        toast.type === 'success'
          ? 'border-[#bbf7d0] bg-[#f0fdf4] text-[#155724]'
          : toast.type === 'error'
          ? 'border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]'
          : 'border-[#bfdbfe] bg-[#eff6ff] text-[#1e40af]'
      }`}
    >
      {toast.type === 'success' && <CheckCircle2 className="size-4.5 shrink-0 text-[#16a34a]" />}
      {toast.type === 'error' && <AlertCircle className="size-4.5 shrink-0 text-[#dc2626]" />}
      {toast.type === 'info' && <Info className="size-4.5 shrink-0 text-[#2563eb]" />}

      <span>{toast.text}</span>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="ms-auto rounded-md p-1 opacity-70 hover:opacity-100 hover:bg-black/5 transition cursor-pointer"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}
