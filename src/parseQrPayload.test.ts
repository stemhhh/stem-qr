import { describe, expect, it } from 'vitest'
import { parseQrPayload } from './parseQrPayload.ts'

describe('parseQrPayload', () => {
  it('parses WiFi payload', () => {
    const result = parseQrPayload('WIFI:T:WPA;S:MyNet;P:secret123;H:false;;')
    expect(result.kind).toBe('wifi')
    expect(result.wifiSsid).toBe('MyNet')
    expect(result.wifiPassword).toBe('secret123')
    expect(result.wifiSecurity).toBe('WPA')
    expect(result.wifiHidden).toBe(false)
  })

  it('parses mailto payload', () => {
    const result = parseQrPayload('mailto:test@example.com?subject=Hello&body=World')
    expect(result.kind).toBe('email')
    expect(result.emailTo).toBe('test@example.com')
    expect(result.emailSubject).toBe('Hello')
    expect(result.emailBody).toBe('World')
  })

  it('parses tel payload', () => {
    const result = parseQrPayload('tel:+18095551234')
    expect(result.kind).toBe('phone')
    expect(result.phone).toBe('+18095551234')
  })

  it('parses smsto payload', () => {
    const result = parseQrPayload('smsto:18095551234:Hi there')
    expect(result.kind).toBe('sms')
    expect(result.smsPhone).toBe('18095551234')
    expect(result.smsBody).toBe('Hi there')
  })

  it('parses geo payload', () => {
    const result = parseQrPayload('geo:18.4861,-69.9312')
    expect(result.kind).toBe('geo')
    expect(result.geoLat).toBe('18.4861')
    expect(result.geoLng).toBe('-69.9312')
  })

  it('parses vCard payload', () => {
    const vcard = 'BEGIN:VCARD\nFN:John Doe\nORG:STEM\nTEL:+1234\nEMAIL:john@doe.com\nEND:VCARD'
    const result = parseQrPayload(vcard)
    expect(result.kind).toBe('vcard')
    expect(result.vcardFirst).toBe('John')
    expect(result.vcardLast).toBe('Doe')
    expect(result.vcardOrg).toBe('STEM')
  })

  it('parses https URL', () => {
    const result = parseQrPayload('https://example.com')
    expect(result.kind).toBe('url')
    expect(result.url).toBe('https://example.com')
  })

  it('parses plain text', () => {
    const result = parseQrPayload('Hello World')
    expect(result.kind).toBe('text')
    expect(result.text).toBe('Hello World')
  })
})
