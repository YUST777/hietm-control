import { useState, useEffect } from 'react'
import { useControlStore } from './lib/store'
import type { MainTab, ProctoringSubTab, Observer, Committee, Subject, ScheduleSlot, PrintSignatures } from './types/control'
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
    setObservers,
    subjects,
    setSubjects,
    committees,
    setCommittees,
    schedules,
    setSchedules,
    controlWorks,
    setControlWorks,
    signatures,
    setSignatures,
    academicYears,
    currentYear,
    setCurrentYear,
    resetToDefaults,
    exportBackup,
  } = useControlStore()

  // Zoom level state - default to 75% for ultra-wide view without scroll
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

  // Observer updates
  const handleUpdateObserver = (id: string, updates: Partial<Observer>) => {
    setObservers((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)))
  }

  const handleUpdateObserverDays = (id: string, days: string) => {
    setObservers((prev) => prev.map((o) => (o.id === id ? { ...o, days } : o)))
  }

  const handleResetHours = () => {
    if (window.confirm('هل تريد تصفير جميع ساعات المراقبة المسجلة للمراقبين؟')) {
      setObservers((prev) => prev.map((o) => ({ ...o, hours: 0 })))
    }
  }

  // Committee updates
  const handleAddCommittee = (c: Omit<Committee, 'id'>) => {
    const newC: Committee = { id: String(Date.now()), ...c }
    setCommittees((prev) => [newC, ...prev])
  }

  const handleDeleteCommittee = (id: string) => {
    if (window.confirm('هل تريد بالتأكيد حذف هذه اللجنة؟')) {
      setCommittees((prev) => prev.filter((c) => c.id !== id))
    }
  }

  // Subject updates
  const handleAddSubject = (s: Omit<Subject, 'id'>) => {
    const newS: Subject = { id: String(Date.now()), ...s }
    setSubjects((prev) => [newS, ...prev])
  }

  const handleDeleteSubject = (id: string) => {
    if (window.confirm('هل تريد بالتأكيد حذف هذا المقرر الدراسي؟')) {
      setSubjects((prev) => prev.filter((s) => s.id !== id))
    }
  }

  // Schedule slot save
  const handleSaveSlot = (slot: ScheduleSlot) => {
    setSchedules((prev) => [slot, ...prev])
  }

  // Control item toggle
  const handleToggleControlItem = (subjectId: string, itemIndex: number) => {
    setControlWorks((prev) => {
      const existing = prev.find((cw) => cw.subjectId === subjectId)
      if (existing) {
        const nextChecklist = {
          ...existing.checklist,
          [itemIndex]: !existing.checklist[itemIndex],
        }
        return prev.map((cw) =>
          cw.subjectId === subjectId ? { ...cw, checklist: nextChecklist } : cw
        )
      } else {
        const subj = subjects.find((s) => s.id === subjectId)
        return [
          ...prev,
          {
            subjectId,
            subjectName: subj?.name || '',
            dept: subj?.dept || '',
            year: subj?.year || '',
            checklist: { [itemIndex]: true },
          },
        ]
      }
    })
  }

  // Signatures update
  const handleSaveSignatures = (sigs: PrintSignatures) => {
    setSignatures(sigs)
  }

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
        onReset={resetToDefaults}
        onExport={exportBackup}
        onPrint={() => window.print()}
      />

      {/* Navigation Pills */}
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
                onUpdateObserverDays={handleUpdateObserverDays}
              />
            )}
            {activeSubTab === 'committees' && (
              <CommitteesView
                committees={committees}
                onAddCommittee={handleAddCommittee}
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
            onDeleteSubject={handleDeleteSubject}
          />
        )}

        {activeMainTab === 'control' && (
          <ControlWorksView
            subjects={subjects}
            controlWorks={controlWorks}
            onToggleItem={handleToggleControlItem}
          />
        )}

        {activeMainTab === 'settings' && (
          <SignaturesSettingsView
            signatures={signatures}
            onSaveSignatures={handleSaveSignatures}
          />
        )}
      </div>
    </main>
  )
}
