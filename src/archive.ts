import {
  buildPayload,
  downloadName,
  initialContent,
  type ContentForm,
  type ContentKind,
} from './content.ts'
import { initialStyle, type QrStyle } from './qrStyle.ts'

export type SavedQr = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  kind: ContentKind
  payload: string
  content: ContentForm
  style: QrStyle
  folder?: string
  tags?: string[]
  favorite?: boolean
}

const STORAGE_KEY = 'stem-qr-archive'
const MAX_ITEMS = 200

function canUseStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined'
  } catch {
    return false
  }
}

export function loadArchive(): SavedQr[] {
  if (!canUseStorage()) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item): item is SavedQr => {
        if (!item || typeof item !== 'object') return false
        const row = item as Partial<SavedQr>
        return (
          typeof row.id === 'string' &&
          typeof row.name === 'string' &&
          typeof row.createdAt === 'number' &&
          typeof row.kind === 'string' &&
          typeof row.payload === 'string' &&
          row.content != null &&
          row.style != null
        )
      })
      .map((item) => ({
        ...item,
        updatedAt: item.updatedAt ?? item.createdAt,
        content: { ...initialContent, ...item.content },
        style: { ...initialStyle, ...item.style },
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt)
  } catch {
    return []
  }
}

function persist(items: SavedQr[]): void {
  if (!canUseStorage()) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
}

export function suggestArchiveName(
  content: ContentForm,
  style: QrStyle,
  payload: string,
): string {
  const caption = style.caption.trim()
  if (caption) return caption.slice(0, 60)

  if (content.kind === 'wifi' && content.wifiSsid.trim()) {
    return `WiFi · ${content.wifiSsid.trim()}`.slice(0, 60)
  }
  if (content.kind === 'vcard') {
    const name = `${content.vcardFirst} ${content.vcardLast}`.trim()
    if (name) return name.slice(0, 60)
  }
  if (content.kind === 'event' && content.eventTitle.trim()) {
    return content.eventTitle.trim().slice(0, 60)
  }
  if (content.kind === 'menu' && content.menuName.trim()) {
    return content.menuName.trim().slice(0, 60)
  }
  if (content.kind === 'file' && content.fileLabel.trim()) {
    return content.fileLabel.trim().slice(0, 60)
  }
  if (content.kind === 'social' && content.socialHandle.trim()) {
    return `@${content.socialHandle.replace(/^@+/, '')}`.slice(0, 60)
  }

  const compact = payload.replace(/\s+/g, ' ').trim()
  if (compact) return compact.slice(0, 48)

  return downloadName(content.kind)
}

export function saveToArchive(input: {
  name?: string
  content: ContentForm
  style: QrStyle
  id?: string
}): SavedQr {
  const payload = buildPayload(input.content)
  const now = Date.now()
  const existing = loadArchive()
  const name =
    (input.name ?? '').trim() ||
    suggestArchiveName(input.content, input.style, payload)

  if (input.id) {
    const index = existing.findIndex((item) => item.id === input.id)
    if (index >= 0) {
      const updated: SavedQr = {
        ...existing[index],
        name,
        updatedAt: now,
        kind: input.content.kind,
        payload,
        content: structuredClone(input.content),
        style: structuredClone(input.style),
      }
      const next = [...existing]
      next[index] = updated
      persist(next.sort((a, b) => b.updatedAt - a.updatedAt))
      return updated
    }
  }

  const created: SavedQr = {
    id: crypto.randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    kind: input.content.kind,
    payload,
    content: structuredClone(input.content),
    style: structuredClone(input.style),
  }
  persist([created, ...existing])
  return created
}

export function renameArchiveItem(id: string, name: string): SavedQr | null {
  const trimmed = name.trim()
  if (!trimmed) return null
  const existing = loadArchive()
  const index = existing.findIndex((item) => item.id === id)
  if (index < 0) return null
  const updated: SavedQr = {
    ...existing[index],
    name: trimmed.slice(0, 80),
    updatedAt: Date.now(),
  }
  const next = [...existing]
  next[index] = updated
  persist(next)
  return updated
}

export function deleteFromArchive(id: string): void {
  persist(loadArchive().filter((item) => item.id !== id))
}

export function duplicateArchiveItem(id: string): SavedQr | null {
  const existing = loadArchive()
  const original = existing.find((item) => item.id === id)
  if (!original) return null
  const now = Date.now()
  const copy: SavedQr = {
    ...structuredClone(original),
    id: crypto.randomUUID(),
    name: `${original.name} (copy)`,
    createdAt: now,
    updatedAt: now,
    favorite: false,
  }
  persist([copy, ...existing])
  return copy
}

export function toggleFavorite(id: string): SavedQr | null {
  const existing = loadArchive()
  const index = existing.findIndex((item) => item.id === id)
  if (index < 0) return null
  const updated: SavedQr = {
    ...existing[index]!,
    favorite: !existing[index]!.favorite,
    updatedAt: Date.now(),
  }
  const next = [...existing]
  next[index] = updated
  persist(next)
  return updated
}

export function setArchiveFolder(id: string, folder: string): SavedQr | null {
  const existing = loadArchive()
  const index = existing.findIndex((item) => item.id === id)
  if (index < 0) return null
  const updated: SavedQr = {
    ...existing[index]!,
    folder: folder.trim() || undefined,
    updatedAt: Date.now(),
  }
  const next = [...existing]
  next[index] = updated
  persist(next)
  return updated
}

export function setArchiveTags(id: string, tags: string[]): SavedQr | null {
  const existing = loadArchive()
  const index = existing.findIndex((item) => item.id === id)
  if (index < 0) return null
  const cleaned = tags.map((t) => t.trim()).filter(Boolean)
  const updated: SavedQr = {
    ...existing[index]!,
    tags: cleaned.length ? cleaned : undefined,
    updatedAt: Date.now(),
  }
  const next = [...existing]
  next[index] = updated
  persist(next)
  return updated
}

export function getArchiveFolders(items: SavedQr[]): string[] {
  const folders = new Set<string>()
  for (const item of items) {
    if (item.folder) folders.add(item.folder)
  }
  return [...folders].sort()
}

export function searchArchive(
  items: SavedQr[],
  query: string,
  folderFilter?: string,
  favoritesOnly?: boolean,
): SavedQr[] {
  let result = items
  if (favoritesOnly) result = result.filter((item) => item.favorite)
  if (folderFilter) result = result.filter((item) => item.folder === folderFilter)
  const q = query.trim().toLowerCase()
  if (!q) return result
  return result.filter((item) => {
    const haystack = [
      item.name,
      item.kind,
      item.payload,
      item.style.caption,
      item.style.subtitle,
      item.folder ?? '',
      ...(item.tags ?? []),
    ]
      .join('\n')
      .toLowerCase()
    return haystack.includes(q)
  })
}

export function exportArchiveJson(items: SavedQr[]): string {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: Date.now(),
      items,
    },
    null,
    2,
  )
}

export function importArchiveJson(raw: string): SavedQr[] {
  const parsed = JSON.parse(raw) as { items?: unknown } | unknown
  const list = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && Array.isArray((parsed as { items?: unknown }).items)
      ? (parsed as { items: unknown[] }).items
      : null
  if (!list) throw new Error('Invalid archive')

  const normalized = list
    .filter((item): item is SavedQr => {
      if (!item || typeof item !== 'object') return false
      const row = item as Partial<SavedQr>
      return (
        typeof row.id === 'string' &&
        typeof row.name === 'string' &&
        typeof row.kind === 'string' &&
        row.content != null &&
        row.style != null
      )
    })
    .map((item) => ({
      ...item,
      createdAt: item.createdAt ?? Date.now(),
      updatedAt: item.updatedAt ?? item.createdAt ?? Date.now(),
      payload: item.payload ?? '',
      content: { ...initialContent, ...item.content },
      style: { ...initialStyle, ...item.style },
    }))

  const existing = loadArchive()
  const byId = new Map(existing.map((item) => [item.id, item]))
  for (const item of normalized) byId.set(item.id, item)
  const merged = [...byId.values()].sort((a, b) => b.updatedAt - a.updatedAt)
  persist(merged)
  return merged
}

export function formatArchiveDate(timestamp: number, locale: string): string {
  const localeMap: Record<string, string> = {
    en: 'en-US',
    es: 'es-DO',
    pt: 'pt-BR',
    fr: 'fr-FR',
  }
  try {
    return new Intl.DateTimeFormat(localeMap[locale] ?? 'es-DO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(timestamp))
  } catch {
    return new Date(timestamp).toLocaleString()
  }
}
