import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import SaveDialog from './SaveDialog.tsx'
import { I18nProvider } from './i18n/I18nContext.tsx'

function wrap(ui: ReactNode) {
  return render(<I18nProvider>{ui}</I18nProvider>)
}

afterEach(() => {
  cleanup()
})

describe('SaveDialog a11y', () => {
  it('closes on Escape', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    wrap(
      <SaveDialog
        name="Demo"
        canUpdate={false}
        onNameChange={() => {}}
        onCancel={onCancel}
        onConfirm={() => {}}
      />,
    )
    expect(screen.getByRole('dialog')).toBeTruthy()
    await user.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalled()
  })

  it('confirms with primary button', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    wrap(
      <SaveDialog
        name="Demo"
        canUpdate={false}
        onNameChange={() => {}}
        onCancel={() => {}}
        onConfirm={onConfirm}
      />,
    )
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /^save$|^guardar$/i }))
    expect(onConfirm).toHaveBeenCalledWith(false)
  })
})
