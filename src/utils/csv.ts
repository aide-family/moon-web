/** Escape a CSV cell value */
export function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/** Build CSV text with UTF-8 BOM for Excel compatibility */
export function buildCsvContent(rows: string[][]): string {
  const bom = '\uFEFF'
  return (
    bom +
    rows.map((row) => row.map((cell) => escapeCsvCell(cell)).join(',')).join('\n')
  )
}

/** Trigger browser download of CSV content */
export function downloadCsv(filename: string, rows: string[][]): void {
  const content = buildCsvContent(rows)
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
