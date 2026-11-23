import type { ContentForm } from './content.ts'

type PartialContent = Partial<ContentForm>

/**
 * Map a decoded QR string to a partial ContentForm.
 * Supports: WIFI:, mailto:, tel:, smsto:, geo:, BEGIN:VCARD, http(s):, else text.
 */
export function parseQrPayload(raw: string): PartialContent {
  const trimmed = raw.trim()

  // WiFi: WIFI:T:WPA;S:ssid;P:pass;H:false;;
  if (trimmed.toUpperCase().startsWith('WIFI:')) {
    const get = (key: string): string => {
      const match = new RegExp(`${key}:([^;]*)`, 'i').exec(trimmed)
      return match ? decodeURIComponent(match[1]!.replace(/\\;/g, ';')) : ''
    }
    const security = get('T').toUpperCase()
    return {
      kind: 'wifi',
      wifiSsid: get('S'),
      wifiPassword: get('P'),
      wifiSecurity: security === 'WEP' ? 'WEP' : security === 'NOPASS' ? 'nopass' : 'WPA',
      wifiHidden: get('H').toLowerCase() === 'true',
    }
  }

  // mailto:
  if (trimmed.toLowerCase().startsWith('mailto:')) {
    const url = new URL(trimmed)
    return {
      kind: 'email',
      emailTo: url.pathname,
      emailSubject: url.searchParams.get('subject') ?? '',
      emailBody: url.searchParams.get('body') ?? '',
    }
  }

  // tel:
  if (trimmed.toLowerCase().startsWith('tel:')) {
    return {
      kind: 'phone',
      phone: trimmed.slice(4).trim(),
    }
  }

  // smsto: or sms:
  if (trimmed.toLowerCase().startsWith('smsto:') || trimmed.toLowerCase().startsWith('sms:')) {
    const prefix = trimmed.toLowerCase().startsWith('smsto:') ? 6 : 4
    const rest = trimmed.slice(prefix)
    const colonIndex = rest.indexOf(':')
    const phone = colonIndex >= 0 ? rest.slice(0, colonIndex) : rest
    const body = colonIndex >= 0 ? rest.slice(colonIndex + 1) : ''
    return {
      kind: 'sms',
      smsPhone: phone.trim(),
      smsBody: body.trim(),
    }
  }

  // whatsapp:// or wa.me
  if (
    trimmed.toLowerCase().startsWith('whatsapp://') ||
    /https?:\/\/(wa\.me|api\.whatsapp\.com)/i.test(trimmed)
  ) {
    try {
      const url = new URL(trimmed.replace(/^whatsapp:\/\/send\?/i, 'x:?'))
      const phone = url.searchParams.get('phone') ?? trimmed.split('/').pop() ?? ''
      const text = url.searchParams.get('text') ?? ''
      return { kind: 'whatsapp', whatsappPhone: phone, whatsappMessage: text }
    } catch {
      return { kind: 'whatsapp', whatsappPhone: '' }
    }
  }

  // geo:
  if (trimmed.toLowerCase().startsWith('geo:')) {
    const coords = trimmed.slice(4).split('?')[0]!.split(',')
    return {
      kind: 'geo',
      geoLat: coords[0]?.trim() ?? '',
      geoLng: coords[1]?.trim() ?? '',
    }
  }

  // BEGIN:VCARD
  if (trimmed.toUpperCase().startsWith('BEGIN:VCARD')) {
    const getField = (field: string): string => {
      const match = new RegExp(`^${field}[^:]*:(.*)$`, 'im').exec(trimmed)
      return match ? match[1]!.trim() : ''
    }
    const fn = getField('FN')
    const nameParts = fn.split(' ')
    return {
      kind: 'vcard',
      vcardFirst: nameParts[0] ?? '',
      vcardLast: nameParts.slice(1).join(' '),
      vcardOrg: getField('ORG'),
      vcardPhone: getField('TEL'),
      vcardEmail: getField('EMAIL'),
      vcardUrl: getField('URL'),
    }
  }

  // URL
  if (/^https?:\/\//i.test(trimmed)) {
    return { kind: 'url', url: trimmed }
  }

  // Plain text
  return { kind: 'text', text: trimmed }
}
