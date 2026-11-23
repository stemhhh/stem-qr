import { useI18n } from './i18n/I18nContext.tsx'
import { useTheme, type ThemeMode } from './theme/ThemeContext.tsx'

type Props = {
  onResetStyle: () => void
}

export default function SettingsPanel({ onResetStyle }: Props) {
  const { t, locale, setLocale } = useI18n()
  const { mode, setMode } = useTheme()

  return (
    <section className="panel">
      <h2>{t('settingsTitle')}</h2>
      <p className="hint">{t('settingsHint')}</p>
      <div className="field-grid">
        <label className="field">
          <span>{t('language')}</span>
          <select
            value={locale}
            onChange={(event) => setLocale(event.target.value as 'es' | 'en' | 'pt' | 'fr')}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="pt">Português</option>
            <option value="fr">Français</option>
          </select>
        </label>
        <label className="field">
          <span>{t('theme')}</span>
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as ThemeMode)}
          >
            <option value="light">{t('themeLight')}</option>
            <option value="dark">{t('themeDark')}</option>
            <option value="system">{t('themeSystem')}</option>
          </select>
        </label>
      </div>
      <button type="button" className="btn btn-ghost" onClick={onResetStyle}>
        {t('resetStyle')}
      </button>
    </section>
  )
}
