import type {
  ContentForm,
  ContentKind,
  CryptoAsset,
  PaymentKind,
  SocialNetwork,
  WifiSecurity,
} from './content.ts'
import { cryptoAssets, socialNetworks } from './content.ts'
import { useI18n } from './i18n/I18nContext.tsx'
import type { MessageKey } from './i18n/messages.ts'

type FieldProps = {
  content: ContentForm
  onChange: <K extends keyof ContentForm>(key: K, value: ContentForm[K]) => void
}

const socialLabel: Record<SocialNetwork, MessageKey> = {
  instagram: 'socialInstagram',
  facebook: 'socialFacebook',
  x: 'socialX',
  tiktok: 'socialTiktok',
  youtube: 'socialYoutube',
  linkedin: 'socialLinkedin',
  telegram: 'socialTelegram',
  other: 'socialOther',
}

const cryptoLabel: Record<CryptoAsset, MessageKey> = {
  bitcoin: 'cryptoBitcoin',
  ethereum: 'cryptoEthereum',
  litecoin: 'cryptoLitecoin',
  dogecoin: 'cryptoDogecoin',
  other: 'cryptoOther',
}

export default function ContentFields({ content, onChange }: FieldProps) {
  const { t } = useI18n()
  const kind: ContentKind = content.kind

  if (kind === 'url') {
    return (
      <label className="field">
        <span>{t('fieldLink')}</span>
        <input
          type="url"
          placeholder={t('placeholderUrl')}
          value={content.url}
          onChange={(event) => onChange('url', event.target.value)}
        />
      </label>
    )
  }

  if (kind === 'text') {
    return (
      <label className="field">
        <span>{t('fieldMessage')}</span>
        <textarea
          rows={4}
          placeholder={t('placeholderText')}
          value={content.text}
          onChange={(event) => onChange('text', event.target.value)}
        />
      </label>
    )
  }

  if (kind === 'wifi') {
    return (
      <>
        <label className="field">
          <span>{t('fieldWifiSsid')}</span>
          <input
            type="text"
            value={content.wifiSsid}
            onChange={(event) => onChange('wifiSsid', event.target.value)}
            autoComplete="off"
          />
        </label>
        <div className="field-grid">
          <label className="field">
            <span>{t('fieldSecurity')}</span>
            <select
              value={content.wifiSecurity}
              onChange={(event) =>
                onChange('wifiSecurity', event.target.value as WifiSecurity)
              }
            >
              <option value="WPA">{t('securityWpa')}</option>
              <option value="WEP">{t('securityWep')}</option>
              <option value="nopass">{t('securityNone')}</option>
            </select>
          </label>
          <label className="field">
            <span>{t('fieldPassword')}</span>
            <input
              type="text"
              value={content.wifiPassword}
              disabled={content.wifiSecurity === 'nopass'}
              onChange={(event) => onChange('wifiPassword', event.target.value)}
              autoComplete="off"
            />
          </label>
        </div>
        <label className="check">
          <input
            type="checkbox"
            checked={content.wifiHidden}
            onChange={(event) => onChange('wifiHidden', event.target.checked)}
          />
          {t('fieldHiddenNetwork')}
        </label>
      </>
    )
  }

  if (kind === 'whatsapp') {
    return (
      <>
        <label className="field">
          <span>{t('fieldWhatsappPhone')}</span>
          <input
            type="tel"
            placeholder={t('placeholderWhatsapp')}
            value={content.whatsappPhone}
            onChange={(event) => onChange('whatsappPhone', event.target.value)}
          />
        </label>
        <label className="field">
          <span>{t('fieldOptionalMessage')}</span>
          <textarea
            rows={3}
            value={content.whatsappMessage}
            onChange={(event) => onChange('whatsappMessage', event.target.value)}
          />
        </label>
      </>
    )
  }

  if (kind === 'email') {
    return (
      <>
        <label className="field">
          <span>{t('fieldTo')}</span>
          <input
            type="email"
            placeholder={t('placeholderEmail')}
            value={content.emailTo}
            onChange={(event) => onChange('emailTo', event.target.value)}
          />
        </label>
        <label className="field">
          <span>{t('fieldSubject')}</span>
          <input
            type="text"
            value={content.emailSubject}
            onChange={(event) => onChange('emailSubject', event.target.value)}
          />
        </label>
        <label className="field">
          <span>{t('fieldMessage')}</span>
          <textarea
            rows={3}
            value={content.emailBody}
            onChange={(event) => onChange('emailBody', event.target.value)}
          />
        </label>
      </>
    )
  }

  if (kind === 'phone') {
    return (
      <label className="field">
        <span>{t('fieldPhone')}</span>
        <input
          type="tel"
          placeholder={t('placeholderPhone')}
          value={content.phone}
          onChange={(event) => onChange('phone', event.target.value)}
        />
      </label>
    )
  }

  if (kind === 'sms') {
    return (
      <>
        <label className="field">
          <span>{t('fieldSmsPhone')}</span>
          <input
            type="tel"
            placeholder={t('placeholderSms')}
            value={content.smsPhone}
            onChange={(event) => onChange('smsPhone', event.target.value)}
          />
        </label>
        <label className="field">
          <span>{t('fieldSmsBody')}</span>
          <textarea
            rows={3}
            value={content.smsBody}
            onChange={(event) => onChange('smsBody', event.target.value)}
          />
        </label>
      </>
    )
  }

  if (kind === 'geo') {
    return (
      <>
        <div className="field-grid">
          <label className="field">
            <span>{t('fieldLatitude')}</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder={t('placeholderLat')}
              value={content.geoLat}
              onChange={(event) => onChange('geoLat', event.target.value)}
            />
          </label>
          <label className="field">
            <span>{t('fieldLongitude')}</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder={t('placeholderLng')}
              value={content.geoLng}
              onChange={(event) => onChange('geoLng', event.target.value)}
            />
          </label>
        </div>
        <label className="field">
          <span>{t('fieldGeoLabel')}</span>
          <input
            type="text"
            value={content.geoLabel}
            onChange={(event) => onChange('geoLabel', event.target.value)}
          />
        </label>
      </>
    )
  }

  if (kind === 'vcard') {
    return (
      <>
        <div className="field-grid">
          <label className="field">
            <span>{t('fieldFirstName')}</span>
            <input
              type="text"
              value={content.vcardFirst}
              onChange={(event) => onChange('vcardFirst', event.target.value)}
            />
          </label>
          <label className="field">
            <span>{t('fieldLastName')}</span>
            <input
              type="text"
              value={content.vcardLast}
              onChange={(event) => onChange('vcardLast', event.target.value)}
            />
          </label>
        </div>
        <label className="field">
          <span>{t('fieldOrg')}</span>
          <input
            type="text"
            value={content.vcardOrg}
            onChange={(event) => onChange('vcardOrg', event.target.value)}
          />
        </label>
        <label className="field">
          <span>{t('fieldPhone')}</span>
          <input
            type="tel"
            value={content.vcardPhone}
            onChange={(event) => onChange('vcardPhone', event.target.value)}
          />
        </label>
        <label className="field">
          <span>{t('kindEmail')}</span>
          <input
            type="email"
            value={content.vcardEmail}
            onChange={(event) => onChange('vcardEmail', event.target.value)}
          />
        </label>
        <label className="field">
          <span>{t('fieldWebsite')}</span>
          <input
            type="url"
            value={content.vcardUrl}
            onChange={(event) => onChange('vcardUrl', event.target.value)}
          />
        </label>
      </>
    )
  }

  if (kind === 'event') {
    return (
      <>
        <p className="hint">{t('eventHint')}</p>
        <label className="field">
          <span>{t('fieldEventTitle')}</span>
          <input
            type="text"
            placeholder={t('placeholderEventTitle')}
            value={content.eventTitle}
            onChange={(event) => onChange('eventTitle', event.target.value)}
          />
        </label>
        <div className="field-grid">
          <label className="field">
            <span>{t('fieldEventStart')}</span>
            <input
              type="datetime-local"
              value={content.eventStart}
              onChange={(event) => onChange('eventStart', event.target.value)}
            />
          </label>
          <label className="field">
            <span>{t('fieldEventEnd')}</span>
            <input
              type="datetime-local"
              value={content.eventEnd}
              onChange={(event) => onChange('eventEnd', event.target.value)}
            />
          </label>
        </div>
        <label className="field">
          <span>{t('fieldEventLocation')}</span>
          <input
            type="text"
            value={content.eventLocation}
            onChange={(event) => onChange('eventLocation', event.target.value)}
          />
        </label>
        <label className="field">
          <span>{t('fieldEventDescription')}</span>
          <textarea
            rows={3}
            value={content.eventDescription}
            onChange={(event) => onChange('eventDescription', event.target.value)}
          />
        </label>
        <label className="field">
          <span>{t('fieldEventUrl')}</span>
          <input
            type="url"
            placeholder={t('placeholderUrl')}
            value={content.eventUrl}
            onChange={(event) => onChange('eventUrl', event.target.value)}
          />
        </label>
      </>
    )
  }

  if (kind === 'social') {
    return (
      <>
        <p className="hint">{t('socialHint')}</p>
        <label className="field">
          <span>{t('fieldSocialNetwork')}</span>
          <select
            value={content.socialNetwork}
            onChange={(event) =>
              onChange('socialNetwork', event.target.value as SocialNetwork)
            }
          >
            {socialNetworks.map((network) => (
              <option key={network} value={network}>
                {t(socialLabel[network])}
              </option>
            ))}
          </select>
        </label>
        {content.socialNetwork === 'other' ? (
          <label className="field">
            <span>{t('fieldLink')}</span>
            <input
              type="url"
              placeholder={t('placeholderUrl')}
              value={content.socialUrl}
              onChange={(event) => onChange('socialUrl', event.target.value)}
            />
          </label>
        ) : (
          <label className="field">
            <span>{t('fieldSocialHandle')}</span>
            <input
              type="text"
              placeholder={t('placeholderSocialHandle')}
              value={content.socialHandle}
              onChange={(event) => onChange('socialHandle', event.target.value)}
            />
          </label>
        )}
      </>
    )
  }

  if (kind === 'app') {
    return (
      <>
        <p className="hint">{t('appHint')}</p>
        <label className="field">
          <span>{t('fieldAppLanding')}</span>
          <input
            type="url"
            placeholder={t('placeholderAppLanding')}
            value={content.appLanding}
            onChange={(event) => onChange('appLanding', event.target.value)}
          />
        </label>
        <label className="field">
          <span>{t('fieldAppIos')}</span>
          <input
            type="url"
            placeholder={t('placeholderAppIos')}
            value={content.appIos}
            onChange={(event) => onChange('appIos', event.target.value)}
          />
        </label>
        <label className="field">
          <span>{t('fieldAppAndroid')}</span>
          <input
            type="url"
            placeholder={t('placeholderAppAndroid')}
            value={content.appAndroid}
            onChange={(event) => onChange('appAndroid', event.target.value)}
          />
        </label>
      </>
    )
  }

  if (kind === 'crypto') {
    return (
      <>
        <p className="hint">{t('cryptoHint')}</p>
        <label className="field">
          <span>{t('fieldCryptoAsset')}</span>
          <select
            value={content.cryptoAsset}
            onChange={(event) =>
              onChange('cryptoAsset', event.target.value as CryptoAsset)
            }
          >
            {cryptoAssets.map((asset) => (
              <option key={asset} value={asset}>
                {t(cryptoLabel[asset])}
              </option>
            ))}
          </select>
        </label>
        {content.cryptoAsset === 'other' && (
          <label className="field">
            <span>{t('fieldCryptoPrefix')}</span>
            <input
              type="text"
              placeholder={t('placeholderCryptoPrefix')}
              value={content.cryptoUriPrefix}
              onChange={(event) => onChange('cryptoUriPrefix', event.target.value)}
            />
          </label>
        )}
        <label className="field">
          <span>{t('fieldCryptoAddress')}</span>
          <input
            type="text"
            placeholder={t('placeholderCryptoAddress')}
            value={content.cryptoAddress}
            onChange={(event) => onChange('cryptoAddress', event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <div className="field-grid">
          <label className="field">
            <span>{t('fieldCryptoAmount')}</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder={t('placeholderCryptoAmount')}
              value={content.cryptoAmount}
              onChange={(event) => onChange('cryptoAmount', event.target.value)}
            />
          </label>
          <label className="field">
            <span>{t('fieldCryptoLabel')}</span>
            <input
              type="text"
              value={content.cryptoLabel}
              onChange={(event) => onChange('cryptoLabel', event.target.value)}
            />
          </label>
        </div>
      </>
    )
  }

  if (kind === 'menu') {
    return (
      <>
        <p className="hint">{t('menuHint')}</p>
        <label className="field">
          <span>{t('fieldMenuName')}</span>
          <input
            type="text"
            placeholder={t('placeholderMenuName')}
            value={content.menuName}
            onChange={(event) => onChange('menuName', event.target.value)}
          />
        </label>
        <label className="field">
          <span>{t('fieldMenuUrl')}</span>
          <input
            type="url"
            placeholder={t('placeholderMenuUrl')}
            value={content.menuUrl}
            onChange={(event) => onChange('menuUrl', event.target.value)}
          />
        </label>
      </>
    )
  }

  if (kind === 'file') {
    return (
      <>
        <p className="hint">{t('fileHint')}</p>
        <label className="field">
          <span>{t('fieldFileLabel')}</span>
          <input
            type="text"
            placeholder={t('placeholderFileLabel')}
            value={content.fileLabel}
            onChange={(event) => onChange('fileLabel', event.target.value)}
          />
        </label>
        <label className="field">
          <span>{t('fieldFileUrl')}</span>
          <input
            type="url"
            placeholder={t('placeholderFileUrl')}
            value={content.fileUrl}
            onChange={(event) => onChange('fileUrl', event.target.value)}
          />
        </label>
      </>
    )
  }

  if (kind === 'payment') {
    return (
      <>
        <p className="hint">{t('paymentHint')}</p>
        <label className="field">
          <span>{t('fieldPaymentKind')}</span>
          <select
            value={content.paymentKind}
            onChange={(event) =>
              onChange('paymentKind', event.target.value as PaymentKind)
            }
          >
            <option value="link">{t('paymentLink')}</option>
            <option value="paypal">{t('paymentPaypal')}</option>
            <option value="mercadopago">{t('paymentMercadopago')}</option>
          </select>
        </label>
        {content.paymentKind === 'paypal' && (
          <div className="field-grid">
            <label className="field">
              <span>{t('fieldPaypalUser')}</span>
              <input
                type="text"
                placeholder={t('placeholderPaypalUser')}
                value={content.paypalUser}
                onChange={(event) => onChange('paypalUser', event.target.value)}
              />
            </label>
            <label className="field">
              <span>{t('fieldPaypalAmount')}</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder={t('placeholderPaypalAmount')}
                value={content.paypalAmount}
                onChange={(event) => onChange('paypalAmount', event.target.value)}
              />
            </label>
          </div>
        )}
        {content.paymentKind === 'mercadopago' && (
          <label className="field">
            <span>{t('fieldMercadopagoUrl')}</span>
            <input
              type="url"
              placeholder={t('placeholderMercadopagoUrl')}
              value={content.mercadopagoUrl}
              onChange={(event) => onChange('mercadopagoUrl', event.target.value)}
            />
          </label>
        )}
        {content.paymentKind === 'link' && (
          <label className="field">
            <span>{t('fieldPaymentUrl')}</span>
            <input
              type="url"
              placeholder={t('placeholderPaymentUrl')}
              value={content.paymentUrl}
              onChange={(event) => onChange('paymentUrl', event.target.value)}
            />
          </label>
        )}
      </>
    )
  }

  return null
}
