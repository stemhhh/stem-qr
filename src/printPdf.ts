import { jsPDF } from 'jspdf'
import QRCodeStyling from 'qr-code-styling'
import { hexToRgb } from './color.ts'
import { blobToDataUrl, buildOptions } from './qrBuild.ts'
import type { PrintSettings, QrStyle, SheetKind } from './qrStyle.ts'
import { sheetPresets } from './qrStyle.ts'

type Args = {
  data: string
  style: QrStyle
  print: PrintSettings
  sheet: SheetKind
  footerText: string
}

export async function buildPrintPdf({
  data,
  style,
  print,
  sheet,
  footerText,
}: Args): Promise<Blob> {
  const qr = new QRCodeStyling(buildOptions(data, style, 1600, 'canvas'))
  const raw = await qr.getRawData('png')
  if (!(raw instanceof Blob)) {
    throw new Error('Could not generate QR image')
  }
  const image = await blobToDataUrl(raw)
  const preset = sheetPresets.find((item) => item.kind === sheet) ?? sheetPresets[0]
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: print.paper,
    compress: true,
  })

  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const pages = Math.max(1, Math.min(20, Math.round(print.copies) || 1))

  for (let page = 0; page < pages; page += 1) {
    if (page > 0) pdf.addPage()
    drawSheet(pdf, {
      image,
      style,
      print,
      cols: preset.cols,
      rows: preset.rows,
      pageW,
      pageH,
      footerText,
      pageIndex: page,
      pageCount: pages,
    })
  }

  return pdf.output('blob')
}

function drawSheet(
  pdf: jsPDF,
  opts: {
    image: string
    style: QrStyle
    print: PrintSettings
    cols: number
    rows: number
    pageW: number
    pageH: number
    footerText: string
    pageIndex: number
    pageCount: number
  },
) {
  const margin = 10
  const footerH = opts.print.showFooter ? 10 : 4
  const titleH = opts.print.pageTitle.trim() ? 10 : 0
  const usableW = opts.pageW - margin * 2
  const usableH = opts.pageH - margin * 2 - footerH - titleH
  const gutter = opts.cols * opts.rows === 1 ? 0 : 6
  const cellW = (usableW - gutter * (opts.cols - 1)) / opts.cols
  const cellH = (usableH - gutter * (opts.rows - 1)) / opts.rows
  const originY = margin + titleH

  if (opts.print.pageTitle.trim()) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(13)
    pdf.setTextColor(26, 26, 26)
    pdf.text(opts.print.pageTitle.trim(), opts.pageW / 2, margin + 6, { align: 'center' })
  }

  for (let row = 0; row < opts.rows; row += 1) {
    for (let col = 0; col < opts.cols; col += 1) {
      const x = margin + col * (cellW + gutter)
      const y = originY + row * (cellH + gutter)
      drawCell(pdf, x, y, cellW, cellH, opts)
      if (opts.print.showCutMarks) {
        drawCutMarks(pdf, x, y, cellW, cellH)
      }
    }
  }

  if (opts.print.showFooter) {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(100, 100, 100)
    pdf.text(opts.footerText, opts.pageW / 2, opts.pageH - 6, { align: 'center' })
    if (opts.pageCount > 1) {
      pdf.text(`${opts.pageIndex + 1}/${opts.pageCount}`, opts.pageW - margin, opts.pageH - 6, {
        align: 'right',
      })
    }
  }
}

function drawCell(
  pdf: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { image: string; style: QrStyle; print: PrintSettings },
) {
  const caption = opts.print.showCaption ? opts.style.caption.trim() : ''
  const subtitle = opts.print.showSubtitle ? opts.style.subtitle.trim() : ''
  const captionH = caption ? 7 : 0
  const subtitleH = subtitle ? 5 : 0
  const textH = captionH + subtitleH
  const pad = 3
  const qrMax = Math.min(w - pad * 2, h - pad * 2 - textH)
  const qrSize = Math.max(28, qrMax)
  const qrX = x + (w - qrSize) / 2
  const qrY = y + pad + (h - pad * 2 - textH - qrSize) / 2

  if (opts.style.frame !== 'none') {
    drawFrame(pdf, qrX - 2, qrY - 2, qrSize + 4, qrSize + 4 + textH, opts.style)
  }

  pdf.addImage(opts.image, 'PNG', qrX, qrY, qrSize, qrSize, undefined, 'FAST')

  if (caption) {
    const color = hexToRgb(opts.style.captionColor) ?? { r: 26, g: 26, b: 26 }
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(Math.max(8, Math.min(14, opts.style.captionSize - 4)))
    pdf.setTextColor(color.r, color.g, color.b)
    pdf.text(caption, x + w / 2, qrY + qrSize + 5, {
      align: 'center',
      maxWidth: w - 6,
    })
  }
  if (subtitle) {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(90, 90, 90)
    pdf.text(subtitle, x + w / 2, qrY + qrSize + (caption ? 10 : 5), {
      align: 'center',
      maxWidth: w - 6,
    })
  }
}

function drawFrame(
  pdf: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  style: QrStyle,
) {
  const rgb = hexToRgb(style.frameColor) ?? { r: 26, g: 26, b: 26 }
  pdf.setDrawColor(rgb.r, rgb.g, rgb.b)
  const width = style.frame === 'thick' ? 1.1 : 0.4
  pdf.setLineWidth(width)
  if (style.frame === 'ticket') {
    pdf.roundedRect(x, y, w, h, 2, 2)
    pdf.setLineDashPattern([1.2, 1.2], 0)
    pdf.rect(x + 1.5, y + 1.5, w - 3, h - 3)
    pdf.setLineDashPattern([], 0)
    return
  }
  if (style.frame === 'double') {
    pdf.rect(x, y, w, h)
    pdf.setLineWidth(0.3)
    pdf.rect(x + 1.4, y + 1.4, w - 2.8, h - 2.8)
    return
  }
  pdf.rect(x, y, w, h)
}

function drawCutMarks(pdf: jsPDF, x: number, y: number, w: number, h: number) {
  const len = 3
  pdf.setDrawColor(160, 160, 160)
  pdf.setLineWidth(0.15)
  const corners = [
    [x, y, 1, 1],
    [x + w, y, -1, 1],
    [x, y + h, 1, -1],
    [x + w, y + h, -1, -1],
  ]
  for (const [cx, cy, dx, dy] of corners) {
    pdf.line(cx, cy, cx + len * dx, cy)
    pdf.line(cx, cy, cx, cy + len * dy)
  }
}
