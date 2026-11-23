import { useEffect, useMemo, useRef, useState } from 'react'
import QRCodeStyling from 'qr-code-styling'
import type { ErrorCorrectionLevel, FileExtension } from 'qr-code-styling'
import ColorField from './ColorField.tsx'
import ScanAdvicePanel from './ScanAdvicePanel.tsx'
import { useI18n } from './i18n/I18nContext.tsx'
import { blobToBase64, buildOptions, saveBlob } from './qrBuild.ts'
import { verifyLiveQr, type DecodeStatus } from './qrDecode.ts'
import { qrVisualFingerprint } from './qrFingerprint.ts'
import { getScanAdvice, type ScanFixId } from './scanAdvice.ts'
import { correctionLevels, exportSizes, type QrStyle } from './qrStyle.ts'

type PreviewMode = 'preview' | 'design'
type MockupKind = 'none' | 'card' | 'poster' | 'phone'

type Props = {
  data: string
  ready: boolean
  style: QrStyle
  fileName: string
  payloadPreview: string
  onCopied: () => void
  onCopiedLink: () => void
  onChangeStyle: <K extends keyof QrStyle>(key: K, value: QrStyle[K]) => void
  onFixStyle?: (fixId: ScanFixId) => void
}

const PREVIEW_SIZE = 280

export default function QrPreview({
  data,
  ready,
  style,
  fileName,
  payloadPreview,
  onCopied,
  onCopiedLink,
  onChangeStyle,
  onFixStyle,
}: Props) {
  const { t, locale } = useI18n()
  const mountRef = useRef<HTMLDivElement>(null)
  const qrRef = useRef<QRCodeStyling | null>(null)
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<PreviewMode>('preview')
  const [mockup, setMockup] = useState<MockupKind>('none')
  const [decodeStatus, setDecodeStatus] = useState<DecodeStatus>('idle')
  const [lastSavedPath, setLastSavedPath] = useState<string | null>(null)
  const visualKey = useMemo(() => qrVisualFingerprint(style), [style])
  const advice = useMemo(() => getScanAdvice(style), [style])
  const styleRef = useRef(style)
  styleRef.current = style
  const readyRef = useRef(ready)
  readyRef.current = ready

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const qr = new QRCodeStyling({
      type: 'canvas',
      width: PREVIEW_SIZE,
      height: PREVIEW_SIZE,
      data: ' ',
    })
    qr.append(mount)
    qrRef.current = qr

    return () => {
      mount.replaceChildren()
      qrRef.current = null
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const handle = window.setTimeout(() => {
      void (async () => {
        const qr = qrRef.current
        if (!qr) return
        qr.update(buildOptions(data, styleRef.current, PREVIEW_SIZE, 'canvas'))
        if (!readyRef.current || !data.trim()) {
          setDecodeStatus('idle')
          return
        }
        setDecodeStatus('checking')
        try {
          const status = await verifyLiveQr(data, styleRef.current, async () => {
            const raw = await qr.getRawData('png')
            return raw instanceof Blob ? raw : null
          })
          if (!cancelled) setDecodeStatus(status)
        } catch {
          if (!cancelled) setDecodeStatus('fail')
        }
      })()
    }, 180)
    return () => {
      cancelled = true
      window.clearTimeout(handle)
    }
  }, [data, visualKey, ready])

  async function withExportSize(action: (qr: QRCodeStyling) => Promise<void>) {
    const qr = qrRef.current
    if (!qr || !ready || busy) return
    setBusy(true)
    try {
      qr.update(buildOptions(data, style, style.exportSize, 'canvas'))
      await action(qr)
    } finally {
      qr.update(buildOptions(data, style, PREVIEW_SIZE, 'canvas'))
      setBusy(false)
    }
  }

  async function handleDownload(extension: FileExtension) {
    await withExportSize(async (qr) => {
      if (window.qrDesktop?.isDesktop) {
        const raw = await qr.getRawData(extension)
        if (!(raw instanceof Blob)) return
        const base64 = await blobToBase64(raw)
        const result = await window.qrDesktop.saveFile({
          defaultName: `${fileName}.${extension}`,
          mime: raw.type || 'application/octet-stream',
          base64,
          locale,
        })
        if (result.saved && result.filePath) setLastSavedPath(result.filePath)
        return
      }
      await qr.download({ name: fileName, extension })
    })
  }

  async function revealInFolder() {
    if (!lastSavedPath || !window.qrDesktop?.showItemInFolder) return
    await window.qrDesktop.showItemInFolder(lastSavedPath)
  }

  async function handlePdf() {
    await withExportSize(async (qr) => {
      const { buildSingleQrPdf } = await import('./exportExtras.ts')
      const raw = await qr.getRawData('png')
      if (!(raw instanceof Blob)) return
      const blob = await buildSingleQrPdf(
        raw,
        style.exportSize,
        style.caption.trim() || undefined,
      )
      await saveBlob(blob, `${fileName}.pdf`, locale)
    })
  }

  async function handleEps() {
    if (!ready || !data.trim() || busy) return
    setBusy(true)
    try {
      const { buildVectorEps } = await import('./exportExtras.ts')
      const foreground = style.useGradient ? style.gradientFrom : style.foreground
      const background = style.useBackgroundGradient
        ? style.backgroundGradientFrom
        : style.background
      const blob = buildVectorEps(data, {
        size: style.exportSize,
        margin: style.margin,
        foreground,
        background,
        errorCorrection: style.logo ? 'H' : style.errorCorrection,
      })
      await saveBlob(blob, `${fileName}.eps`, locale)
    } finally {
      setBusy(false)
    }
  }

  async function handleCopy() {
    await withExportSize(async (qr) => {
      const raw = await qr.getRawData('png')
      if (!(raw instanceof Blob)) return
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': raw })])
      onCopied()
    })
  }

  async function handleCopyLink() {
    if (!payloadPreview) return
    try {
      await navigator.clipboard.writeText(payloadPreview)
      onCopiedLink()
    } catch {
      /* ignore */
    }
  }

  const sheetClass = [
    'preview-sheet',
    ready ? '' : 'is-empty',
    mode === 'design' ? 'is-compact' : '',
    style.shape === 'circle' ? 'is-circle' : '',
    style.transparentBackground ? 'is-transparent' : '',
    `frame-${style.frame}`,
    mockup !== 'none' ? `mockup-${mockup}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const caption = style.caption.trim()
  const subtitle = style.subtitle.trim()
  const shortPayload =
    payloadPreview.length > 42
      ? `${payloadPreview.slice(0, 39)}…`
      : payloadPreview

  return (
    <aside className="preview-panel">
      <div
        className="preview-tabs"
        role="tablist"
        aria-label={t('preview')}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault()
            setMode((prev) => (prev === 'preview' ? 'design' : 'preview'))
          }
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'preview'}
          tabIndex={mode === 'preview' ? 0 : -1}
          className={`preview-tab${mode === 'preview' ? ' is-active' : ''}`}
          onClick={() => setMode('preview')}
        >
          {t('preview')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'design'}
          tabIndex={mode === 'design' ? 0 : -1}
          className={`preview-tab${mode === 'design' ? ' is-active' : ''}`}
          onClick={() => setMode('design')}
        >
          {t('editDesign')}
        </button>
      </div>

      {mode === 'preview' && (
        <div className="mockup-switcher" role="group" aria-label="Mockup">
          {(['none', 'card', 'poster', 'phone'] as MockupKind[]).map((mk) => {
            const labelKey =
              mk === 'none'
                ? 'mockupNone'
                : mk === 'card'
                  ? 'mockupCard'
                  : mk === 'poster'
                    ? 'mockupPoster'
                    : 'mockupPhone'
            return (
              <button
                key={mk}
                type="button"
                className={`mockup-btn${mockup === mk ? ' is-active' : ''}`}
                onClick={() => setMockup(mk)}
              >
                {t(labelKey)}
              </button>
            )
          })}
        </div>
      )}

      <div className={sheetClass} style={{ color: style.frameColor }}>
        {mode === 'preview' &&
          style.captionPosition === 'above' &&
          caption &&
          ready && (
            <p
              className="preview-caption"
              style={{ color: style.captionColor, fontSize: style.captionSize }}
            >
              {caption}
            </p>
          )}
        {mode === 'preview' &&
          style.captionPosition === 'above' &&
          subtitle &&
          ready && <p className="preview-subtitle">{subtitle}</p>}
        <div ref={mountRef} className="preview-canvas" />
        {mode === 'preview' &&
          style.captionPosition === 'below' &&
          caption &&
          ready && (
            <p
              className="preview-caption"
              style={{ color: style.captionColor, fontSize: style.captionSize }}
            >
              {caption}
            </p>
          )}
        {mode === 'preview' &&
          style.captionPosition === 'below' &&
          subtitle &&
          ready && <p className="preview-subtitle">{subtitle}</p>}
        {mode === 'preview' && !ready && (
          <p className="preview-hint">{t('previewEmpty')}</p>
        )}
      </div>

      <ScanAdvicePanel advice={advice} onFix={onFixStyle} decodeStatus={decodeStatus} />

      {mode === 'preview' ? (
        <>
          <p className={`ready-badge${ready ? ' is-ready' : ''}`}>
            <span aria-hidden="true">{ready ? '✓' : '…'}</span>
            {ready ? t('readyStatus') : t('waitingStatus')}
          </p>

          <div className="preview-actions">
            <p className="field-label">{t('exportFormats')}</p>
            <button
              type="button"
              className="btn btn-primary btn-block"
              disabled={!ready || busy}
              onClick={() => void handleDownload('png')}
            >
              {t('downloadPng')}
            </button>
            <div className="preview-actions-row preview-actions-grid">
              <button
                type="button"
                className="btn btn-outline"
                disabled={!ready || busy}
                onClick={() => void handleDownload('svg')}
              >
                {t('downloadSvg')}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                disabled={!ready || busy}
                onClick={() => void handleDownload('jpeg')}
              >
                {t('downloadJpg')}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                disabled={!ready || busy}
                onClick={() => void handlePdf()}
              >
                {t('downloadPdf')}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                disabled={!ready || busy}
                onClick={() => void handleEps()}
              >
                {t('downloadEps')}
              </button>
            </div>
            <p className="generate-hint">{t('exportEpsNote')}</p>
            <button
              type="button"
              className="btn btn-ghost btn-block"
              disabled={!ready || busy}
              onClick={() => void handleCopy()}
            >
              {t('copy')}
            </button>
            {lastSavedPath && window.qrDesktop?.showItemInFolder && (
              <button
                type="button"
                className="btn btn-ghost btn-block"
                onClick={() => void revealInFolder()}
              >
                {t('showInFolder')}
              </button>
            )}
            <p className="generate-hint">{t('exportHiRes')}: {style.exportSize}px</p>
          </div>

          <div className="payload-box">
            <span>{t('payloadLink')}</span>
            <div className="payload-row">
              <code title={payloadPreview || undefined}>
                {ready ? shortPayload : '—'}
              </code>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                disabled={!ready}
                aria-label={t('copy')}
                onClick={() => void handleCopyLink()}
              >
                ⎘
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="design-side">
          <ColorField
            label={t('modules')}
            value={style.foreground}
            onChange={(hex) => onChangeStyle('foreground', hex)}
          />
          <ColorField
            label={t('background')}
            value={style.background}
            disabled={style.transparentBackground}
            onChange={(hex) => onChangeStyle('background', hex)}
          />
          <label className="field">
            <span>{t('imageSize')}</span>
            <select
              value={style.exportSize}
              onChange={(event) =>
                onChangeStyle('exportSize', Number(event.target.value))
              }
            >
              {exportSizes.map((size) => (
                <option key={size} value={size}>
                  {size} × {size} px
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t('errorCorrection')}</span>
            <select
              value={style.logo ? 'H' : style.errorCorrection}
              disabled={Boolean(style.logo)}
              onChange={(event) =>
                onChangeStyle(
                  'errorCorrection',
                  event.target.value as ErrorCorrectionLevel,
                )
              }
            >
              {correctionLevels.map((option) => (
                <option key={option.id} value={option.id}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </aside>
  )
}
