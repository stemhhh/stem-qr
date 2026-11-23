import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import ScanAdvicePanel from './ScanAdvicePanel.tsx'
import { I18nProvider } from './i18n/I18nContext.tsx'
import { applyScanFix, getScanAdvice } from './scanAdvice.ts'
import { initialStyle } from './qrStyle.ts'
import { popularContentKinds, contentKinds } from './content.ts'

function wrap(ui: ReactNode) {
  return render(<I18nProvider>{ui}</I18nProvider>)
}

afterEach(() => {
  cleanup()
})

describe('ScanAdvicePanel UI', () => {
  it('shows fix button and calls onFix', async () => {
    const user = userEvent.setup()
    const advice = getScanAdvice({
      ...initialStyle,
      foreground: '#cccccc',
      background: '#dddddd',
    })
    const onFix = vi.fn()
    wrap(<ScanAdvicePanel advice={advice} onFix={onFix} />)
    const button = await screen.findByRole('button', { name: /arreglar|fix/i })
    await user.click(button)
    expect(onFix).toHaveBeenCalled()
    const fixed = applyScanFix(initialStyle, 'boostContrast')
    expect(fixed.foreground).toBe('#111111')
  })
})

describe('popular content kinds', () => {
  it('is a subset of all kinds', () => {
    expect(popularContentKinds.length).toBeGreaterThan(0)
    expect(popularContentKinds.every((kind) => contentKinds.includes(kind))).toBe(
      true,
    )
  })
})
