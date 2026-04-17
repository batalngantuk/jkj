import * as XLSX from 'xlsx'

/**
 * Export array of objects to .xlsx file and trigger browser download.
 *
 * @param data     - Array of row objects (keys become column headers)
 * @param filename - Desired filename WITHOUT extension (e.g. "Laporan_Sales")
 * @param sheetName - Optional sheet tab name (default: "Data")
 * @param headers  - Optional ordered column header map: { key: 'Display Label' }
 *                   If omitted, object keys are used as-is.
 */
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  sheetName = 'Data',
  headers?: Partial<Record<keyof T, string>>
) {
  if (data.length === 0) return

  // Remap keys to display labels if headers provided
  const rows = headers
    ? data.map((row) => {
        const mapped: Record<string, unknown> = {}
        for (const [key, label] of Object.entries(headers)) {
          mapped[label as string] = row[key as keyof T] ?? ''
        }
        return mapped
      })
    : data

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  // Auto column width
  const colWidths = Object.keys(rows[0] ?? {}).map((k) => ({
    wch: Math.max(k.length, 12),
  }))
  ws['!cols'] = colWidths

  XLSX.writeFile(wb, `${filename}.xlsx`)
}

/**
 * Export multiple sheets into one workbook.
 *
 * @param sheets - Array of { name, data, headers? }
 * @param filename - Filename without extension
 */
export function exportToExcelMultiSheet(
  sheets: Array<{
    name: string
    data: Record<string, unknown>[]
    headers?: Record<string, string>
  }>,
  filename: string
) {
  const wb = XLSX.utils.book_new()

  for (const sheet of sheets) {
    if (sheet.data.length === 0) continue

    const rows = sheet.headers
      ? sheet.data.map((row) => {
          const mapped: Record<string, unknown> = {}
          for (const [key, label] of Object.entries(sheet.headers!)) {
            mapped[label] = row[key] ?? ''
          }
          return mapped
        })
      : sheet.data

    const ws = XLSX.utils.json_to_sheet(rows)
    const colWidths = Object.keys(rows[0] ?? {}).map((k) => ({
      wch: Math.max(k.length, 12),
    }))
    ws['!cols'] = colWidths
    XLSX.utils.book_append_sheet(wb, ws, sheet.name)
  }

  XLSX.writeFile(wb, `${filename}.xlsx`)
}
