import { describe, expect, it } from 'vitest'
import {
  buildPayload,
  downloadName,
  initialContent,
  isPayloadReady,
  type ContentForm,
} from './content.ts'

function form(patch: Partial<ContentForm>): ContentForm {
  return { ...initialContent, ...patch }
}

describe('content payload', () => {
  it('normalizes urls without protocol', () => {
    expect(buildPayload(form({ kind: 'url', url: 'example.com' }))).toBe(
      'https://example.com',
    )
    expect(isPayloadReady(form({ kind: 'url', url: 'https://' }))).toBe(false)
    expect(isPayloadReady(form({ kind: 'url', url: 'estudio.app' }))).toBe(true)
  })

  it('builds wifi payloads with escaping', () => {
    const payload = buildPayload(
      form({
        kind: 'wifi',
        wifiSsid: 'Cafe;1',
        wifiPassword: 'a:b',
        wifiSecurity: 'WPA',
        wifiHidden: true,
      }),
    )
    expect(payload).toBe('WIFI:T:WPA;S:Cafe\\;1;P:a\\:b;H:true;;')
    expect(
      isPayloadReady(form({ kind: 'wifi', wifiSsid: 'x', wifiSecurity: 'nopass' })),
    ).toBe(true)
  })

  it('builds whatsapp and email payloads', () => {
    expect(
      buildPayload(
        form({
          kind: 'whatsapp',
          whatsappPhone: '+1 (809) 555-1234',
          whatsappMessage: 'Hola',
        }),
      ),
    ).toBe('https://wa.me/18095551234?text=Hola')
    expect(
      buildPayload(
        form({
          kind: 'email',
          emailTo: 'a@b.com',
          emailSubject: 'Hi',
          emailBody: 'Body',
        }),
      ),
    ).toContain('mailto:a@b.com?')
  })

  it('requires meaningful contact data', () => {
    expect(isPayloadReady(form({ kind: 'vcard' }))).toBe(false)
    expect(isPayloadReady(form({ kind: 'vcard', vcardFirst: 'Ana' }))).toBe(true)
    expect(downloadName('phone')).toBe('qr-phone')
  })

  it('builds vcard text', () => {
    const payload = buildPayload(
      form({
        kind: 'vcard',
        vcardFirst: 'Ana',
        vcardLast: 'Perez',
        vcardPhone: '809555',
      }),
    )
    expect(payload).toContain('BEGIN:VCARD')
    expect(payload).toContain('FN:Ana Perez')
    expect(payload).toContain('TEL;TYPE=CELL:809555')
  })

  it('builds sms and geo payloads', () => {
    expect(
      buildPayload(
        form({
          kind: 'sms',
          smsPhone: '18095551234',
          smsBody: 'Hola',
        }),
      ),
    ).toBe('sms:18095551234?body=Hola')
    expect(
      isPayloadReady(form({ kind: 'geo', geoLat: '18.48', geoLng: '-69.93' })),
    ).toBe(true)
    expect(downloadName('sms')).toBe('qr-sms')
  })

  it('builds event calendar payload', () => {
    const payload = buildPayload(
      form({
        kind: 'event',
        eventTitle: 'Demo',
        eventStart: '2026-09-16T15:00',
        eventEnd: '2026-09-16T16:30',
        eventLocation: 'Sala A',
      }),
    )
    expect(payload).toContain('BEGIN:VCALENDAR')
    expect(payload).toContain('SUMMARY:Demo')
    expect(payload).toContain('DTSTART:20260916T150000')
    expect(payload).toContain('DTEND:20260916T163000')
    expect(payload).toContain('LOCATION:Sala A')
    expect(isPayloadReady(form({ kind: 'event', eventTitle: 'x' }))).toBe(false)
    expect(
      isPayloadReady(
        form({ kind: 'event', eventTitle: 'x', eventStart: '2026-09-16T15:00' }),
      ),
    ).toBe(true)
  })

  it('builds social, app, crypto and payment payloads', () => {
    expect(
      buildPayload(
        form({ kind: 'social', socialNetwork: 'instagram', socialHandle: '@stem' }),
      ),
    ).toBe('https://instagram.com/stem')
    expect(
      buildPayload(
        form({
          kind: 'app',
          appIos: 'apps.apple.com/app/id1',
          appAndroid: '',
          appLanding: '',
        }),
      ),
    ).toBe('https://apps.apple.com/app/id1')
    expect(
      buildPayload(
        form({
          kind: 'crypto',
          cryptoAsset: 'bitcoin',
          cryptoAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          cryptoAmount: '0.01',
          cryptoLabel: 'Tips',
        }),
      ),
    ).toBe(
      'bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?amount=0.01&label=Tips',
    )
    expect(
      buildPayload(
        form({
          kind: 'payment',
          paymentKind: 'paypal',
          paypalUser: 'enmanuel',
          paypalAmount: '12',
        }),
      ),
    ).toBe('https://paypal.me/enmanuel/12')
    expect(
      isPayloadReady(
        form({ kind: 'menu', menuUrl: 'https://menu.example.com' }),
      ),
    ).toBe(true)
    expect(downloadName('payment')).toBe('qr-payment')
  })
})
