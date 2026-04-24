/* eslint-disable react-refresh/only-export-components -- Context 与 hooks 同文件导出 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthUser } from '@/api/authApi'
import { getStoredTokens, loginApi, logoutApi, meApi, refreshApi } from '@/api/authApi'

interface AuthContextValue {
  /** 当前用户 */
  user: AuthUser | null
  /** 是否已认证 */
  isAuthenticated: boolean
  /** 是否已准备好 */
  isAuthReady: boolean
  /** 登录 */
  login: (username: string, password: string) => Promise<boolean>
  /** 退出 */
  logout: () => void
}

/** 创建 auth context */
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isAuthReady, setIsAuthReady] = useState(false)

  /** 启动认证，尝试获取当前用户信息 */
  useEffect(() => {
    let mounted = true
    /** 启动认证 */
    const bootstrapAuth = async () => {
      const { accessToken, refreshToken } = getStoredTokens()
      /** 如果 access token 不存在，则设置认证准备完成 */
      if (!accessToken) {
        if (mounted) setIsAuthReady(true)
        return
      }
      /** 如果 access token 存在，尝试获取当前用户信息 */
      try {
        const currentUser = await meApi(accessToken)
        if (mounted) setUser(currentUser)
      } catch {
        /** 如果获取当前用户信息失败，则尝试刷新令牌 */
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

/** 获取 auth context
 * @returns auth context
 * 当前用户 user: AuthUser | null
 * 是否已认证 isAuthenticated: boolean
 * 是否已准备好 isAuthReady: boolean
 * 登录 login: (username: string, password: string) => Promise<boolean>
 * 退出 logout: () => void
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
