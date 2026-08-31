import { useState, useEffect } from 'react'
import { useControlStore } from './lib/store'
import type { MainTab, ProctoringSubTab } from './types/control'
import { Navbar } from './components/Navbar'
import { NavigationTabs } from './components/NavigationTabs'
import { HoursDashboardView } from './components/views/HoursDashboardView'
import { ScheduleView } from './components/views/ScheduleView'
import { ObserverDaysView } from './components/views/ObserverDaysView'
import { CommitteesView } from './components/views/CommitteesView'
import { SubjectsView } from './components/views/SubjectsView'
import { ControlWorksView } from './components/views/ControlWorksView'
import { SignaturesSettingsView } from './components/views/SignaturesSettingsView'

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

    academicYears,
    currentYear,
    setCurrentYear,

    connectionStatus,
    lastSyncTime,
    fetchFromSupabase,
    seedDatabaseFromDefaults,
    resetToDefaults,
    exportBackup,
  } = useControlStore()

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
        connectionStatus={connectionStatus}
        lastSyncTime={lastSyncTime}
        onRefreshCloud={fetchFromSupabase}
        onSeedDatabase={seedDatabaseFromDefaults}
        onReset={resetToDefaults}
        onExport={exportBackup}
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
                onUpdateObserver={updateObserver}
                onAddObserver={addObserver}
                onDeleteObserver={deleteObserver}
                onResetHours={resetAllHours}
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
                onSaveSlot={saveScheduleSlot}
              />
            )}
            {activeSubTab === 'days' && (
              <ObserverDaysView
                observers={observers}
                onUpdateObserverDays={(id, days) => updateObserver(id, { days })}
              />
            )}
            {activeSubTab === 'committees' && (
              <CommitteesView
                committees={committees}
                onAddCommittee={addCommittee}
                onUpdateCommittee={updateCommittee}
                onDeleteCommittee={deleteCommittee}
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
            onAddSubject={addSubject}
            onUpdateSubject={updateSubject}
            onDeleteSubject={deleteSubject}
          />
        )}

        {activeMainTab === 'control' && (
          <ControlWorksView
            subjects={subjects}
            controlWorks={controlWorks}
            onToggleItem={toggleControlStage}
          />
        )}

        {activeMainTab === 'settings' && (
          <SignaturesSettingsView
            signatures={signatures}
            onSaveSignatures={updateSignatures}
          />
        )}
      </div>
    </main>
  )
}
