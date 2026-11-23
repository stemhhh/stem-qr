import { describe, expect, it, beforeEach } from 'vitest'
import {
  deleteFromArchive,
  duplicateArchiveItem,
  exportArchiveJson,
  getArchiveFolders,
  importArchiveJson,
  loadArchive,
  renameArchiveItem,
  saveToArchive,
  searchArchive,
  setArchiveFolder,
  setArchiveTags,
  suggestArchiveName,
  toggleFavorite,
} from './archive.ts'
import { initialContent } from './content.ts'
import { initialStyle } from './qrStyle.ts'

const memory = new Map<string, string>()

beforeEach(() => {
  memory.clear()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value)
      },
      removeItem: (key: string) => {
        memory.delete(key)
      },
    },
  })
})

describe('archive', () => {
  it('saves, searches, renames and deletes codes', () => {
    const first = saveToArchive({
      name: 'WiFi Casa',
      content: {
        ...initialContent,
        kind: 'wifi',
        wifiSsid: 'Casa',
        wifiPassword: 'secreto',
      },
      style: { ...initialStyle, caption: 'WiFi' },
    })
    saveToArchive({
      content: {
        ...initialContent,
        kind: 'url',
        url: 'https://example.com/menu',
      },
      style: initialStyle,
    })

    expect(loadArchive()).toHaveLength(2)
    expect(searchArchive(loadArchive(), 'casa')).toHaveLength(1)
    expect(suggestArchiveName(
      { ...initialContent, kind: 'wifi', wifiSsid: 'Oficina' },
      initialStyle,
      'WIFI:T:WPA;S:Oficina;P:x;H:false;;',
    )).toContain('Oficina')

    const renamed = renameArchiveItem(first.id, 'Red principal')
    expect(renamed?.name).toBe('Red principal')
    deleteFromArchive(first.id)
    expect(loadArchive().some((item) => item.id === first.id)).toBe(false)
  })

  it('exports and imports archive json', () => {
    saveToArchive({
      name: 'Menu',
      content: { ...initialContent, kind: 'menu', menuUrl: 'https://menu.test' },
      style: initialStyle,
    })
    const json = exportArchiveJson(loadArchive())
    memory.clear()
    expect(loadArchive()).toHaveLength(0)
    const merged = importArchiveJson(json)
    expect(merged.some((item) => item.name === 'Menu')).toBe(true)
  })

  it('duplicates an archive item', () => {
    const original = saveToArchive({
      name: 'Original',
      content: { ...initialContent, kind: 'url', url: 'https://dup.test' },
      style: initialStyle,
    })
    const copy = duplicateArchiveItem(original.id)
    expect(copy).not.toBeNull()
    expect(copy!.name).toContain('copy')
    expect(copy!.id).not.toBe(original.id)
    expect(loadArchive()).toHaveLength(2)
  })

  it('toggles favorite', () => {
    const item = saveToArchive({
      name: 'Fav test',
      content: { ...initialContent, kind: 'text', text: 'hello' },
      style: initialStyle,
    })
    expect(item.favorite).toBeFalsy()
    const toggled = toggleFavorite(item.id)
    expect(toggled?.favorite).toBe(true)
    const untoggled = toggleFavorite(item.id)
    expect(untoggled?.favorite).toBe(false)
  })

  it('sets folder and tags', () => {
    const item = saveToArchive({
      name: 'Folder test',
      content: { ...initialContent, kind: 'text', text: 'test' },
      style: initialStyle,
    })
    setArchiveFolder(item.id, 'Work')
    setArchiveTags(item.id, ['promo', 'wifi'])

    const archive = loadArchive()
    const updated = archive.find((a) => a.id === item.id)!
    expect(updated.folder).toBe('Work')
    expect(updated.tags).toEqual(['promo', 'wifi'])

    const folders = getArchiveFolders(archive)
    expect(folders).toContain('Work')
  })

  it('searches by folder and tags', () => {
    const a = saveToArchive({
      name: 'Code A',
      content: { ...initialContent, kind: 'url', url: 'https://a.test' },
      style: initialStyle,
    })
    const b = saveToArchive({
      name: 'Code B',
      content: { ...initialContent, kind: 'url', url: 'https://b.test' },
      style: initialStyle,
    })
    setArchiveFolder(a.id, 'Alpha')
    setArchiveTags(a.id, ['special'])

    const archive = loadArchive()
    const byFolder = searchArchive(archive, '', 'Alpha')
    expect(byFolder.some((i) => i.id === a.id)).toBe(true)
    expect(byFolder.some((i) => i.id === b.id)).toBe(false)

    const byTag = searchArchive(archive, 'special')
    expect(byTag.some((i) => i.id === a.id)).toBe(true)

    toggleFavorite(a.id)
    const favs = searchArchive(loadArchive(), '', undefined, true)
    expect(favs.some((i) => i.id === a.id)).toBe(true)
    expect(favs.some((i) => i.id === b.id)).toBe(false)
  })
})
