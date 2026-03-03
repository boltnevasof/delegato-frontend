import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

type AuthLayoutProps = {
  children?: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <header className="header">
        <NavLink to="/" className="header-logo">
          Delegato
        </NavLink>
      </header>
      <div className="page-wrap page-wrap--auth">
        <div className="auth-container">
          {children ?? <Outlet />}
        </div>
      </div>
    </div>
  )
}
