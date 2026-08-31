import { useState, useCallback } from 'react'
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
import { Globe, Linkedin } from 'lucide-react'

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
    toggleAllControlStages,

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

    semesters,
    addSemester,
    deleteSemester,
    currentSemester,
    setCurrentSemester,

    studyLevels,
    addStudyLevel,
    deleteStudyLevel,

    buildings,
    addBuilding,
    deleteBuilding,

    floors,
    addFloor,
    deleteFloor,

    workDays,
    toggleWorkDay,

    roleQuotas,
    updateRoleQuota,

    syncStatus,
    lastSyncTime,
    manualSync,
    resetToDefaults,
    exportBackup,
    importBackup,
  } = useControlStore()

  // Zoom Level for entire app (ratio e.g. 0.75, 0.85, 1.0)
  const [zoomLevel, setZoomLevel] = useState<number>(1.0)

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

  return (
    <main
      className="flex h-screen w-screen flex-col overflow-hidden bg-[#fafaf8] text-[#171717] font-sans antialiased"
      style={{ zoom: zoomLevel }}
      dir="rtl"
    >
      {/* Top Application Bar */}
      <Navbar
        currentYear={currentYear}
        setCurrentYear={(year: string) => {
          setCurrentYear(year)
          showToast(`تم تغيير العام الجامعي النشط إلى: ${year}`)
        }}
        academicYears={academicYears}
        currentSemester={currentSemester}
        setCurrentSemester={(sem: string) => {
          setCurrentSemester(sem)
          showToast(`تم تغيير الفصل الدراسي النشط إلى: ${sem}`)
        }}
        semesters={semesters}
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
                jobTitles={jobTitles}
                departments={departments}
                workDays={workDays}
                roleQuotas={roleQuotas}
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
                branding={branding}
                periods={periods}
                semesters={semesters}
                currentSemester={currentSemester}
                onSaveSlot={handleSaveSlot}
              />
            )}

            {activeProctoringTab === 'days' && (
              <ObserverDaysView
                observers={observers}
                workDays={workDays}
                jobTitles={jobTitles}
                departments={departments}
                roleQuotas={roleQuotas}
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
                floors={floors}
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
                jobTitles={jobTitles}
                departments={departments}
                workDays={workDays}
                roleQuotas={roleQuotas}
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
            departments={departments}
            studyLevels={studyLevels}
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
            departments={departments}
            studyLevels={studyLevels}
            onToggleItem={(subjId, itemIdx) => {
              toggleControlStage(subjId, itemIdx)
              showToast('تم تحديث بند الكنترول بنجاح ✓')
            }}
            onToggleAllItems={(subjId, setAll) => {
              toggleAllControlStages(subjId, setAll)
              showToast(setAll ? 'تم تحديد جميع بنود المقرر بنجاح ✓' : 'تم إلغاء تحديد بنود المقرر ✓')
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
            semesters={semesters}
            currentSemester={currentSemester}
            studyLevels={studyLevels}
            buildings={buildings}
            floors={floors}
            workDays={workDays}
            roleQuotas={roleQuotas}
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
              showToast('تم تحديث بنود الكنترول بنجاح ✓')
            }}
            onAddSemester={(s) => {
              addSemester(s)
              showToast(`تمت إضافة الفصل الدراسي: "${s}" بنجاح ✓`)
            }}
            onDeleteSemester={(s) => {
              deleteSemester(s)
              showToast(`تم حذف الفصل: "${s}"`, 'info')
            }}
            onSetCurrentSemester={(s) => {
              setCurrentSemester(s)
              showToast(`تم تعيين الفصل الدراسي النشط: "${s}" ✓`)
            }}
            onAddStudyLevel={(lvl) => {
              addStudyLevel(lvl)
              showToast(`تمت إضافة الفرقة الدراسية: "${lvl}" بنجاح ✓`)
            }}
            onDeleteStudyLevel={(lvl) => {
              deleteStudyLevel(lvl)
              showToast(`تم حذف الفرقة: "${lvl}"`, 'info')
            }}
            onAddBuilding={(b) => {
              addBuilding(b)
              showToast(`تمت إضافة المبنى: "${b}" بنجاح ✓`)
            }}
            onDeleteBuilding={(b) => {
              deleteBuilding(b)
              showToast(`تم حذف المبنى: "${b}"`, 'info')
            }}
            onAddFloor={(f) => {
              addFloor(f)
              showToast(`تمت إضافة الدور: "${f}" بنجاح ✓`)
            }}
            onDeleteFloor={(f) => {
              deleteFloor(f)
              showToast(`تم حذف الدور: "${f}"`, 'info')
            }}
            onToggleWorkDay={(day) => {
              toggleWorkDay(day)
              showToast(`تم تحديث حالة يوم: "${day}" ✓`)
            }}
            onUpdateRoleQuota={(job, hours) => {
              updateRoleQuota(job, hours)
              showToast(`تم تحديث نصاب "${job}" إلى ${hours} ساعة ✓`)
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

      {/* Pure Floating Text - ONLY in Settings Tab (No widget, no borders, no box) */}
      {activeMainTab === 'settings' && (
        <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-1.5 text-[10.5px] font-medium text-[#888] print-hide opacity-80 hover:opacity-100 transition whitespace-nowrap">
          <span>نظام إدارة الكنترول والمراقبات | تطوير: يوسف</span>
          <span className="text-[#ccc]">•</span>
          <a
            href="https://www.yust.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#1f4d78] hover:underline transition"
          >
            <Globe className="size-3" />
            <span>yust.dev</span>
          </a>
          <span className="text-[#ccc]">•</span>
          <a
            href="https://www.linkedin.com/in/yousefmsm1/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#0a66c2] hover:underline transition"
          >
            <Linkedin className="size-3" />
            <span>LinkedIn</span>
          </a>
        </div>
      )}

      {/* Universal Floating Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </main>
  )
}
