import { useState, useEffect, useCallback } from 'react'
import { useControlStore } from './lib/store'
import type {
  MainTab,
  ProctoringSubTab,
  ScheduleSlot,
  PrintSignatures,
  SystemBranding,
  Observer,
  Subject,
  Committee,
  DailyAttendanceRecord,
} from './types/control'
import { Navbar } from './components/Navbar'
import { NavigationTabs } from './components/NavigationTabs'
import { HoursDashboardView } from './components/views/HoursDashboardView'
import { ScheduleView } from './components/views/ScheduleView'
import { ObserverDaysView } from './components/views/ObserverDaysView'
import { CommitteesView } from './components/views/CommitteesView'
import { AttendanceView } from './components/views/AttendanceView'
import { ObserverStatusView } from './components/views/ObserverStatusView'
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
    importObserversList,
    resetAllHours,

    subjects,
    updateSubject,
    addSubject,
    deleteSubject,
    importSubjectsList,

    committees,
    updateCommittee,
    addCommittee,
    deleteCommittee,
    importCommitteesList,

    schedules,
    saveScheduleSlot,

    attendance,
    setAttendance,

    controlWorks,
    toggleControlStage,

    signatures,
    updateSignatures,

    branding,
    updateBranding,

    academicYears,
    addAcademicYear,
    deleteAcademicYear,
    currentYear,
    setCurrentYear,

    periods,
    addPeriod,
    deletePeriod,

    departments,
    addDepartment,
    deleteDepartment,

    jobTitles,
    addJobTitle,
    deleteJobTitle,

    controlStages,
    updateAllControlStages,

    syncStatus,
    lastSyncTime,
    manualSync,
    resetToDefaults,
    exportBackup,
    importBackup,
  } = useControlStore()

  // Zoom Level for entire app
  const [zoomLevel, setZoomLevel] = useState(100)

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    setToasts((prev) => [...prev, { id, text, type }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Handlers with Toast Feedback
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

  const handleUpdateSubject = (id: string, updates: Partial<Subject>) => {
    updateSubject(id, updates)
    showToast('تم تحديث المقرر الدراسي بنجاح ✓')
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
    showToast(`تمت إضافة اللجنة رقم ${c.roomNum} بنجاح ✓`)
  }

  const handleDeleteCommittee = (id: string) => {
    deleteCommittee(id)
    showToast('تم حذف اللجنة من قاعدة البيانات', 'info')
  }

  const handleSaveSlot = (slot: ScheduleSlot) => {
    saveScheduleSlot(slot)
    showToast('تم حفظ واعتماد جدول التوزيع الامتحاني بنجاح ✓')
  }

  const handleSaveAttendance = (records: DailyAttendanceRecord[]) => {
    setAttendance(records)
    showToast('تم حفظ كشف الحضور والغياب اليومي بنجاح ✓')
  }

  const handleSaveSignatures = (sigs: PrintSignatures) => {
    updateSignatures(sigs)
    showToast('تم حفظ واعتماد التوقيعات الرسمية بنجاح ✓')
  }

  const handleSaveBranding = (newBranding: SystemBranding) => {
    updateBranding(newBranding)
    showToast('تم تحديث وحفظ هوية المعهد وألوان النظام بنجاح ✓')
  }

  // Active Main Navigation Tab
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('proctoring')
  // Active Sub-Tab under Proctoring & Exam Tables
  const [activeProctoringTab, setActiveProctoringTab] = useState<ProctoringSubTab>('schedule')

  // Auto-sync status feedback on sync complete
  useEffect(() => {
    if (syncStatus === 'synced' && lastSyncTime) {
      // Optional subtle indicator
    }
  }, [syncStatus, lastSyncTime])

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-[#fafaf8] text-[#171717] font-sans antialiased select-none" dir="rtl">
      {/* Top Application Bar */}
      <Navbar
        currentYear={currentYear}
        setCurrentYear={(year: string) => {
          setCurrentYear(year)
          showToast(`تم تغيير العام الجامعي النشط إلى: ${year}`)
        }}
        academicYears={academicYears}
        totalObservers={observers.length}
        totalSubjects={subjects.length}
        totalCommittees={committees.length}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
        branding={branding}
        onManualSync={() => {
          manualSync()
          showToast('جاري مزامنة وحفظ البيانات سحابياً...')
        }}
        onReset={resetToDefaults}
        onExport={exportBackup}
        onPrint={() => window.print()}
      />

      {/* Main & Sub Navigation Tabs */}
      <NavigationTabs
        activeMainTab={activeMainTab}
        setActiveMainTab={setActiveMainTab}
        activeSubTab={activeProctoringTab}
        setActiveSubTab={setActiveProctoringTab}
      />

      {/* Dynamic View Content Area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2.5">
        {activeMainTab === 'proctoring' && (
          <>
            {activeProctoringTab === 'hours' && (
              <HoursDashboardView
                observers={observers}
                onUpdateObserver={handleUpdateObserver}
                onAddObserver={handleAddObserver}
                onDeleteObserver={handleDeleteObserver}
                onResetHours={resetAllHours}
              />
            )}

            {activeProctoringTab === 'schedule' && (
              <ScheduleView
                observers={observers}
                subjects={subjects}
                committees={committees}
                schedules={schedules}
                currentYear={currentYear}
                signatures={signatures}
                periods={periods}
                onSaveSlot={handleSaveSlot}
              />
            )}

            {activeProctoringTab === 'days' && (
              <ObserverDaysView
                observers={observers}
                onUpdateObserver={handleUpdateObserver}
                onAddObserver={handleAddObserver}
                onUpdateObserverDays={(id, days) => {
                  updateObserver(id, { days })
                  showToast('تم تحديث أيام التفرغ بنجاح ✓')
                }}
              />
            )}

            {activeProctoringTab === 'committees' && (
              <CommitteesView
                committees={committees}
                onAddCommittee={handleAddCommittee}
                onUpdateCommittee={handleUpdateCommittee}
                onDeleteCommittee={handleDeleteCommittee}
                onImportCommittees={(list) => {
                  importCommitteesList(list)
                  showToast(`تم استيراد ${list.length} لجنة بنجاح ✓`)
                }}
              />
            )}

            {activeProctoringTab === 'attendance' && (
              <AttendanceView
                observers={observers}
                schedules={schedules}
                attendance={attendance}
                signatures={signatures}
                branding={branding}
                currentYear={currentYear}
                periods={periods}
                onSaveAttendance={handleSaveAttendance}
              />
            )}

            {activeProctoringTab === 'status' && (
              <ObserverStatusView
                observers={observers}
                schedules={schedules}
                attendance={attendance}
                signatures={signatures}
                branding={branding}
                currentYear={currentYear}
                onUpdateObserver={handleUpdateObserver}
                onAddObserver={handleAddObserver}
                onImportObservers={(list) => {
                  importObserversList(list)
                  showToast(`تم استيراد ${list.length} مراقب بنجاح ✓`)
                }}
              />
            )}
          </>
        )}

        {activeMainTab === 'subjects' && (
          <SubjectsView
            subjects={subjects}
            onAddSubject={handleAddSubject}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
            onImportSubjects={(list) => {
              importSubjectsList(list)
              showToast(`تم استيراد ${list.length} مقرر دراسي بنجاح ✓`)
            }}
          />
        )}

        {activeMainTab === 'control' && (
          <ControlWorksView
            subjects={subjects}
            controlWorks={controlWorks}
            controlStages={controlStages}
            onToggleItem={(subjId, itemIdx) => {
              toggleControlStage(subjId, itemIdx)
              showToast('تم تحديث بند الكنترول بنجاح ✓')
            }}
            onUpdateSubject={handleUpdateSubject}
            onAddSubject={handleAddSubject}
          />
        )}

        {activeMainTab === 'settings' && (
          <SignaturesSettingsView
            signatures={signatures}
            branding={branding}
            academicYears={academicYears}
            currentYear={currentYear}
            periods={periods}
            departments={departments}
            jobTitles={jobTitles}
            controlStages={controlStages}
            onSaveSignatures={handleSaveSignatures}
            onSaveBranding={handleSaveBranding}
            onAddAcademicYear={(year) => {
              addAcademicYear(year)
              showToast(`تمت إضافة العام الجامعي "${year}" بنجاح ✓`)
            }}
            onDeleteAcademicYear={(year) => {
              deleteAcademicYear(year)
              showToast(`تم حذف العام الجامعي "${year}"`, 'info')
            }}
            onSetCurrentYear={(year) => {
              setCurrentYear(year)
              showToast(`تم تعيين العام الجامعي النشط: "${year}" ✓`)
            }}
            onAddPeriod={(p) => {
              addPeriod(p)
              showToast(`تمت إضافة الفترة: "${p}" بنجاح ✓`)
            }}
            onDeletePeriod={(p) => {
              deletePeriod(p)
              showToast(`تم حذف الفترة: "${p}"`, 'info')
            }}
            onAddDepartment={(d) => {
              addDepartment(d)
              showToast(`تمت إضافة القسم: "${d}" بنجاح ✓`)
            }}
            onDeleteDepartment={(d) => {
              deleteDepartment(d)
              showToast(`تم حذف القسم: "${d}"`, 'info')
            }}
            onAddJobTitle={(j) => {
              addJobTitle(j)
              showToast(`تمت إضافة الدرجة الوظيفية: "${j}" بنجاح ✓`)
            }}
            onDeleteJobTitle={(j) => {
              deleteJobTitle(j)
              showToast(`تم حذف الدرجة الوظيفية: "${j}"`, 'info')
            }}
            onUpdateControlStages={(stages) => {
              updateAllControlStages(stages)
              showToast('تم تحديث وحفظ مسميات بنود الكنترول الـ 14 بنجاح ✓')
            }}
            onExportBackup={() => {
              exportBackup()
              showToast('تم تصدير النسخة الاحتياطية بنجاح 💾')
            }}
            onImportBackup={(jsonStr) => {
              const success = importBackup(jsonStr)
              if (success) showToast('تم استيراد واستعادة البيانات بنجاح ✓')
              return success
            }}
            onResetToDefaults={() => {
              resetToDefaults()
              showToast('تمت استعادة البيانات الأصلية', 'info')
            }}
          />
        )}
      </div>

      {/* Universal Floating Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </main>
  )
}
