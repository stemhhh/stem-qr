import jsQR from 'jsqr'
import QRCodeStyling from 'qr-code-styling'
import { buildOptions } from './qrBuild.ts'
import { getScanAdvice } from './scanAdvice.ts'
import type { QrStyle } from './qrStyle.ts'

export type DecodeStatus = 'idle' | 'checking' | 'ok' | 'fail'

/** Normalize payloads so WiFi/URL casing quirks do not false-fail. */
export function payloadsMatch(decoded: string | null, expected: string): boolean {
  if (!decoded) return false
  return decoded.trim() === expected.trim()
}

/** Force high-contrast B/W for jsQR (helps with anti-aliased rounded modules). */
export function binarizeRgba(
  data: Uint8ClampedArray,
  threshold = 140,
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(data.length)
  for (let i = 0; i < data.length; i += 4) {
    const y = 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!
    const v = y < threshold ? 0 : 255
    out[i] = v
    out[i + 1] = v
    out[i + 2] = v
    out[i + 3] = 255
  }
  return out
}

function tryJsQr(data: Uint8ClampedArray, width: number, height: number): string | null {
  const direct = jsQR(data, width, height, { inversionAttempts: 'attemptBoth' })
  if (direct?.data) return direct.data
  const binary = binarizeRgba(data)
  const second = jsQR(binary, width, height, { inversionAttempts: 'attemptBoth' })
  return second?.data ?? null
}

async function imageDataFromBlob(blob: Blob): Promise<ImageData | null> {
  if (typeof createImageBitmap !== 'function') return null
  const bitmap = await createImageBitmap(blob)
  try {
    const width = bitmap.width
    const height = bitmap.height
    if (width < 8 || height < 8) return null

    if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(width, height)
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      ctx.drawImage(bitmap, 0, 0)
      return ctx.getImageData(0, 0, width, height)
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(bitmap, 0, 0)
    return ctx.getImageData(0, 0, width, height)
  } finally {
    bitmap.close()
  }
}

async function upscaleImageData(source: ImageData, scale: number): Promise<ImageData | null> {
  const width = Math.round(source.width * scale)
  const height = Math.round(source.height * scale)
  if (typeof OffscreenCanvas !== 'undefined') {
    const src = new OffscreenCanvas(source.width, source.height)
    const sctx = src.getContext('2d')
    if (!sctx) return null
    sctx.putImageData(source, 0, 0)
    const dst = new OffscreenCanvas(width, height)
    const dctx = dst.getContext('2d')
    if (!dctx) return null
    dctx.imageSmoothingEnabled = false
    dctx.drawImage(src, 0, 0, width, height)
    return dctx.getImageData(0, 0, width, height)
  }
  const src = document.createElement('canvas')
  src.width = source.width
  src.height = source.height
  const sctx = src.getContext('2d')
  if (!sctx) return null
  sctx.putImageData(source, 0, 0)
  const dst = document.createElement('canvas')
  dst.width = width
  dst.height = height
  const dctx = dst.getContext('2d')
  if (!dctx) return null
  dctx.imageSmoothingEnabled = false
  dctx.drawImage(src, 0, 0, width, height)
  return dctx.getImageData(0, 0, width, height)
}

/**
 * Decode a PNG (or other bitmap) Blob with jsQR.
 * Tries original, binarized, and 2× upscaled passes.
 */
export async function decodeQrFromImageBlob(blob: Blob): Promise<string | null> {
  const image = await imageDataFromBlob(blob)
  if (!image) return null

  const first = tryJsQr(image.data, image.width, image.height)
  if (first) return first

  const up = await upscaleImageData(image, 2)
  if (!up) return null
  return tryJsQr(up.data, up.width, up.height)
}

function plainScanStyle(style: QrStyle): QrStyle {
  return {
    ...style,
    dots: 'square',
    corners: 'square',
    cornerDots: 'square',
    shape: 'square',
    useGradient: false,
    useBackgroundGradient: false,
    transparentBackground: false,
    background: style.transparentBackground ? '#ffffff' : style.background,
    logo: null,
    roundSize: false,
  }
}

/**
 * Live verification of the preview QR.
 * Avoids false fails from decorative modules that phone cameras still read.
 */
export async function verifyLiveQr(
  data: string,
  style: QrStyle,
  previewPng: () => Promise<Blob | null>,
): Promise<DecodeStatus> {
  const expected = data.trim()
  if (!expected) return 'idle'

  const preview = await previewPng()
  if (preview) {
    const decoded = await decodeQrFromImageBlob(preview)
    if (payloadsMatch(decoded, expected)) return 'ok'
  }

  const hi = new QRCodeStyling(buildOptions(data, style, 640, 'canvas'))
  const hiBlob = await hi.getRawData('png')
  if (hiBlob instanceof Blob) {
    const decoded = await decodeQrFromImageBlob(hiBlob)
    if (payloadsMatch(decoded, expected)) return 'ok'
  }

  const plain = new QRCodeStyling(buildOptions(data, plainScanStyle(style), 480, 'canvas'))
  const plainBlob = await plain.getRawData('png')
  if (plainBlob instanceof Blob) {
    const decoded = await decodeQrFromImageBlob(plainBlob)
    if (payloadsMatch(decoded, expected)) {
      const critical = getScanAdvice(style).some((item) => item.severity === 'critical')
      return critical ? 'fail' : 'ok'
    }
  }

  return 'fail'
}
