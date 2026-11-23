import type { DrawType, Gradient, Options } from 'qr-code-styling'
import type { QrStyle } from './qrStyle.ts'

function buildGradient(
  from: string,
  to: string,
  type: QrStyle['gradientType'],
  rotation: number,
): Gradient {
  return {
    type,
    rotation: (rotation * Math.PI) / 180,
    colorStops: [
      { offset: 0, color: from },
      { offset: 1, color: to },
    ],
  }
}

export function buildOptions(
  data: string,
  style: QrStyle,
  size: number,
  drawType: DrawType = 'svg',
): Options {
  const moduleGradient = style.useGradient
    ? buildGradient(style.gradientFrom, style.gradientTo, style.gradientType, style.gradientRotation)
    : undefined
  const backgroundGradient = style.useBackgroundGradient
    ? buildGradient(style.backgroundGradientFrom, style.backgroundGradientTo, 'linear', 90)
    : undefined
  const cornerColor = style.matchCorners ? style.foreground : style.cornerColor
  const cornerDotColor = style.matchCorners ? style.foreground : style.cornerDotColor

  return {
    type: drawType,
    shape: style.shape,
    width: size,
    height: size,
    margin: style.margin,
    data: data || ' ',
    image: style.logo ?? undefined,
    qrOptions: {
      errorCorrectionLevel: style.logo ? 'H' : style.errorCorrection,
    },
    dotsOptions: {
      type: style.dots,
      color: style.foreground,
      roundSize: style.roundSize,
      gradient: moduleGradient,
    },
    cornersSquareOptions: {
      type: style.corners,
      color: cornerColor,
      gradient: moduleGradient && style.matchCorners ? moduleGradient : undefined,
    },
    cornersDotOptions: {
      type: style.cornerDots,
      color: cornerDotColor,
    },
    backgroundOptions: {
      color: style.transparentBackground ? 'transparent' : style.background,
      round: style.shape === 'circle' ? 1 : style.backgroundRound,
      gradient: style.transparentBackground ? undefined : backgroundGradient,
    },
    imageOptions: {
      hideBackgroundDots: style.hideLogoDots,
      imageSize: style.logoSize,
      margin: style.logoMargin,
      crossOrigin: 'anonymous',
    },
  }
}

export function blobToBase64(blob: Blob): Promise<string> {
  return blobToDataUrl(blob).then((url) => url.split(',')[1] ?? '')
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export async function saveBlob(
  blob: Blob,
  defaultName: string,
  locale: string = 'es',
) {
  const base64 = await blobToBase64(blob)
  if (window.qrDesktop?.isDesktop) {
    await window.qrDesktop.saveFile({
      defaultName,
      mime: blob.type || 'application/octet-stream',
      base64,
      locale,
    })
    return
  }
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = defaultName
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}
