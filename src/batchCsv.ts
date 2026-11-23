export type BatchRow = {
  label: string
  data: string
}

/** Parse CSV/TSV: `payload` or `label,payload` per line (header optional). */
export function parseBatchCsv(text: string): BatchRow[] {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (!lines.length) return []

  const first = lines[0]!.toLowerCase()
  const hasHeader =
    first.includes('url') ||
    first.includes('data') ||
    first.includes('payload') ||
    first.includes('label') ||
    first.includes('nombre') ||
    first.includes('name')

  const body = hasHeader ? lines.slice(1) : lines
  const rows: BatchRow[] = []

  for (const line of body) {
    const parts = splitCsvLine(line)
    if (parts.length === 1) {
      const data = parts[0]!.trim()
      if (!data) continue
      rows.push({ label: shortLabel(data), data })
      continue
    }
    const label = (parts[0] ?? '').trim()
    const data = parts.slice(1).join(',').trim()
    if (!data) continue
    rows.push({ label: label || shortLabel(data), data })
  }

  return rows
}

function splitCsvLine(line: string): string[] {
  const delim = line.includes('\t') && !line.includes(',') ? '\t' : ','
  const out: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (ch === delim && !inQuotes) {
      out.push(current)
      current = ''
      continue
    }
    current += ch
  }
  out.push(current)
  return out
}

function shortLabel(data: string): string {
  const trimmed = data.trim()
  if (trimmed.length <= 28) return trimmed
  return `${trimmed.slice(0, 25)}…`
}

export function batchCsvExample(): string {
  return `label,url
WiFi Lobby,WIFI:T:WPA;S:Lobby;P:secret;;
Landing,https://example.com
Evento,https://example.com/event
`
}
