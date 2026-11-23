import { useMemo, useRef, useState } from 'react'
import {
  deleteFromArchive,
  duplicateArchiveItem,
  exportArchiveJson,
  formatArchiveDate,
  getArchiveFolders,
  importArchiveJson,
  loadArchive,
  renameArchiveItem,
  searchArchive,
  setArchiveFolder,
  setArchiveTags,
  toggleFavorite,
  type SavedQr,
} from './archive.ts'
import type { ContentKind } from './content.ts'
import { useI18n } from './i18n/I18nContext.tsx'
import type { MessageKey } from './i18n/messages.ts'
import { saveBlob } from './qrBuild.ts'

type Props = {
  items: SavedQr[]
  kindLabel: Record<ContentKind, MessageKey>
  onChange: (items: SavedQr[]) => void
  onOpen: (item: SavedQr) => void
}

export default function SavedCodes({ items, kindLabel, onChange, onOpen }: Props) {
  const { t, locale } = useI18n()
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [folderFilter, setFolderFilter] = useState<string>('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [draftFolder, setDraftFolder] = useState('')
  const [editingTagsId, setEditingTagsId] = useState<string | null>(null)
  const [draftTags, setDraftTags] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const folders = useMemo(() => getArchiveFolders(items), [items])
  const filtered = useMemo(
    () => searchArchive(items, query, folderFilter || undefined, favoritesOnly),
    [items, query, folderFilter, favoritesOnly],
  )

  function handleDelete(id: string, name: string) {
    if (!window.confirm(t('codesDeleteConfirm', { name }))) return
    deleteFromArchive(id)
    onChange(loadArchive())
  }

  function startRename(item: SavedQr) {
    setEditingId(item.id)
    setDraftName(item.name)
  }

  function commitRename() {
    if (!editingId) return
    renameArchiveItem(editingId, draftName)
    setEditingId(null)
    onChange(loadArchive())
  }

  function handleDuplicate(id: string) {
    duplicateArchiveItem(id)
    onChange(loadArchive())
  }

  function handleToggleFavorite(id: string) {
    toggleFavorite(id)
    onChange(loadArchive())
  }

  function startEditFolder(item: SavedQr) {
    setEditingFolderId(item.id)
    setDraftFolder(item.folder ?? '')
  }

  function commitFolder() {
    if (!editingFolderId) return
    setArchiveFolder(editingFolderId, draftFolder)
    setEditingFolderId(null)
    onChange(loadArchive())
  }

  function startEditTags(item: SavedQr) {
    setEditingTagsId(item.id)
    setDraftTags((item.tags ?? []).join(', '))
  }

  function commitTags() {
    if (!editingTagsId) return
    const tags = draftTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
    setArchiveTags(editingTagsId, tags)
    setEditingTagsId(null)
    onChange(loadArchive())
  }

  async function handleExport() {
    const blob = new Blob([exportArchiveJson(items)], {
      type: 'application/json',
    })
    await saveBlob(blob, 'stem-qr-archive.json', locale)
  }

  async function handleImport(file: File) {
    try {
      const text = await file.text()
      const merged = importArchiveJson(text)
      onChange(merged)
    } catch {
      window.alert(t('codesImportFailed'))
    }
  }

  return (
    <section className="panel archive-panel">
      <h2>{t('navCodes')}</h2>
      <p className="hint">{t('codesHint')}</p>

      <div className="archive-toolbar">
        <label className="field archive-search">
          <span>{t('codesSearch')}</span>
          <input
            type="search"
            value={query}
            placeholder={t('codesSearchPlaceholder')}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="archive-toolbar-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => void handleExport()}>
            {t('codesExport')}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => fileRef.current?.click()}
          >
            {t('codesImport')}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void handleImport(file)
              event.target.value = ''
            }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="archive-filters">
        <button
          type="button"
          className={`btn btn-ghost btn-sm${favoritesOnly ? ' is-active' : ''}`}
          onClick={() => setFavoritesOnly((f) => !f)}
        >
          {favoritesOnly ? '★' : '☆'} {t('codesFilterFavorites')}
        </button>
        {folders.length > 0 && (
          <select
            className="archive-folder-select"
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
          >
            <option value="">{t('codesFilterAll')}</option>
            {folders.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        )}
      </div>

      {items.length === 0 ? (
        <p className="archive-empty">{t('codesEmpty')}</p>
      ) : filtered.length === 0 ? (
        <p className="archive-empty">{t('codesNoResults')}</p>
      ) : (
        <ul className="archive-list">
          {filtered.map((item) => (
            <li key={item.id} className={`archive-card${item.favorite ? ' is-favorite' : ''}`}>
              <div className="archive-card-main">
                {editingId === item.id ? (
                  <input
                    className="archive-rename"
                    value={draftName}
                    autoFocus
                    onChange={(event) => setDraftName(event.target.value)}
                    onBlur={() => commitRename()}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') commitRename()
                      if (event.key === 'Escape') setEditingId(null)
                    }}
                  />
                ) : (
                  <strong>{item.name}</strong>
                )}
                <p>
                  {t(kindLabel[item.kind])} ·{' '}
                  {formatArchiveDate(item.updatedAt, locale)}
                  {item.folder ? ` · 📁 ${item.folder}` : ''}
                </p>
                {item.tags && item.tags.length > 0 && (
                  <div className="archive-tags">
                    {item.tags.map((tag) => (
                      <span key={tag} className="archive-tag">{tag}</span>
                    ))}
                  </div>
                )}
                <code title={item.payload}>{item.payload}</code>

                {/* Inline folder edit */}
                {editingFolderId === item.id && (
                  <input
                    className="archive-rename"
                    value={draftFolder}
                    placeholder={t('codesFolderPlaceholder')}
                    autoFocus
                    onChange={(e) => setDraftFolder(e.target.value)}
                    onBlur={() => commitFolder()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitFolder()
                      if (e.key === 'Escape') setEditingFolderId(null)
                    }}
                  />
                )}

                {/* Inline tags edit */}
                {editingTagsId === item.id && (
                  <input
                    className="archive-rename"
                    value={draftTags}
                    placeholder={t('codesTagsPlaceholder')}
                    autoFocus
                    onChange={(e) => setDraftTags(e.target.value)}
                    onBlur={() => commitTags()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitTags()
                      if (e.key === 'Escape') setEditingTagsId(null)
                    }}
                  />
                )}
              </div>
              <div className="archive-card-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => onOpen(item)}
                >
                  {t('codesOpen')}
                </button>
                <button
                  type="button"
                  className={`btn btn-ghost btn-sm${item.favorite ? ' is-active' : ''}`}
                  title={item.favorite ? t('codesUnfavorite') : t('codesFavorite')}
                  onClick={() => handleToggleFavorite(item.id)}
                >
                  {item.favorite ? '★' : '☆'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => startRename(item)}
                >
                  {t('codesRename')}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDuplicate(item.id)}
                >
                  {t('codesDuplicate')}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  title={t('codesFolder')}
                  onClick={() => startEditFolder(item)}
                >
                  📁
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  title={t('codesTags')}
                  onClick={() => startEditTags(item)}
                >
                  🏷
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDelete(item.id, item.name)}
                >
                  {t('codesDelete')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
