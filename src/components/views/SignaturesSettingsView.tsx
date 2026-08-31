import React, { useState } from 'react'
import type { PrintSignatures, SystemBranding } from '../../types/control'
import {
  Save,
  UserCog,
  Palette,
  Building2,
  Upload,
  Trash2,
  Check,
  Sparkles,
  Calendar,
  Plus,
  Download,
  FileUp,
  RotateCcw,
  ShieldCheck,
  Clock,
  Briefcase,
  ListOrdered,
} from 'lucide-react'

interface SettingsViewProps {
  signatures: PrintSignatures
  branding: SystemBranding
  academicYears: string[]
  currentYear: string
  periods: string[]
  departments: string[]
  jobTitles: string[]
  controlStages: string[]
  onSaveSignatures: (sigs: PrintSignatures) => void
  onSaveBranding: (branding: SystemBranding) => void
  onAddAcademicYear?: (year: string) => void
  onDeleteAcademicYear?: (year: string) => void
  onSetCurrentYear?: (year: string) => void
  onAddPeriod?: (period: string) => void
  onDeletePeriod?: (period: string) => void
  onAddDepartment?: (dept: string) => void
  onDeleteDepartment?: (dept: string) => void
  onAddJobTitle?: (job: string) => void
  onDeleteJobTitle?: (job: string) => void
  onUpdateControlStages?: (stages: string[]) => void
  onExportBackup?: () => void
  onImportBackup?: (jsonStr: string) => boolean
  onResetToDefaults?: () => void
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
  academicYears,
  currentYear,
  periods,
  departments,
  jobTitles,
  controlStages,
  onSaveSignatures,
  onSaveBranding,
  onAddAcademicYear,
  onDeleteAcademicYear,
  onSetCurrentYear,
  onAddPeriod,
  onDeletePeriod,
  onAddDepartment,
  onDeleteDepartment,
  onAddJobTitle,
  onDeleteJobTitle,
  onUpdateControlStages,
  onExportBackup,
  onImportBackup,
  onResetToDefaults,
}) => {
  // Navigation subtabs inside Settings
  const [activeTab, setActiveTab] = useState<
    'branding' | 'signatures' | 'periods' | 'departments' | 'stages' | 'years' | 'backup'
  >('branding')

  // Signatures State
  const [sigTables, setSigTables] = useState(signatures.sigTables)
  const [sigSystem, setSigSystem] = useState(signatures.sigSystem)
  const [sigDean, setSigDean] = useState(signatures.sigDean)
  const [sigTablesRole, setSigTablesRole] = useState(signatures.sigTablesRole || 'رئيس لجنة الجداول')
  const [sigSystemRole, setSigSystemRole] = useState(signatures.sigSystemRole || 'مدير النظام ورئيس الكنترول')
  const [sigDeanRole, setSigDeanRole] = useState(signatures.sigDeanRole || 'عميد المعهد')

  // Branding State
  const [appName, setAppName] = useState(branding.appName)
  const [instituteName, setInstituteName] = useState(branding.instituteName)
  const [badgeText, setBadgeText] = useState(branding.badgeText)
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl || '')
  const [primaryColor, setPrimaryColor] = useState(branding.primaryColor || '#1f4d78')
  const [headerLine1, setHeaderLine1] = useState(branding.headerLine1 || 'وزارة التعليم العالي')
  const [headerLine2, setHeaderLine2] = useState(branding.headerLine2 || 'المعهد العالي للهندسة والتكنولوجيا')
  const [headerLine3, setHeaderLine3] = useState(branding.headerLine3 || 'إدارة الكنترول والجداول الامتحانية')

  // Dynamic Inputs
  const [newYearInput, setNewYearInput] = useState('')
  const [newPeriodInput, setNewPeriodInput] = useState('')
  const [newDeptInput, setNewDeptInput] = useState('')
  const [newJobInput, setNewJobInput] = useState('')
  const [editableStages, setEditableStages] = useState<string[]>(controlStages)

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

  // Handle Import JSON Backup File
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImportBackup) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        if (text) {
          const success = onImportBackup(text)
          if (success) {
            alert('تم استيراد واستعادة البيانات بنجاح ✓')
          } else {
            alert('خطأ: ملف النسخة الاحتياطية غير صالح')
          }
        }
      }
      reader.readAsText(file)
    }
  }

  const handleAddYear = () => {
    if (newYearInput.trim() && onAddAcademicYear) {
      onAddAcademicYear(newYearInput.trim())
      setNewYearInput('')
    }
  }

  const handleAddPeriod = () => {
    if (newPeriodInput.trim() && onAddPeriod) {
      onAddPeriod(newPeriodInput.trim())
      setNewPeriodInput('')
    }
  }

  const handleAddDept = () => {
    if (newDeptInput.trim() && onAddDepartment) {
      onAddDepartment(newDeptInput.trim())
      setNewDeptInput('')
    }
  }

  const handleAddJob = () => {
    if (newJobInput.trim() && onAddJobTitle) {
      onAddJobTitle(newJobInput.trim())
      setNewJobInput('')
    }
  }

  const handleStageChange = (index: number, val: string) => {
    const next = [...editableStages]
    next[index] = val
    setEditableStages(next)
  }

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveSignatures({
      sigTables,
      sigSystem,
      sigDean,
      sigTablesRole,
      sigSystemRole,
      sigDeanRole,
    })
    onSaveBranding({
      appName: appName.trim(),
      instituteName: instituteName.trim(),
      badgeText: badgeText.trim(),
      logoUrl,
      primaryColor,
      headerLine1: headerLine1.trim(),
      headerLine2: headerLine2.trim(),
      headerLine3: headerLine3.trim(),
    })
    if (onUpdateControlStages) {
      onUpdateControlStages(editableStages)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto p-3">
      <form onSubmit={handleSaveAll} className="mx-auto flex w-full max-w-5xl flex-col gap-3">
        {/* Settings Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[#dededb] bg-white p-1.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
              activeTab === 'branding'
                ? 'bg-[#1f4d78] text-white shadow-xs'
                : 'text-[#555] hover:bg-[#f0f0ee]'
            }`}
          >
            <Palette className="size-3.5" />
            <span>الهوية والمظهر</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('signatures')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
              activeTab === 'signatures'
                ? 'bg-[#1f4d78] text-white shadow-xs'
                : 'text-[#555] hover:bg-[#f0f0ee]'
            }`}
          >
            <UserCog className="size-3.5" />
            <span>التوقيعات والترويسة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('periods')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
              activeTab === 'periods'
                ? 'bg-[#1f4d78] text-white shadow-xs'
                : 'text-[#555] hover:bg-[#f0f0ee]'
            }`}
          >
            <Clock className="size-3.5" />
            <span>فترات الامتحانات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('departments')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
              activeTab === 'departments'
                ? 'bg-[#1f4d78] text-white shadow-xs'
                : 'text-[#555] hover:bg-[#f0f0ee]'
            }`}
          >
            <Briefcase className="size-3.5" />
            <span>الأقسام والوظائف</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stages')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
              activeTab === 'stages'
                ? 'bg-[#1f4d78] text-white shadow-xs'
                : 'text-[#555] hover:bg-[#f0f0ee]'
            }`}
          >
            <ListOrdered className="size-3.5" />
            <span>بنود الكنترول الـ 14</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('years')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
              activeTab === 'years'
                ? 'bg-[#1f4d78] text-white shadow-xs'
                : 'text-[#555] hover:bg-[#f0f0ee]'
            }`}
          >
            <Calendar className="size-3.5" />
            <span>الأعوام الجامعية</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-[#1f4d78] text-white shadow-xs'
                : 'text-[#555] hover:bg-[#f0f0ee]'
            }`}
          >
            <ShieldCheck className="size-3.5" />
            <span>النسخ الاحتياطي</span>
          </button>
        </div>

        {/* Tab 1: Branding & Theme */}
        {activeTab === 'branding' && (
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
                          className="flex items-center justify-center gap-1 rounded-lg border border-[#fee2e2] bg-[#fff5f5] px-2 py-1 text-[11px] font-bold text-[#c5221f] hover:bg-[#fee2e2] transition cursor-pointer"
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
                          className={`flex items-center gap-1.5 rounded-lg border p-1.5 text-[11px] font-bold transition text-right cursor-pointer ${
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
        )}

        {/* Tab 2: Signatures & Official Print Headers */}
        {activeTab === 'signatures' && (
          <div className="flex flex-col gap-3">
            {/* Signatures */}
            <div className="rounded-2xl border border-[#dededb] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-[#ecece9] pb-3 mb-3">
                <div
                  className="grid size-9 place-items-center rounded-xl text-white shadow-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  <UserCog className="size-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-[#171717]">إعدادات التوقيعات الرسمية والمسميات</h2>
                  <p className="text-[11px] font-semibold text-[#777]">
                    تخصيص أسماء المسؤولين ومسمياتهم الوظيفية أسفل الكشوف المطبوعة
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-bold">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#555]">المسمى الوظيفي (1):</label>
                  <input
                    type="text"
                    value={sigTablesRole}
                    onChange={(e) => setSigTablesRole(e.target.value)}
                    className="h-7.5 w-full rounded-lg border border-[#cfcfcb] px-2 text-xs font-semibold"
                  />
                  <label className="text-[#555]">اسم المسؤول:</label>
                  <input
                    type="text"
                    value={sigTables}
                    onChange={(e) => setSigTables(e.target.value)}
                    className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2.5 text-xs font-bold text-[#171717]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[#555]">المسمى الوظيفي (2):</label>
                  <input
                    type="text"
                    value={sigSystemRole}
                    onChange={(e) => setSigSystemRole(e.target.value)}
                    className="h-7.5 w-full rounded-lg border border-[#cfcfcb] px-2 text-xs font-semibold"
                  />
                  <label className="text-[#555]">اسم المسؤول:</label>
                  <input
                    type="text"
                    value={sigSystem}
                    onChange={(e) => setSigSystem(e.target.value)}
                    className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2.5 text-xs font-bold text-[#171717]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[#555]">المسمى الوظيفي (3):</label>
                  <input
                    type="text"
                    value={sigDeanRole}
                    onChange={(e) => setSigDeanRole(e.target.value)}
                    className="h-7.5 w-full rounded-lg border border-[#cfcfcb] px-2 text-xs font-semibold"
                  />
                  <label className="text-[#555]">اسم المسؤول:</label>
                  <input
                    type="text"
                    value={sigDean}
                    onChange={(e) => setSigDean(e.target.value)}
                    className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2.5 text-xs font-bold text-[#171717]"
                  />
                </div>
              </div>
            </div>

            {/* 3-Line Print Header Customizer */}
            <div className="rounded-2xl border border-[#dededb] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-[#ecece9] pb-3 mb-3">
                <div
                  className="grid size-9 place-items-center rounded-xl text-white shadow-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Building2 className="size-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-[#171717]">ترويسة الطباعة الرسمية (أعلى يمين الكشف)</h2>
                  <p className="text-[11px] font-semibold text-[#777]">
                    تخصيص أسطر الترويسة المطبوعة في أعلى الكشوف الرسمية A4
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-bold">
                <div>
                  <label className="text-[#555] block mb-1">السطر الأول (الجهة / الوزارة):</label>
                  <input
                    type="text"
                    value={headerLine1}
                    onChange={(e) => setHeaderLine1(e.target.value)}
                    className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2.5 text-xs font-bold text-[#171717]"
                  />
                </div>

                <div>
                  <label className="text-[#555] block mb-1">السطر الثاني (المعهد / الكلية):</label>
                  <input
                    type="text"
                    value={headerLine2}
                    onChange={(e) => setHeaderLine2(e.target.value)}
                    className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2.5 text-xs font-bold text-[#171717]"
                  />
                </div>

                <div>
                  <label className="text-[#555] block mb-1">السطر الثالث (الإدارة / الكنترول):</label>
                  <input
                    type="text"
                    value={headerLine3}
                    onChange={(e) => setHeaderLine3(e.target.value)}
                    className="h-8.5 w-full rounded-lg border border-[#cfcfcb] px-2.5 text-xs font-bold text-[#171717]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Exam Periods Management */}
        {activeTab === 'periods' && (
          <div className="rounded-2xl border border-[#dededb] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-[#ecece9] pb-3 mb-3">
              <div
                className="grid size-9 place-items-center rounded-xl text-white shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                <Clock className="size-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#171717]">إدارة فترات ومواعيد الامتحانات</h2>
                <p className="text-[11px] font-semibold text-[#777]">
                  إضافة وحذف وتعديل فترات الامتحانات اليومية وتحديد مواعيدها
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-xs font-bold">
              <div className="flex flex-wrap gap-2">
                {periods.map((p) => (
                  <div
                    key={p}
                    className="flex items-center gap-2 rounded-xl border border-[#cfcfcb] bg-[#fafaf8] px-3 py-1.5 text-xs font-bold text-[#171717]"
                  >
                    <span>{p}</span>
                    {periods.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeletePeriod && onDeletePeriod(p)}
                        className="rounded-full text-[#aaa] hover:bg-[#fee2e2] hover:text-[#c5221f] p-0.5 transition cursor-pointer"
                        title="حذف هذه الفترة"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Period Input */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="مثال: الفترة الرابعة (4:30 - 6:30)"
                  value={newPeriodInput}
                  onChange={(e) => setNewPeriodInput(e.target.value)}
                  className="h-8.5 w-72 rounded-lg border border-[#cfcfcb] px-2.5 text-xs font-bold text-[#171717] outline-none focus:border-[#1f4d78]"
                />
                <button
                  type="button"
                  onClick={handleAddPeriod}
                  disabled={!newPeriodInput.trim()}
                  className="flex items-center gap-1 rounded-lg bg-[#1f4d78] px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50 transition cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>إضافة فترة جديدة</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Departments & Job Titles */}
        {activeTab === 'departments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Departments */}
            <div className="rounded-2xl border border-[#dededb] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-[#ecece9] pb-3 mb-3">
                <div
                  className="grid size-8 place-items-center rounded-xl text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Briefcase className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#171717]">الأقسام والشعب العلمية</h3>
                  <p className="text-[10.5px] font-semibold text-[#777]">إدارة الأقسام المتاحة للمقررات</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-xs font-bold">
                <div className="flex flex-col gap-1.5 max-h-56 overflow-auto">
                  {departments.map((d) => (
                    <div
                      key={d}
                      className="flex items-center justify-between rounded-lg border border-[#cfcfcb] bg-[#fafaf8] px-2.5 py-1.5"
                    >
                      <span>{d}</span>
                      {departments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteDepartment && onDeleteDepartment(d)}
                          className="text-[#aaa] hover:text-[#c5221f] transition cursor-pointer"
                          title="حذف القسم"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 mt-2">
                  <input
                    type="text"
                    placeholder="اسم القسم الجديد..."
                    value={newDeptInput}
                    onChange={(e) => setNewDeptInput(e.target.value)}
                    className="h-8 w-full rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddDept}
                    disabled={!newDeptInput.trim()}
                    className="rounded-lg bg-[#1f4d78] px-3 py-1.5 text-xs font-bold text-white shrink-0 disabled:opacity-50"
                  >
                    إضافة
                  </button>
                </div>
              </div>
            </div>

            {/* Job Titles */}
            <div className="rounded-2xl border border-[#dededb] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-[#ecece9] pb-3 mb-3">
                <div
                  className="grid size-8 place-items-center rounded-xl text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <UserCog className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#171717]">الدرجات والفئات الوظيفية</h3>
                  <p className="text-[10.5px] font-semibold text-[#777]">إدارة المسميات الوظيفية للمراقبين</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-xs font-bold">
                <div className="flex flex-col gap-1.5 max-h-56 overflow-auto">
                  {jobTitles.map((j) => (
                    <div
                      key={j}
                      className="flex items-center justify-between rounded-lg border border-[#cfcfcb] bg-[#fafaf8] px-2.5 py-1.5"
                    >
                      <span>{j}</span>
                      {jobTitles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteJobTitle && onDeleteJobTitle(j)}
                          className="text-[#aaa] hover:text-[#c5221f] transition cursor-pointer"
                          title="حذف الوظيفة"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 mt-2">
                  <input
                    type="text"
                    placeholder="اسم الدرجة الوظيفية..."
                    value={newJobInput}
                    onChange={(e) => setNewJobInput(e.target.value)}
                    className="h-8 w-full rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddJob}
                    disabled={!newJobInput.trim()}
                    className="rounded-lg bg-[#1f4d78] px-3 py-1.5 text-xs font-bold text-white shrink-0 disabled:opacity-50"
                  >
                    إضافة
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: 14 Control Stages Customizer */}
        {activeTab === 'stages' && (
          <div className="rounded-2xl border border-[#dededb] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-[#ecece9] pb-3 mb-3">
              <div
                className="grid size-9 place-items-center rounded-xl text-white shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                <ListOrdered className="size-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#171717]">تخصيص مسميات مراحل أعمال الكنترول (14 بند)</h2>
                <p className="text-[11px] font-semibold text-[#777]">
                  تعديل نصوص وعناوين بنود الكنترول الـ 14 لتطابق اللائحة الداخلية للمعهد بدقة
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs font-bold">
              {editableStages.map((stage, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-lg border border-[#cfcfcb] p-2 bg-[#fafaf8]">
                  <span className="grid size-6 shrink-0 place-items-center rounded bg-[#1f4d78] text-[10px] font-black text-white">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={stage}
                    onChange={(e) => handleStageChange(idx, e.target.value)}
                    className="h-7 w-full rounded border border-[#cfcfcb] bg-white px-2 text-xs font-bold outline-none focus:border-[#1f4d78]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Academic Years */}
        {activeTab === 'years' && (
          <div className="rounded-2xl border border-[#dededb] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-[#ecece9] pb-3 mb-3">
              <div
                className="grid size-9 place-items-center rounded-xl text-white shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                <Calendar className="size-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#171717]">إدارة الأعوام الجامعية المعتمدة</h2>
                <p className="text-[11px] font-semibold text-[#777]">
                  إضافة وحذف وتعيين العام الجامعي النشط حالياً في النظام
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
              {/* List of Years */}
              <div className="flex flex-wrap items-center gap-2">
                {academicYears.map((y) => (
                  <div
                    key={y}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 transition ${
                      y === currentYear
                        ? 'border-[#1f4d78] bg-[#eef3f8] text-[#1f4d78] ring-1 ring-[#1f4d78]'
                        : 'border-[#cfcfcb] bg-[#fafaf8] text-[#333]'
                    }`}
                  >
                    <span
                      onClick={() => onSetCurrentYear && onSetCurrentYear(y)}
                      className="cursor-pointer font-black"
                      title="تعيين كعام نشط"
                    >
                      {y} {y === currentYear && '(النشط حالياً)'}
                    </span>
                    {academicYears.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteAcademicYear && onDeleteAcademicYear(y)}
                        className="rounded-full text-[#aaa] hover:bg-[#fee2e2] hover:text-[#c5221f] p-0.5 transition cursor-pointer"
                        title="حذف هذا العام"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Academic Year */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="مثال: 2026 - 2027"
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value)}
                  className="h-8 w-36 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold outline-none focus:border-[#1f4d78]"
                />
                <button
                  type="button"
                  onClick={handleAddYear}
                  disabled={!newYearInput.trim()}
                  className="flex items-center gap-1 rounded-lg bg-[#1f4d78] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50 transition cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>إضافة عام</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Backup & Data Recovery */}
        {activeTab === 'backup' && (
          <div className="rounded-2xl border border-[#dededb] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-[#ecece9] pb-3 mb-3">
              <div
                className="grid size-9 place-items-center rounded-xl text-white shadow-xs"
                style={{ backgroundColor: '#0f766e' }}
              >
                <ShieldCheck className="size-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#171717]">إدارة النسخ الاحتياطي وحماية البيانات</h2>
                <p className="text-[11px] font-semibold text-[#777]">
                  تصدير واستيراد وحفظ نسخ احتياطية كاملة لجميع بيانات الجداول والكنترول
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Export Backup */}
                {onExportBackup && (
                  <button
                    type="button"
                    onClick={onExportBackup}
                    className="flex items-center gap-1.5 rounded-xl border border-[#cfcfcb] bg-[#fafaf8] px-3.5 py-2 text-xs font-bold text-[#171717] hover:bg-[#eaeae7] transition cursor-pointer"
                  >
                    <Download className="size-4 text-[#1f4d78]" />
                    <span>تصدير نسخة احتياطية (JSON)</span>
                  </button>
                )}

                {/* Import Backup */}
                {onImportBackup && (
                  <label className="flex items-center gap-1.5 rounded-xl border border-[#cfcfcb] bg-[#fafaf8] px-3.5 py-2 text-xs font-bold text-[#171717] hover:bg-[#eaeae7] transition cursor-pointer">
                    <FileUp className="size-4 text-[#059669]" />
                    <span>استيراد واستعادة ملف (JSON)</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Reset to Factory Defaults */}
              {onResetToDefaults && (
                <button
                  type="button"
                  onClick={onResetToDefaults}
                  className="flex items-center gap-1.5 rounded-xl border border-[#fee2e2] bg-[#fff5f5] px-3.5 py-2 text-xs font-bold text-[#c5221f] hover:bg-[#fee2e2] transition cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  <span>استعادة البيانات الأصلية</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Global Save Button */}
        <div className="flex items-center justify-between rounded-xl bg-white border border-[#dededb] p-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#555]">
            <Sparkles className="size-4" style={{ color: primaryColor }} />
            <span>يتم حفظ جميع التعديلات فورياً محلياً وتلقائياً على قاعدة البيانات السحابية</span>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-black text-white shadow-sm hover:opacity-90 transition cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            <Save className="size-4" />
            <span>حفظ واعتماد التعديلات</span>
          </button>
        </div>
      </form>
    </div>
  )
}
