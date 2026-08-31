import type { Observer, Subject, Committee } from '../types/control'

// Download a CSV with UTF-8 BOM so Microsoft Excel renders Arabic text perfectly
function downloadCSV(csvContent: string, filename: string) {
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// 1. Observers Excel/CSV
export function exportObserversCSV(observers: Observer[]) {
  const headers = ['الاسم', 'الوظيفة', 'التخصص / القسم', 'أيام التفرغ', 'ساعات المراقبة']
  const rows = observers.map((o) => [
    `"${(o.name || '').replace(/"/g, '""')}"`,
    `"${(o.job || '').replace(/"/g, '""')}"`,
    `"${(o.specialization || '').replace(/"/g, '""')}"`,
    `"${(o.days || '').replace(/"/g, '""')}"`,
    o.hours || 0,
  ])
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  downloadCSV(csv, `كشف_المراقبين_${new Date().toISOString().slice(0, 10)}.csv`)
}

export function parseObserversCSV(csvText: string): Omit<Observer, 'id'>[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length <= 1) return []

  const results: Omit<Observer, 'id'>[] = []

  // Skip header if contains 'الاسم' or 'name'
  const startIndex = lines[0].includes('الاسم') || lines[0].toLowerCase().includes('name') ? 1 : 0

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i]
    // Regex for CSV split handling quotes
    const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) =>
      c.replace(/^"|"$/g, '').trim()
    )

    if (cols[0]) {
      results.push({
        name: cols[0],
        job: cols[1] || 'عضو هيئة تدريس',
        specialization: cols[2] || '',
        days: cols[3] || '',
        hours: parseFloat(cols[4]) || 0,
      })
    }
  }

  return results
}

// 2. Subjects Excel/CSV
export function exportSubjectsCSV(subjects: Subject[]) {
  const headers = ['كود المقرر', 'اسم المقرر', 'القسم العلمي', 'الفرقة الدراسية', 'الفصل الدراسي']
  const rows = subjects.map((s) => [
    `"${(s.code || '').replace(/"/g, '""')}"`,
    `"${(s.name || '').replace(/"/g, '""')}"`,
    `"${(s.dept || '').replace(/"/g, '""')}"`,
    `"${(s.year || '').replace(/"/g, '""')}"`,
    `"${(s.semester || '').replace(/"/g, '""')}"`,
  ])
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  downloadCSV(csv, `كشف_المقررات_الدراسية_${new Date().toISOString().slice(0, 10)}.csv`)
}

export function parseSubjectsCSV(csvText: string): Omit<Subject, 'id'>[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length <= 1) return []

  const results: Omit<Subject, 'id'>[] = []
  const startIndex = lines[0].includes('كود') || lines[0].toLowerCase().includes('code') ? 1 : 0

  for (let i = startIndex; i < lines.length; i++) {
    const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) =>
      c.replace(/^"|"$/g, '').trim()
    )

    if (cols[1] || cols[0]) {
      results.push({
        code: cols[0] || `CODE_${Date.now()}`,
        name: cols[1] || cols[0],
        dept: cols[2] || 'قسم العلوم الأساسية',
        year: cols[3] || 'الفرقة الإعدادية',
        semester: cols[4] || 'الفصل الأول',
        spec: '',
      })
    }
  }

  return results
}

// 3. Committees Excel/CSV
export function exportCommitteesCSV(committees: Committee[]) {
  const headers = ['رقم اللجنة', 'اسم القاعة / المدرج', 'الدور / المبنى', 'السعة الاستيعابية']
  const rows = committees.map((c) => [
    `"${(c.roomNum || '').replace(/"/g, '""')}"`,
    `"${(c.hallName || '').replace(/"/g, '""')}"`,
    `"${(c.floor || '').replace(/"/g, '""')}"`,
    c.capacity || 30,
  ])
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  downloadCSV(csv, `كشف_اللجان_والقاعات_${new Date().toISOString().slice(0, 10)}.csv`)
}

export function parseCommitteesCSV(csvText: string): Omit<Committee, 'id'>[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length <= 1) return []

  const results: Omit<Committee, 'id'>[] = []
  const startIndex = lines[0].includes('رقم') || lines[0].toLowerCase().includes('room') ? 1 : 0

  for (let i = startIndex; i < lines.length; i++) {
    const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) =>
      c.replace(/^"|"$/g, '').trim()
    )

    if (cols[0]) {
      results.push({
        roomNum: cols[0],
        hallName: cols[1] || cols[0],
        floor: cols[2] || 'الدور الأول',
        capacity: parseInt(cols[3], 10) || 30,
      })
    }
  }

  return results
}
