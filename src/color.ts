export type Rgb = { r: number; g: number; b: number }

export function clampByte(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(255, Math.max(0, Math.round(value)))
}

export function hexToRgb(hex: string): Rgb | null {
  const raw = hex.trim().replace('#', '')
  const full = raw.length === 3 ? [...raw].map((part) => part + part).join('') : raw
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  const num = Number.parseInt(full, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

export function rgbToHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b]
    .map((channel) => clampByte(channel).toString(16).padStart(2, '0'))
    .join('')}`
}

export function normalizeHex(hex: string): string {
  const rgb = hexToRgb(hex)
  return rgb ? rgbToHex(rgb) : '#000000'
}

export function rgbToHsv({ r, g, b }: Rgb): { h: number; s: number; v: number } {
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  let h = 0
  if (delta !== 0) {
    if (max === red) h = ((green - blue) / delta) % 6
    else if (max === green) h = (blue - red) / delta + 2
    else h = (red - green) / delta + 4
    h *= 60
    if (h < 0) h += 360
  }
  return { h, s: max === 0 ? 0 : delta / max, v: max }
}

export function hsvToRgb({ h, s, v }: { h: number; s: number; v: number }): Rgb {
  const hue = ((h % 360) + 360) % 360
  const sat = Math.min(1, Math.max(0, s))
  const val = Math.min(1, Math.max(0, v))
  const c = val * sat
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = val - c
  let red = 0
  let green = 0
  let blue = 0
  if (hue < 60) {
    red = c
    green = x
  } else if (hue < 120) {
    red = x
    green = c
  } else if (hue < 180) {
    green = c
    blue = x
  } else if (hue < 240) {
    green = x
    blue = c
  } else if (hue < 300) {
    red = x
    blue = c
  } else {
    red = c
    blue = x
  }
  return {
    r: clampByte((red + m) * 255),
    g: clampByte((green + m) * 255),
    b: clampByte((blue + m) * 255),
  }
}

export const spectrumHues = Array.from({ length: 24 }, (_, index) =>
  rgbToHex(hsvToRgb({ h: index * 15, s: 1, v: 1 })),
)

export const spectrumNeutrals = ['#000000', '#1a1a1a', '#444444', '#888888', '#cccccc', '#ffffff']

export function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (value: number) => {
    const s = value / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const light = Math.max(relativeLuminance(a), relativeLuminance(b))
  const dark = Math.min(relativeLuminance(a), relativeLuminance(b))
  return (light + 0.05) / (dark + 0.05)
}

export function hasWeakQrContrast(foreground: string, background: string): boolean {
  const fg = hexToRgb(foreground)
  const bg = hexToRgb(background)
  if (!fg || !bg) return false
  return contrastRatio(fg, bg) < 4.5
}

export function qrContrastRatio(foreground: string, background: string): number | null {
  const fg = hexToRgb(foreground)
  const bg = hexToRgb(background)
  if (!fg || !bg) return null
  return contrastRatio(fg, bg)
}
