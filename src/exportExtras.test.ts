import { describe, expect, it } from 'vitest'
import { buildVectorEps, buildVectorEpsSource } from './exportExtras.ts'

describe('buildVectorEps', () => {
  it('emits EPSF with vector rect paths (not colorimage)', () => {
    const options = {
      size: 256,
      margin: 12,
      foreground: '#111111',
      background: '#ffffff',
      errorCorrection: 'M' as const,
    }
    const text = buildVectorEpsSource('https://stem.qr/test', options)
    expect(text.startsWith('%!PS-Adobe-3.0 EPSF-3.0')).toBe(true)
    expect(text).toContain('%%BoundingBox: 0 0 256 256')
    expect(text).toContain(' setrgbcolor')
    expect(text).toMatch(/\d[\d.]* \d[\d.]* \d[\d.]* \d[\d.]* rect/)
    expect(text).toContain('fill')
    expect(text).not.toContain('colorimage')
    expect(text).not.toContain('ASCIIHexDecode')

    const blob = buildVectorEps('https://stem.qr/test', options)
    expect(blob.type).toBe('application/postscript')
    expect(blob.size).toBeGreaterThan(200)
  })

  it('throws on empty payload', () => {
    expect(() =>
      buildVectorEpsSource('   ', {
        size: 128,
        margin: 8,
        foreground: '#000',
        background: '#fff',
        errorCorrection: 'L',
      }),
    ).toThrow(/payload/i)
  })
})
