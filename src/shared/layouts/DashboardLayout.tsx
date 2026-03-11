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
    to: '/agent/settings',
    label: 'Настройки агента',
    icon: (
      <Icon>
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <circle cx="12" cy="12" r="3" />
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
        <a href="/" className="header-logo">
          Delegato
        </a>
        <div className="header-right">
          <NavLink to="/billing" className="header-link">Подписка</NavLink>
        </div>
      </header>
      <div className="layout-sidebar">
        <nav className="sidebar">
          <ul className="sidebar-list">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
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
