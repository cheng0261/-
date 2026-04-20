import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Spin } from 'antd'
import AppLayout from '../components/layout'
import { Providers } from './providers'
import { HomePage } from './pages/HomePage'
import { UserDetailPage } from './pages/UserDetailPage'
import { CompanyPage } from './pages/CompanyPage'

const EchartsDashboardPage = lazy(async () => {
  const m = await import('./pages/EchartsDashboardPage')
  return { default: m.EchartsDashboardPage }
})

export default function App() {
  return (
    <BrowserRouter>
      <Providers>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route
              path="echarts"
              element={
                <Suspense
                  fallback={
                    <div className="flex min-h-[40vh] items-center justify-center p-8">
                      <Spin size="large" tip="加载图表模块…" />
                    </div>
                  }
                >
                  <EchartsDashboardPage />
                </Suspense>
              }
            />
            <Route path="users/:userId" element={<UserDetailPage />} />
            <Route path="companies/:companyName" element={<CompanyPage />} />
          </Route>
        </Routes>
      </Providers>
    </BrowserRouter>
  )
}
