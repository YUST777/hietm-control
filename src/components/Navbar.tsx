import React from 'react'
import {
  Printer,
  RotateCcw,
  Download,
  Building2,
  Calendar,
  Users,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Cloud,
  CloudOff,
  RefreshCw,
} from 'lucide-react'
import type { SyncStatus } from '../lib/store'
import type { SystemBranding } from '../types/control'

interface NavbarProps {
  currentYear: string
  setCurrentYear: (y: string) => void
  academicYears: string[]
  currentSemester?: string
  setCurrentSemester?: (s: string) => void
  semesters?: string[]
  totalObservers: number
  totalSubjects: number
  totalCommittees: number
  zoomLevel: number
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>
  syncStatus: SyncStatus
  lastSyncTime: string | null
  branding: SystemBranding
  onManualSync: () => void
  onReset: () => void
  onExport: () => void
  onPrint: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  currentYear,
  setCurrentYear,
  academicYears,
  currentSemester,
  setCurrentSemester,
  semesters,
  totalObservers,
  totalSubjects,
  totalCommittees,
  zoomLevel,
  setZoomLevel,
  syncStatus,
  lastSyncTime,
  branding,
  onManualSync,
  onReset,
  onExport,
  onPrint,
}) => {
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(1.5, parseFloat((prev + 0.05).toFixed(2))))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(0.5, parseFloat((prev - 0.05).toFixed(2))))
  }

  const primaryColor = branding.primaryColor || '#1f4d78'

  return (
    <header className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-[#dededb] bg-white px-4 py-2 shadow-sm print-hide">
      {/* Brand & Crest / Custom Logo */}
      <div className="flex items-center gap-2.5">
        <div
          className="grid size-9 shrink-0 place-items-center rounded-xl text-white shadow-sm overflow-hidden"
          style={{ backgroundColor: primaryColor }}
        >
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt="Logo" className="size-full object-contain p-0.5" />
          ) : (
            <Building2 className="size-5" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-[#171717]">
              {branding.appName || 'وحدة التعليم الإلكتروني — الكنترول وتوزيع المراقبات'}
            </h1>
            <span
              className="rounded-md px-1.5 py-0.2 text-[10px] font-bold"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              {branding.badgeText || 'H.I.E.T'}
            </span>
          </div>
          <p className="text-[11px] font-semibold text-[#666]">
            {branding.instituteName || 'المعهد العالي للهندسة والتكنولوجيا — إدارة الجداول والامتحانات'}
          </p>
        </div>
      </div>

      {/* KPI Badges */}
      <div className="hidden lg:flex items-center gap-2.5">
        <div className="flex items-center gap-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-2 py-0.5 text-[11px] font-bold text-[#334155]">
          <Users className="size-3" style={{ color: primaryColor }} />
          <span>المراقبين:</span>
          <span className="font-black" style={{ color: primaryColor }}>{totalObservers}</span>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-2 py-0.5 text-[11px] font-bold text-[#334155]">
          <BookOpen className="size-3" style={{ color: primaryColor }} />
          <span>المقررات:</span>
          <span className="font-black" style={{ color: primaryColor }}>{totalSubjects}</span>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-2 py-0.5 text-[11px] font-bold text-[#334155]">
          <Building2 className="size-3" style={{ color: primaryColor }} />
          <span>اللجان:</span>
          <span className="font-black" style={{ color: primaryColor }}>{totalCommittees}</span>
        </div>
      </div>

      {/* Actions, Auto-Sync Status, Zoom Presets & Academic Year */}
      <div className="flex items-center gap-1.5">
        {/* Automatic Cloud Sync Status Pill */}
        <button
          type="button"
          onClick={onManualSync}
          className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
            syncStatus === 'synced'
              ? 'border-[#bbf7d0] bg-[#f0fdf4] text-[#155724] hover:bg-[#dcfce7]'
              : syncStatus === 'syncing'
              ? 'border-[#fed7aa] bg-[#fff7ed] text-[#c2410c] hover:bg-[#ffedd5]'
              : 'border-[#fef08a] bg-[#fefce8] text-[#854d0e] hover:bg-[#fef9c3]'
          }`}
          title={
            syncStatus === 'synced'
              ? `متزامن مع قاعدة البيانات السحابية (آخر تحديث: ${lastSyncTime || 'الآن'})`
              : syncStatus === 'syncing'
              ? 'جارٍ التزامن التلقائي مع السحابة...'
              : 'محفوظ محلياً (سيتم الرفع تلقائياً فور توفر الاتصال بالإنترنت)'
          }
        >
          {syncStatus === 'synced' ? (
            <>
              <Cloud className="size-3.5 text-[#155724]" />
              <span className="hidden sm:inline">متزامن مع السحابة</span>
            </>
          ) : syncStatus === 'syncing' ? (
            <>
              <RefreshCw className="size-3.5 animate-spin text-[#c2410c]" />
              <span className="hidden sm:inline">جارٍ التزامن...</span>
            </>
          ) : (
            <>
              <CloudOff className="size-3.5 text-[#854d0e]" />
              <span className="hidden sm:inline">محفوظ محلياً (أوفلاين)</span>
            </>
          )}
        </button>

        {/* Zoom Presets & Controls */}
        <div className="flex items-center gap-0.5 rounded-xl border border-[#cfcfcb] bg-[#f7f7f5] p-0.5">
          <button
            type="button"
            onClick={handleZoomOut}
            title="تصغير (-)"
            className="rounded-lg p-1 text-[#444] hover:bg-[#e6e6e3] transition"
          >
            <ZoomOut className="size-3" />
          </button>

          {/* Quick presets */}
          {[0.7, 0.75, 0.85, 1.0].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setZoomLevel(lvl)}
              className={`rounded-md px-1.5 py-0.5 text-[10.5px] font-black transition tabular-nums ${
                Math.round(zoomLevel * 100) === Math.round(lvl * 100)
                  ? 'text-white shadow-xs'
                  : 'text-[#555] hover:bg-[#e6e6e3]'
              }`}
              style={{
                backgroundColor:
                  Math.round(zoomLevel * 100) === Math.round(lvl * 100)
                    ? primaryColor
                    : 'transparent',
              }}
            >
              {Math.round(lvl * 100)}%
            </button>
          ))}

          <button
            type="button"
            onClick={handleZoomIn}
            title="تكبير (+)"
            className="rounded-lg p-1 text-[#444] hover:bg-[#e6e6e3] transition"
          >
            <ZoomIn className="size-3" />
          </button>
        </div>

        {/* Year Dropdown */}
        <div className="flex items-center gap-1 rounded-xl border border-[#cfcfcb] bg-[#f7f7f5] px-2 py-1">
          <Calendar className="size-3 text-[#666]" />
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(e.target.value)}
            className="bg-transparent text-[11px] font-bold text-[#171717] outline-none cursor-pointer"
          >
            {academicYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Semester Dropdown */}
        {semesters && semesters.length > 0 && setCurrentSemester && (
          <div className="hidden md:flex items-center gap-1 rounded-xl border border-[#cfcfcb] bg-[#f7f7f5] px-2 py-1">
            <select
              value={currentSemester}
              onChange={(e) => setCurrentSemester(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-[#171717] outline-none cursor-pointer"
            >
              {semesters.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Print Button */}
        <button
          type="button"
          onClick={onPrint}
          className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90 transition"
          style={{ backgroundColor: primaryColor }}
        >
          <Printer className="size-3.5" />
          <span>طباعة</span>
        </button>

        {/* Export Backup */}
        <button
          type="button"
          onClick={onExport}
          title="تصدير نسخة احتياطية من البيانات"
          className="flex items-center gap-1 rounded-xl border border-[#dededb] bg-white px-2 py-1.5 text-xs font-bold text-[#555] hover:bg-[#f0f0ee] transition"
        >
          <Download className="size-3.5" />
        </button>

        {/* Reset Defaults */}
        <button
          type="button"
          onClick={onReset}
          title="استعادة البيانات الأصلية"
          className="flex items-center gap-1 rounded-xl border border-[#fee2e2] bg-[#fff5f5] px-2 py-1.5 text-xs font-bold text-[#c5221f] hover:bg-[#fee2e2] transition"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>
    </header>
  )
}
