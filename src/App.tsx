import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CompareStylesModal from './CompareStylesModal.tsx'
import CreateStudio from './CreateStudio.tsx'
import PrintPanel from './PrintPanel.tsx'
import QrPreview from './QrPreview.tsx'
import SavedCodes from './SavedCodes.tsx'
import SaveDialog from './SaveDialog.tsx'
import SettingsPanel from './SettingsPanel.tsx'
import Sidebar, { type AppPage } from './Sidebar.tsx'
import TemplateGallery from './TemplateGallery.tsx'
import {
  loadArchive,
  saveToArchive,
  suggestArchiveName,
  type SavedQr,
} from './archive.ts'
import type { BatchRow } from './batchCsv.ts'
import { applyScanFix } from './scanAdvice.ts'
import {
  buildPayload,
  downloadName,
  initialContent,
  isPayloadReady,
  type ContentForm,
} from './content.ts'
import { useI18n } from './i18n/I18nContext.tsx'
import { remountKey } from './qrFingerprint.ts'
import { saveBlob } from './qrBuild.ts'
import {
  initialPrint,
  initialStyle,
  sheetPresets,
  type PrintSettings,
  type QrStyle,
  type SheetKind,
} from './qrStyle.ts'
import {
  createStyleHistory,
  pushStyleHistory,
  undoStyle,
  redoStyle,
  type StyleHistory,
} from './styleHistory.ts'
import { kindLabel, type CustomizeTab } from './kindLabel.ts'
import './App.css'

function App() {
  const { t, locale } = useI18n()
  const [page, setPage] = useState<AppPage>('create')
  const [customizeTab, setCustomizeTab] = useState<CustomizeTab>('design')
  const [content, setContent] = useState<ContentForm>(initialContent)
  const [style, setStyle] = useState<QrStyle>(initialStyle)
  const [print, setPrint] = useState<PrintSettings>(initialPrint)
  const [archive, setArchive] = useState<SavedQr[]>(() => loadArchive())
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null)
  const [saveOpen, setSaveOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [showAllKinds, setShowAllKinds] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)
  const [batchBusy, setBatchBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const noticeTimer = useRef<number | null>(null)
  const [styleHistory, setStyleHistory] = useState<StyleHistory>(() => createStyleHistory())
  const [kindSearch, setKindSearch] = useState('')
  const [compareStyle, setCompareStyle] = useState<QrStyle | null>(null)
  const [showCompare, setShowCompare] = useState(false)

  const payload = useMemo(() => buildPayload(content), [content])
  const ready = useMemo(() => isPayloadReady(content), [content])
  const previewKey = useMemo(() => remountKey(style), [style])

  const patchContent = useCallback(
    <K extends keyof ContentForm>(key: K, value: ContentForm[K]) => {
      setContent((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const patchStyle = useCallback(<K extends keyof QrStyle>(key: K, value: QrStyle[K]) => {
    setStyle((prev) => ({ ...prev, [key]: value }))
  }, [])

  const patchPrint = useCallback(
    <K extends keyof PrintSettings>(key: K, value: PrintSettings[K]) => {
      setPrint((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const showNotice = useCallback((message: string) => {
    setNotice(message)
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current)
    noticeTimer.current = window.setTimeout(() => setNotice(''), 1800)
  }, [])

  useEffect(
    () => () => {
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current)
    },
    [],
  )

  // Electron menu action listener
  useEffect(() => {
    const cleanup = window.qrDesktop?.onMenuAction?.((action) => {
      if (action === 'save') {
        if (page === 'create' && ready) openSaveDialog()
      } else if (action === 'print') {
        setPage('print')
      } else if (action === 'export-png') {
        window.dispatchEvent(new CustomEvent('qr:export-png'))
      }
    })
    return () => { cleanup?.() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, ready])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const inInput =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        if (page === 'create') openSaveDialog()
      }

      if (!inInput && (event.ctrlKey || event.metaKey)) {
        if (event.key.toLowerCase() === 'z' && !event.shiftKey) {
          event.preventDefault()
          setStyle((current) => {
            const result = undoStyle(styleHistory, current)
            if (!result) return current
            setStyleHistory(result.history)
            return result.style
          })
        }
        if (
          event.key.toLowerCase() === 'y' ||
          (event.key.toLowerCase() === 'z' && event.shiftKey)
        ) {
          event.preventDefault()
          setStyle((current) => {
            const result = redoStyle(styleHistory, current)
            if (!result) return current
            setStyleHistory(result.history)
            return result.style
          })
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  async function handlePdf(sheet: SheetKind) {
    if (!ready || pdfBusy) return
    setPdfBusy(true)
    try {
      const { buildPrintPdf } = await import('./printPdf.ts')
      const preset = sheetPresets.find((item) => item.kind === sheet) ?? sheetPresets[0]
      const blob = await buildPrintPdf({
        data: payload,
        style,
        print,
        sheet,
        footerText: t('pdfFooter', {
          label: downloadName(content.kind),
          cols: preset.cols,
          rows: preset.rows,
        }),
      })
      await saveBlob(blob, `${downloadName(content.kind)}-${sheet}-sheet.pdf`, locale)
      showNotice(t('pdfReady', { sheet }))
    } catch {
      showNotice(t('pdfFailed'))
    } finally {
      setPdfBusy(false)
    }
  }

  async function handleBatch(rows: BatchRow[]) {
    if (!rows.length || batchBusy) return
    setBatchBusy(true)
    try {
      const { buildBatchPdf } = await import('./batchPdf.ts')
      const blob = await buildBatchPdf(rows, style)
      await saveBlob(blob, `stem-qr-batch-${rows.length}.pdf`, locale)
      showNotice(t('batchReady', { count: rows.length }))
    } catch {
      showNotice(t('batchFailed'))
    } finally {
      setBatchBusy(false)
    }
  }

  async function handleBatchZip(rows: BatchRow[], includeSvg: boolean) {
    if (!rows.length || batchBusy) return
    setBatchBusy(true)
    try {
      const { buildBatchZip } = await import('./batchZip.ts')
      const blob = await buildBatchZip(rows, style, includeSvg)
      await saveBlob(blob, `stem-qr-batch-${rows.length}.zip`, locale)
      showNotice(t('batchZipReady', { count: rows.length }))
    } catch {
      showNotice(t('batchFailed'))
    } finally {
      setBatchBusy(false)
    }
  }

  function commitStyleChange(newStyle: QrStyle) {
    setStyleHistory((h) => pushStyleHistory(h, style))
    setStyle(newStyle)
  }

  const pageTitle =
    page === 'create'
      ? t('navCreate')
      : page === 'codes'
        ? t('navCodes')
        : page === 'templates'
          ? t('navTemplates')
          : page === 'print'
            ? t('navPrint')
            : t('navSettings')

  function openSaveDialog() {
    if (!ready) {
      showNotice(t('waitingStatus'))
      return
    }
    setSaveName(suggestArchiveName(content, style, payload))
    setSaveOpen(true)
  }

  function confirmSave(asNew = false) {
    const updating = Boolean(activeSavedId) && !asNew
    const saved = saveToArchive({
      id: updating ? activeSavedId ?? undefined : undefined,
      name: saveName,
      content,
      style,
    })
    setActiveSavedId(saved.id)
    setArchive(loadArchive())
    setSaveOpen(false)
    showNotice(updating ? t('codesUpdated') : t('codesSaved'))
  }

  function openSaved(item: SavedQr) {
    setContent(item.content)
    setStyle({ ...initialStyle, ...item.style })
    setActiveSavedId(item.id)
    setPage('create')
    showNotice(t('codesOpened'))
  }

  return (
    <div className="app">
      <Sidebar page={page} onNavigate={setPage} />

      <div className="main">
        <div className={`workspace${page === 'create' || page === 'templates' ? ' has-preview' : ''}`}>
          <div className="editor-pane">
            {page === 'create' && (
              <CreateStudio
                content={content}
                style={style}
                customizeTab={customizeTab}
                showAllKinds={showAllKinds}
                kindSearch={kindSearch}
                compareStyle={compareStyle}
                showCompare={showCompare}
                ready={ready}
                patchContent={patchContent}
                patchStyle={patchStyle}
                setStyle={setStyle}
                setCustomizeTab={setCustomizeTab}
                setShowAllKinds={setShowAllKinds}
                setKindSearch={setKindSearch}
                setContent={setContent}
                setCompareStyle={setCompareStyle}
                setShowCompare={setShowCompare}
                commitStyleChange={commitStyleChange}
                openSaveDialog={openSaveDialog}
                showNotice={showNotice}
                onNavigateToTemplates={() => setPage('templates')}
              />
            )}

            {page !== 'create' && (
              <header className="hero hero-compact">
                <h1>{pageTitle}</h1>
              </header>
            )}

            {page === 'codes' && (
              <SavedCodes
                items={archive}
                kindLabel={kindLabel}
                onChange={setArchive}
                onOpen={openSaved}
              />
            )}

            {page === 'templates' && (
              <TemplateGallery
                currentStyle={style}
                onApply={(patch) => {
                  commitStyleChange({ ...style, ...patch })
                  setPage('create')
                  showNotice(t('applyTemplate'))
                }}
                onNotice={showNotice}
              />
            )}

            {page === 'print' && (
              <PrintPanel
                print={print}
                ready={ready}
                busy={pdfBusy}
                batchBusy={batchBusy}
                onChange={patchPrint}
                onExport={(sheet) => void handlePdf(sheet)}
                onBatchExport={(rows) => void handleBatch(rows)}
                onBatchZip={(rows, includeSvg) => void handleBatchZip(rows, includeSvg)}
              />
            )}

            {page === 'settings' && (
              <SettingsPanel onResetStyle={() => setStyle(initialStyle)} />
            )}
          </div>

          {(page === 'create' || page === 'templates') && (
            <QrPreview
              key={previewKey}
              data={ready ? payload : ' '}
              ready={ready}
              style={style}
              fileName={downloadName(content.kind)}
              payloadPreview={ready ? payload : ''}
              onCopied={() => showNotice(t('copied'))}
              onCopiedLink={() => showNotice(t('copiedLink'))}
              onChangeStyle={patchStyle}
              onFixStyle={(fixId) => {
                commitStyleChange(applyScanFix(style, fixId))
                showNotice(t('scanFixApplied'))
              }}
            />
          )}
        </div>

        <footer className="app-footer">
          <div className="footer-features">
            <span>{t('featureOffline')}</span>
            <span>{t('featureDesigns')}</span>
            <span>{t('featurePrint')}</span>
            <span>{t('featurePrivate')}</span>
          </div>
          <p>{t('appTagline')}</p>
        </footer>
      </div>

      {saveOpen && (
        <SaveDialog
          name={saveName}
          canUpdate={Boolean(activeSavedId)}
          onNameChange={setSaveName}
          onCancel={() => setSaveOpen(false)}
          onConfirm={confirmSave}
        />
      )}

      {notice && (
        <p className="toast" role="status">
          {notice}
        </p>
      )}

      {showCompare && compareStyle && (
        <CompareStylesModal
          compareStyle={compareStyle}
          currentStyle={style}
          onApply={() => {
            commitStyleChange(compareStyle)
            setShowCompare(false)
            showNotice(t('compareApplyA'))
          }}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  )
}

export default App
