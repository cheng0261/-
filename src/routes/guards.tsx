import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { PageLoading } from '@/components/PageLoading'
import { useAuth } from '@/context/auth-context'
import { LoginPage } from '@/pages/LoginPage'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAuthReady } = useAuth()
  console.log(isAuthenticated, isAuthReady)
  const location = useLocation()

  if (!isAuthReady) {
    return <PageLoading tip="正在恢复登录状态…" fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <>{children}</>
}

export function LoginRouteGuard() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
}
