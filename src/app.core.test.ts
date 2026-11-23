import { describe, expect, it } from 'vitest'
import { formatMessage, messages } from './i18n/messages.ts'
import { resolveTheme } from './theme/resolve.ts'
import { remountKey, qrVisualFingerprint } from './qrFingerprint.ts'
import { buildOptions } from './qrBuild.ts'
import { qrContrastRatio } from './color.ts'
import { initialStyle, randomQrStyle } from './qrStyle.ts'

describe('i18n', () => {
  it('keeps es/en dictionaries aligned', () => {
    const esKeys = Object.keys(messages.es).sort()
    const enKeys = Object.keys(messages.en).sort()
    expect(enKeys).toEqual(esKeys)
  })

  it('formats placeholders', () => {
    expect(formatMessage('Hello {name}', { name: 'Enmanuel' })).toBe('Hello Enmanuel')
    expect(messages.en.brand).toBe('STEM QR')
    expect(messages.es.brand).toBe('STEM QR')
    expect(messages.en.appTitle).toContain('QR')
    expect(messages.es.appTitle).toContain('QR')
  })
})

describe('theme resolve', () => {
  it('resolves explicit modes without system lookup', () => {
    expect(resolveTheme('light')).toBe('light')
    expect(resolveTheme('dark')).toBe('dark')
  })
})

describe('qr fingerprint and options', () => {
  it('ignores caption-only changes in visual fingerprint', () => {
    const a = qrVisualFingerprint(initialStyle)
    const b = qrVisualFingerprint({ ...initialStyle, caption: 'Hola', subtitle: 'x' })
    expect(a).toBe(b)
    expect(remountKey(initialStyle)).toContain('plain')
  })

  it('forces high error correction when logo is present', () => {
    const options = buildOptions(
      'https://example.com',
      { ...initialStyle, logo: 'data:image/png;base64,xx', errorCorrection: 'L' },
      256,
    )
    expect(options.qrOptions?.errorCorrectionLevel).toBe('H')
    expect(options.width).toBe(256)
  })

  it('uses transparent background when requested', () => {
    const options = buildOptions(
      'hola',
      { ...initialStyle, transparentBackground: true },
      128,
    )
    expect(options.backgroundOptions?.color).toBe('transparent')
    expect(options.backgroundOptions?.gradient).toBeUndefined()
  })

  it('random style keeps logo and caption and stays high-contrast', () => {
    const base = {
      ...initialStyle,
      logo: 'data:image/png;base64,xx',
      caption: 'STEM',
      exportSize: 2048,
    }
    for (let i = 0; i < 30; i += 1) {
      const next = randomQrStyle(base)
      expect(next.logo).toBe(base.logo)
      expect(next.caption).toBe('STEM')
      expect(next.exportSize).toBe(2048)
      expect(['square', 'circle']).toContain(next.shape)
      expect(next.transparentBackground).toBe(false)
      expect(next.useBackgroundGradient).toBe(false)
      expect(next.margin).toBeGreaterThanOrEqual(12)
      expect(next.errorCorrection).not.toBe('L')
      expect(next.matchCorners).toBe(true)
      expect(next.hideLogoDots).toBe(true)
      expect(next.logoSize).toBeLessThanOrEqual(0.26)
      const ratio = qrContrastRatio(next.foreground, next.background)
      expect(ratio).toBeGreaterThanOrEqual(4.5)
      if (next.useGradient) {
        expect(qrContrastRatio(next.gradientFrom, next.background)!).toBeGreaterThanOrEqual(4.5)
        expect(qrContrastRatio(next.gradientTo, next.background)!).toBeGreaterThanOrEqual(4.5)
      }
      expect(next.dots).not.toBe('dots')
    }
  })
})
