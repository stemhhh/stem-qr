import type { QrStyle } from './qrStyle.ts'

const STORAGE_KEY = 'stem-qr-user-templates'
const MAX_TEMPLATES = 50

export type UserTemplate = {
  id: string
  name: string
  createdAt: number
  patch: Partial<QrStyle>
}

function canUseStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined'
  } catch {
    return false
  }
}

export function loadUserTemplates(): UserTemplate[] {
  if (!canUseStorage()) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is UserTemplate =>
        item != null &&
        typeof item === 'object' &&
        typeof (item as UserTemplate).id === 'string' &&
        typeof (item as UserTemplate).name === 'string' &&
        (item as UserTemplate).patch != null,
    )
  } catch {
    return []
  }
}

function persist(items: UserTemplate[]): void {
  if (!canUseStorage()) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_TEMPLATES)))
}

export function saveUserTemplate(name: string, style: QrStyle): UserTemplate {
  const existing = loadUserTemplates()
  // Extract only visual style (no exportSize changes for cleanliness)
  const { caption, subtitle, captionPosition, captionSize, captionColor, exportSize: _es, ...patch } = style
  void _es
  const template: UserTemplate = {
    id: crypto.randomUUID(),
    name: name.trim().slice(0, 60) || 'Template',
    createdAt: Date.now(),
    patch: { caption, subtitle, captionPosition, captionSize, captionColor, ...patch },
  }
  persist([template, ...existing])
  return template
}

export function deleteUserTemplate(id: string): void {
  persist(loadUserTemplates().filter((item) => item.id !== id))
}
