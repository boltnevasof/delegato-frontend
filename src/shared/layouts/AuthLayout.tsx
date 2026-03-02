import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'

type AuthLayoutProps = {
  children?: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="page-wrap">
      <div className="auth-container">
        {children ?? <Outlet />}
      </div>
    </div>
  )
}
