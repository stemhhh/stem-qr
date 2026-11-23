import type { MessageKey } from './i18n/messages.ts'

export type IconPreset = {
  id: string
  labelKey: MessageKey
  /** SVG data URL suitable as QR center image */
  dataUrl: string
}

function svgDataUrl(body: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">${body}</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const iconPresets: IconPreset[] = [
  {
    id: 'link',
    labelKey: 'iconLink',
    dataUrl: svgDataUrl(
      `<path stroke="#007bff" stroke-width="5" stroke-linecap="round" d="M28 36l8-8m-12 4a8 8 0 0 1 0-11l6-6a8 8 0 0 1 11 11l-2 2m-4 4a8 8 0 0 0 0 11l-6 6a8 8 0 1 0 11-11l2-2"/>`,
    ),
  },
  {
    id: 'wifi',
    labelKey: 'iconWifi',
    dataUrl: svgDataUrl(
      `<path stroke="#007bff" stroke-width="5" stroke-linecap="round" d="M16 28c9-9 23-9 32 0M22 35c6-6 14-6 20 0M28 42c3-3 5-3 8 0"/><circle cx="32" cy="48" r="3.5" fill="#007bff"/>`,
    ),
  },
  {
    id: 'mail',
    labelKey: 'iconMail',
    dataUrl: svgDataUrl(
      `<rect x="10" y="16" width="44" height="32" rx="6" stroke="#007bff" stroke-width="5"/><path stroke="#007bff" stroke-width="5" stroke-linecap="round" d="M12 20l20 14L52 20"/>`,
    ),
  },
  {
    id: 'phone',
    labelKey: 'iconPhone',
    dataUrl: svgDataUrl(
      `<rect x="20" y="8" width="24" height="48" rx="6" stroke="#007bff" stroke-width="5"/><circle cx="32" cy="48" r="2.5" fill="#007bff"/>`,
    ),
  },
  {
    id: 'pin',
    labelKey: 'iconPin',
    dataUrl: svgDataUrl(
      `<path fill="#007bff" d="M32 8c-9 0-16 7-16 16 0 12 16 32 16 32s16-20 16-32c0-9-7-16-16-16zm0 22a6 6 0 1 1 0-12 6 6 0 0 1 0 12z"/>`,
    ),
  },
  {
    id: 'star',
    labelKey: 'iconStar',
    dataUrl: svgDataUrl(
      `<path fill="#007bff" d="M32 8l6.5 13.2L53 23l-10.5 10 2.5 14.5L32 40.5 19 47.5l2.5-14.5L11 23l14.5-1.8L32 8z"/>`,
    ),
  },
  {
    id: 'heart',
    labelKey: 'iconHeart',
    dataUrl: svgDataUrl(
      `<path fill="#007bff" d="M32 52S10 38 10 24a11 11 0 0 1 20-6 11 11 0 0 1 20 6c0 14-22 28-22 28z"/>`,
    ),
  },
  {
    id: 'shop',
    labelKey: 'iconShop',
    dataUrl: svgDataUrl(
      `<path stroke="#007bff" stroke-width="5" stroke-linejoin="round" d="M12 24l4-12h32l4 12v28H12V24z"/><path stroke="#007bff" stroke-width="5" d="M12 24h40M24 36v16m16-16v16"/>`,
    ),
  },
]
