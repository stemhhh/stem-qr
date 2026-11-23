import { useState } from 'react'
import TemplateThumb from './TemplateThumb.tsx'
import { useI18n } from './i18n/I18nContext.tsx'
import { templates, type QrStyle } from './qrStyle.ts'
import {
  deleteUserTemplate,
  loadUserTemplates,
  saveUserTemplate,
  type UserTemplate,
} from './userTemplates.ts'

type Props = {
  onApply: (patch: Partial<QrStyle>) => void
  currentStyle?: QrStyle
  onNotice?: (msg: string) => void
}

export default function TemplateGallery({ onApply, currentStyle, onNotice }: Props) {
  const { t } = useI18n()
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>(() =>
    loadUserTemplates(),
  )
  const [saveName, setSaveName] = useState('')
  const [saving, setSaving] = useState(false)

  function handleSaveUserTemplate() {
    if (!currentStyle) return
    const name = saveName.trim() || t('userTemplatesNamePlaceholder')
    saveUserTemplate(name, currentStyle)
    setUserTemplates(loadUserTemplates())
    setSaveName('')
    setSaving(false)
    onNotice?.(t('userTemplateSaved'))
  }

  function handleDeleteUserTemplate(id: string) {
    deleteUserTemplate(id)
    setUserTemplates(loadUserTemplates())
    onNotice?.(t('userTemplateDeleted'))
  }

  return (
    <section className="panel">
      <h2>{t('templates')}</h2>
      <p className="hint">{t('templatesHint')}</p>
      <div className="template-grid">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            className="template-card"
            onClick={() => onApply(template.patch)}
          >
            <TemplateThumb patch={template.patch} />
            <strong>{t(template.id)}</strong>
            <span>{t('applyTemplate')}</span>
          </button>
        ))}
      </div>

      {/* User templates */}
      <div className="user-templates-section">
        <h3>{t('userTemplates')}</h3>
        {userTemplates.length === 0 ? (
          <p className="hint">{t('userTemplatesEmpty')}</p>
        ) : (
          <div className="template-grid">
            {userTemplates.map((ut) => (
              <div key={ut.id} className="template-card user-template-card">
                <TemplateThumb patch={ut.patch} />
                <strong>{ut.name}</strong>
                <div className="user-template-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => onApply(ut.patch)}
                  >
                    {t('userTemplateApply')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDeleteUserTemplate(ut.id)}
                  >
                    {t('userTemplatesDelete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentStyle && (
          <div className="user-template-save">
            {saving ? (
              <div className="user-template-save-row">
                <input
                  type="text"
                  value={saveName}
                  placeholder={t('userTemplatesNamePlaceholder')}
                  autoFocus
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveUserTemplate()
                    if (e.key === 'Escape') setSaving(false)
                  }}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveUserTemplate}
                >
                  {t('codesSaveConfirm')}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSaving(false)}
                >
                  {t('codesSaveCancel')}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setSaving(true)}
              >
                {t('userTemplatesSave')}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
