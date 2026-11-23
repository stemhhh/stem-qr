import { describe, expect, it } from 'vitest'
import {
  clampByte,
  hasWeakQrContrast,
  hexToRgb,
  hsvToRgb,
  normalizeHex,
  rgbToHex,
  rgbToHsv,
} from './color.ts'

describe('color utils', () => {
  it('clamps channel values to 0-255', () => {
    expect(clampByte(-10)).toBe(0)
    expect(clampByte(300)).toBe(255)
    expect(clampByte(12.6)).toBe(13)
    expect(clampByte(Number.NaN)).toBe(0)
  })

  it('parses hex including shorthand', () => {
    expect(hexToRgb('#0af')).toEqual({ r: 0, g: 170, b: 255 })
    expect(hexToRgb('005fb8')).toEqual({ r: 0, g: 95, b: 184 })
    expect(hexToRgb('notahex')).toBeNull()
    expect(hexToRgb('#12')).toBeNull()
  })

  it('round-trips RGB and HEX', () => {
    expect(rgbToHex({ r: 0, g: 95, b: 184 })).toBe('#005fb8')
    expect(normalizeHex('#ABC')).toBe('#aabbcc')
    expect(normalizeHex('nope')).toBe('#000000')
  })

  it('converts HSV extremes safely', () => {
    expect(hsvToRgb({ h: 360, s: 1, v: 1 })).toEqual({ r: 255, g: 0, b: 0 })
    expect(hsvToRgb({ h: -30, s: 1, v: 1 }).r).toBeGreaterThan(200)
    const gray = rgbToHsv({ r: 26, g: 26, b: 26 })
    expect(gray.s).toBe(0)
    expect(gray.v).toBeCloseTo(26 / 255, 5)
  })

  it('flags weak QR contrast', () => {
    expect(hasWeakQrContrast('#111111', '#ffffff')).toBe(false)
    expect(hasWeakQrContrast('#cccccc', '#dddddd')).toBe(true)
  })
})
