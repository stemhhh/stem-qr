import { STORE_SEARCH_URL } from './storeLink.ts'

export type ContentKind =
  | 'url'
  | 'text'
  | 'wifi'
  | 'whatsapp'
  | 'email'
  | 'phone'
  | 'sms'
  | 'geo'
  | 'vcard'
  | 'event'
  | 'social'
  | 'app'
  | 'crypto'
  | 'menu'
  | 'file'
  | 'payment'

export type WifiSecurity = 'WPA' | 'WEP' | 'nopass'

export type SocialNetwork =
  | 'instagram'
  | 'facebook'
  | 'x'
  | 'tiktok'
  | 'youtube'
  | 'linkedin'
  | 'telegram'
  | 'other'

export type CryptoAsset =
  | 'bitcoin'
  | 'ethereum'
  | 'litecoin'
  | 'dogecoin'
  | 'other'

export type PaymentKind = 'link' | 'paypal' | 'mercadopago'

export type ContentForm = {
  kind: ContentKind
  url: string
  text: string
  wifiSsid: string
  wifiPassword: string
  wifiSecurity: WifiSecurity
  wifiHidden: boolean
  whatsappPhone: string
  whatsappMessage: string
  emailTo: string
  emailSubject: string
  emailBody: string
  phone: string
  smsPhone: string
  smsBody: string
  geoLat: string
  geoLng: string
  geoLabel: string
  vcardFirst: string
  vcardLast: string
  vcardOrg: string
  vcardPhone: string
  vcardEmail: string
  vcardUrl: string
  eventTitle: string
  eventLocation: string
  eventStart: string
  eventEnd: string
  eventDescription: string
  eventUrl: string
  socialNetwork: SocialNetwork
  socialHandle: string
  socialUrl: string
  appLanding: string
  appIos: string
  appAndroid: string
  cryptoAsset: CryptoAsset
  cryptoAddress: string
  cryptoAmount: string
  cryptoLabel: string
  cryptoUriPrefix: string
  menuUrl: string
  menuName: string
  fileUrl: string
  fileLabel: string
  paymentKind: PaymentKind
  paymentUrl: string
  paypalUser: string
  paypalAmount: string
  mercadopagoUrl: string
}

export const initialContent: ContentForm = {
  kind: 'url',
  url: STORE_SEARCH_URL,
  text: '',
  wifiSsid: '',
  wifiPassword: '',
  wifiSecurity: 'WPA',
  wifiHidden: false,
  whatsappPhone: '',
  whatsappMessage: '',
  emailTo: '',
  emailSubject: '',
  emailBody: '',
  phone: '',
  smsPhone: '',
  smsBody: '',
  geoLat: '',
  geoLng: '',
  geoLabel: '',
  vcardFirst: '',
  vcardLast: '',
  vcardOrg: '',
  vcardPhone: '',
  vcardEmail: '',
  vcardUrl: '',
  eventTitle: '',
  eventLocation: '',
  eventStart: '',
  eventEnd: '',
  eventDescription: '',
  eventUrl: '',
  socialNetwork: 'instagram',
  socialHandle: '',
  socialUrl: '',
  appLanding: '',
  appIos: '',
  appAndroid: '',
  cryptoAsset: 'bitcoin',
  cryptoAddress: '',
  cryptoAmount: '',
  cryptoLabel: '',
  cryptoUriPrefix: '',
  menuUrl: '',
  menuName: '',
  fileUrl: '',
  fileLabel: '',
  paymentKind: 'link',
  paymentUrl: '',
  paypalUser: '',
  paypalAmount: '',
  mercadopagoUrl: '',
}

export const contentKinds: ContentKind[] = [
  'url',
  'text',
  'wifi',
  'whatsapp',
  'email',
  'phone',
  'sms',
  'geo',
  'vcard',
  'event',
  'social',
  'app',
  'crypto',
  'menu',
  'file',
  'payment',
]

/** First-run types shown by default; the rest live under “More”. */
export const popularContentKinds: ContentKind[] = [
  'url',
  'text',
  'wifi',
  'whatsapp',
  'email',
  'phone',
  'vcard',
  'menu',
]

export const socialNetworks: SocialNetwork[] = [
  'instagram',
  'facebook',
  'x',
  'tiktok',
  'youtube',
  'linkedin',
  'telegram',
  'other',
]

export const cryptoAssets: CryptoAsset[] = [
  'bitcoin',
  'ethereum',
  'litecoin',
  'dogecoin',
  'other',
]

function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1')
}

function escapeIcs(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
}

export function normalizeUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function hasUsefulUrl(value: string): boolean {
  return normalizeUrl(value).replace(/^https?:\/\//i, '').length > 0
}

function stripHandle(value: string): string {
  return value.trim().replace(/^@+/, '')
}

function toIcsDateTime(value: string): string {
  const cleaned = value.trim().replace(/[-:]/g, '')
  if (/^\d{8}T\d{6}$/.test(cleaned)) return cleaned
  if (/^\d{8}T\d{4}$/.test(cleaned)) return `${cleaned}00`
  return cleaned
}

export function buildSocialUrl(form: ContentForm): string {
  if (form.socialNetwork === 'other') {
    return normalizeUrl(form.socialUrl)
  }
  const handle = stripHandle(form.socialHandle)
  if (!handle) return ''
  switch (form.socialNetwork) {
    case 'instagram':
      return `https://instagram.com/${encodeURIComponent(handle)}`
    case 'facebook':
      return `https://facebook.com/${encodeURIComponent(handle)}`
    case 'x':
      return `https://x.com/${encodeURIComponent(handle)}`
    case 'tiktok':
      return `https://tiktok.com/@${encodeURIComponent(handle)}`
    case 'youtube':
      return handle.startsWith('UC') || handle.includes('/')
        ? `https://youtube.com/${handle.replace(/^\/+/, '')}`
        : `https://youtube.com/@${encodeURIComponent(handle)}`
    case 'linkedin':
      return `https://linkedin.com/in/${encodeURIComponent(handle)}`
    case 'telegram':
      return `https://t.me/${encodeURIComponent(handle)}`
  }
}

function buildCryptoUri(form: ContentForm): string {
  const address = form.cryptoAddress.trim()
  if (!address) return ''

  const scheme =
    form.cryptoAsset === 'other'
      ? form.cryptoUriPrefix.trim().replace(/:$/, '') || 'crypto'
      : form.cryptoAsset === 'bitcoin'
        ? 'bitcoin'
        : form.cryptoAsset === 'ethereum'
          ? 'ethereum'
          : form.cryptoAsset === 'litecoin'
            ? 'litecoin'
            : 'dogecoin'

  const params = new URLSearchParams()
  if (form.cryptoAmount.trim()) params.set('amount', form.cryptoAmount.trim())
  if (form.cryptoLabel.trim()) params.set('label', form.cryptoLabel.trim())
  const query = params.toString()
  return query ? `${scheme}:${address}?${query}` : `${scheme}:${address}`
}

function buildPaymentUrl(form: ContentForm): string {
  if (form.paymentKind === 'paypal') {
    const user = form.paypalUser.trim().replace(/^@+/, '').replace(/^paypal\.me\//i, '')
    if (!user) return ''
    const amount = form.paypalAmount.trim()
    return amount
      ? `https://paypal.me/${encodeURIComponent(user)}/${encodeURIComponent(amount)}`
      : `https://paypal.me/${encodeURIComponent(user)}`
  }
  if (form.paymentKind === 'mercadopago') {
    return normalizeUrl(form.mercadopagoUrl)
  }
  return normalizeUrl(form.paymentUrl)
}

function buildAppUrl(form: ContentForm): string {
  if (hasUsefulUrl(form.appLanding)) return normalizeUrl(form.appLanding)
  if (hasUsefulUrl(form.appIos)) return normalizeUrl(form.appIos)
  if (hasUsefulUrl(form.appAndroid)) return normalizeUrl(form.appAndroid)
  return ''
}

export function buildPayload(form: ContentForm): string {
  switch (form.kind) {
    case 'url':
      return normalizeUrl(form.url)
    case 'text':
      return form.text.trim()
    case 'wifi': {
      const password =
        form.wifiSecurity === 'nopass' ? '' : escapeWifi(form.wifiPassword)
      return `WIFI:T:${form.wifiSecurity};S:${escapeWifi(form.wifiSsid)};P:${password};H:${form.wifiHidden};;`
    }
    case 'whatsapp': {
      const phone = form.whatsappPhone.replace(/\D/g, '')
      const message = form.whatsappMessage.trim()
      return message
        ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
        : `https://wa.me/${phone}`
    }
    case 'email': {
      const params = new URLSearchParams()
      if (form.emailSubject.trim()) params.set('subject', form.emailSubject.trim())
      if (form.emailBody.trim()) params.set('body', form.emailBody.trim())
      const query = params.toString()
      return query
        ? `mailto:${form.emailTo.trim()}?${query}`
        : `mailto:${form.emailTo.trim()}`
    }
    case 'phone':
      return `tel:${form.phone.trim()}`
    case 'sms': {
      const phone = form.smsPhone.replace(/\D/g, '')
      const body = form.smsBody.trim()
      return body
        ? `sms:${phone}?body=${encodeURIComponent(body)}`
        : `sms:${phone}`
    }
    case 'geo': {
      const lat = Number(form.geoLat)
      const lng = Number(form.geoLng)
      const label = form.geoLabel.trim()
      if (label) {
        return `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(label)})`
      }
      return `geo:${lat},${lng}`
    }
    case 'vcard': {
      const fullName = `${form.vcardFirst} ${form.vcardLast}`.trim()
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${form.vcardLast};${form.vcardFirst};;;`,
        `FN:${fullName}`,
      ]
      if (form.vcardOrg.trim()) lines.push(`ORG:${form.vcardOrg.trim()}`)
      if (form.vcardPhone.trim()) lines.push(`TEL;TYPE=CELL:${form.vcardPhone.trim()}`)
      if (form.vcardEmail.trim()) lines.push(`EMAIL:${form.vcardEmail.trim()}`)
      if (form.vcardUrl.trim()) lines.push(`URL:${normalizeUrl(form.vcardUrl)}`)
      lines.push('END:VCARD')
      return lines.join('\n')
    }
    case 'event': {
      const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//STEM QR//ES',
        'BEGIN:VEVENT',
        `SUMMARY:${escapeIcs(form.eventTitle.trim())}`,
      ]
      if (form.eventStart.trim()) {
        lines.push(`DTSTART:${toIcsDateTime(form.eventStart)}`)
      }
      if (form.eventEnd.trim()) {
        lines.push(`DTEND:${toIcsDateTime(form.eventEnd)}`)
      }
      if (form.eventLocation.trim()) {
        lines.push(`LOCATION:${escapeIcs(form.eventLocation.trim())}`)
      }
      if (form.eventDescription.trim()) {
        lines.push(`DESCRIPTION:${escapeIcs(form.eventDescription.trim())}`)
      }
      if (hasUsefulUrl(form.eventUrl)) {
        lines.push(`URL:${normalizeUrl(form.eventUrl)}`)
      }
      lines.push('END:VEVENT', 'END:VCALENDAR')
      return lines.join('\n')
    }
    case 'social':
      return buildSocialUrl(form)
    case 'app':
      return buildAppUrl(form)
    case 'crypto':
      return buildCryptoUri(form)
    case 'menu':
      return normalizeUrl(form.menuUrl)
    case 'file':
      return normalizeUrl(form.fileUrl)
    case 'payment':
      return buildPaymentUrl(form)
  }
}

export function isPayloadReady(form: ContentForm): boolean {
  switch (form.kind) {
    case 'url':
      return hasUsefulUrl(form.url)
    case 'text':
      return form.text.trim().length > 0
    case 'wifi':
      return (
        form.wifiSsid.trim().length > 0 &&
        (form.wifiSecurity === 'nopass' || form.wifiPassword.length > 0)
      )
    case 'whatsapp':
      return form.whatsappPhone.replace(/\D/g, '').length >= 8
    case 'email':
      return form.emailTo.includes('@')
    case 'phone':
      return form.phone.replace(/\D/g, '').length >= 7
    case 'sms':
      return form.smsPhone.replace(/\D/g, '').length >= 7
    case 'geo': {
      const lat = Number(form.geoLat)
      const lng = Number(form.geoLng)
      return (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        Math.abs(lat) <= 90 &&
        Math.abs(lng) <= 180 &&
        form.geoLat.trim().length > 0 &&
        form.geoLng.trim().length > 0
      )
    }
    case 'vcard':
      return (
        form.vcardFirst.trim().length > 0 ||
        form.vcardLast.trim().length > 0 ||
        form.vcardPhone.trim().length > 0 ||
        form.vcardEmail.trim().length > 0
      )
    case 'event':
      return form.eventTitle.trim().length > 0 && form.eventStart.trim().length > 0
    case 'social':
      return form.socialNetwork === 'other'
        ? hasUsefulUrl(form.socialUrl)
        : stripHandle(form.socialHandle).length > 0
    case 'app':
      return (
        hasUsefulUrl(form.appLanding) ||
        hasUsefulUrl(form.appIos) ||
        hasUsefulUrl(form.appAndroid)
      )
    case 'crypto':
      return (
        form.cryptoAddress.trim().length >= 10 &&
        (form.cryptoAsset !== 'other' || form.cryptoUriPrefix.trim().length > 0)
      )
    case 'menu':
      return hasUsefulUrl(form.menuUrl)
    case 'file':
      return hasUsefulUrl(form.fileUrl)
    case 'payment':
      if (form.paymentKind === 'paypal') {
        return form.paypalUser.trim().replace(/^@+/, '').length > 0
      }
      if (form.paymentKind === 'mercadopago') {
        return hasUsefulUrl(form.mercadopagoUrl)
      }
      return hasUsefulUrl(form.paymentUrl)
  }
}

export function downloadName(kind: ContentKind): string {
  const names: Record<ContentKind, string> = {
    url: 'qr-url',
    text: 'qr-text',
    wifi: 'qr-wifi',
    whatsapp: 'qr-whatsapp',
    email: 'qr-email',
    phone: 'qr-phone',
    sms: 'qr-sms',
    geo: 'qr-location',
    vcard: 'qr-contact',
    event: 'qr-event',
    social: 'qr-social',
    app: 'qr-app',
    crypto: 'qr-crypto',
    menu: 'qr-menu',
    file: 'qr-file',
    payment: 'qr-payment',
  }
  return names[kind]
}
