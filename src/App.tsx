import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout'
import { PageLoading } from '@/components/PageLoading'
import { Providers } from './providers'
import { HomePage } from './pages/HomePage'
import { UserDetailPage } from './pages/UserDetailPage'
import { CompanyPage } from './pages/CompanyPage'
import { LoginRouteGuard, RequireAuth } from '@/routes/guards'

const EchartsDashboardPage = lazy(async () => {
  const m = await import('./pages/EchartsDashboardPage')
  return { default: m.EchartsDashboardPage }
})

export default function App() {
  return (
    <BrowserRouter>
      <Providers>
        <Routes>
          <Route path="/login" element={<LoginRouteGuard />} />
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route index element={<HomePage />} />
            <Route
              path="echarts"
              element={
                <Suspense
                  fallback={<PageLoading tip="加载图表模块…" />}
                >
                  <EchartsDashboardPage />
                </Suspense>
              }
            />
            <Route path="users/:userId" element={<UserDetailPage />} />
            <Route path="companies/:companyName" element={<CompanyPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Providers>
    </BrowserRouter>
  )
}
