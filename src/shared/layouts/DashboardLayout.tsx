import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', icon: '\u{1F4CA}', label: 'Дашборд' },
  { to: '/agent/personality', icon: '\u{1F464}', label: 'Личность (SOUL.md)' },
  { to: '/agent/rules', icon: '\u{1F4DC}', label: 'Правила (AGENT.md)' },
  { to: '/agent/skills', icon: '\u26A1', label: 'Задачи и скиллы' },
  { to: '/agent/tools', icon: '\u{1F527}', label: 'Инструменты' },
  { to: '/agent/channel', icon: '\u{1F4AC}', label: 'Канал связи' },
  { to: '/billing', icon: '\u{1F4B3}', label: 'Подписка' },
  { to: '/support', icon: '\u{1F5E8}', label: 'Поддержка' },
]

export function DashboardLayout() {
  return (
    <>
      <header className="header">
        <NavLink to="/dashboard" className="header-logo">
          Delegata
        </NavLink>
        <div className="header-right">
          <NavLink to="/billing">Подписка</NavLink>
        </div>
      </header>
      <div className="layout-sidebar">
        <nav className="sidebar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </>
  )
}
