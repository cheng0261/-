/* eslint-disable react-refresh/only-export-components -- Context 与 hooks 同文件导出 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthUser } from '@/api/authApi'
import { getStoredTokens, loginApi, logoutApi, meApi, refreshApi } from '@/api/authApi'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isAuthReady: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isAuthReady, setIsAuthReady] = useState(false)

  useEffect(() => {
    let mounted = true

    const bootstrapAuth = async () => {
      const { accessToken, refreshToken } = getStoredTokens()

      if (!accessToken) {
        if (mounted) setIsAuthReady(true)
        return
      }

      try {
        const currentUser = await meApi(accessToken)
        if (mounted) setUser(currentUser)
      } catch {
        if (refreshToken) {
          try {
            const refreshed = await refreshApi(refreshToken)
            const currentUser = await meApi(refreshed.accessToken)
            if (mounted) setUser(currentUser)
          } catch {
            if (mounted) setUser(null)
          }
        } else if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) setIsAuthReady(true)
      }
    }

    void bootstrapAuth()
    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    try {
      const result = await loginApi(username, password)
      setUser(result.user)
      return true
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(() => {
    void logoutApi()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isAuthReady,
      login,
      logout,
    }),
    [user, isAuthReady, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
