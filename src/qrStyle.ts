import type {
  CornerDotType,
  CornerSquareType,
  DotType,
  ErrorCorrectionLevel,
  GradientType,
  ShapeType,
} from 'qr-code-styling'
import { qrContrastRatio } from './color.ts'
import type { MessageKey } from './i18n/messages.ts'

export type CaptionPosition = 'below' | 'above' | 'none'
export type FrameStyle = 'none' | 'thin' | 'thick' | 'double' | 'ticket'
export type PaperSize = 'a4' | 'letter'
export type SheetKind = 1 | 4 | 6 | 8

export type QrStyle = {
  dots: DotType
  corners: CornerSquareType
  cornerDots: CornerDotType
  shape: ShapeType
  roundSize: boolean
  foreground: string
  background: string
  cornerColor: string
  cornerDotColor: string
  matchCorners: boolean
  useGradient: boolean
  gradientType: GradientType
  gradientFrom: string
  gradientTo: string
  gradientRotation: number
  useBackgroundGradient: boolean
  backgroundGradientFrom: string
  backgroundGradientTo: string
  transparentBackground: boolean
  backgroundRound: number
  margin: number
  errorCorrection: ErrorCorrectionLevel
  logo: string | null
  logoSize: number
  logoMargin: number
  hideLogoDots: boolean
  caption: string
  subtitle: string
  captionPosition: CaptionPosition
  captionSize: number
  captionColor: string
  frame: FrameStyle
  frameColor: string
  frameWidth: number
  exportSize: number
}

export type PrintSettings = {
  paper: PaperSize
  showCutMarks: boolean
  showCaption: boolean
  showSubtitle: boolean
  showFooter: boolean
  copies: number
  pageTitle: string
}

export const initialStyle: QrStyle = {
  dots: 'rounded',
  corners: 'extra-rounded',
  cornerDots: 'dot',
  shape: 'square',
  roundSize: true,
  foreground: '#1a1a1a',
  background: '#ffffff',
  cornerColor: '#1a1a1a',
  cornerDotColor: '#1a1a1a',
  matchCorners: true,
  useGradient: false,
  gradientType: 'linear',
  gradientFrom: '#1d6fd8',
  gradientTo: '#0b6e63',
  gradientRotation: 45,
  useBackgroundGradient: false,
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#e8eef5',
  transparentBackground: false,
  backgroundRound: 0,
  margin: 10,
  errorCorrection: 'M',
  logo: null,
  logoSize: 0.28,
  logoMargin: 6,
  hideLogoDots: true,
  caption: '',
  subtitle: '',
  captionPosition: 'below',
  captionSize: 16,
  captionColor: '#1a1a1a',
  frame: 'none',
  frameColor: '#1a1a1a',
  frameWidth: 2,
  exportSize: 1024,
}

export const initialPrint: PrintSettings = {
  paper: 'a4',
  showCutMarks: true,
  showCaption: true,
  showSubtitle: true,
  showFooter: true,
  copies: 1,
  pageTitle: '',
}

export const palettes: { fg: string; bg: string; labelKey: MessageKey }[] = [
  { fg: '#1a1a1a', bg: '#ffffff', labelKey: 'paletteClassic' },
  { fg: '#1d6fd8', bg: '#f3f9ff', labelKey: 'paletteBlue' },
  { fg: '#0d6e63', bg: '#f4fbf9', labelKey: 'paletteGreen' },
  { fg: '#9a3412', bg: '#fff7ed', labelKey: 'paletteCopper' },
  { fg: '#6d28d9', bg: '#f5f3ff', labelKey: 'paletteViolet' },
  { fg: '#ffffff', bg: '#1a1a1a', labelKey: 'paletteInverted' },
  { fg: '#111827', bg: '#f9fafb', labelKey: 'paletteGraphite' },
  { fg: '#be185d', bg: '#fdf2f8', labelKey: 'palettePink' },
  { fg: '#b45309', bg: '#fffbeb', labelKey: 'paletteAmber' },
  { fg: '#0369a1', bg: '#f0f9ff', labelKey: 'paletteSky' },
  { fg: '#15803d', bg: '#f0fdf4', labelKey: 'paletteForest' },
  { fg: '#b91c1c', bg: '#fef2f2', labelKey: 'paletteRed' },
  { fg: '#0f766e', bg: '#ccfbf1', labelKey: 'paletteMint' },
  { fg: '#c2410c', bg: '#fff7ed', labelKey: 'paletteOrange' },
  { fg: '#4338ca', bg: '#eef2ff', labelKey: 'paletteIndigo' },
  { fg: '#ca8a04', bg: '#1c1917', labelKey: 'paletteDarkGold' },
  { fg: '#e11d48', bg: '#fff1f2', labelKey: 'paletteCherry' },
  { fg: '#334155', bg: '#f8fafc', labelKey: 'paletteSlate' },
]

function basePatch(patch: Partial<QrStyle>): Partial<QrStyle> {
  return {
    useGradient: false,
    useBackgroundGradient: false,
    matchCorners: true,
    shape: 'square',
    transparentBackground: false,
    frame: 'none',
    ...patch,
  }
}

export const templates: { id: MessageKey; patch: Partial<QrStyle> }[] = [
  { id: 'templateClassic', patch: basePatch({ dots: 'square', corners: 'square', cornerDots: 'square', foreground: '#1a1a1a', background: '#ffffff' }) },
  { id: 'templateSoft', patch: basePatch({ dots: 'rounded', corners: 'extra-rounded', cornerDots: 'dot', foreground: '#1a1a1a', background: '#ffffff' }) },
  { id: 'templateDots', patch: basePatch({ dots: 'dots', corners: 'dot', cornerDots: 'dot', foreground: '#0d6e63', background: '#f4fbf9' }) },
  {
    id: 'templateNeon',
    patch: basePatch({
      dots: 'classy-rounded',
      corners: 'extra-rounded',
      cornerDots: 'dot',
      foreground: '#22d3ee',
      background: '#0b1220',
      useGradient: true,
      gradientType: 'linear',
      gradientFrom: '#22d3ee',
      gradientTo: '#a855f7',
      captionColor: '#e2e8f0',
    }),
  },
  {
    id: 'templateBrand',
    patch: basePatch({
      dots: 'extra-rounded',
      corners: 'extra-rounded',
      cornerDots: 'dot',
      foreground: '#1d6fd8',
      background: '#ffffff',
      useGradient: true,
      gradientType: 'radial',
      gradientFrom: '#1d6fd8',
      gradientTo: '#0d7377',
      frame: 'thin',
      frameColor: '#1d6fd8',
    }),
  },  {
    id: 'templateCircle',
    patch: basePatch({
      dots: 'rounded',
      corners: 'extra-rounded',
      cornerDots: 'dot',
      foreground: '#1a1a1a',
      background: '#ffffff',
      shape: 'circle',
      backgroundRound: 1,
    }),
  },
  { id: 'templateInstagram', patch: basePatch({ dots: 'extra-rounded', corners: 'extra-rounded', cornerDots: 'dot', foreground: '#c026d3', background: '#fff7fb', useGradient: true, gradientType: 'linear', gradientFrom: '#f97316', gradientTo: '#db2777', gradientRotation: 45 }) },
  { id: 'templateWhatsapp', patch: basePatch({ dots: 'rounded', corners: 'extra-rounded', cornerDots: 'dot', foreground: '#16a34a', background: '#f0fdf4' }) },
  { id: 'templateLinkedin', patch: basePatch({ dots: 'square', corners: 'square', cornerDots: 'square', foreground: '#0a66c2', background: '#f8fafc' }) },
  { id: 'templateGold', patch: basePatch({ dots: 'classy', corners: 'extra-rounded', cornerDots: 'dot', foreground: '#b45309', background: '#fffbeb', frame: 'double', frameColor: '#b45309' }) },
  { id: 'templateMidnight', patch: basePatch({ dots: 'classy-rounded', corners: 'dot', cornerDots: 'dot', foreground: '#e2e8f0', background: '#020617', captionColor: '#e2e8f0' }) },
  { id: 'templateCoral', patch: basePatch({ dots: 'rounded', corners: 'extra-rounded', cornerDots: 'dot', foreground: '#e11d48', background: '#fff1f2' }) },
  { id: 'templateMinimal', patch: basePatch({ dots: 'square', corners: 'square', cornerDots: 'square', foreground: '#111111', background: '#ffffff', margin: 16, frame: 'none' }) },
  { id: 'templateTicket', patch: basePatch({ dots: 'dots', corners: 'square', cornerDots: 'square', foreground: '#1e3a8a', background: '#eff6ff', frame: 'ticket', frameColor: '#1e3a8a' }) },
  { id: 'templateIndustrial', patch: basePatch({ dots: 'square', corners: 'square', cornerDots: 'square', foreground: '#44403c', background: '#f5f5f4', frame: 'thick', frameColor: '#44403c' }) },
  { id: 'templatePastel', patch: basePatch({ dots: 'extra-rounded', corners: 'extra-rounded', cornerDots: 'dot', foreground: '#7c3aed', background: '#faf5ff', useBackgroundGradient: true, backgroundGradientFrom: '#fdf4ff', backgroundGradientTo: '#e0f2fe' }) },
  { id: 'templateBrandRed', patch: basePatch({ dots: 'rounded', corners: 'extra-rounded', cornerDots: 'dot', foreground: '#b91c1c', background: '#ffffff', frame: 'thin', frameColor: '#b91c1c' }) },
  { id: 'templateOcean', patch: basePatch({ dots: 'classy-rounded', corners: 'extra-rounded', cornerDots: 'dot', foreground: '#0369a1', background: '#f0f9ff', useGradient: true, gradientType: 'linear', gradientFrom: '#0284c7', gradientTo: '#0f766e' }) },
  { id: 'templateForest', patch: basePatch({ dots: 'dots', corners: 'extra-rounded', cornerDots: 'dot', foreground: '#166534', background: '#f0fdf4' }) },
  { id: 'templateCandy', patch: basePatch({ dots: 'extra-rounded', corners: 'dot', cornerDots: 'dot', foreground: '#db2777', background: '#fdf2f8', useGradient: true, gradientType: 'radial', gradientFrom: '#f472b6', gradientTo: '#6366f1' }) },
]

export const sheetPresets: {
  kind: SheetKind
  labelKey: MessageKey
  hintKey: MessageKey
  cols: number
  rows: number
}[] = [
  { kind: 1, labelKey: 'sheet1', hintKey: 'sheet1Hint', cols: 1, rows: 1 },
  { kind: 4, labelKey: 'sheet4', hintKey: 'sheet4Hint', cols: 2, rows: 2 },
  { kind: 6, labelKey: 'sheet6', hintKey: 'sheet6Hint', cols: 2, rows: 3 },
  { kind: 8, labelKey: 'sheet8', hintKey: 'sheet8Hint', cols: 2, rows: 4 },
]

export const dotStyles: { id: DotType; labelKey: MessageKey }[] = [
  { id: 'square', labelKey: 'dotSquare' },
  { id: 'rounded', labelKey: 'dotRounded' },
  { id: 'extra-rounded', labelKey: 'dotSoft' },
  { id: 'dots', labelKey: 'dotDots' },
  { id: 'classy', labelKey: 'dotClassy' },
  { id: 'classy-rounded', labelKey: 'dotClassic' },
]

export const cornerStyles: { id: CornerSquareType; labelKey: MessageKey }[] = [
  { id: 'square', labelKey: 'cornerSquare' },
  { id: 'rounded', labelKey: 'cornerRounded' },
  { id: 'extra-rounded', labelKey: 'cornerRound' },
  { id: 'dot', labelKey: 'cornerDot' },
  { id: 'dots', labelKey: 'cornerDotsStyle' },
  { id: 'classy', labelKey: 'cornerClassy' },
  { id: 'classy-rounded', labelKey: 'cornerClassyRounded' },
]

export const cornerDotStyles: { id: CornerDotType; labelKey: MessageKey }[] = [
  { id: 'square', labelKey: 'cornerDotSquare' },
  { id: 'dot', labelKey: 'cornerDotDot' },
  { id: 'rounded', labelKey: 'cornerDotRounded' },
  { id: 'extra-rounded', labelKey: 'cornerDotExtraRounded' },
  { id: 'dots', labelKey: 'cornerDotDots' },
  { id: 'classy', labelKey: 'cornerDotClassy' },
  { id: 'classy-rounded', labelKey: 'cornerDotClassyRounded' },
]

export const correctionLevels: { id: ErrorCorrectionLevel; labelKey: MessageKey }[] = [
  { id: 'L', labelKey: 'ecL' },
  { id: 'M', labelKey: 'ecM' },
  { id: 'Q', labelKey: 'ecQ' },
  { id: 'H', labelKey: 'ecH' },
]

export const exportSizes = [512, 1024, 2048, 4096]

export function moduleToCornerSquare(dots: DotType): CornerSquareType {
  return dots
}

export function moduleToCornerDot(dots: DotType): CornerDotType {
  return dots
}

export const frameStyles: { id: FrameStyle; labelKey: MessageKey }[] = [
  { id: 'none', labelKey: 'frameNone' },
  { id: 'thin', labelKey: 'frameThin' },
  { id: 'thick', labelKey: 'frameThick' },
  { id: 'double', labelKey: 'frameDouble' },
  { id: 'ticket', labelKey: 'frameTicket' },
]

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

/** Minimum WCAG-ish contrast for random styles (readable by cameras + jsQR). */
const RANDOM_MIN_CONTRAST = 4.5

/** Module shapes that stay scannable after styling. */
const SAFE_DOTS: readonly DotType[] = [
  'square',
  'rounded',
  'extra-rounded',
  'classy',
  'classy-rounded',
]

/** High-contrast pairs only — used by random style. */
export const safeRandomPalettes: { fg: string; bg: string }[] = [
  { fg: '#111111', bg: '#ffffff' },
  { fg: '#ffffff', bg: '#111111' },
  { fg: '#0b3d91', bg: '#ffffff' },
  { fg: '#ffffff', bg: '#0b3d91' },
  { fg: '#065f46', bg: '#ecfdf5' },
  { fg: '#7c2d12', bg: '#fff7ed' },
  { fg: '#1e3a8a', bg: '#eff6ff' },
  { fg: '#4c1d95', bg: '#f5f3ff' },
  { fg: '#9f1239', bg: '#fff1f2' },
  { fg: '#134e4a', bg: '#f0fdfa' },
  { fg: '#f8fafc', bg: '#0f172a' },
  { fg: '#fef3c7', bg: '#1c1917' },
  { fg: '#0f766e', bg: '#ffffff' },
  { fg: '#b91c1c', bg: '#ffffff' },
  { fg: '#1d4ed8', bg: '#ffffff' },
]

function isStrongContrast(fg: string, bg: string): boolean {
  const ratio = qrContrastRatio(fg, bg)
  return ratio != null && ratio >= RANDOM_MIN_CONTRAST
}

function pickSafeGradientPair(bg: string): { from: string; to: string } | null {
  const darks = safeRandomPalettes
    .map((p) => p.fg)
    .filter((fg) => isStrongContrast(fg, bg))
  if (darks.length < 2) {
    const one = darks[0]
    return one ? { from: one, to: one } : null
  }
  const from = pick(darks)
  const to = pick(darks)
  if (!isStrongContrast(from, bg) || !isStrongContrast(to, bg)) return null
  return { from, to }
}

/**
 * Random look that is always scannable: strong contrast, solid quiet zone,
 * no washed gradients, EC ≥ M, and no sparse “dots” modules.
 * Keeps logo, caption text and export size from the current style.
 */
export function randomQrStyle(current: QrStyle): QrStyle {
  const palette = pick(safeRandomPalettes)
  const dots = pick(SAFE_DOTS)
  const matchModule = Math.random() < 0.55
  const corners = matchModule
    ? moduleToCornerSquare(dots)
    : pick(['square', 'rounded', 'extra-rounded', 'classy', 'classy-rounded'] as const)
  const cornerDots = matchModule
    ? moduleToCornerDot(dots)
    : pick(['square', 'dot', 'rounded', 'extra-rounded'] as const)
  // Circle is OK but rarer; always with solid quiet zone.
  const shape: ShapeType = Math.random() < 0.18 ? 'circle' : 'square'
  const framed = Math.random() < 0.3
  const frame = framed
    ? pick(['thin', 'thick', 'double', 'ticket'] as const)
    : 'none'

  let useGradient = Math.random() < 0.28
  let gradientFrom = palette.fg
  let gradientTo = palette.fg
  if (useGradient) {
    const pair = pickSafeGradientPair(palette.bg)
    if (pair) {
      gradientFrom = pair.from
      gradientTo = pair.to
    } else {
      useGradient = false
    }
  }

  const hasLogo = Boolean(current.logo)
  const next: QrStyle = {
    ...current,
    dots,
    corners,
    cornerDots,
    shape,
    roundSize: Math.random() < 0.65,
    foreground: palette.fg,
    background: palette.bg,
    cornerColor: palette.fg,
    cornerDotColor: palette.fg,
    matchCorners: true,
    useGradient,
    gradientType: pick(['linear', 'radial'] as const),
    gradientFrom,
    gradientTo,
    gradientRotation: pick([0, 45, 90, 135, 180]),
    useBackgroundGradient: false,
    backgroundGradientFrom: palette.bg,
    backgroundGradientTo: palette.bg,
    transparentBackground: false,
    backgroundRound: shape === 'circle' ? 1 : pick([0, 0.12, 0.25]),
    margin: pick([12, 14, 16, 18]),
    errorCorrection: hasLogo
      ? 'H'
      : pick(['M', 'Q', 'H'] as const),
    logoSize: hasLogo ? Math.min(current.logoSize, 0.26) : current.logoSize,
    hideLogoDots: hasLogo ? true : current.hideLogoDots,
    captionColor: isStrongContrast('#f8fafc', palette.bg) ? '#f8fafc' : '#111111',
    frame,
    frameColor: palette.fg,
    frameWidth: pick([2, 3, 4]),
  }

  // Final safety net — never return a weak-contrast style.
  if (
    !isStrongContrast(next.foreground, next.background) ||
    (next.useGradient &&
      (!isStrongContrast(next.gradientFrom, next.background) ||
        !isStrongContrast(next.gradientTo, next.background)))
  ) {
    return {
      ...current,
      dots: 'rounded',
      corners: 'extra-rounded',
      cornerDots: 'dot',
      shape: 'square',
      foreground: '#111111',
      background: '#ffffff',
      cornerColor: '#111111',
      cornerDotColor: '#111111',
      matchCorners: true,
      useGradient: false,
      useBackgroundGradient: false,
      transparentBackground: false,
      margin: Math.max(current.margin, 12),
      errorCorrection: hasLogo ? 'H' : 'M',
      hideLogoDots: hasLogo ? true : current.hideLogoDots,
      logoSize: hasLogo ? Math.min(current.logoSize, 0.26) : current.logoSize,
      captionColor: '#111111',
      frame: 'none',
      frameColor: '#111111',
    }
  }

  return next
}
