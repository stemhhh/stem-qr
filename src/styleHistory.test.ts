import { describe, expect, it } from 'vitest'
import {
  createStyleHistory,
  pushStyleHistory,
  undoStyle,
  redoStyle,
} from './styleHistory.ts'
import { initialStyle } from './qrStyle.ts'

const styleA = { ...initialStyle, foreground: '#ff0000' }
const styleB = { ...initialStyle, foreground: '#00ff00' }
const styleC = { ...initialStyle, foreground: '#0000ff' }

describe('styleHistory', () => {
  it('starts empty', () => {
    const h = createStyleHistory()
    expect(h.past).toHaveLength(0)
    expect(h.future).toHaveLength(0)
  })

  it('pushes and undoes', () => {
    let h = createStyleHistory()
    h = pushStyleHistory(h, styleA)
    const result = undoStyle(h, styleB)
    expect(result).not.toBeNull()
    expect(result!.style.foreground).toBe('#ff0000')
    expect(result!.history.past).toHaveLength(0)
    expect(result!.history.future).toHaveLength(1)
  })

  it('redoes after undo', () => {
    let h = createStyleHistory()
    h = pushStyleHistory(h, styleA)
    const undone = undoStyle(h, styleB)!
    const redone = redoStyle(undone.history, undone.style)!
    expect(redone.style.foreground).toBe('#00ff00')
  })

  it('returns null when nothing to undo/redo', () => {
    const h = createStyleHistory()
    expect(undoStyle(h, styleA)).toBeNull()
    expect(redoStyle(h, styleA)).toBeNull()
  })

  it('clears future on push', () => {
    let h = createStyleHistory()
    h = pushStyleHistory(h, styleA)
    const undone = undoStyle(h, styleB)!
    h = pushStyleHistory(undone.history, styleC)
    expect(h.future).toHaveLength(0)
  })

  it('caps history at 40', () => {
    let h = createStyleHistory()
    for (let i = 0; i < 50; i++) {
      h = pushStyleHistory(h, { ...initialStyle, foreground: `#${i.toString(16).padStart(6, '0')}` })
    }
    expect(h.past.length).toBeLessThanOrEqual(40)
  })
})
