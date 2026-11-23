import { writeFile } from 'node:fs/promises'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pngToIco from 'png-to-ico'
import QRCode from 'qrcode'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'build')
const appxDir = path.join(outDir, 'appx')

/** Same destination phones should open when they scan the app icon / Store QR. */
export const STORE_SEARCH_URL = 'https://apps.microsoft.com/detail/9PNT21J0RLMB'

const ACCENT = '#007bff'
const ACCENT_DEEP = '#0b3f8c'
const MODULE = '#f4f9ff'
const BG_TOP = '#1d6fd8'

/**
 * Build a branded, scannable STEM QR icon:
 * blue rounded tile + real QR encoding the Microsoft Store search URL.
 */
async function buildIconPng(size) {
  const pad = Math.max(4, Math.round(size * 0.12))
  const qrSize = Math.max(8, size - pad * 2)

  const rawQr = await QRCode.toBuffer(STORE_SEARCH_URL, {
    type: 'png',
    width: qrSize,
    margin: 1,
    errorCorrectionLevel: 'H',
    color: {
      dark: MODULE,
      light: '#00000000',
    },
  })

  const qrPng = await sharp(rawQr)
    .resize(qrSize, qrSize, { fit: 'fill' })
    .png()
    .toBuffer()

  const radius = Math.round(size * 0.22)
  const background = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
      <stop stop-color="${BG_TOP}"/>
      <stop offset="1" stop-color="${ACCENT_DEEP}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bg)"/>
</svg>
`)

  return sharp(background)
    .composite([{ input: qrPng, left: pad, top: pad }])
    .png()
    .toBuffer()
}

await mkdir(appxDir, { recursive: true })

const icon256 = await buildIconPng(256)
await writeFile(path.join(outDir, 'icon.png'), icon256)
await writeFile(path.join(outDir, 'icon-store-qr.png'), await buildIconPng(1024))
await writeFile(path.join(root, 'public', 'favicon.png'), await buildIconPng(64))

await writeFile(
  path.join(outDir, 'icon.ico'),
  await pngToIco([
    await buildIconPng(16),
    await buildIconPng(24),
    await buildIconPng(32),
    await buildIconPng(48),
    await buildIconPng(64),
    await buildIconPng(128),
    await buildIconPng(256),
  ]),
)

await writeFile(path.join(appxDir, 'StoreLogo.png'), await buildIconPng(50))
await writeFile(path.join(appxDir, 'Square44x44Logo.png'), await buildIconPng(44))
await writeFile(path.join(appxDir, 'Square150x150Logo.png'), await buildIconPng(150))
await writeFile(path.join(appxDir, 'Square71x71Logo.png'), await buildIconPng(71))
await writeFile(path.join(appxDir, 'Square310x310Logo.png'), await buildIconPng(310))

const wideQr = await buildIconPng(96)
const wideBase = await sharp({
  create: {
    width: 310,
    height: 150,
    channels: 4,
    background: ACCENT,
  },
})
  .composite([{ input: wideQr, left: 107, top: 27 }])
  .png()
  .toBuffer()

await writeFile(path.join(appxDir, 'Wide310x150Logo.png'), wideBase)

const faviconSvg = await QRCode.toString(STORE_SEARCH_URL, {
  type: 'svg',
  margin: 1,
  errorCorrectionLevel: 'H',
  color: {
    dark: MODULE,
    light: BG_TOP,
  },
})

const brandedFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="32" y2="32">
      <stop stop-color="${BG_TOP}"/>
      <stop offset="1" stop-color="${ACCENT_DEEP}"/>
    </linearGradient>
    <clipPath id="round"><rect width="32" height="32" rx="7"/></clipPath>
  </defs>
  <rect width="32" height="32" rx="7" fill="url(#bg)"/>
  <g clip-path="url(#round)" transform="translate(3.5 3.5) scale(0.78)">
    ${faviconSvg.replace(/<\?xml[^>]*>/, '').replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')}
  </g>
</svg>
`

await writeFile(path.join(root, 'public', 'favicon.svg'), brandedFavicon)

await writeFile(
  path.join(outDir, 'store-search-url.txt'),
  `${STORE_SEARCH_URL}\n`,
)

console.log('Iconos QR de STEM QR generados → Microsoft Store search')
console.log(STORE_SEARCH_URL)
