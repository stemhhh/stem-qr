import { useEffect, useRef } from 'react'
import { useI18n } from './i18n/I18nContext.tsx'

type Props = {
  name: string
  canUpdate: boolean
  onNameChange: (value: string) => void
  onCancel: () => void
  onConfirm: (asNew: boolean) => void
}

export default function SaveDialog({
  name,
  canUpdate,
  onNameChange,
  onCancel,
  onConfirm,
}: Props) {
  const { t } = useI18n()
  const dialogRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    inputRef.current?.focus()
    inputRef.current?.select()

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable.length) return
      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      previous?.focus?.()
    }
  }, [onCancel])

  return (
    <div className="modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="save-title">{t('codesSaveTitle')}</h2>
        <label className="field">
          <span>{t('codesSaveName')}</span>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onConfirm(false)
            }}
          />
        </label>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {t('codesSaveCancel')}
          </button>
          {canUpdate ? (
            <>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => onConfirm(true)}
              >
                {t('codesSaveAsNew')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onConfirm(false)}
              >
                {t('codesSaveUpdate')}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onConfirm(false)}
            >
              {t('codesSaveConfirm')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
