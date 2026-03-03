import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="sidebar-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

const navItems = [
  {
    to: '/dashboard',
    label: 'Дашборд',
    icon: (
      <Icon>
        <path d="M10 6.025A7.5 7.5 0 1 0 17.975 14H10V6.025Z" />
        <path d="M13.5 3c-.169 0-.334.014-.5.025V11h7.975c.011-.166.025-.331.025-.5A7.5 7.5 0 0 0 13.5 3Z" />
      </Icon>
    ),
  },
  {
    to: '/agent/personality',
    label: 'Личность',
    icon: (
      <Icon>
        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
        <path d="M20 21c0-3.3-3.6-6-8-6s-8 2.7-8 6" />
      </Icon>
    ),
  },
  {
    to: '/agent/rules',
    label: 'Правила',
    icon: (
      <Icon>
        <path d="M9 7H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4" />
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2H9Z" />
        <path d="M8 12h8M8 16h5" />
      </Icon>
    ),
  },
  {
    to: '/agent/skills',
    label: 'Задачи и скиллы',
    icon: (
      <Icon>
        <path d="M13 3v7h6l-8 11v-7H5l8-11Z" />
      </Icon>
    ),
  },
  {
    to: '/agent/tools',
    label: 'Инструменты',
    icon: (
      <Icon>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
      </Icon>
    ),
  },
  {
    to: '/agent/channel',
    label: 'Канал связи',
    icon: (
      <Icon>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
      </Icon>
    ),
  },
  {
    to: '/billing',
    label: 'Подписка',
    icon: (
      <Icon>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </Icon>
    ),
  },
  {
    to: '/support',
    label: 'Поддержка',
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </Icon>
    ),
  },
]

export function DashboardLayout() {
  const { logout } = useAuth()

  return (
    <>
      <header className="header">
        <NavLink to="/dashboard" className="header-logo">
          Delegato
        </NavLink>
        <div className="header-right">
          <NavLink to="/billing">Подписка</NavLink>
        </div>
      </header>
      <div className="layout-sidebar">
        <nav className="sidebar">
          <ul className="sidebar-list">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `sidebar-link${isActive ? ' active' : ''}`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="sidebar-bottom">
            <button className="sidebar-logout" onClick={logout}>
              <svg
                className="sidebar-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Выйти</span>
            </button>
          </div>
        </nav>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </>
  )
}
