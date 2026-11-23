import { zipSync, strToU8 } from 'fflate'
import QRCodeStyling from 'qr-code-styling'
import type { BatchRow } from './batchCsv.ts'
import { buildOptions } from './qrBuild.ts'
import type { QrStyle } from './qrStyle.ts'

const QR_PX = 1024

function safeName(label: string, index: number): string {
  const base = label.replace(/[^a-zA-Z0-9_\-. ]/g, '_').trim().slice(0, 60) || `qr-${index + 1}`
  return base
}

/**
 * Generate a ZIP containing PNG (and optionally SVG) for each batch row.
 * Uses fflate zipSync — runs synchronously after all Blobs are resolved.
 */
export async function buildBatchZip(
  rows: BatchRow[],
  style: QrStyle,
  includeSvg = false,
): Promise<Blob> {
  if (!rows.length) throw new Error('No batch rows')

  const files: Record<string, Uint8Array> = {}

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]!
    const base = safeName(row.label, i)

    const qr = new QRCodeStyling(buildOptions(row.data, style, QR_PX, 'canvas'))

    const pngBlob = await qr.getRawData('png')
    if (pngBlob instanceof Blob) {
      const buf = await pngBlob.arrayBuffer()
      files[`${base}.png`] = new Uint8Array(buf)
    }

    if (includeSvg) {
      const svgBlob = await qr.getRawData('svg')
      if (svgBlob instanceof Blob) {
        const text = await svgBlob.text()
        files[`${base}.svg`] = strToU8(text)
      }
    }
  }

  // Add a manifest
  const manifest = rows
    .map((row, i) => `${i + 1}\t${safeName(row.label, i)}\t${row.data}`)
    .join('\n')
  files['manifest.tsv'] = strToU8(`#\tname\tdata\n${manifest}`)

  const zipped = zipSync(files, { level: 6 })
  return new Blob([zipped], { type: 'application/zip' })
}
