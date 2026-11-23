import QRCode from 'qrcode'
import type { ErrorCorrectionLevel } from 'qr-code-styling'
import { jsPDF } from 'jspdf'
import { blobToDataUrl } from './qrBuild.ts'

/** Single-page PDF with the QR centered (print-ready). */
export async function buildSingleQrPdf(
  pngBlob: Blob,
  sizePx: number,
  title?: string,
): Promise<Blob> {
  const dataUrl = await blobToDataUrl(pngBlob)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const box = Math.min(pageW, pageH) * 0.62
  const x = (pageW - box) / 2
  const y = (pageH - box) / 2 - 12
  doc.addImage(dataUrl, 'PNG', x, y, box, box, undefined, 'FAST')
  if (title?.trim()) {
    doc.setFontSize(12)
    doc.setTextColor(40)
    doc.text(title.trim(), pageW / 2, y + box + 28, { align: 'center' })
  }
  doc.setFontSize(8)
  doc.setTextColor(120)
  doc.text(`STEM QR · ${sizePx}px`, pageW / 2, pageH - 28, { align: 'center' })
  return doc.output('blob')
}

function parseHexRgb(hex: string): [number, number, number] {
  const raw = hex.replace('#', '').trim()
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw.padEnd(6, '0').slice(0, 6)
  const n = Number.parseInt(full, 16)
  if (Number.isNaN(n)) return [0, 0, 0]
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(4).replace(/\.?0+$/, '')
}

export type VectorEpsOptions = {
  size: number
  margin: number
  foreground: string
  background: string
  errorCorrection: ErrorCorrectionLevel
}

/**
 * True vector EPS source: square module paths (PostScript `rect`), solid FG/BG.
 * Decorative dots/logo/gradients are approximated as solid colors for print editability.
 */
export function buildVectorEpsSource(data: string, options: VectorEpsOptions): string {
  if (!data.trim()) throw new Error('EPS requires payload data')

  const qr = QRCode.create(data, { errorCorrectionLevel: options.errorCorrection })
  const modules = qr.modules
  const count = modules.size
  const size = Math.max(32, Math.round(options.size))
  const margin = Math.max(0, Math.min(Math.floor(size / 3), Math.round(options.margin)))
  const inner = Math.max(1, size - margin * 2)
  const cell = inner / count

  const [fr, fg, fb] = parseHexRgb(options.foreground)
  const [br, bg, bb] = parseHexRgb(options.background)

  const rects: string[] = []
  for (let row = 0; row < count; row += 1) {
    let col = 0
    while (col < count) {
      if (!modules.get(row, col)) {
        col += 1
        continue
      }
      let end = col + 1
      while (end < count && modules.get(row, end)) end += 1
      const x = margin + col * cell
      const yTop = margin + row * cell
      const y = size - yTop - cell
      const w = (end - col) * cell
      rects.push(`${fmt(x)} ${fmt(y)} ${fmt(w)} ${fmt(cell)} rect`)
      col = end
    }
  }

  return `%!PS-Adobe-3.0 EPSF-3.0
%%Creator: STEM QR
%%Title: STEM QR
%%BoundingBox: 0 0 ${size} ${size}
%%HiResBoundingBox: 0 0 ${size} ${size}
%%LanguageLevel: 2
%%Pages: 1
%%DocumentData: Clean7Bit
%%EndComments
gsave
${fmt(br)} ${fmt(bg)} ${fmt(bb)} setrgbcolor
0 0 ${size} ${size} rect fill
${fmt(fr)} ${fmt(fg)} ${fmt(fb)} setrgbcolor
newpath
${rects.join('\n')}
fill
grestore
showpage
%%EOF
`
}

export function buildVectorEps(data: string, options: VectorEpsOptions): Blob {
  return new Blob([buildVectorEpsSource(data, options)], {
    type: 'application/postscript',
  })
}

function toHexBytes(bytes: Uint8Array): string {
  let out = ''
  for (let i = 0; i < bytes.length; i += 1) {
    out += bytes[i]!.toString(16).padStart(2, '0')
    if ((i + 1) % 32 === 0) out += '\n'
  }
  return out
}

/**
 * Legacy raster EPS (PNG → colorimage). Prefer {@link buildVectorEps}.
 */
export async function buildEpsFromPng(pngBlob: Blob, size: number): Promise<Blob> {
  if (typeof createImageBitmap !== 'function' || typeof OffscreenCanvas === 'undefined') {
    throw new Error('EPS export requires OffscreenCanvas')
  }

  const bitmap = await createImageBitmap(pngBlob)
  try {
    const canvas = new OffscreenCanvas(size, size)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('No 2D context')
    ctx.drawImage(bitmap, 0, 0, size, size)
    const image = ctx.getImageData(0, 0, size, size)
    const rgb = new Uint8Array(size * size * 3)
    for (let i = 0, j = 0; i < image.data.length; i += 4, j += 3) {
      rgb[j] = image.data[i]!
      rgb[j + 1] = image.data[i + 1]!
      rgb[j + 2] = image.data[i + 2]!
    }

    const eps = `%!PS-Adobe-3.0 EPSF-3.0
%%Creator: STEM QR
%%Title: STEM QR
%%BoundingBox: 0 0 ${size} ${size}
%%HiResBoundingBox: 0 0 ${size} ${size}
%%LanguageLevel: 2
%%Pages: 1
%%EndComments
gsave
0 ${size} translate
1 -1 scale
${size} ${size} 8 [${size} 0 0 -${size} 0 ${size}]
{ currentfile /ASCIIHexDecode filter }
false 3
colorimage
${toHexBytes(rgb)}
>
grestore
showpage
%%EOF
`
    return new Blob([eps], { type: 'application/postscript' })
  } finally {
    bitmap.close()
  }
}
