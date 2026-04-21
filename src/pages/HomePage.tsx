import { Card } from 'antd'
import { Header } from '@/components/Header'
import { Search } from '@/components/Search'
import { CommonValueProvider, useCommonValueHook } from '@/context/home-context'

export function HomePage() {
  const providerValue = useCommonValueHook()

  return (
    <CommonValueProvider value={providerValue}>
      <div style={{ padding: '20px' }}>
        <Card
          style={{ marginBottom: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <Header />
        </Card>
        <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Search />
        </Card>
      </div>
    </CommonValueProvider>
  )
}
