import React, { useState, useEffect } from 'react'
import { Database, CheckCircle2, AlertCircle, RefreshCw, UploadCloud, X, KeyRound, Globe, HelpCircle } from 'lucide-react'
import { getSavedSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, testSupabaseConnection, resetSupabaseClient } from '../lib/supabase'

interface DatabaseSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onConnectionChanged: () => void
  onSeedDatabase: () => Promise<{ success: boolean; message: string }>
}

export const DatabaseSettingsModal: React.FC<DatabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  onConnectionChanged,
  onSeedDatabase,
}) => {
  const [url, setUrl] = useState('')
  const [anonKey, setAnonKey] = useState('')
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    if (isOpen) {
      const config = getSavedSupabaseConfig()
      setUrl(config.url || '')
      setAnonKey(config.anonKey || '')
      setStatus('idle')
      setErrorMessage('')
      setSeedResult(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('testing')
    setErrorMessage('')
    setSeedResult(null)

    const trimmedUrl = url.trim()
    const trimmedKey = anonKey.trim()

    const result = await testSupabaseConnection(trimmedUrl, trimmedKey)
    if (result.success) {
      saveSupabaseConfig({ url: trimmedUrl, anonKey: trimmedKey })
      resetSupabaseClient()
      setStatus('success')
      onConnectionChanged()
    } else {
      setStatus('error')
      setErrorMessage(result.error || 'فشل الاتصال بـ Supabase')
    }
  }

  const handleDisconnect = () => {
    if (window.confirm('هل تريد فصل الاتصال بقاعدة البيانات والعودة للوضع المحلي؟')) {
      clearSupabaseConfig()
      resetSupabaseClient()
      setUrl('')
      setAnonKey('')
      setStatus('idle')
      onConnectionChanged()
      onClose()
    }
  }

  const handleRunSeed = async () => {
    if (!window.confirm('هل تريد رفع وتعبئة جميع البيانات الأصلية المعتمدة (72 مراقب، 273 مقرر، 24 لجنة) في جدول Supabase؟')) {
      return
    }
    setIsSeeding(true)
    setSeedResult(null)
    const res = await onSeedDatabase()
    setIsSeeding(false)
    setSeedResult(res)
    if (res.success) {
      onConnectionChanged()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 print-hide">
      <div className="w-full max-w-lg rounded-2xl border border-[#dededb] bg-white p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ecece9] pb-3">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-[#e2ecf5] text-[#1f4d78]">
              <Database className="size-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#171717]">ربط قاعدة بيانات Supabase السحابية</h3>
              <p className="text-[11px] font-semibold text-[#777]">حفظ وتزامن التعديلات مباشرة عبر جميع الأجهزة</p>
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
        <form onSubmit={handleTestAndSave} className="mt-4 flex flex-col gap-3 text-xs font-bold">
          <div>
            <label className="flex items-center gap-1 text-[#555]">
              <Globe className="size-3.5 text-[#1f4d78]" />
              <span>رابط المشروع (Project URL):</span>
            </label>
            <input
              type="url"
              dir="ltr"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="mt-1 h-8 w-full rounded-lg border border-[#cfcfcb] px-2.5 font-mono text-xs outline-none focus:border-[#1f4d78]"
            />
          </div>

          <div>
            <label className="flex items-center gap-1 text-[#555]">
              <KeyRound className="size-3.5 text-[#1f4d78]" />
              <span>مفتاح الوصول العام (Anon / Public Key):</span>
            </label>
            <input
              type="password"
              dir="ltr"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              required
              className="mt-1 h-8 w-full rounded-lg border border-[#cfcfcb] px-2.5 font-mono text-xs outline-none focus:border-[#1f4d78]"
            />
          </div>

          {/* Status feedback */}
          {status === 'success' && (
            <div className="flex items-center gap-1.5 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-2 text-xs font-bold text-[#155724]">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>تم التحقق من الاتصال بنجاح وتفعيل المزامنة المباشرة!</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-1.5 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-2 text-xs font-bold text-[#b91c1c]">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {seedResult && (
            <div
              className={`flex items-center gap-1.5 rounded-lg border p-2 text-xs font-bold ${
                seedResult.success
                  ? 'border-[#bbf7d0] bg-[#f0fdf4] text-[#155724]'
                  : 'border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]'
              }`}
            >
              {seedResult.success ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
              <span>{seedResult.message}</span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#ecece9] pt-3">
            <button
              type="button"
              onClick={handleRunSeed}
              disabled={isSeeding || !url || !anonKey}
              className="flex items-center gap-1 rounded-lg border border-[#e2ecf5] bg-[#eef6fc] px-3 py-1.5 text-xs font-black text-[#1f4d78] hover:bg-[#e2ecf5] transition disabled:opacity-50"
            >
              {isSeeding ? <RefreshCw className="size-3.5 animate-spin" /> : <UploadCloud className="size-3.5" />}
              <span>تعبئة قاعدة البيانات بالبيانات الأصلية</span>
            </button>

            <div className="flex items-center gap-2">
              {url && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="rounded-lg border border-[#cfcfcb] px-2.5 py-1.5 text-xs text-[#666] hover:bg-[#f0f0ee] transition"
                >
                  فصل الاتصال
                </button>
              )}
              <button
                type="submit"
                disabled={status === 'testing'}
                className="flex items-center gap-1 rounded-lg bg-[#1f4d78] px-4 py-1.5 text-xs text-white hover:bg-[#163756] transition disabled:opacity-50"
              >
                {status === 'testing' ? <RefreshCw className="size-3.5 animate-spin" /> : null}
                <span>حفظ وتفعيل</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Instructions */}
        <div className="mt-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] p-2.5 text-[11px] text-[#475569]">
          <div className="flex items-center gap-1 font-bold text-[#1e293b] mb-1">
            <HelpCircle className="size-3.5 text-[#1f4d78]" />
            <span>كيف تحصل على المفاتيح؟</span>
          </div>
          <ol className="list-decimal list-inside space-y-0.5 font-medium leading-relaxed">
            <li>أنشئ مشروع مجاني في <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#1f4d78] underline font-bold">Supabase.com</a>.</li>
            <li>افتح <strong>SQL Editor</strong> وقم بتشغيل ملف <code className="bg-[#e2e8f0] px-1 rounded font-mono">supabase/schema.sql</code>.</li>
            <li>انسخ رابط المشروع ومفتاح <code className="bg-[#e2e8f0] px-1 rounded font-mono">anon key</code> من إعدادات <strong>Project Settings → API</strong>.</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
