import { describe, expect, it } from 'vitest'
import { batchCsvExample, parseBatchCsv } from './batchCsv.ts'
import { payloadsMatch } from './qrDecode.ts'

describe('parseBatchCsv', () => {
  it('parses label,url rows and skips header', () => {
    const rows = parseBatchCsv(batchCsvExample())
    expect(rows.length).toBe(3)
    expect(rows[0]).toEqual({
      label: 'WiFi Lobby',
      data: 'WIFI:T:WPA;S:Lobby;P:secret;;',
    })
    expect(rows[1]?.data).toBe('https://example.com')
  })

  it('accepts single-column payloads', () => {
    const rows = parseBatchCsv('https://a.test\nhttps://b.test')
    expect(rows).toHaveLength(2)
    expect(rows[0]?.label).toContain('https://a.test')
  })

  it('handles quoted commas', () => {
    const rows = parseBatchCsv('name,url\n"Cafe, Centro",https://cafe.test')
    expect(rows[0]?.label).toBe('Cafe, Centro')
    expect(rows[0]?.data).toBe('https://cafe.test')
  })
})

describe('payloadsMatch', () => {
  it('trims and compares', () => {
    expect(payloadsMatch(' abc ', 'abc')).toBe(true)
    expect(payloadsMatch(null, 'abc')).toBe(false)
    expect(payloadsMatch('a', 'b')).toBe(false)
  })
})
