import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { batchCsvExample, parseBatchCsv, type BatchRow } from './batchCsv.ts'
import { useI18n } from './i18n/I18nContext.tsx'
import type { PrintSettings, SheetKind } from './qrStyle.ts'
import { sheetPresets } from './qrStyle.ts'

type Props = {
  print: PrintSettings
  busy: boolean
  ready: boolean
  batchBusy: boolean
  onChange: <K extends keyof PrintSettings>(key: K, value: PrintSettings[K]) => void
  onExport: (sheet: SheetKind) => void
  onBatchExport: (rows: BatchRow[]) => void
  onBatchZip?: (rows: BatchRow[], includeSvg: boolean) => void
}

export default function PrintPanel({
  print,
  busy,
  ready,
  batchBusy,
  onChange,
  onExport,
  onBatchExport,
  onBatchZip,
}: Props) {
  const { t } = useI18n()
  const fileRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<BatchRow[]>([])
  const [parseError, setParseError] = useState('')
  const [includeSvg, setIncludeSvg] = useState(false)

  function handleCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : ''
      const parsed = parseBatchCsv(text)
      if (!parsed.length) {
        setRows([])
        setParseError(t('batchEmpty'))
        return
      }
      setParseError('')
      setRows(parsed)
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  function loadExample() {
    const parsed = parseBatchCsv(batchCsvExample())
    setParseError('')
    setRows(parsed)
  }

  return (
    <section className="panel">
      <h2>{t('printPdf')}</h2>
      <p className="hint">{t('printNote')}</p>

      <div className="sheet-grid">
        {sheetPresets.map((preset) => (
          <button
            key={preset.kind}
            type="button"
            className="sheet-btn"
            disabled={!ready || busy}
            onClick={() => onExport(preset.kind)}
          >
            <span
              className="sheet-preview"
              aria-hidden="true"
              style={{ gridTemplateColumns: `repeat(${preset.cols}, 1fr)` }}
            >
              {Array.from({ length: preset.rows * preset.cols }, (_, index) => (
                <span key={index} />
              ))}
            </span>
            <strong>{t(preset.labelKey)}</strong>
            <small>{t(preset.hintKey)}</small>
          </button>
        ))}
      </div>

      <div className="field-grid">
        <label className="field">
          <span>{t('paper')}</span>
          <select
            value={print.paper}
            onChange={(event) =>
              onChange('paper', event.target.value as PrintSettings['paper'])
            }
          >
            <option value="a4">{t('paperA4')}</option>
            <option value="letter">{t('paperLetter')}</option>
          </select>
        </label>
        <label className="field">
          <span>{t('sheetCopies')}</span>
          <input
            type="number"
            min={1}
            max={20}
            value={print.copies}
            onChange={(event) => {
              const next = Math.min(20, Math.max(1, Number(event.target.value) || 1))
              onChange('copies', next)
            }}
          />
        </label>
      </div>

      <label className="field">
        <span>{t('pageTitle')}</span>
        <input
          type="text"
          placeholder={t('pageTitlePlaceholder')}
          value={print.pageTitle}
          onChange={(event) => onChange('pageTitle', event.target.value)}
        />
      </label>

      <label className="check">
        <input
          type="checkbox"
          checked={print.showCutMarks}
          onChange={(event) => onChange('showCutMarks', event.target.checked)}
        />
        {t('cutMarks')}
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={print.showCaption}
          onChange={(event) => onChange('showCaption', event.target.checked)}
        />
        {t('includeCaption')}
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={print.showSubtitle}
          onChange={(event) => onChange('showSubtitle', event.target.checked)}
        />
        {t('includeSubtitle')}
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={print.showFooter}
          onChange={(event) => onChange('showFooter', event.target.checked)}
        />
        {t('printFooter')}
      </label>

      <div className="batch-block">
        <h3>{t('batchTitle')}</h3>
        <p className="hint">{t('batchHint')}</p>
        <div className="preview-actions-row">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => fileRef.current?.click()}
          >
            {t('batchLoadCsv')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={loadExample}>
            {t('batchExample')}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv,text/plain"
            hidden
            onChange={handleCsv}
          />
        </div>
        {parseError && <p className="field-error">{parseError}</p>}
        {rows.length > 0 && (
          <>
            <p className="hint">{t('batchCount', { count: rows.length })}</p>
            <ul className="batch-list">
              {rows.slice(0, 6).map((row) => (
                <li key={`${row.label}-${row.data}`}>
                  <strong>{row.label}</strong>
                  <code>{row.data.length > 40 ? `${row.data.slice(0, 37)}…` : row.data}</code>
                </li>
              ))}
              {rows.length > 6 && <li>… +{rows.length - 6}</li>}
            </ul>
            <label className="check">
              <input
                type="checkbox"
                checked={includeSvg}
                onChange={(e) => setIncludeSvg(e.target.checked)}
              />
              {t('batchZipIncludeSvg')}
            </label>
            <div className="preview-actions-row">
              <button
                type="button"
                className="btn btn-primary"
                disabled={batchBusy}
                onClick={() => onBatchExport(rows)}
              >
                {batchBusy ? t('batchBusy') : t('batchExportPdf')}
              </button>
              {onBatchZip && (
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={batchBusy}
                  onClick={() => onBatchZip(rows, includeSvg)}
                >
                  {t('batchExportZip')}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
