import { useRef } from 'react'
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from 'react'
import type { ErrorCorrectionLevel, GradientType } from 'qr-code-styling'
import ColorField from './ColorField.tsx'
import ContentFields from './ContentFields.tsx'
import ScanImport from './ScanImport.tsx'
import { iconPresets } from './iconPresets.ts'
import { applyPrintSafeStyle } from './scanAdvice.ts'
import {
  contentKinds,
  initialContent,
  popularContentKinds,
  type ContentForm,
} from './content.ts'
import { useI18n } from './i18n/I18nContext.tsx'
import {
  cornerDotStyles,
  cornerStyles,
  correctionLevels,
  dotStyles,
  exportSizes,
  frameStyles,
  initialStyle,
  moduleToCornerDot,
  moduleToCornerSquare,
  palettes,
  randomQrStyle,
  type CaptionPosition,
  type FrameStyle,
  type QrStyle,
} from './qrStyle.ts'
import { type CustomizeTab, kindLabel } from './kindLabel.ts'

type Props = {
  content: ContentForm
  style: QrStyle
  customizeTab: CustomizeTab
  showAllKinds: boolean
  kindSearch: string
  compareStyle: QrStyle | null
  showCompare: boolean
  ready: boolean
  patchContent: <K extends keyof ContentForm>(key: K, value: ContentForm[K]) => void
  patchStyle: <K extends keyof QrStyle>(key: K, value: QrStyle[K]) => void
  setStyle: Dispatch<SetStateAction<QrStyle>>
  setCustomizeTab: Dispatch<SetStateAction<CustomizeTab>>
  setShowAllKinds: Dispatch<SetStateAction<boolean>>
  setKindSearch: Dispatch<SetStateAction<string>>
  setContent: Dispatch<SetStateAction<ContentForm>>
  setCompareStyle: Dispatch<SetStateAction<QrStyle | null>>
  setShowCompare: Dispatch<SetStateAction<boolean>>
  commitStyleChange: (newStyle: QrStyle) => void
  openSaveDialog: () => void
  showNotice: (message: string) => void
  onNavigateToTemplates: () => void
}

export default function CreateStudio({
  content,
  style,
  customizeTab,
  showAllKinds,
  kindSearch,
  compareStyle,
  showCompare,
  ready,
  patchContent,
  patchStyle,
  setStyle,
  setCustomizeTab,
  setShowAllKinds,
  setKindSearch,
  setContent,
  setCompareStyle,
  setShowCompare,
  commitStyleChange,
  openSaveDialog,
  showNotice,
  onNavigateToTemplates,
}: Props) {
  const { t } = useI18n()
  const logoDropRef = useRef<HTMLDivElement>(null)

  function applyLogoFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        patchStyle('logo', reader.result)
        setCustomizeTab('logo')
        showNotice(t('logoDropped'))
      }
    }
    reader.readAsDataURL(file)
  }

  function handleLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    applyLogoFile(file)
    event.target.value = ''
  }

  return (
    <form
      className="editor"
      onSubmit={(event: FormEvent) => {
        event.preventDefault()
        if (!ready) {
          showNotice(t('generateQrNeedContent'))
          return
        }
        commitStyleChange(randomQrStyle(style))
        showNotice(t('generateQrDone'))
        document.querySelector('.preview-panel')?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }}
    >
      <header className="hero">
        <h1>{t('appHeadline')}</h1>
        <p>{t('appLead')}</p>
      </header>

      <section className="panel">
        <input
          type="search"
          className="kind-search"
          placeholder={t('kindSearch')}
          value={kindSearch}
          onChange={(e) => setKindSearch(e.target.value)}
          aria-label={t('kindSearch')}
        />
        <div className="kind-grid" role="tablist" aria-label={t('contentType')}>
          {(showAllKinds || popularContentKinds.includes(content.kind)
            ? showAllKinds
              ? contentKinds
              : popularContentKinds
            : [...popularContentKinds, content.kind]
          ).filter((kind) => {
            if (!kindSearch.trim()) return true
            const label = t(kindLabel[kind]).toLowerCase()
            return label.includes(kindSearch.trim().toLowerCase())
          }).map((kind) => (
            <button
              key={kind}
              type="button"
              role="tab"
              aria-selected={content.kind === kind}
              className={`kind-tile${content.kind === kind ? ' is-active' : ''}`}
              onClick={() => patchContent('kind', kind)}
            >
              <span className={`kind-icon kind-icon-${kind}`} aria-hidden="true" />
              {t(kindLabel[kind])}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm kinds-more"
          onClick={() => setShowAllKinds((open) => !open)}
        >
          {showAllKinds ? t('kindsLess') : t('kindsMore')}
        </button>
        <ContentFields content={content} onChange={patchContent} />
        <ScanImport
          onDecoded={(patch) => {
            setContent((prev) => ({ ...prev, ...patch }))
          }}
          onReset={() => setContent(initialContent)}
        />
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>{t('designStudio')}</h2>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setStyle(initialStyle)}
          >
            {t('resetStyle')}
          </button>
        </div>
        <p className="hint">{t('designStudioHint')}</p>

        <p className="field-label">{t('designShortcuts')}</p>
        <div className="shortcut-row">
          <button
            type="button"
            className={`shortcut${ !style.logo ? ' is-active' : ''}`}
            onClick={() => {
              patchStyle('logo', null)
              setCustomizeTab('logo')
            }}
          >
            {t('noLogo')}
          </button>
          <button
            type="button"
            className={`shortcut${style.logo ? ' is-active' : ''}`}
            onClick={() => setCustomizeTab('logo')}
          >
            {t('ownLogo')}
          </button>
          <button
            type="button"
            className={`shortcut${customizeTab === 'frame' ? ' is-active' : ''}`}
            onClick={() => setCustomizeTab('frame')}
          >
            {t('tabFrame')}
          </button>
          <button
            type="button"
            className="shortcut"
            onClick={onNavigateToTemplates}
          >
            {t('templates')}
          </button>
        </div>

        <div
          className="subtabs"
          role="tablist"
          aria-label={t('customize')}
          onKeyDown={(event) => {
            const order: CustomizeTab[] = [
              'design',
              'color',
              'frame',
              'logo',
              'advanced',
            ]
            const index = order.indexOf(customizeTab)
            if (event.key === 'ArrowRight') {
              event.preventDefault()
              setCustomizeTab(order[(index + 1) % order.length]!)
            } else if (event.key === 'ArrowLeft') {
              event.preventDefault()
              setCustomizeTab(order[(index - 1 + order.length) % order.length]!)
            }
          }}
        >
          {(
            [
              ['design', 'tabDesign'],
              ['color', 'tabColor'],
              ['frame', 'tabFrame'],
              ['logo', 'tabLogo'],
              ['advanced', 'tabAdvanced'],
            ] as const
          ).map(([id, key]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={customizeTab === id}
              tabIndex={customizeTab === id ? 0 : -1}
              className={`subtab${customizeTab === id ? ' is-active' : ''}`}
              onClick={() => setCustomizeTab(id)}
            >
              {t(key)}
            </button>
          ))}
        </div>

        {customizeTab === 'design' && (
          <div className="tab-body">
            <div className="field">
              <span>{t('modules')}</span>
              <div className="choice-row">
                {dotStyles.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`choice${style.dots === option.id ? ' is-active' : ''}`}
                    onClick={() => patchStyle('dots', option.id)}
                  >
                    {t(option.labelKey)}
                  </button>
                ))}
              </div>
            </div>
            <label className="check">
              <input
                type="checkbox"
                checked={
                  style.corners === moduleToCornerSquare(style.dots) &&
                  style.cornerDots === moduleToCornerDot(style.dots)
                }
                onChange={(event) => {
                  if (!event.target.checked) return
                  setStyle((prev) => ({
                    ...prev,
                    corners: moduleToCornerSquare(prev.dots),
                    cornerDots: moduleToCornerDot(prev.dots),
                  }))
                }}
              />
              {t('matchModuleShape')}
            </label>
            <div className="field">
              <span>{t('corners')}</span>
              <div className="choice-row">
                {cornerStyles.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`choice${style.corners === option.id ? ' is-active' : ''}`}
                    onClick={() => patchStyle('corners', option.id)}
                  >
                    {t(option.labelKey)}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span>{t('center')}</span>
              <div className="choice-row">
                {cornerDotStyles.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`choice${style.cornerDots === option.id ? ' is-active' : ''}`}
                    onClick={() => patchStyle('cornerDots', option.id)}
                  >
                    {t(option.labelKey)}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span>{t('qrOutline')}</span>
              <div className="choice-row">
                {(['square', 'circle'] as const).map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    className={`choice${style.shape === shape ? ' is-active' : ''}`}
                    onClick={() => patchStyle('shape', shape)}
                  >
                    {t(shape)}
                  </button>
                ))}
              </div>
            </div>
            <fieldset className="field">
              <legend>{t('quickPalette')}</legend>
              <div className="palette-row">
                {palettes.map((palette) => (
                  <button
                    key={palette.labelKey}
                    type="button"
                    className={`palette${style.foreground === palette.fg && style.background === palette.bg ? ' is-active' : ''}`}
                    onClick={() =>
                      setStyle((prev) => ({
                        ...prev,
                        foreground: palette.fg,
                        background: palette.bg,
                        cornerColor: palette.fg,
                        cornerDotColor: palette.fg,
                        useGradient: false,
                      }))
                    }
                    aria-label={t(palette.labelKey)}
                    title={t(palette.labelKey)}
                  >
                    <span style={{ background: palette.bg }} />
                    <span style={{ background: palette.fg }} />
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {customizeTab === 'color' && (
          <div className="tab-body">
            <p className="hint">{t('colorsHint')}</p>
            <ColorField
              label={t('modules')}
              value={style.foreground}
              onChange={(hex) => patchStyle('foreground', hex)}
            />
            <ColorField
              label={t('background')}
              value={style.background}
              disabled={style.transparentBackground}
              onChange={(hex) => patchStyle('background', hex)}
            />
            <label className="check">
              <input
                type="checkbox"
                checked={style.transparentBackground}
                onChange={(event) =>
                  patchStyle('transparentBackground', event.target.checked)
                }
              />
              {t('transparentBg')}
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={style.matchCorners}
                onChange={(event) =>
                  patchStyle('matchCorners', event.target.checked)
                }
              />
              {t('matchCorners')}
            </label>
            {!style.matchCorners && (
              <>
                <ColorField
                  label={t('corners')}
                  value={style.cornerColor}
                  onChange={(hex) => patchStyle('cornerColor', hex)}
                />
                <ColorField
                  label={t('cornerCenter')}
                  value={style.cornerDotColor}
                  onChange={(hex) => patchStyle('cornerDotColor', hex)}
                />
              </>
            )}
            <label className="check">
              <input
                type="checkbox"
                checked={style.useGradient}
                onChange={(event) =>
                  patchStyle('useGradient', event.target.checked)
                }
              />
              {t('moduleGradient')}
            </label>
            {style.useGradient && (
              <>
                <ColorField
                  label={t('gradientFrom')}
                  value={style.gradientFrom}
                  onChange={(hex) => patchStyle('gradientFrom', hex)}
                />
                <ColorField
                  label={t('gradientTo')}
                  value={style.gradientTo}
                  onChange={(hex) => patchStyle('gradientTo', hex)}
                />
                <label className="field">
                  <span>{t('gradientType')}</span>
                  <select
                    value={style.gradientType}
                    onChange={(event) =>
                      patchStyle(
                        'gradientType',
                        event.target.value as GradientType,
                      )
                    }
                  >
                    <option value="linear">{t('linear')}</option>
                    <option value="radial">{t('radial')}</option>
                  </select>
                </label>
                <label className="field">
                  <span>{t('rotation', { deg: style.gradientRotation })}</span>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={style.gradientRotation}
                    onChange={(event) =>
                      patchStyle('gradientRotation', Number(event.target.value))
                    }
                  />
                </label>
              </>
            )}
            <label className="check">
              <input
                type="checkbox"
                checked={style.useBackgroundGradient}
                disabled={style.transparentBackground}
                onChange={(event) =>
                  patchStyle('useBackgroundGradient', event.target.checked)
                }
              />
              {t('bgGradient')}
            </label>
            {style.useBackgroundGradient && !style.transparentBackground && (
              <>
                <ColorField
                  label={t('bgFrom')}
                  value={style.backgroundGradientFrom}
                  onChange={(hex) =>
                    patchStyle('backgroundGradientFrom', hex)
                  }
                />
                <ColorField
                  label={t('bgTo')}
                  value={style.backgroundGradientTo}
                  onChange={(hex) => patchStyle('backgroundGradientTo', hex)}
                />
              </>
            )}
          </div>
        )}

        {customizeTab === 'frame' && (
          <div className="tab-body">
            <label className="field">
              <span>{t('frame')}</span>
              <select
                value={style.frame}
                onChange={(event) =>
                  patchStyle('frame', event.target.value as FrameStyle)
                }
              >
                {frameStyles.map((option) => (
                  <option key={option.id} value={option.id}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
            </label>
            <ColorField
              label={t('frameColor')}
              value={style.frameColor}
              disabled={style.frame === 'none'}
              onChange={(hex) => patchStyle('frameColor', hex)}
            />
            <label className="field">
              <span>{t('caption')}</span>
              <input
                type="text"
                placeholder={t('captionPlaceholder')}
                value={style.caption}
                onChange={(event) => patchStyle('caption', event.target.value)}
              />
            </label>
            <label className="field">
              <span>{t('subtitle')}</span>
              <input
                type="text"
                placeholder={t('subtitlePlaceholder')}
                value={style.subtitle}
                onChange={(event) => patchStyle('subtitle', event.target.value)}
              />
            </label>
            <div className="field-grid">
              <label className="field">
                <span>{t('position')}</span>
                <select
                  value={style.captionPosition}
                  onChange={(event) =>
                    patchStyle(
                      'captionPosition',
                      event.target.value as CaptionPosition,
                    )
                  }
                >
                  <option value="below">{t('positionBelow')}</option>
                  <option value="above">{t('positionAbove')}</option>
                  <option value="none">{t('positionNone')}</option>
                </select>
              </label>
              <label className="field">
                <span>{t('captionSize', { px: style.captionSize })}</span>
                <input
                  type="range"
                  min={12}
                  max={28}
                  value={style.captionSize}
                  onChange={(event) =>
                    patchStyle('captionSize', Number(event.target.value))
                  }
                />
              </label>
            </div>
            <ColorField
              label={t('textColor')}
              value={style.captionColor}
              onChange={(hex) => patchStyle('captionColor', hex)}
            />
          </div>
        )}

        {customizeTab === 'logo' && (
          <div className="tab-body">
            <p className="field-label">{t('iconPresets')}</p>
            <div className="icon-preset-row">
              {iconPresets.map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  className={`icon-preset${style.logo === icon.dataUrl ? ' is-active' : ''}`}
                  title={t(icon.labelKey)}
                  aria-label={t(icon.labelKey)}
                  onClick={() => {
                    patchStyle('logo', icon.dataUrl)
                    patchStyle('hideLogoDots', true)
                    if (style.logoSize > 0.3) patchStyle('logoSize', 0.26)
                  }}
                >
                  <img src={icon.dataUrl} alt="" />
                </button>
              ))}
            </div>
            <div
              ref={logoDropRef}
              className="logo-drop"
              onDragOver={(event) => {
                event.preventDefault()
                event.dataTransfer.dropEffect = 'copy'
              }}
              onDrop={(event) => {
                event.preventDefault()
                const file = event.dataTransfer.files?.[0]
                if (file) applyLogoFile(file)
              }}
            >
              <p>{t('logoDropHint')}</p>
              <div className="logo-row">
                <label className="btn btn-ghost file-btn">
                  {style.logo ? t('changeLogo') : t('addLogo')}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogo}
                    hidden
                  />
                </label>
                {style.logo && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => patchStyle('logo', null)}
                  >
                    {t('removeLogo')}
                  </button>
                )}
              </div>
            </div>
            {style.logo && (
              <>
                <label className="field">
                  <span>
                    {t('logoSize', { pct: Math.round(style.logoSize * 100) })}
                  </span>
                  <input
                    type="range"
                    min={16}
                    max={40}
                    value={Math.round(style.logoSize * 100)}
                    onChange={(event) =>
                      patchStyle('logoSize', Number(event.target.value) / 100)
                    }
                  />
                </label>
                <label className="field">
                  <span>{t('logoMargin', { px: style.logoMargin })}</span>
                  <input
                    type="range"
                    min={0}
                    max={16}
                    value={style.logoMargin}
                    onChange={(event) =>
                      patchStyle('logoMargin', Number(event.target.value))
                    }
                  />
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={style.hideLogoDots}
                    onChange={(event) =>
                      patchStyle('hideLogoDots', event.target.checked)
                    }
                  />
                  {t('hideLogoDots')}
                </label>
              </>
            )}
            <label className="field">
              <span>
                {style.logo ? t('errorCorrectionLogo') : t('errorCorrection')}
              </span>
              <select
                value={style.logo ? 'H' : style.errorCorrection}
                disabled={Boolean(style.logo)}
                onChange={(event) =>
                  patchStyle(
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

        {customizeTab === 'advanced' && (
          <div className="tab-body">
            <label className="field">
              <span>{t('innerMargin', { px: style.margin })}</span>
              <input
                type="range"
                min={0}
                max={40}
                value={style.margin}
                onChange={(event) =>
                  patchStyle('margin', Number(event.target.value))
                }
              />
            </label>
            <label className="field">
              <span>
                {t('bgRound', {
                  pct: Math.round(style.backgroundRound * 100),
                })}
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(style.backgroundRound * 100)}
                disabled={style.shape === 'circle'}
                onChange={(event) =>
                  patchStyle(
                    'backgroundRound',
                    Number(event.target.value) / 100,
                  )
                }
              />
            </label>
            <label className="field">
              <span>{t('imageSize')}</span>
              <select
                value={style.exportSize}
                onChange={(event) =>
                  patchStyle('exportSize', Number(event.target.value))
                }
              >
                {exportSizes.map((size) => (
                  <option key={size} value={size}>
                    {size} × {size} px
                  </option>
                ))}
              </select>
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={style.roundSize}
                onChange={(event) =>
                  patchStyle('roundSize', event.target.checked)
                }
              />
              {t('roundSize')}
            </label>
          </div>
        )}

        <div className="create-actions">
          <button type="submit" className="btn btn-primary btn-generate">
            {t('generateQr')}
            <span aria-hidden="true">✦</span>
          </button>
          <p className="generate-hint">{t('generateQrHint')}</p>
          <button
            type="button"
            className="btn btn-outline btn-generate"
            disabled={!ready}
            onClick={openSaveDialog}
          >
            {t('codesSave')}
          </button>
          <div className="create-extra-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                commitStyleChange(applyPrintSafeStyle(style))
                showNotice(t('printSafeApplied'))
              }}
            >
              {t('printSafe')}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setCompareStyle(structuredClone(style))
                showNotice(t('compareSave'))
              }}
            >
              {t('compareSave')}
            </button>
            {compareStyle && (
              <button
                type="button"
                className={`btn btn-ghost btn-sm${showCompare ? ' is-active' : ''}`}
                onClick={() => setShowCompare((v) => !v)}
              >
                {t('compareStyle')}
              </button>
            )}
          </div>
        </div>
      </section>
    </form>
  )
}
