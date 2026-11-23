import { useRef, useState } from 'react'
import type { ContentForm } from './content.ts'
import { decodeQrFromImageBlob } from './qrDecode.ts'
import { parseQrPayload } from './parseQrPayload.ts'
import { useI18n } from './i18n/I18nContext.tsx'

type Props = {
  onDecoded: (patch: Partial<ContentForm>, raw: string) => void
  onReset?: () => void
}

type Status = 'idle' | 'decoding' | 'ok' | 'fail'

export default function ScanImport({ onDecoded, onReset }: Props) {
  const { t } = useI18n()
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [notice, setNotice] = useState('')
  const [dragging, setDragging] = useState(false)

  function handleReset() {
    setStatus('idle')
    setNotice('')
    if (fileRef.current) fileRef.current.value = ''
    onReset?.()
  }

  async function processBlob(blob: Blob) {
    setStatus('decoding')
    setNotice('')
    try {
      const raw = await decodeQrFromImageBlob(blob)
      if (!raw) {
        setStatus('fail')
        setNotice(t('scanImportFail'))
        return
      }
      const patch = parseQrPayload(raw)
      setStatus('ok')
      const short = raw.length > 40 ? `${raw.slice(0, 37)}…` : raw
      setNotice(t('scanImportOk', { raw: short }))
      onDecoded(patch, raw)
    } catch {
      setStatus('fail')
      setNotice(t('scanImportFail'))
    }
  }

  async function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    await processBlob(file)
  }

  async function handlePaste() {
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith('image/'))
        if (imageType) {
          const blob = await item.getType(imageType)
          await processBlob(blob)
          return
        }
      }
      setStatus('fail')
      setNotice(t('scanImportFail'))
    } catch {
      setStatus('fail')
      setNotice(t('scanImportFail'))
    }
  }

  return (
    <div
      className={`scan-import${dragging ? ' is-dragging' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={async (e) => {
        e.preventDefault()
        setDragging(false)
        await handleFiles(e.dataTransfer.files)
      }}
    >
      <details>
        <summary className="scan-import-title">{t('scanImportTitle')}</summary>
        <p className="hint">{t('scanImportHint')}</p>
        <div className="scan-import-actions">
          <label className="btn btn-ghost btn-sm file-btn">
            {t('scanImportChoose')}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => void handleFiles(e.target.files).finally(() => { e.target.value = '' })}
            />
          </label>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => void handlePaste()}
          >
            {t('scanImportPaste')}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleReset}
          >
            {t('scanImportReset')}
          </button>
        </div>
        <p className="scan-import-drop-hint">{t('scanImportDrop')}</p>
        {status === 'decoding' && <p className="hint">{t('scanImportDecoding')}</p>}
        {notice && (
          <p className={`scan-import-notice ${status === 'ok' ? 'is-ok' : 'is-fail'}`}>
            {notice}
          </p>
        )}
      </details>
    </div>
  )
}
