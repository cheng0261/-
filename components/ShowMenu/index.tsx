import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { AppstoreOutlined, BarChartOutlined, UserOutlined } from '@ant-design/icons';
import styles from './ShowMenu.module.css'

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  { key: '/', icon: <AppstoreOutlined />, label: '线索列表' },
  { key: '/echarts', icon: <BarChartOutlined />, label: 'echarts测试' },
  {
    key: 'users',
    icon: <UserOutlined />,
    label: '用户信息',
    children: [
      { key: '/users/L-1001', label: '小李' },
      { key: '/users/L-1002', label: '阿文' },
    ],
  },
];

interface ShowMenuProps {
  collapsed?: boolean
}

export default function ShowMenu({ collapsed = false }: ShowMenuProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const path = pathname || '/'
  const [openKeys, setOpenKeys] = useState<string[]>([])

  const getSelectedKeys = () => {
    if (path.startsWith('/users/L-1001')) return ['/users/L-1001']
    if (path.startsWith('/users/L-1002')) return ['/users/L-1002']
    if (path.startsWith('/users/')) return ['users']
    if (path.startsWith('/companies/')) return ['users']
    if (path.startsWith('/echarts')) return ['/echarts']
    return ['/']
  }

  const getDefaultOpenKeys = () => {
    if (path.startsWith('/users/') || path.startsWith('/companies/')) return ['users']
    return []
  }

  return (
    <div className={`${styles.wrapper} ${collapsed ? styles.collapsed : ''}`}>
      {!collapsed && <div className={styles.title}>导航菜单</div>}
      <Menu
        className={styles.menu}
        selectedKeys={getSelectedKeys()}
        openKeys={collapsed ? [] : (openKeys.length > 0 ? openKeys : getDefaultOpenKeys())}
        mode="inline"
        theme="dark"
        items={items}
        onOpenChange={(keys) => {
          setOpenKeys(keys as string[])
        }}
        onClick={(e) => {
          navigate(e.key)
        }}
      />
    </div>
  );
};
