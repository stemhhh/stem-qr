import type { QrStyle } from './qrStyle.ts'

/** Fields that require regenerating the QR visual (not caption/frame chrome). */
export function qrVisualFingerprint(style: QrStyle): string {
  return [
    style.dots,
    style.corners,
    style.cornerDots,
    style.shape,
    style.roundSize,
    style.foreground,
    style.background,
    style.cornerColor,
    style.cornerDotColor,
    style.matchCorners,
    style.useGradient,
    style.gradientType,
    style.gradientFrom,
    style.gradientTo,
    style.gradientRotation,
    style.useBackgroundGradient,
    style.backgroundGradientFrom,
    style.backgroundGradientTo,
    style.transparentBackground,
    style.backgroundRound,
    style.margin,
    style.errorCorrection,
    style.logo ? 'logo' : 'plain',
    style.logoSize,
    style.logoMargin,
    style.hideLogoDots,
  ].join('|')
}

export function remountKey(style: QrStyle): string {
  return `${style.useGradient}-${style.transparentBackground}-${style.logo ? 'logo' : 'plain'}-${style.shape}`
}
