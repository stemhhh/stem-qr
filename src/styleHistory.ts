import type { QrStyle } from './qrStyle.ts'

const MAX_HISTORY = 40

export type StyleHistory = {
  past: QrStyle[]
  future: QrStyle[]
}

export function createStyleHistory(): StyleHistory {
  return { past: [], future: [] }
}

/**
 * Push a new style snapshot onto the history stack.
 * Call this when a "commit" action happens (template apply, random, scan fix, print-safe).
 * Do NOT call on every keystroke.
 */
export function pushStyleHistory(history: StyleHistory, current: QrStyle): StyleHistory {
  const past = [...history.past, structuredClone(current)].slice(-MAX_HISTORY)
  return { past, future: [] }
}

export function undoStyle(
  history: StyleHistory,
  current: QrStyle,
): { history: StyleHistory; style: QrStyle } | null {
  if (!history.past.length) return null
  const past = [...history.past]
  const prev = past.pop()!
  const future = [structuredClone(current), ...history.future].slice(0, MAX_HISTORY)
  return { history: { past, future }, style: prev }
}

export function redoStyle(
  history: StyleHistory,
  current: QrStyle,
): { history: StyleHistory; style: QrStyle } | null {
  if (!history.future.length) return null
  const future = [...history.future]
  const next = future.shift()!
  const past = [...history.past, structuredClone(current)].slice(-MAX_HISTORY)
  return { history: { past, future }, style: next }
}
