import { useEffect, useId, useState } from 'react'
import {
  clampByte,
  hexToRgb,
  hsvToRgb,
  normalizeHex,
  rgbToHex,
  rgbToHsv,
  spectrumHues,
  spectrumNeutrals,
} from './color.ts'
import { useI18n } from './i18n/I18nContext.tsx'

type Props = {
  label: string
  value: string
  disabled?: boolean
  onChange: (hex: string) => void
}

export default function ColorField({ label, value, disabled, onChange }: Props) {
  const { t } = useI18n()
  const panelId = useId()
  const rgb = hexToRgb(value) ?? { r: 0, g: 0, b: 0 }
  const hsv = rgbToHsv(rgb)
  const [hexDraft, setHexDraft] = useState(normalizeHex(value))
  const [advancedOpen, setAdvancedOpen] = useState(false)

  useEffect(() => {
    setHexDraft(normalizeHex(value))
  }, [value])

  function commitRgb(next: { r: number; g: number; b: number }) {
    onChange(rgbToHex(next))
  }

  function commitChannel(channel: 'r' | 'g' | 'b', raw: string) {
    if (raw === '') return
    commitRgb({ ...rgb, [channel]: clampByte(Number(raw)) })
  }

  function commitHue(raw: string) {
    const nextSat = hsv.s === 0 ? 1 : hsv.s
    const nextVal = hsv.v === 0 ? 1 : hsv.v
    commitRgb(hsvToRgb({ h: Number(raw), s: nextSat, v: nextVal }))
  }

  function commitHex() {
    const parsed = hexToRgb(hexDraft)
    if (parsed) onChange(rgbToHex(parsed))
    else setHexDraft(normalizeHex(value))
  }

  return (
    <fieldset className={`color-field${disabled ? ' is-disabled' : ''}`} disabled={disabled}>
      <legend>{label}</legend>
      <div className="color-top">
        <input
          type="color"
          className="color-swatch"
          value={normalizeHex(value)}
          onChange={(event) => onChange(event.target.value)}
          aria-label={t('colorSpectrumAria', { label })}
        />
        <label className="color-hex">
          <span>{t('hex')}</span>
          <input
            type="text"
            spellCheck={false}
            value={hexDraft}
            onChange={(event) => setHexDraft(event.target.value)}
            onBlur={commitHex}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitHex()
            }}
          />
        </label>
      </div>

      <div className="spectrum-row" role="list" aria-label={t('spectrumAria', { label })}>
        {spectrumHues.map((hue) => (
          <button
            key={hue}
            type="button"
            className="spectrum-chip"
            style={{ background: hue }}
            aria-label={hue}
            onClick={() => onChange(hue)}
          />
        ))}
      </div>
      <div
        className="spectrum-row spectrum-neutrals"
        role="list"
        aria-label={t('neutralsAria', { label })}
      >
        {spectrumNeutrals.map((tone) => (
          <button
            key={tone}
            type="button"
            className="spectrum-chip"
            style={{ background: tone }}
            aria-label={tone}
            onClick={() => onChange(tone)}
          />
        ))}
      </div>

      <button
        type="button"
        className={`color-toggle${advancedOpen ? ' is-open' : ''}`}
        aria-expanded={advancedOpen}
        aria-controls={panelId}
        onClick={() => setAdvancedOpen((open) => !open)}
      >
        <span className="color-toggle-chevron" aria-hidden="true" />
        <span>{t('colorAdvanced')}</span>
        <span className="color-toggle-hint">
          {advancedOpen ? t('colorHideAdvanced') : t('colorShowAdvanced')}
        </span>
      </button>

      {advancedOpen && (
        <div id={panelId} className="color-advanced">
          <label className="color-slider">
            <span>{t('hue')}</span>
            <input
              type="range"
              className="hue-slider"
              min={0}
              max={360}
              value={Math.round(hsv.h)}
              onChange={(event) => commitHue(event.target.value)}
            />
          </label>
          <label className="color-slider">
            <span>{t('saturation')}</span>
            <input
              type="range"
              className="sat-slider"
              min={0}
              max={100}
              value={Math.round(hsv.s * 100)}
              style={{
                background: `linear-gradient(to right, ${rgbToHex(hsvToRgb({ ...hsv, s: 0 }))}, ${rgbToHex(hsvToRgb({ ...hsv, s: 1 }))})`,
              }}
              onChange={(event) =>
                commitRgb(hsvToRgb({ ...hsv, s: Number(event.target.value) / 100 }))
              }
            />
          </label>
          <label className="color-slider">
            <span>{t('brightness')}</span>
            <input
              type="range"
              className="val-slider"
              min={0}
              max={100}
              value={Math.round(hsv.v * 100)}
              style={{
                background: `linear-gradient(to right, #000, ${rgbToHex(hsvToRgb({ ...hsv, v: 1 }))})`,
              }}
              onChange={(event) =>
                commitRgb(hsvToRgb({ ...hsv, v: Number(event.target.value) / 100 }))
              }
            />
          </label>

          <div className="rgb-grid">
            {(['r', 'g', 'b'] as const).map((channel) => (
              <label key={channel} className="rgb-channel">
                <span>{channel.toUpperCase()}</span>
                <input
                  type="range"
                  className={`rgb-slider rgb-${channel}`}
                  min={0}
                  max={255}
                  value={rgb[channel]}
                  onChange={(event) => commitChannel(channel, event.target.value)}
                />
                <input
                  type="number"
                  min={0}
                  max={255}
                  inputMode="numeric"
                  value={rgb[channel]}
                  onChange={(event) => commitChannel(channel, event.target.value)}
                  aria-label={`${label} ${channel.toUpperCase()}`}
                />
              </label>
            ))}
          </div>
          <p className="rgb-sum">
            {t('rgbSum', { r: rgb.r, g: rgb.g, b: rgb.b, sum: rgb.r + rgb.g + rgb.b })}
          </p>
        </div>
      )}
    </fieldset>
  )
}
