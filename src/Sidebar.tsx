import { useI18n } from './i18n/I18nContext.tsx'

export type AppPage = 'create' | 'codes' | 'templates' | 'print' | 'settings'

type Props = {
  page: AppPage
  onNavigate: (page: AppPage) => void
}

const items: {
  id: AppPage
  labelKey: 'navCreate' | 'navCodes' | 'navTemplates' | 'navPrint' | 'navSettings'
}[] = [
  { id: 'create', labelKey: 'navCreate' },
  { id: 'codes', labelKey: 'navCodes' },
  { id: 'templates', labelKey: 'navTemplates' },
  { id: 'print', labelKey: 'navPrint' },
  { id: 'settings', labelKey: 'navSettings' },
]

function NavGlyph({ id }: { id: AppPage }) {
  if (id === 'create') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm13 0h-3v3h-3v3h3v3h3v-3h3v-3h-3v-3z"
        />
      </svg>
    )
  }
  if (id === 'codes') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm2 3v2h10V7H7zm0 4v2h10v-2H7zm0 4v2h7v-2H7z"
        />
      </svg>
    )
  }
  if (id === 'templates') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M4 5h7v7H4V5zm9 0h7v4h-7V5zM4 14h7v5H4v-5zm9-3h7v8h-7v-8z"
        />
      </svg>
    )
  }
  if (id === 'print') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M7 3h10v4H7V3zm-3 6h16a2 2 0 0 1 2 2v6h-4v4H7v-4H3v-6a2 2 0 0 1 2-2zm3 10h8v-4H7v4zm11-6.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
        />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm0 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm0 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
      />
    </svg>
  )
}

export default function Sidebar({ page, onNavigate }: Props) {
  const { t } = useI18n()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark" aria-hidden="true" />
        <strong>{t('brand')}</strong>
      </div>

      <nav className="sidebar-nav" aria-label={t('brand')}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item${page === item.id ? ' is-active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-glyph">
              <NavGlyph id={item.id} />
            </span>
            {t(item.labelKey)}
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        <p className="sidebar-blurb">{t('sidebarBlurb')}</p>
        <div className="sidebar-profile">
          <span className="sidebar-avatar" aria-hidden="true">
            ST
          </span>
          <div>
            <strong>{t('brand')}</strong>
            <small>{t('localBadge')}</small>
          </div>
        </div>
      </div>
    </aside>
  )
}
