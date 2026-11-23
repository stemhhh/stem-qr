import type { Options } from 'qr-code-styling'
import type { MessageKey } from './i18n/messages.ts'
import type { QrStyle } from './qrStyle.ts'
import {
  contrastRatio,
  hexToRgb,
  type Rgb,
} from './color.ts'

export type ScanSeverity = 'warning' | 'critical'

export type ScanFixId =
  | 'boostContrast'
  | 'hideLogoDots'
  | 'shrinkLogo'
  | 'raiseMargin'
  | 'raiseEc'
  | 'raiseExportSize'
  | 'disableTransparent'

export type ScanAdvice = {
  id: string
  severity: ScanSeverity
  messageKey: MessageKey
  fixId?: ScanFixId
}

function ratio(fg: string, bg: string): number | null {
  const a = hexToRgb(fg)
  const b = hexToRgb(bg)
  if (!a || !b) return null
  return contrastRatio(a, b)
}

function darkest(...colors: string[]): Rgb | null {
  const parsed = colors.map(hexToRgb).filter((item): item is Rgb => item != null)
  if (!parsed.length) return null
  return parsed.reduce((best, item) =>
    contrastRatio(item, { r: 255, g: 255, b: 255 }) >
    contrastRatio(best, { r: 255, g: 255, b: 255 })
      ? best
      : item,
  )
}

function lightest(...colors: string[]): Rgb | null {
  const parsed = colors.map(hexToRgb).filter((item): item is Rgb => item != null)
  if (!parsed.length) return null
  return parsed.reduce((best, item) =>
    contrastRatio(item, { r: 0, g: 0, b: 0 }) >
    contrastRatio(best, { r: 0, g: 0, b: 0 })
      ? best
      : item,
  )
}

/** Scanability checks that help keep STEM QR designs readable by cameras. */
export function getScanAdvice(style: QrStyle): ScanAdvice[] {
  const advice: ScanAdvice[] = []

  if (!style.transparentBackground) {
    const solid = ratio(style.foreground, style.background)
    if (solid != null && solid < 3) {
      advice.push({
        id: 'contrast-critical',
        severity: 'critical',
        messageKey: 'scanContrastCritical',
        fixId: 'boostContrast',
      })
    } else if (solid != null && solid < 4.5) {
      advice.push({
        id: 'contrast-warn',
        severity: 'warning',
        messageKey: 'scanContrastWarn',
        fixId: 'boostContrast',
      })
    }

    if (style.useGradient) {
      const dark = darkest(style.gradientFrom, style.gradientTo, style.foreground)
      const light = lightest(style.background)
      if (dark && light) {
        const gRatio = contrastRatio(dark, light)
        if (gRatio < 3) {
          advice.push({
            id: 'gradient-critical',
            severity: 'critical',
            messageKey: 'scanGradientCritical',
            fixId: 'boostContrast',
          })
        } else if (gRatio < 4.5) {
          advice.push({
            id: 'gradient-warn',
            severity: 'warning',
            messageKey: 'scanGradientWarn',
            fixId: 'boostContrast',
          })
        }
      }
    }

    if (!style.matchCorners) {
      const corner = ratio(style.cornerColor, style.background)
      if (corner != null && corner < 3) {
        advice.push({
          id: 'corner-contrast',
          severity: 'critical',
          messageKey: 'scanCornerContrast',
          fixId: 'boostContrast',
        })
      }
    }
  } else {
    advice.push({
      id: 'transparent',
      severity: 'warning',
      messageKey: 'scanTransparentWarn',
      fixId: 'disableTransparent',
    })
  }

  if (style.logo) {
    if (style.logoSize >= 0.36) {
      advice.push({
        id: 'logo-large',
        severity: 'critical',
        messageKey: 'scanLogoLargeCritical',
        fixId: 'shrinkLogo',
      })
    } else if (style.logoSize >= 0.3) {
      advice.push({
        id: 'logo-size',
        severity: 'warning',
        messageKey: 'scanLogoLargeWarn',
        fixId: 'shrinkLogo',
      })
    }
    if (!style.hideLogoDots) {
      advice.push({
        id: 'logo-dots',
        severity: 'warning',
        messageKey: 'scanLogoDotsWarn',
        fixId: 'hideLogoDots',
      })
    }
  } else if (style.errorCorrection === 'L') {
    advice.push({
      id: 'ec-low',
      severity: 'warning',
      messageKey: 'scanEcLowWarn',
      fixId: 'raiseEc',
    })
  }

  if (style.margin < 4) {
    advice.push({
      id: 'margin',
      severity: 'warning',
      messageKey: 'scanMarginWarn',
      fixId: 'raiseMargin',
    })
  }

  if (style.exportSize < 512) {
    advice.push({
      id: 'resolution',
      severity: 'warning',
      messageKey: 'scanResolutionWarn',
      fixId: 'raiseExportSize',
    })
  }

  return advice
}

/** Apply a one-click safer default for a scan warning. */
export function applyScanFix(style: QrStyle, fixId: ScanFixId): QrStyle {
  switch (fixId) {
    case 'boostContrast':
      return {
        ...style,
        foreground: '#111111',
        background: '#ffffff',
        cornerColor: '#111111',
        cornerDotColor: '#111111',
        matchCorners: true,
        useGradient: false,
        useBackgroundGradient: false,
        transparentBackground: false,
        captionColor: '#111111',
        frameColor: style.frame === 'none' ? style.frameColor : '#111111',
      }
    case 'hideLogoDots':
      return { ...style, hideLogoDots: true }
    case 'shrinkLogo':
      return { ...style, logoSize: Math.min(style.logoSize, 0.26) }
    case 'raiseMargin':
      return { ...style, margin: Math.max(style.margin, 12) }
    case 'raiseEc':
      return { ...style, errorCorrection: 'M' }
    case 'raiseExportSize':
      return { ...style, exportSize: Math.max(style.exportSize, 1024) }
    case 'disableTransparent':
      return { ...style, transparentBackground: false, background: '#ffffff' }
  }
}

/**
 * Apply print-safe defaults: high-contrast B&W, square dots,
 * margin ≥ 12, EC M+, no gradient, no transparent, logo shrunk or hidden.
 */
export function applyPrintSafeStyle(style: QrStyle): QrStyle {
  return {
    ...style,
    foreground: '#000000',
    background: '#ffffff',
    cornerColor: '#000000',
    cornerDotColor: '#000000',
    matchCorners: true,
    useGradient: false,
    gradientFrom: '#000000',
    gradientTo: '#000000',
    useBackgroundGradient: false,
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    transparentBackground: false,
    dots: 'square',
    corners: 'square',
    cornerDots: 'square',
    margin: Math.max(style.margin, 12),
    errorCorrection:
      style.errorCorrection === 'L' ? 'M' : style.errorCorrection,
    logo: style.logo && style.logoSize > 0.26 ? style.logo : style.logo,
    logoSize: style.logo ? Math.min(style.logoSize, 0.26) : style.logoSize,
    captionColor: '#000000',
    frameColor: '#000000',
  }
}

/** Optional live decode hook: returns whether a PNG buffer looks scannable via heuristic size. */
export function estimateDecodeLikelihood(options: Options): 'likely' | 'risky' {
  const margin = options.margin ?? 0
  const ec = options.qrOptions?.errorCorrectionLevel ?? 'M'
  if (margin < 4) return 'risky'
  if (ec === 'L' && options.image) return 'risky'
  return 'likely'
}
