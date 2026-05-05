import ExcelJS from 'exceljs'

// ── Style constants ──────────────────────────────────────────────────────────

const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF2D5A8E' },   // dark navy blue
}

const ALT_ROW_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFF0F4FA' },   // light blue-gray
}

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top:    { style: 'thin', color: { argb: 'FFCCD6E0' } },
  bottom: { style: 'thin', color: { argb: 'FFCCD6E0' } },
  left:   { style: 'thin', color: { argb: 'FFCCD6E0' } },
  right:  { style: 'thin', color: { argb: 'FFCCD6E0' } },
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function looksLikeCurrency(key: string): boolean {
  return /harga|nilai|total|amount|cost|price|bayar|tagihan|saldo|dpp|ppn|cif|landed|subtotal|debit|kredit|balance/i.test(key)
}

function looksLikeDate(key: string): boolean {
  return /^(date|tgl|tanggal|order_date|delivery|expired|created|updated)/i.test(key)
}

function looksLikeNumber(key: string): boolean {
  return /^(qty|quantity|jumlah|berat|weight|konsumsi|kuantiti)/i.test(key)
}

function cellValueWidth(v: unknown): number {
  if (v == null) return 0
  return String(v).length
}

// ── Core: build one worksheet ────────────────────────────────────────────────

interface SheetOptions {
  /** Optional title row above headers (merged across all columns) */
  title?: string
  /** Freeze header row (default: true) */
  freezeHeader?: boolean
  /** Manual column widths: { fieldKey: charWidth } */
  columnWidths?: Record<string, number>
}

async function buildSheet(
  wb: ExcelJS.Workbook,
  sheetName: string,
  data: Record<string, unknown>[],
  headers?: Record<string, string>,
  options?: SheetOptions,
): Promise<void> {
  const ws = wb.addWorksheet(sheetName)

  if (data.length === 0) {
    ws.addRow(['(Tidak ada data)'])
    return
  }

  // Determine field keys and display labels
  const keys: string[]   = headers ? Object.keys(headers)              : Object.keys(data[0])
  const labels: string[] = headers ? Object.values(headers) as string[] : keys

  let headerRowIndex = 1

  // ── Title row ──
  if (options?.title) {
    const titleRow = ws.addRow([options.title])
    ws.mergeCells(1, 1, 1, labels.length)
    const cell = titleRow.getCell(1)
    cell.font      = { bold: true, size: 13, color: { argb: 'FF1A3557' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E4F0' } }
    titleRow.height = 24
    headerRowIndex = 2
  }

  // ── Header row ──
  const headerRow = ws.addRow(labels)
  headerRow.height = 20
  headerRow.eachCell((cell, col) => {
    cell.fill      = HEADER_FILL
    cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
    cell.border    = THIN_BORDER
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: false }
    void col
  })

  // ── Data rows ──
  data.forEach((row, rowIdx) => {
    const values = keys.map(k => row[k] ?? '')
    const dataRow = ws.addRow(values)
    const isAlt   = rowIdx % 2 === 1

    dataRow.eachCell((cell, colIdx) => {
      const key = keys[colIdx - 1]

      // Alternating row background
      if (isAlt) cell.fill = ALT_ROW_FILL

      cell.border    = THIN_BORDER
      cell.alignment = { vertical: 'middle' }

      // Number formatting
      if (looksLikeCurrency(key) && typeof cell.value === 'number') {
        cell.numFmt    = '#,##0'
        cell.alignment = { horizontal: 'right', vertical: 'middle' }
      } else if (looksLikeNumber(key) && typeof cell.value === 'number') {
        cell.numFmt    = '#,##0.##'
        cell.alignment = { horizontal: 'right', vertical: 'middle' }
      } else if (looksLikeDate(key)) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
      }
    })
  })

  // ── Column widths ──
  ws.columns = keys.map((key, i) => {
    const manual = options?.columnWidths?.[key]
    if (manual) return { width: manual }

    const labelLen  = labels[i]?.length ?? 10
    const maxDataLen = data.reduce((mx, row) => Math.max(mx, cellValueWidth(row[key])), 0)
    const auto      = Math.min(Math.max(labelLen + 3, maxDataLen + 2, 10), 60)
    return { width: auto }
  })

  // ── Freeze header ──
  if (options?.freezeHeader !== false) {
    ws.views = [{
      state:       'frozen',
      xSplit:      0,
      ySplit:      headerRowIndex,
      topLeftCell: `A${headerRowIndex + 1}`,
      activeCell:  `A${headerRowIndex + 1}`,
    }]
  }
}

// ── Download helper ──────────────────────────────────────────────────────────

async function download(wb: ExcelJS.Workbook, filename: string): Promise<void> {
  const buffer = await wb.xlsx.writeBuffer()
  const blob   = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = `${filename}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function newWorkbook(): ExcelJS.Workbook {
  const wb    = new ExcelJS.Workbook()
  wb.creator  = 'JKJ ERP System'
  wb.created  = new Date()
  wb.modified = new Date()
  return wb
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Export satu sheet ke .xlsx.
 *
 * @param data      Array of row objects
 * @param filename  Nama file tanpa .xlsx
 * @param sheetName Nama tab sheet (default: "Data")
 * @param headers   Map field key → label kolom (opsional — jika tidak diisi, pakai key as-is)
 * @param options   Opsi tambahan: title, freezeHeader, columnWidths
 */
export async function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  sheetName = 'Data',
  headers?: Partial<Record<keyof T, string>>,
  options?: SheetOptions,
): Promise<void> {
  const wb = newWorkbook()
  await buildSheet(wb, sheetName, data as Record<string, unknown>[], headers as Record<string, string> | undefined, options)
  await download(wb, filename)
}

/**
 * Export beberapa sheet sekaligus ke satu file .xlsx.
 *
 * @param sheets   Array of { name, data, headers?, options? }
 * @param filename Nama file tanpa .xlsx
 */
export async function exportToExcelMultiSheet(
  sheets: Array<{
    name: string
    data: Record<string, unknown>[]
    headers?: Record<string, string>
    options?: SheetOptions
  }>,
  filename: string,
): Promise<void> {
  const wb = newWorkbook()
  for (const sheet of sheets) {
    await buildSheet(wb, sheet.name, sheet.data, sheet.headers, sheet.options)
  }
  await download(wb, filename)
}
