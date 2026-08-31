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
  GraduationCap,
  DoorOpen,
  CalendarDays,
  FileText,
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
  semesters?: string[]
  currentSemester?: string
  studyLevels?: string[]
  buildings?: string[]
  floors?: string[]
  workDays?: string[]
  roleQuotas?: Record<string, number>
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
  onAddSemester?: (sem: string) => void
  onDeleteSemester?: (sem: string) => void
  onSetCurrentSemester?: (sem: string) => void
  onAddStudyLevel?: (lvl: string) => void
  onDeleteStudyLevel?: (lvl: string) => void
  onAddBuilding?: (b: string) => void
  onDeleteBuilding?: (b: string) => void
  onAddFloor?: (f: string) => void
  onDeleteFloor?: (f: string) => void
  onToggleWorkDay?: (day: string) => void
  onUpdateRoleQuota?: (job: string, hours: number) => void
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

const ALL_WEEK_DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

export const SignaturesSettingsView: React.FC<SettingsViewProps> = ({
  signatures,
  branding,
  academicYears,
  currentYear,
  periods,
  departments,
  jobTitles,
  controlStages,
  semesters = ['الفصل الدراسي الأول', 'الفصل الدراسي الثاني', 'الفصل الصيفي (Summer)', 'امتحانات التخلفات والتكميلي'],
  currentSemester = 'الفصل الدراسي الثاني',
  studyLevels = ['إعدادي', 'الفرقة الأولى', 'الفرقة الثانية', 'الفرقة الثالثة', 'الفرقة الرابعة', 'دراسات عليا'],
  buildings = ['مبنى الهندسة الرئيسي (أ)', 'مبنى الورش والمعامل (ب)', 'مبنى المدرجات المركزي (ج)', 'مبنى إدارة المعهد'],
  floors = ['البدروم', 'الدور الأرضي', 'الدور الأول', 'الدور الثاني', 'الدور الثالث', 'الدور الرابع'],
  workDays = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
  roleQuotas = {},
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
  onAddSemester,
  onDeleteSemester,
  onSetCurrentSemester,
  onAddStudyLevel,
  onDeleteStudyLevel,
  onAddBuilding,
  onDeleteBuilding,
  onAddFloor,
  onDeleteFloor,
  onToggleWorkDay,
  onUpdateRoleQuota,
  onExportBackup,
  onImportBackup,
  onResetToDefaults,
}) => {
  // Navigation subtabs inside Settings
  const [activeTab, setActiveTab] = useState<
    'branding' | 'signatures' | 'academics' | 'periods' | 'facilities' | 'roles' | 'stages' | 'backup'
  >('branding')

  // Signatures State
  const [sigTables, setSigTables] = useState(signatures.sigTables)
  const [sigSystem, setSigSystem] = useState(signatures.sigSystem)
  const [sigDean, setSigDean] = useState(signatures.sigDean)
  const [sigTablesRole, setSigTablesRole] = useState(signatures.sigTablesRole || 'رئيس لجنة الجداول')
  const [sigSystemRole, setSigSystemRole] = useState(signatures.sigSystemRole || 'مدير النظام ورئيس الكنترول')
  const [sigDeanRole, setSigDeanRole] = useState(signatures.sigDeanRole || 'عميد المعهد')
  const [printNotice, setPrintNotice] = useState(
    signatures.printNotice ||
      'تنبيه هام: يُرجى من السادة المراقبين التواجد بمقر اللجنة قبل موعد بدء الامتحان بنصف ساعة على الأقل، واستلام كراسات الإجابة وأوراق الأسئلة وتوزيعها بدقة، وتطبيق قواعد الامتحانات والكنترول، وعدم مغادرة مقر اللجنة إلا بعد تسليم كامل أوراق الإجابة ومحاضر الغياب للكنترول.'
  )

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
  const [newSemesterInput, setNewSemesterInput] = useState('')
  const [newLevelInput, setNewLevelInput] = useState('')
  const [newPeriodInput, setNewPeriodInput] = useState('')
  const [newDeptInput, setNewDeptInput] = useState('')
  const [newJobInput, setNewJobInput] = useState('')
  const [newBuildingInput, setNewBuildingInput] = useState('')
  const [newFloorInput, setNewFloorInput] = useState('')
  const [newStageInput, setNewStageInput] = useState('')
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

  const handleAddSemester = () => {
    if (newSemesterInput.trim() && onAddSemester) {
      onAddSemester(newSemesterInput.trim())
      setNewSemesterInput('')
    }
  }

  const handleAddLevel = () => {
    if (newLevelInput.trim() && onAddStudyLevel) {
      onAddStudyLevel(newLevelInput.trim())
      setNewLevelInput('')
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

  const handleAddBuilding = () => {
    if (newBuildingInput.trim() && onAddBuilding) {
      onAddBuilding(newBuildingInput.trim())
      setNewBuildingInput('')
    }
  }

  const handleAddFloor = () => {
    if (newFloorInput.trim() && onAddFloor) {
      onAddFloor(newFloorInput.trim())
      setNewFloorInput('')
    }
  }

  const handleAddStage = () => {
    if (newStageInput.trim()) {
      const next = [...editableStages, newStageInput.trim()]
      setEditableStages(next)
      setNewStageInput('')
      if (onUpdateControlStages) onUpdateControlStages(next)
    }
  }

  const handleDeleteStage = (index: number) => {
    if (editableStages.length <= 1) return
    const next = editableStages.filter((_, idx) => idx !== index)
    setEditableStages(next)
    if (onUpdateControlStages) onUpdateControlStages(next)
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
      printNotice,
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
            onClick={() => setActiveTab('academics')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
              activeTab === 'academics'
                ? 'bg-[#1f4d78] text-white shadow-xs'
                : 'text-[#555] hover:bg-[#f0f0ee]'
            }`}
          >
            <GraduationCap className="size-3.5" />
            <span>الأعوام والفصول والفرق</span>
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
            <span>فترات الامتحانات وأيام العمل</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('facilities')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
              activeTab === 'facilities'
                ? 'bg-[#1f4d78] text-white shadow-xs'
                : 'text-[#555] hover:bg-[#f0f0ee]'
            }`}
          >
            <Building2 className="size-3.5" />
            <span>الأقسام والمباني والقاعات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-[#1f4d78] text-white shadow-xs'
                : 'text-[#555] hover:bg-[#f0f0ee]'
            }`}
          >
            <Briefcase className="size-3.5" />
            <span>الوظائف والأنصبة</span>
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
            <span>مراحل وبنود الكنترول</span>
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

              <div className="flex flex-col gap-3">
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
          </div>
        )}

        {/* Tab 2: Signatures & Official Print Headers */}
        {activeTab === 'signatures' && (
          <div className="flex flex-col gap-3">
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

            {/* Official Print Directive / Notice */}
            <div className="rounded-2xl border border-[#dededb] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-[#ecece9] pb-3 mb-3">
                <div
                  className="grid size-9 place-items-center rounded-xl text-white shadow-xs"
                  style={{ backgroundColor: '#0284c7' }}
                >
                  <FileText className="size-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-[#171717]">ملاحظات وتنبيهات الكشوف المطبوعة (Print Notice)</h2>
                  <p className="text-[11px] font-semibold text-[#777]">
                    النص التوجيهي المطبوع أسفل كشوف الحضور والغياب الرسمية للمراقبين
                  </p>
                </div>
              </div>

              <div>
                <textarea
                  rows={3}
                  value={printNotice}
                  onChange={(e) => setPrintNotice(e.target.value)}
                  placeholder="اكتب التنبيهات والتعليمات الرسمية..."
                  className="w-full rounded-xl border border-[#cfcfcb] p-2.5 text-xs font-semibold text-[#171717] outline-none focus:border-[#1f4d78]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Academics (Years, Semesters, Study Levels) */}
        {activeTab === 'academics' && (
          <div className="flex flex-col gap-4">
            {/* Academic Years */}
            <div className="rounded-2xl border border-[#dededb] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-[#ecece9] pb-3 mb-3">
                <div
                  className="grid size-8 place-items-center rounded-xl text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Calendar className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#171717]">الأعوام الجامعية المعتمدة</h3>
                  <p className="text-[10.5px] font-semibold text-[#777]">إضافة وحذف وتعيين العام الجامعي النشط</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
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

                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="مثال: 2026 - 2027"
                    value={newYearInput}
                    onChange={(e) => setNewYearInput(e.target.value)}
                    className="h-8 w-36 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddYear}
                    disabled={!newYearInput.trim()}
                    className="flex items-center gap-1 rounded-lg bg-[#1f4d78] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50 transition cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>إضافة</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Semesters & Exam Terms */}
            <div className="rounded-2xl border border-[#dededb] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-[#ecece9] pb-3 mb-3">
                <div
                  className="grid size-8 place-items-center rounded-xl text-white"
                  style={{ backgroundColor: '#059669' }}
                >
                  <CalendarDays className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#171717]">الفصول والأدوار الامتحانية (Semesters)</h3>
                  <p className="text-[10.5px] font-semibold text-[#777]">إدارة فصول الامتحانات وتحديد الفصل النشط</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
                <div className="flex flex-wrap items-center gap-2">
                  {semesters.map((s) => (
                    <div
                      key={s}
                      className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 transition ${
                        s === currentSemester
                          ? 'border-[#059669] bg-[#ecfdf5] text-[#059669] ring-1 ring-[#059669]'
                          : 'border-[#cfcfcb] bg-[#fafaf8] text-[#333]'
                      }`}
                    >
                      <span
                        onClick={() => onSetCurrentSemester && onSetCurrentSemester(s)}
                        className="cursor-pointer font-black"
                        title="تعيين كفصل نشط"
                      >
                        {s} {s === currentSemester && '(النشط)'}
                      </span>
                      {semesters.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteSemester && onDeleteSemester(s)}
                          className="rounded-full text-[#aaa] hover:bg-[#fee2e2] hover:text-[#c5221f] p-0.5 transition cursor-pointer"
                          title="حذف هذا الفصل"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="مثال: دور سبتمبر التكميلي"
                    value={newSemesterInput}
                    onChange={(e) => setNewSemesterInput(e.target.value)}
                    className="h-8 w-44 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddSemester}
                    disabled={!newSemesterInput.trim()}
                    className="flex items-center gap-1 rounded-lg bg-[#059669] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50 transition cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>إضافة</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Study Levels / Stages */}
            <div className="rounded-2xl border border-[#dededb] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-[#ecece9] pb-3 mb-3">
                <div
                  className="grid size-8 place-items-center rounded-xl text-white"
                  style={{ backgroundColor: '#7c3aed' }}
                >
                  <GraduationCap className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#171717]">الفرق والمستويات الدراسية (Study Levels)</h3>
                  <p className="text-[10.5px] font-semibold text-[#777]">الفرق الدراسية المتاحة عند تسجيل المقررات وجداول الامتحانات</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
                <div className="flex flex-wrap items-center gap-2">
                  {studyLevels.map((lvl) => (
                    <div
                      key={lvl}
                      className="flex items-center gap-1.5 rounded-xl border border-[#cfcfcb] bg-[#fafaf8] px-3 py-1.5 text-[#333]"
                    >
                      <span className="font-black">{lvl}</span>
                      {studyLevels.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteStudyLevel && onDeleteStudyLevel(lvl)}
                          className="rounded-full text-[#aaa] hover:bg-[#fee2e2] hover:text-[#c5221f] p-0.5 transition cursor-pointer"
                          title="حذف هذه الفرقة"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="مثال: الفرقة الخامسة"
                    value={newLevelInput}
                    onChange={(e) => setNewLevelInput(e.target.value)}
                    className="h-8 w-36 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddLevel}
                    disabled={!newLevelInput.trim()}
                    className="flex items-center gap-1 rounded-lg bg-[#7c3aed] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50 transition cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>إضافة</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Periods & Working Exam Days */}
        {activeTab === 'periods' && (
          <div className="flex flex-col gap-4">
            {/* Exam Periods */}
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

            {/* Working Exam Days Selector */}
            <div className="rounded-2xl border border-[#dededb] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-[#ecece9] pb-3 mb-3">
                <div
                  className="grid size-9 place-items-center rounded-xl text-white shadow-xs"
                  style={{ backgroundColor: '#0284c7' }}
                >
                  <CalendarDays className="size-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-[#171717]">أيام العمل وجدول الامتحانات الأسبوعي</h2>
                  <p className="text-[11px] font-semibold text-[#777]">
                    تحديد أيام الأسبوع المعتمدة لعقد لجان الامتحانات وتوزيع الملاحظات
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
                {ALL_WEEK_DAYS.map((day) => {
                  const isActive = workDays.includes(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => onToggleWorkDay && onToggleWorkDay(day)}
                      className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 transition cursor-pointer ${
                        isActive
                          ? 'border-[#0284c7] bg-[#f0f9ff] text-[#0284c7] font-black ring-1 ring-[#0284c7]'
                          : 'border-[#cfcfcb] bg-[#fafaf8] text-[#888]'
                      }`}
                    >
                      <span className={`size-2.5 rounded-full ${isActive ? 'bg-[#0284c7]' : 'bg-[#ccc]'}`} />
                      <span>{day}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Facilities (Departments, Buildings, Floors) */}
        {activeTab === 'facilities' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <h3 className="text-xs font-black text-[#171717]">الأقسام العلمية</h3>
                  <p className="text-[10.5px] font-semibold text-[#777]">الأقسام والتخصصات</p>
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
                    placeholder="اسم القسم..."
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

            {/* Buildings */}
            <div className="rounded-2xl border border-[#dededb] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-[#ecece9] pb-3 mb-3">
                <div
                  className="grid size-8 place-items-center rounded-xl text-white"
                  style={{ backgroundColor: '#059669' }}
                >
                  <Building2 className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#171717]">المباني والمقرات</h3>
                  <p className="text-[10.5px] font-semibold text-[#777]">مباني اللجان والقاعات</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-xs font-bold">
                <div className="flex flex-col gap-1.5 max-h-56 overflow-auto">
                  {buildings.map((b) => (
                    <div
                      key={b}
                      className="flex items-center justify-between rounded-lg border border-[#cfcfcb] bg-[#fafaf8] px-2.5 py-1.5"
                    >
                      <span>{b}</span>
                      {buildings.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteBuilding && onDeleteBuilding(b)}
                          className="text-[#aaa] hover:text-[#c5221f] transition cursor-pointer"
                          title="حذف المبنى"
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
                    placeholder="اسم المبنى..."
                    value={newBuildingInput}
                    onChange={(e) => setNewBuildingInput(e.target.value)}
                    className="h-8 w-full rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddBuilding}
                    disabled={!newBuildingInput.trim()}
                    className="rounded-lg bg-[#059669] px-3 py-1.5 text-xs font-bold text-white shrink-0 disabled:opacity-50"
                  >
                    إضافة
                  </button>
                </div>
              </div>
            </div>

            {/* Floors */}
            <div className="rounded-2xl border border-[#dededb] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-[#ecece9] pb-3 mb-3">
                <div
                  className="grid size-8 place-items-center rounded-xl text-white"
                  style={{ backgroundColor: '#d97706' }}
                >
                  <DoorOpen className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#171717]">الأدوار والطوابق</h3>
                  <p className="text-[10.5px] font-semibold text-[#777]">أدوار القاعات واللجان</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-xs font-bold">
                <div className="flex flex-col gap-1.5 max-h-56 overflow-auto">
                  {floors.map((f) => (
                    <div
                      key={f}
                      className="flex items-center justify-between rounded-lg border border-[#cfcfcb] bg-[#fafaf8] px-2.5 py-1.5"
                    >
                      <span>{f}</span>
                      {floors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteFloor && onDeleteFloor(f)}
                          className="text-[#aaa] hover:text-[#c5221f] transition cursor-pointer"
                          title="حذف الدور"
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
                    placeholder="اسم الدور..."
                    value={newFloorInput}
                    onChange={(e) => setNewFloorInput(e.target.value)}
                    className="h-8 w-full rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddFloor}
                    disabled={!newFloorInput.trim()}
                    className="rounded-lg bg-[#d97706] px-3 py-1.5 text-xs font-bold text-white shrink-0 disabled:opacity-50"
                  >
                    إضافة
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Roles & Standard Quota Hours */}
        {activeTab === 'roles' && (
          <div className="rounded-2xl border border-[#dededb] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-[#ecece9] pb-3 mb-3">
              <div
                className="grid size-9 place-items-center rounded-xl text-white shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                <Briefcase className="size-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#171717]">الدرجات الوظيفية والأنصبة وساعات المراقبة المستهدفة</h2>
                <p className="text-[11px] font-semibold text-[#777]">
                  تحديد المسميات الوظيفية وساعات المراقبة المستهدفة لكل درجة وظيفية
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
              <div className="flex flex-col gap-2">
                <h4 className="font-black text-[#171717]">قائمة الدرجات الوظيفية والأنصبة:</h4>
                <div className="flex flex-col gap-2 max-h-72 overflow-auto">
                  {jobTitles.map((j) => {
                    const targetHours = roleQuotas[j] || 16
                    return (
                      <div
                        key={j}
                        className="flex items-center justify-between rounded-xl border border-[#cfcfcb] bg-[#fafaf8] p-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-black text-[#171717]">{j}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-[#666]">النصاب:</span>
                            <input
                              type="number"
                              min="1"
                              max="60"
                              value={targetHours}
                              onChange={(e) => onUpdateRoleQuota && onUpdateRoleQuota(j, parseInt(e.target.value) || 0)}
                              className="h-7 w-14 rounded-lg border border-[#cfcfcb] bg-white text-center font-mono font-black text-[#1f4d78]"
                            />
                            <span className="text-[11px] text-[#888]">ساعة</span>
                          </div>

                          {jobTitles.length > 1 && (
                            <button
                              type="button"
                              onClick={() => onDeleteJobTitle && onDeleteJobTitle(j)}
                              className="text-[#aaa] hover:text-[#c5221f] transition cursor-pointer p-1"
                              title="حذف هذه الدرجة"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Add New Job Title */}
              <div className="flex flex-col justify-between rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3.5">
                <div>
                  <h4 className="font-black text-[#171717] mb-1">إضافة درجة وظيفية جديدة</h4>
                  <p className="text-[11px] font-semibold text-[#666] mb-3">
                    يمكنك إضافة مسمى وظيفي جديد مثل (أمين سر لجنة، فني معمل، مشرف أمن)
                  </p>

                  <input
                    type="text"
                    placeholder="اسم الدرجة الوظيفية..."
                    value={newJobInput}
                    onChange={(e) => setNewJobInput(e.target.value)}
                    className="h-8.5 w-full rounded-lg border border-[#cfcfcb] bg-white px-2.5 text-xs font-bold mb-3"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddJob}
                  disabled={!newJobInput.trim()}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#1f4d78] px-4 py-2 text-xs font-bold text-white disabled:opacity-50 transition cursor-pointer"
                >
                  <Plus className="size-4" />
                  <span>إضافة الدرجة الوظيفية</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Control Stages Customizer */}
        {activeTab === 'stages' && (
          <div className="rounded-2xl border border-[#dededb] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#ecece9] pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="grid size-9 place-items-center rounded-xl text-white shadow-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  <ListOrdered className="size-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-[#171717]">
                    تخصيص وإدارة مراحل أعمال الكنترول ({editableStages.length} بنداً)
                  </h2>
                  <p className="text-[11px] font-semibold text-[#777]">
                    إضافة وحذف وتعديل نصوص وعناوين بنود الكنترول لتطابق اللائحة بدقة
                  </p>
                </div>
              </div>

              {/* Add New Control Stage */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="عنوان بند جديد..."
                  value={newStageInput}
                  onChange={(e) => setNewStageInput(e.target.value)}
                  className="h-8 w-48 rounded-lg border border-[#cfcfcb] px-2 text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={handleAddStage}
                  disabled={!newStageInput.trim()}
                  className="flex items-center gap-1 rounded-lg bg-[#1f4d78] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50 transition cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>إضافة بند</span>
                </button>
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
                  {editableStages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteStage(idx)}
                      className="text-[#aaa] hover:text-[#c5221f] transition p-1 cursor-pointer"
                      title="حذف هذا البند"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 8: Backup & Data Recovery */}
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
          <div className="flex items-center gap-2 text-xs font-bold text-[#666]">
            <Sparkles className="size-4 text-[#888]" />
            <span>يتم حفظ وتطبيق التعديلات فورياً محلياً وسحابياً</span>
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
