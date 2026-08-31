import React, { useState } from 'react'
import type { PrintSignatures, SystemBranding } from '../../types/control'
import { Save, UserCog, Palette, Building2, Upload, Trash2, Check, Sparkles } from 'lucide-react'

interface SettingsViewProps {
  signatures: PrintSignatures
  branding: SystemBranding
  onSaveSignatures: (sigs: PrintSignatures) => void
  onSaveBranding: (branding: SystemBranding) => void
}

const COLOR_PRESETS = [
  { name: 'الأزرق الملكي (الافتراضي)', hex: '#1f4d78' },
  { name: 'الأخضر الزمردي الأكاديمي', hex: '#059669' },
  { name: 'البنفسجي الملكي', hex: '#7c3aed' },
  { name: 'العنابي الأكاديمي', hex: '#991b1b' },
  { name: 'الرمادي الكحلي الحديث', hex: '#1e293b' },
  { name: 'الأزرق الفيروزي (Teal)', hex: '#0d9488' },
]

export const SignaturesSettingsView: React.FC<SettingsViewProps> = ({
  signatures,
  branding,
  onSaveSignatures,
  onSaveBranding,
}) => {
  // Signatures State
  const [sigTables, setSigTables] = useState(signatures.sigTables)
  const [sigSystem, setSigSystem] = useState(signatures.sigSystem)
  const [sigDean, setSigDean] = useState(signatures.sigDean)

  // Branding State
  const [appName, setAppName] = useState(branding.appName)
  const [instituteName, setInstituteName] = useState(branding.instituteName)
  const [badgeText, setBadgeText] = useState(branding.badgeText)
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl || '')
  const [primaryColor, setPrimaryColor] = useState(branding.primaryColor || '#1f4d78')

  // Handle Logo Upload (Base64)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 2 ميجابايت')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoUrl(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveSignatures({ sigTables, sigSystem, sigDean })
    onSaveBranding({
      appName: appName.trim(),
      instituteName: instituteName.trim(),
      badgeText: badgeText.trim(),
      logoUrl,
      primaryColor,
    })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto p-3">
      <form onSubmit={handleSaveAll} className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        {/* Section 1: Branding & Logo & Theme Colors */}
        <div className="rounded-2xl border border-[#dededb] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-[#ecece9] pb-3 mb-3">
            <div
              className="grid size-9 place-items-center rounded-xl text-white shadow-xs"
              style={{ backgroundColor: primaryColor }}
            >
              <Palette className="size-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#171717]">
                هوية المعهد والمظهر والألوان (Branding & Theme)
              </h2>
              <p className="text-[11px] font-semibold text-[#777]">
                تخصيص اسم النظام وشعار المعهد واللون الأساسي للتطبيق والكشوف المطبوعة
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
            {/* Left Column: Names & Badge */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[#555] block mb-1">اسم النظام / الوحدة الرئيسية:</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="مثال: وحدة التعليم الإلكتروني — الكنترول وتوزيع المراقبات"
                  className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2.5 text-xs font-bold text-[#171717] outline-none focus:border-[#1f4d78]"
                />
              </div>

              <div>
                <label className="text-[#555] block mb-1">اسم المعهد / الكلية:</label>
                <input
                  type="text"
                  value={instituteName}
                  onChange={(e) => setInstituteName(e.target.value)}
                  placeholder="مثال: المعهد العالي للهندسة والتكنولوجيا — إدارة الجداول والامتحانات"
                  className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2.5 text-xs font-bold text-[#171717] outline-none focus:border-[#1f4d78]"
                />
              </div>

              <div>
                <label className="text-[#555] block mb-1">رمز الاختصار (Badge):</label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="مثال: H.I.E.T"
                  className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2.5 text-xs font-black text-[#171717] outline-none focus:border-[#1f4d78]"
                />
              </div>
            </div>

            {/* Right Column: Logo & Color Palette */}
            <div className="flex flex-col gap-3">
              {/* Logo Upload & Preview */}
              <div>
                <label className="text-[#555] block mb-1">شعار المعهد (Logo):</label>
                <div className="flex items-center gap-3">
                  <div className="relative grid size-16 shrink-0 place-items-center rounded-xl border border-[#dededb] bg-[#fafaf8] overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="size-full object-contain p-1" />
                    ) : (
                      <div
                        className="grid size-12 place-items-center rounded-lg text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Building2 className="size-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="flex items-center justify-center gap-1 rounded-lg border border-[#cfcfcb] bg-white px-3 py-1.5 text-xs font-bold text-[#333] hover:bg-[#f0f0ee] cursor-pointer transition">
                      <Upload className="size-3.5 text-[#666]" />
                      <span>رفع صورة الشعار</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="flex items-center justify-center gap-1 rounded-lg border border-[#fee2e2] bg-[#fff5f5] px-2 py-1 text-[11px] font-bold text-[#c5221f] hover:bg-[#fee2e2] transition"
                      >
                        <Trash2 className="size-3" />
                        <span>استعادة الأيقونة الافتراضية</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="text-[#555] block mb-1.5">لون مظهر النظام الأساسي (Theme Color):</label>
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  {COLOR_PRESETS.map((p) => {
                    const isSelected = primaryColor.toLowerCase() === p.hex.toLowerCase()
                    return (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() => setPrimaryColor(p.hex)}
                        className={`flex items-center gap-1.5 rounded-lg border p-1.5 text-[11px] font-bold transition text-right ${
                          isSelected
                            ? 'border-black bg-white shadow-xs ring-1 ring-black'
                            : 'border-[#dededb] bg-[#fafaf8] hover:bg-white'
                        }`}
                      >
                        <span
                          className="size-4 shrink-0 rounded-full border border-black/10 flex items-center justify-center text-white"
                          style={{ backgroundColor: p.hex }}
                        >
                          {isSelected && <Check className="size-2.5" />}
                        </span>
                        <span className="truncate">{p.name.split(' ')[0]}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Custom Color Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="size-7 rounded-lg border border-[#cfcfcb] cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-7 w-28 rounded-lg border border-[#cfcfcb] px-2 font-mono text-xs font-bold outline-none uppercase"
                  />
                  <span className="text-[11px] font-semibold text-[#888]">رمز اللون المخصص (Hex)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="mt-4 rounded-xl border border-[#dededb] bg-[#f8fafc] p-3">
            <p className="text-[11px] font-bold text-[#64748b] mb-2 flex items-center gap-1">
              <Sparkles className="size-3.5" style={{ color: primaryColor }} />
              <span>معاينة حية لشريط العنوان:</span>
            </p>
            <div className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-white p-2.5 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div
                  className="grid size-8 place-items-center rounded-lg text-white overflow-hidden shadow-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="size-full object-contain p-0.5" />
                  ) : (
                    <Building2 className="size-4.5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black text-[#171717]">{appName || 'اسم النظام'}</h3>
                    <span
                      className="rounded px-1.5 py-0.2 text-[9px] font-bold"
                      style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                    >
                      {badgeText || 'CODE'}
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold text-[#666]">{instituteName || 'اسم المعهد'}</p>
                </div>
              </div>

              <button
                type="button"
                className="rounded-lg px-3 py-1 text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                زر تجريبي
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Official Signatories */}
        <div className="rounded-2xl border border-[#dededb] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-[#ecece9] pb-3 mb-3">
            <div
              className="grid size-9 place-items-center rounded-xl text-white shadow-xs"
              style={{ backgroundColor: primaryColor }}
            >
              <UserCog className="size-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#171717]">إعدادات التوقيعات الرسمية المعتمدة</h2>
              <p className="text-[11px] font-semibold text-[#777]">
                هذه الأسماء تظهر تلقائياً أسفل كشوف التوزيع المطبوعة والمصدرة
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-bold">
            <div>
              <label className="text-[#555] block mb-1">اسم رئيس لجنة الجداول:</label>
              <input
                type="text"
                value={sigTables}
                onChange={(e) => setSigTables(e.target.value)}
                className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2.5 text-xs font-bold text-[#171717] outline-none focus:border-[#1f4d78]"
              />
            </div>

            <div>
              <label className="text-[#555] block mb-1">اسم مدير النظام ورئيس الكنترول:</label>
              <input
                type="text"
                value={sigSystem}
                onChange={(e) => setSigSystem(e.target.value)}
                className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2.5 text-xs font-bold text-[#171717] outline-none focus:border-[#1f4d78]"
              />
            </div>

            <div>
              <label className="text-[#555] block mb-1">اسم عميد المعهد:</label>
              <input
                type="text"
                value={sigDean}
                onChange={(e) => setSigDean(e.target.value)}
                className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2.5 text-xs font-bold text-[#171717] outline-none focus:border-[#1f4d78]"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-black text-white shadow-sm hover:opacity-90 transition"
            style={{ backgroundColor: primaryColor }}
          >
            <Save className="size-4" />
            <span>حفظ واعتماد جميع الإعدادات والهوية</span>
          </button>
        </div>
      </form>
    </div>
  )
}
