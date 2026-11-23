import type { DecodeStatus } from './qrDecode.ts'
import type { ScanAdvice, ScanFixId } from './scanAdvice.ts'
import { useI18n } from './i18n/I18nContext.tsx'

type Props = {
  advice: ScanAdvice[]
  onFix?: (fixId: ScanFixId) => void
  decodeStatus?: DecodeStatus
}

export default function ScanAdvicePanel({ advice, onFix, decodeStatus = 'idle' }: Props) {
  const { t } = useI18n()
  const decodeTone =
    decodeStatus === 'ok'
      ? 'ok'
      : decodeStatus === 'fail'
        ? 'critical'
        : decodeStatus === 'checking'
          ? 'warning'
          : null

  return (
    <div className="scan-advice-list" role="status">
      {decodeTone && (
        <div className={`scan-advice is-${decodeTone}`}>
          <strong>
            <span className={`scan-mark is-${decodeTone}`} aria-hidden="true" />
            {decodeStatus === 'ok'
              ? t('scanDecodeOk')
              : decodeStatus === 'fail'
                ? t('scanDecodeFail')
                : t('scanDecodeChecking')}
          </strong>
          {decodeStatus === 'fail' && <p>{t('scanDecodeFailHint')}</p>}
        </div>
      )}
      {!advice.length && decodeStatus === 'idle' && (
        <div className="scan-advice is-ok">
          <strong>{t('scanOkTitle')}</strong>
          <p>{t('scanOkBody')}</p>
        </div>
      )}
      {advice.map((item) => (
        <div key={item.id} className={`scan-advice is-${item.severity}`}>
          <strong>
            <span className={`scan-mark is-${item.severity}`} aria-hidden="true" />
            {t(item.messageKey)}
          </strong>
          {(item.messageKey === 'scanContrastWarn' ||
            item.messageKey === 'scanContrastCritical') && (
            <p>{t('scanContrastHint')}</p>
          )}
          {item.fixId && onFix && (
            <button
              type="button"
              className="btn btn-ghost btn-sm scan-fix"
              onClick={() => onFix(item.fixId!)}
            >
              {t('scanFixAction')}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
