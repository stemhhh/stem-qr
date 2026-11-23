import TemplateThumb from './TemplateThumb.tsx'
import { useI18n } from './i18n/I18nContext.tsx'
import type { QrStyle } from './qrStyle.ts'

type Props = {
  /** The snapshot saved for comparison (style A). */
  compareStyle: QrStyle
  /** The current live style (style B). */
  currentStyle: QrStyle
  /** Called when the user wants to apply style A as the current style. */
  onApply: () => void
  /** Called when the user closes the modal without applying. */
  onClose: () => void
}

export default function CompareStylesModal({
  compareStyle,
  currentStyle,
  onApply,
  onClose,
}: Props) {
  const { t } = useI18n()

  return (
    <div className="compare-modal" role="dialog" aria-label={t('compareStyle')}>
      <div className="compare-modal-inner">
        <h3>{t('compareStyle')}</h3>
        <div className="compare-thumbs">
          <div className="compare-thumb">
            <p className="compare-label">{t('compareA')}</p>
            <TemplateThumb patch={compareStyle} />
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onApply}
            >
              {t('compareApplyA')}
            </button>
          </div>
          <div className="compare-thumb">
            <p className="compare-label">{t('compareB')}</p>
            <TemplateThumb patch={currentStyle} />
          </div>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onClose}
        >
          {t('codesSaveCancel')}
        </button>
      </div>
    </div>
  )
}
