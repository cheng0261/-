import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import ShowMenu from '../ShowMenu'
import { Layout } from 'antd'

const { Sider } = Layout

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Layout>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={220}>
        <ShowMenu collapsed={collapsed} />
      </Sider>
      <Layout>
        <Outlet />
      </Layout>
    </Layout>
  )
}
