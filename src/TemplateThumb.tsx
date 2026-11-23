import type { QrStyle } from './qrStyle.ts'

type Props = {
  patch: Partial<QrStyle>
}

/** Lightweight visual stand-in for a QR style template (no canvas work). */
export default function TemplateThumb({ patch }: Props) {
  const fg = patch.foreground ?? '#1a1a1a'
  const bg = patch.background ?? '#ffffff'
  const from = patch.useGradient ? (patch.gradientFrom ?? fg) : fg
  const to = patch.useGradient ? (patch.gradientTo ?? fg) : fg
  const module = patch.useGradient
    ? `linear-gradient(135deg, ${from}, ${to})`
    : fg
  const round =
    patch.dots === 'dots' || patch.dots === 'rounded' || patch.dots === 'extra-rounded'
      ? '50%'
      : patch.dots === 'classy' || patch.dots === 'classy-rounded'
        ? '30%'
        : '12%'
  const shape = patch.shape === 'circle' ? '50%' : '10px'

  return (
    <span
      className="template-thumb"
      aria-hidden="true"
      style={{
        background: bg,
        borderRadius: shape,
        boxShadow: patch.frame && patch.frame !== 'none'
          ? `inset 0 0 0 2px ${patch.frameColor ?? fg}`
          : undefined,
      }}
    >
      <span className="template-thumb-finder" style={{ background: module, borderRadius: round }} />
      <span className="template-thumb-finder is-tr" style={{ background: module, borderRadius: round }} />
      <span className="template-thumb-finder is-bl" style={{ background: module, borderRadius: round }} />
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className="template-thumb-dot"
          style={{
            background: module,
            borderRadius: round,
            gridColumn: 2 + (i % 3),
            gridRow: 2 + Math.floor(i / 3),
            opacity: 0.55 + (i % 3) * 0.15,
          }}
        />
      ))}
    </span>
  )
}
