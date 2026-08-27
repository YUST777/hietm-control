import React from 'react'
import type { MainTab, ProctoringSubTab } from '../types/control'
import {
  Clock,
  CalendarDays,
  CalendarCheck,
  Building,
  UserCheck,
  Activity,
  BookOpen,
  CheckSquare,
  Settings,
} from 'lucide-react'

interface NavigationTabsProps {
  activeMainTab: MainTab
  setActiveMainTab: (t: MainTab) => void
  activeSubTab: ProctoringSubTab
  setActiveSubTab: (t: ProctoringSubTab) => void
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeMainTab,
  setActiveMainTab,
  activeSubTab,
  setActiveSubTab,
}) => {
  return (
    <div className="mb-3 flex shrink-0 flex-col gap-2 rounded-2xl border border-[#dededb] bg-white p-2.5 shadow-sm print-hide">
      {/* Primary Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-[#ecece9] pb-2.5">
        <button
          type="button"
          onClick={() => setActiveMainTab('proctoring')}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition ${
            activeMainTab === 'proctoring'
              ? 'bg-[#1f4d78] text-white shadow-sm'
              : 'text-[#555] hover:bg-[#f0f0ee]'
          }`}
        >
          <CalendarDays className="size-4" />
          <span>إدارة المراقبات والجداول</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('subjects')}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition ${
            activeMainTab === 'subjects'
              ? 'bg-[#1f4d78] text-white shadow-sm'
              : 'text-[#555] hover:bg-[#f0f0ee]'
          }`}
        >
          <BookOpen className="size-4" />
          <span>المقررات الدراسية</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('control')}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition ${
            activeMainTab === 'control'
              ? 'bg-[#1f4d78] text-white shadow-sm'
              : 'text-[#555] hover:bg-[#f0f0ee]'
          }`}
        >
          <CheckSquare className="size-4" />
          <span>متابعة أعمال الكنترول (14 بند)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('settings')}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition ${
            activeMainTab === 'settings'
              ? 'bg-[#1f4d78] text-white shadow-sm'
              : 'text-[#555] hover:bg-[#f0f0ee]'
          }`}
        >
          <Settings className="size-4" />
          <span>التوقيعات الرسمية والإعدادات</span>
        </button>
      </div>

      {/* Secondary Proctoring Sub-tabs */}
      {activeMainTab === 'proctoring' && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('hours')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold transition ${
              activeSubTab === 'hours'
                ? 'bg-[#e2ecf5] text-[#1f4d78] border border-[#bcd2e8]'
                : 'text-[#666] hover:bg-[#f5f5f3]'
            }`}
          >
            <Clock className="size-3.5" />
            <span>لوحة الساعات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('schedule')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold transition ${
              activeSubTab === 'schedule'
                ? 'bg-[#e2ecf5] text-[#1f4d78] border border-[#bcd2e8]'
                : 'text-[#666] hover:bg-[#f5f5f3]'
            }`}
          >
            <CalendarDays className="size-3.5" />
            <span>الجدول والتوزيع</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('days')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold transition ${
              activeSubTab === 'days'
                ? 'bg-[#e2ecf5] text-[#1f4d78] border border-[#bcd2e8]'
                : 'text-[#666] hover:bg-[#f5f5f3]'
            }`}
          >
            <CalendarCheck className="size-3.5" />
            <span>أيام الحضور</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('committees')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold transition ${
              activeSubTab === 'committees'
                ? 'bg-[#e2ecf5] text-[#1f4d78] border border-[#bcd2e8]'
                : 'text-[#666] hover:bg-[#f5f5f3]'
            }`}
          >
            <Building className="size-3.5" />
            <span>اللجان والقاعات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('attendance')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold transition ${
              activeSubTab === 'attendance'
                ? 'bg-[#e2ecf5] text-[#1f4d78] border border-[#bcd2e8]'
                : 'text-[#666] hover:bg-[#f5f5f3]'
            }`}
          >
            <UserCheck className="size-3.5" />
            <span>تسجيل الحضور</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('status')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold transition ${
              activeSubTab === 'status'
                ? 'bg-[#e2ecf5] text-[#1f4d78] border border-[#bcd2e8]'
                : 'text-[#666] hover:bg-[#f5f5f3]'
            }`}
          >
            <Activity className="size-3.5" />
            <span>حالة المراقبين</span>
          </button>
        </div>
      )}
    </div>
  )
}
