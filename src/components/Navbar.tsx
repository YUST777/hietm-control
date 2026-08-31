import React, { useState } from 'react'
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
  Database,
  Cloud,
  CloudOff,
  RefreshCw,
} from 'lucide-react'
import type { ConnectionStatus } from '../lib/store'
import { DatabaseSettingsModal } from './DatabaseSettingsModal'

interface NavbarProps {
  currentYear: string
  setCurrentYear: (y: string) => void
  academicYears: string[]
  totalObservers: number
  totalSubjects: number
  totalCommittees: number
  zoomLevel: number
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>
  connectionStatus: ConnectionStatus
  lastSyncTime: string | null
  onRefreshCloud: () => void
  onSeedDatabase: () => Promise<{ success: boolean; message: string }>
  onReset: () => void
  onExport: () => void
  onPrint: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  currentYear,
  setCurrentYear,
  academicYears,
  totalObservers,
  totalSubjects,
  totalCommittees,
  zoomLevel,
  setZoomLevel,
  connectionStatus,
  lastSyncTime,
  onRefreshCloud,
  onSeedDatabase,
  onReset,
  onExport,
  onPrint,
}) => {
  const [isDbModalOpen, setIsDbModalOpen] = useState(false)

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(1.5, parseFloat((prev + 0.05).toFixed(2))))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(0.5, parseFloat((prev - 0.05).toFixed(2))))
  }

  return (
    <>
      <header className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-[#dededb] bg-white px-4 py-2 shadow-sm print-hide">
        {/* Brand & Crest */}
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#1f4d78] text-white shadow-sm">
            <Building2 className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-[#171717]">
                وحدة التعليم الإلكتروني — الكنترول وتوزيع المراقبات
              </h1>
              <span className="rounded-md bg-[#eef3f8] px-1.5 py-0.2 text-[10px] font-bold text-[#1f4d78]">
                H.I.E.T
              </span>
            </div>
            <p className="text-[11px] font-semibold text-[#666]">
              المعهد العالي للهندسة والتكنولوجيا — إدارة الجداول والامتحانات
            </p>
          </div>
        </div>

        {/* KPI Badges */}
        <div className="hidden lg:flex items-center gap-2.5">
          <div className="flex items-center gap-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-2 py-0.5 text-[11px] font-bold text-[#334155]">
            <Users className="size-3 text-[#1f4d78]" />
            <span>المراقبين:</span>
            <span className="text-[#1f4d78] font-black">{totalObservers}</span>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-2 py-0.5 text-[11px] font-bold text-[#334155]">
            <BookOpen className="size-3 text-[#1f4d78]" />
            <span>المقررات:</span>
            <span className="text-[#1f4d78] font-black">{totalSubjects}</span>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-2 py-0.5 text-[11px] font-bold text-[#334155]">
            <Building2 className="size-3 text-[#1f4d78]" />
            <span>اللجان:</span>
            <span className="text-[#1f4d78] font-black">{totalCommittees}</span>
          </div>
        </div>

        {/* Actions, Cloud Status, Zoom Presets & Academic Year */}
        <div className="flex items-center gap-1.5">
          {/* Cloud Connection Indicator */}
          <button
            type="button"
            onClick={() => setIsDbModalOpen(true)}
            className={`flex items-center gap-1.5 rounded-xl border px-2 py-1 text-[11px] font-bold transition cursor-pointer ${
              connectionStatus === 'connected'
                ? 'border-[#bbf7d0] bg-[#f0fdf4] text-[#155724] hover:bg-[#dcfce7]'
                : connectionStatus === 'connecting'
                ? 'border-[#fed7aa] bg-[#fff7ed] text-[#c2410c] hover:bg-[#ffedd5]'
                : 'border-[#e2e8f0] bg-[#f8fafc] text-[#64748b] hover:bg-[#f1f5f9]'
            }`}
            title={
              connectionStatus === 'connected'
                ? `متصل بقاعدة بيانات Supabase (آخر مزامنة: ${lastSyncTime || 'الآن'})`
                : 'انقر لربط قاعدة بيانات Supabase السحابية'
            }
          >
            {connectionStatus === 'connected' ? (
              <>
                <Cloud className="size-3.5 text-[#155724]" />
                <span className="hidden sm:inline">سحابي مباشر</span>
              </>
            ) : connectionStatus === 'connecting' ? (
              <>
                <RefreshCw className="size-3.5 animate-spin text-[#c2410c]" />
                <span className="hidden sm:inline">جارٍ التزامن...</span>
              </>
            ) : (
              <>
                <CloudOff className="size-3.5 text-[#64748b]" />
                <span className="hidden sm:inline">محلي (أوفلاين)</span>
              </>
            )}
            <Database className="size-3 text-[#aaa]" />
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
                    ? 'bg-[#1f4d78] text-white shadow-xs'
                    : 'text-[#555] hover:bg-[#e6e6e3]'
                }`}
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

          {/* Print Button */}
          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1 rounded-xl bg-[#1f4d78] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#163756] transition"
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

      {/* Cloud Database Modal */}
      <DatabaseSettingsModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onConnectionChanged={onRefreshCloud}
        onSeedDatabase={onSeedDatabase}
      />
    </>
  )
}
