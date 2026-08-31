import type { Observer, Subject, Committee } from '../types/control'

// Formula Injection Sanitizer: Neutralizes =, +, -, @, \t, \r, |
export function sanitizeCSVCell(val: unknown): string {
  if (val === null || val === undefined) return '""'
  let str = String(val).trim()
  // If cell starts with formula characters, prefix with single quote to prevent Excel execution
  if (/^[=+\-@\t\r|%]/.test(str)) {
    str = `'${str}`
  }
  // Escape inner double quotes
  return `"${str.replace(/"/g, '""')}"`
}

// Download a CSV with UTF-8 BOM so Microsoft Excel renders Arabic text perfectly
function downloadCSV(csvContent: string, filename: string) {
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// RFC 4180 State Machine CSV Tokenizer (Zero ReDoS, handles multiline & quotes)
export function parseCSVLines(csvText: string): string[][] {
  const cleanText = csvText.replace(/^\uFEFF/, '').trim()
  if (!cleanText) return []

  // Auto-detect delimiter from first line
  let delimiter = ','
  const firstLf = cleanText.indexOf('\n')
  const sample = firstLf === -1 ? cleanText : cleanText.slice(0, firstLf)
  if (sample.includes('\t')) delimiter = '\t'
  else if (sample.includes(';') && !sample.includes(',')) delimiter = ';'

  const rows: string[][] = []
  let currentRow: string[] = []
  let currentCell = ''
  let inQuotes = false

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i]
    const nextChar = cleanText[i + 1]

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentCell += '"'
          i++ // skip escaped quote
        } else {
          inQuotes = false
        }
      } else {
        currentCell += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === delimiter) {
        currentRow.push(currentCell.trim())
        currentCell = ''
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && nextChar === '\n') {
          i++ // skip CRLF
        }
        currentRow.push(currentCell.trim())
        if (currentRow.some((cell) => cell.length > 0)) {
          rows.push(currentRow)
        }
        currentRow = []
        currentCell = ''
      } else {
        currentCell += char
      }
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim())
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow)
    }
  }

  return rows
}

// 1. Observers Excel/CSV
export function exportObserversCSV(observers: Observer[]) {
  const headers = ['الاسم', 'الوظيفة', 'التخصص / القسم', 'أيام التفرغ', 'ساعات المراقبة']
  const rows = observers.map((o) => [
    sanitizeCSVCell(o.name),
    sanitizeCSVCell(o.job),
    sanitizeCSVCell(o.specialization),
    sanitizeCSVCell(o.days),
    typeof o.hours === 'number' && !isNaN(o.hours) ? o.hours : 0,
  ])
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
  downloadCSV(csv, `كشف_المراقبين_${new Date().toISOString().slice(0, 10)}.csv`)
}

export function parseObserversCSV(csvText: string): Omit<Observer, 'id'>[] {
  const grid = parseCSVLines(csvText)
  if (grid.length === 0) return []

  const firstCol = grid[0][0]?.toLowerCase() || ''
  const startIndex = firstCol.includes('الاسم') || firstCol.includes('name') ? 1 : 0
  const results: Omit<Observer, 'id'>[] = []

  for (let i = startIndex; i < grid.length; i++) {
    const cols = grid[i]
    const name = (cols[0] || '').replace(/^'/, '').trim().slice(0, 200)
    if (name.length > 0) {
      const parsedHours = parseFloat(cols[4] || '0')
      results.push({
        name,
        job: (cols[1] || 'عضو هيئة تدريس').replace(/^'/, '').trim().slice(0, 100),
        specialization: (cols[2] || '').replace(/^'/, '').trim().slice(0, 150),
        days: (cols[3] || '').replace(/^'/, '').trim().slice(0, 250),
        hours: isNaN(parsedHours) ? 0 : Math.max(0, Math.min(1000, parsedHours)),
      })
    }
  }

  return results
}

// 2. Subjects Excel/CSV
export function exportSubjectsCSV(subjects: Subject[]) {
  const headers = ['كود المقرر', 'اسم المقرر', 'القسم العلمي', 'الفرقة الدراسية', 'الفصل الدراسي']
  const rows = subjects.map((s) => [
    sanitizeCSVCell(s.code),
    sanitizeCSVCell(s.name),
    sanitizeCSVCell(s.dept),
    sanitizeCSVCell(s.year),
    sanitizeCSVCell(s.semester),
  ])
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
  downloadCSV(csv, `كشف_المقررات_الدراسية_${new Date().toISOString().slice(0, 10)}.csv`)
}

export function parseSubjectsCSV(csvText: string): Omit<Subject, 'id'>[] {
  const grid = parseCSVLines(csvText)
  if (grid.length === 0) return []

  const firstCol = grid[0][0]?.toLowerCase() || ''
  const startIndex = firstCol.includes('كود') || firstCol.includes('code') ? 1 : 0
  const results: Omit<Subject, 'id'>[] = []

  for (let i = startIndex; i < grid.length; i++) {
    const cols = grid[i]
    const col0 = (cols[0] || '').replace(/^'/, '').trim().slice(0, 50)
    const col1 = (cols[1] || '').replace(/^'/, '').trim().slice(0, 200)

    if (col0 || col1) {
      results.push({
        code: col0 || `CODE_${Date.now()}_${i}`,
        name: col1 || col0 || 'مقرر بدون اسم',
        dept: (cols[2] || 'قسم العلوم الأساسية').replace(/^'/, '').trim().slice(0, 150),
        year: (cols[3] || 'الفرقة الإعدادية').replace(/^'/, '').trim().slice(0, 100),
        semester: (cols[4] || 'الفصل الأول').replace(/^'/, '').trim().slice(0, 100),
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
    sanitizeCSVCell(c.roomNum),
    sanitizeCSVCell(c.hallName),
    sanitizeCSVCell(c.floor),
    typeof c.capacity === 'number' && !isNaN(c.capacity) ? c.capacity : 30,
  ])
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
  downloadCSV(csv, `كشف_اللجان_والقاعات_${new Date().toISOString().slice(0, 10)}.csv`)
}

export function parseCommitteesCSV(csvText: string): Omit<Committee, 'id'>[] {
  const grid = parseCSVLines(csvText)
  if (grid.length === 0) return []

  const firstCol = grid[0][0]?.toLowerCase() || ''
  const startIndex = firstCol.includes('رقم') || firstCol.includes('room') ? 1 : 0
  const results: Omit<Committee, 'id'>[] = []

  for (let i = startIndex; i < grid.length; i++) {
    const cols = grid[i]
    const roomNum = (cols[0] || '').replace(/^'/, '').trim().slice(0, 50)
    if (roomNum.length > 0) {
      const parsedCap = parseInt(cols[3] || '30', 10)
      results.push({
        roomNum,
        hallName: (cols[1] || cols[0]).replace(/^'/, '').trim().slice(0, 150),
        floor: (cols[2] || 'الدور الأول').replace(/^'/, '').trim().slice(0, 100),
        capacity: isNaN(parsedCap) ? 30 : Math.max(1, Math.min(2000, parsedCap)),
      })
    }
  }

  return results
}
