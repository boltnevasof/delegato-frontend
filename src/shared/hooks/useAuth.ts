import { createContext, useContext, useState, useCallback } from 'react'
import { setTokens, clearTokens, isAuthenticated as checkAuth } from '../../api/client'

type AuthContextValue = {
  isAuthenticated: boolean
  login: (accessToken: string, refreshToken: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
})

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}

export function useAuthState(): AuthContextValue {
  const [authenticated, setAuthenticated] = useState(checkAuth())

  const login = useCallback((accessToken: string, refreshToken: string) => {
    setTokens(accessToken, refreshToken)
    setAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    clearTokens()
    setAuthenticated(false)
    window.location.href = '/auth'
  }, [])

  return {
    isAuthenticated: authenticated,
    login,
    logout,
  }
}
