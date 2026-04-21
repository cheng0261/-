import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import ShowMenu from '../ShowMenu'
import { Button, Layout, Typography } from 'antd'
import { LogoutOutlined } from '@ant-design/icons'
import { useAuth } from '@/context/auth-context'

const { Sider, Header, Content } = Layout

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={220}>
        <ShowMenu collapsed={collapsed} />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Typography.Text type="secondary">当前用户：{user?.username ?? '未登录'}</Typography.Text>
          <Button
            icon={<LogoutOutlined />}
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
          >
            退出登录
          </Button>
        </Header>
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
