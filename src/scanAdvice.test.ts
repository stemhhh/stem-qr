import { describe, expect, it } from 'vitest'
import { applyPrintSafeStyle, applyScanFix, getScanAdvice } from './scanAdvice.ts'
import { initialStyle } from './qrStyle.ts'

describe('scanAdvice', () => {
  it('flags critical low contrast', () => {
    const advice = getScanAdvice({
      ...initialStyle,
      foreground: '#cccccc',
      background: '#dddddd',
    })
    expect(advice.some((item) => item.id === 'contrast-critical')).toBe(true)
  })

  it('flags oversized logo', () => {
    const advice = getScanAdvice({
      ...initialStyle,
      logo: 'data:image/svg+xml,x',
      logoSize: 0.4,
      hideLogoDots: true,
    })
    expect(advice.some((item) => item.id === 'logo-large')).toBe(true)
  })

  it('reports ok for classic high-contrast style', () => {
    const advice = getScanAdvice(initialStyle)
    expect(advice).toHaveLength(0)
  })

  it('applies boost contrast fix', () => {
    const fixed = applyScanFix(
      {
        ...initialStyle,
        foreground: '#cccccc',
        background: '#dddddd',
        useGradient: true,
      },
      'boostContrast',
    )
    expect(fixed.foreground).toBe('#111111')
    expect(fixed.background).toBe('#ffffff')
    expect(fixed.useGradient).toBe(false)
    expect(getScanAdvice(fixed)).toHaveLength(0)
  })

  it('applies print-safe style defaults', () => {
    const safe = applyPrintSafeStyle({
      ...initialStyle,
      foreground: '#be185d',
      useGradient: true,
      transparentBackground: true,
      dots: 'rounded',
      margin: 4,
      errorCorrection: 'L',
    })
    expect(safe.foreground).toBe('#000000')
    expect(safe.background).toBe('#ffffff')
    expect(safe.useGradient).toBe(false)
    expect(safe.transparentBackground).toBe(false)
    expect(safe.dots).toBe('square')
    expect(safe.margin).toBeGreaterThanOrEqual(12)
    expect(safe.errorCorrection).not.toBe('L')
  })
})
