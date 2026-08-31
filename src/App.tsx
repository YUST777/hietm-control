import { useState, useEffect, useCallback } from 'react'
import { useControlStore } from './lib/store'
import type { MainTab, ProctoringSubTab, ScheduleSlot, PrintSignatures, SystemBranding, Observer, Subject, Committee } from './types/control'
import { Navbar } from './components/Navbar'
import { NavigationTabs } from './components/NavigationTabs'
import { HoursDashboardView } from './components/views/HoursDashboardView'
import { ScheduleView } from './components/views/ScheduleView'
import { ObserverDaysView } from './components/views/ObserverDaysView'
import { CommitteesView } from './components/views/CommitteesView'
import { SubjectsView } from './components/views/SubjectsView'
import { ControlWorksView } from './components/views/ControlWorksView'
import { SignaturesSettingsView } from './components/views/SignaturesSettingsView'
import { ToastContainer, ToastMessage } from './components/Toast'

export function App() {
  const {
    observers,
    updateObserver,
    addObserver,
    deleteObserver,
    resetAllHours,

    subjects,
    updateSubject,
    addSubject,
    deleteSubject,

    committees,
    updateCommittee,
    addCommittee,
    deleteCommittee,

    schedules,
    saveScheduleSlot,

    controlWorks,
    toggleControlStage,

    signatures,
    updateSignatures,

    branding,
    updateBranding,

    academicYears,
    currentYear,
    setCurrentYear,

    syncStatus,
    lastSyncTime,
    manualSync,
    resetToDefaults,
    exportBackup,
  } = useControlStore()

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    setToasts((prev) => [...prev, { id, text, type }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Wrapped Handlers with Toast Feedback
  const handleUpdateObserver = (id: string, updates: Partial<Observer>) => {
    updateObserver(id, updates)
    showToast('تم تحديث بيانات المراقب بنجاح ✓')
  }

  const handleAddObserver = (obs: Omit<Observer, 'id'>) => {
    addObserver(obs)
    showToast(`تمت إضافة المراقب "${obs.name}" بنجاح ✓`)
  }

  const handleDeleteObserver = (id: string) => {
    deleteObserver(id)
    showToast('تم حذف المراقب من قاعدة البيانات', 'info')
  }

  const handleResetHours = () => {
    resetAllHours()
    showToast('تم تصفير عداد الساعات لجميع المراقبين', 'info')
  }

  const handleUpdateSubject = (id: string, updates: Partial<Subject>) => {
    updateSubject(id, updates)
    showToast('تم تحديث بيانات المقرر الدراسي بنجاح ✓')
  }

  const handleAddSubject = (s: Omit<Subject, 'id'>) => {
    addSubject(s)
    showToast(`تمت إضافة المقرر "${s.name}" بنجاح ✓`)
  }

  const handleDeleteSubject = (id: string) => {
    deleteSubject(id)
    showToast('تم حذف المقرر من قاعدة البيانات', 'info')
  }

  const handleUpdateCommittee = (id: string, updates: Partial<Committee>) => {
    updateCommittee(id, updates)
    showToast('تم تحديث بيانات اللجنة بنجاح ✓')
  }

  const handleAddCommittee = (c: Omit<Committee, 'id'>) => {
    addCommittee(c)
    showToast(`تمت إضافة لجنة ${c.roomNum} بنجاح ✓`)
  }

  const handleDeleteCommittee = (id: string) => {
    deleteCommittee(id)
    showToast('تم حذف اللجنة من قاعدة البيانات', 'info')
  }

  const handleSaveSlot = (slot: ScheduleSlot) => {
    saveScheduleSlot(slot)
    showToast('تم حفظ جدول توزيع المراقبات بنجاح ✓')
  }

  const handleSaveSignatures = (sigs: PrintSignatures) => {
    updateSignatures(sigs)
    showToast('تم حفظ واعتماد التوقيعات الرسمية بنجاح ✓')
  }

  const handleSaveBranding = (newBranding: SystemBranding) => {
    updateBranding(newBranding)
    showToast('تم حفظ وتحديث هوية المعهد والألوان بنجاح ✓')
  }

  // Zoom level state - default to 75% for wide overview without scroll
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('hietm_zoom_level_v3')
      if (saved) return parseFloat(saved)
    } catch (e) {
      console.error(e)
    }
    return 0.75
  })

  // Apply zoom to document.documentElement so the whole viewport reflows seamlessly
  useEffect(() => {
    try {
      document.documentElement.style.zoom = String(zoomLevel)
      localStorage.setItem('hietm_zoom_level_v3', zoomLevel.toString())
    } catch (e) {
      console.error(e)
    }
  }, [zoomLevel])

  const [activeMainTab, setActiveMainTab] = useState<MainTab>('proctoring')
  const [activeSubTab, setActiveSubTab] = useState<ProctoringSubTab>('schedule')

  return (
    <main className="flex h-full w-full flex-col overflow-hidden bg-[#f7f7f5] p-2 sm:p-2.5 text-[#171717]">
      {/* Top Navbar */}
      <Navbar
        currentYear={currentYear}
        setCurrentYear={setCurrentYear}
        academicYears={academicYears}
        totalObservers={observers.length}
        totalSubjects={subjects.length}
        totalCommittees={committees.length}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
        branding={branding}
        onManualSync={async () => {
          await manualSync()
          showToast('تمت مزامنة البيانات مع قاعدة البيانات السحابية 🔄')
        }}
        onReset={() => {
          resetToDefaults()
          showToast('تمت استعادة البيانات الأصلية المعتمدة', 'info')
        }}
        onExport={() => {
          exportBackup()
          showToast('تم تنزيل النسخة الاحتياطية بنجاح 💾')
        }}
        onPrint={() => window.print()}
      />

      {/* Navigation Tabs */}
      <NavigationTabs
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
      />

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1 flex-col">
        {activeMainTab === 'proctoring' && (
          <>
            {activeSubTab === 'hours' && (
              <HoursDashboardView
                observers={observers}
                onUpdateObserver={handleUpdateObserver}
                onAddObserver={handleAddObserver}
                onDeleteObserver={handleDeleteObserver}
                onResetHours={handleResetHours}
              />
            )}
            {activeSubTab === 'schedule' && (
              <ScheduleView
                observers={observers}
                subjects={subjects}
                committees={committees}
                schedules={schedules}
                currentYear={currentYear}
                signatures={signatures}
                onSaveSlot={handleSaveSlot}
              />
            )}
            {activeSubTab === 'days' && (
              <ObserverDaysView
                observers={observers}
                onUpdateObserverDays={(id, days) => {
                  updateObserver(id, { days })
                  showToast('تم تحديث أيام الحضور بنجاح ✓')
                }}
              />
            )}
            {activeSubTab === 'committees' && (
              <CommitteesView
                committees={committees}
                onAddCommittee={handleAddCommittee}
                onUpdateCommittee={handleUpdateCommittee}
                onDeleteCommittee={handleDeleteCommittee}
              />
            )}
            {(activeSubTab === 'attendance' || activeSubTab === 'status') && (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-2xl border border-[#dededb] bg-white p-8 text-center shadow-sm">
                <h3 className="text-base font-black text-[#171717]">
                  {activeSubTab === 'attendance' ? 'كشف تسجيل الحضور اليومي' : 'تقارير حالة المراقبين'}
                </h3>
                <p className="mt-2 text-xs font-semibold text-[#777] max-w-md">
                  يتم تسجيل الحضور تلقائياً بناءً على كشوف التوزيع المعتمدة لكل فترة امتحانية مع توثيق التوقيعات.
                </p>
              </div>
            )}
          </>
        )}

        {activeMainTab === 'subjects' && (
          <SubjectsView
            subjects={subjects}
            onAddSubject={handleAddSubject}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
          />
        )}

        {activeMainTab === 'control' && (
          <ControlWorksView
            subjects={subjects}
            controlWorks={controlWorks}
            onToggleItem={(subjId, itemIdx) => {
              toggleControlStage(subjId, itemIdx)
              showToast('تم تحديث بند الكنترول بنجاح ✓')
            }}
          />
        )}

        {activeMainTab === 'settings' && (
          <SignaturesSettingsView
            signatures={signatures}
            branding={branding}
            onSaveSignatures={handleSaveSignatures}
            onSaveBranding={handleSaveBranding}
          />
        )}
      </div>

      {/* Universal Floating Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </main>
  )
}
