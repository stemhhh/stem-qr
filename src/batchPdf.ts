import QRCodeStyling from 'qr-code-styling'
import { jsPDF } from 'jspdf'
import type { BatchRow } from './batchCsv.ts'
import { blobToDataUrl, buildOptions } from './qrBuild.ts'
import type { QrStyle } from './qrStyle.ts'

const QR_PX = 720

/** Multi-page PDF: one QR per page from batch rows. */
export async function buildBatchPdf(
  rows: BatchRow[],
  style: QrStyle,
): Promise<Blob> {
  if (!rows.length) throw new Error('No batch rows')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const box = Math.min(pageW, pageH) * 0.55

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]!
    if (i > 0) doc.addPage()

    const qr = new QRCodeStyling(buildOptions(row.data, style, QR_PX, 'canvas'))
    const raw = await qr.getRawData('png')
    if (!(raw instanceof Blob)) continue
    const image = await blobToDataUrl(raw)
    const x = (pageW - box) / 2
    const y = (pageH - box) / 2 - 24
    doc.addImage(image, 'PNG', x, y, box, box, undefined, 'FAST')
    doc.setFontSize(12)
    doc.setTextColor(30)
    doc.text(row.label, pageW / 2, y + box + 28, { align: 'center' })
    doc.setFontSize(8)
    doc.setTextColor(120)
    doc.text(`STEM QR · ${i + 1}/${rows.length}`, pageW / 2, pageH - 28, {
      align: 'center',
    })
  }

  return doc.output('blob')
}
