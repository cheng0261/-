import { Link, useParams } from 'react-router-dom'
import userDetails from '../../mock/userDetails.json'
import { Empty, Card, Tag, Timeline, Avatar, Divider, Badge } from 'antd'
import {
  PhoneOutlined,
  MailOutlined,
  PushpinOutlined,
  CalendarOutlined,
  UserOutlined,
  AimOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'

interface FollowLog {
  at: string
  by: string
  content: string
}
interface UserInfo {
  id: string
  name: string
  company: string
  phone: string
  status: string
  channel: string
  owner: string
  updatedAt: string
  note: string
  email: string
  wechat: string
  region: string
  createdAt: string
  intention: string
  followLogs: FollowLog[]
}
interface UserDetailsMap {
  [userId: string]: UserInfo
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case '新线索':
      return 'volcano'
    case '跟进中':
      return 'blue'
    case '已成交':
      return 'green'
    case '已关闭':
      return 'default'
    default:
      return 'skyblue'
  }
}

const getStatusBadge = (status: string) => {
  const colors: { [key: string]: string } = {
    新线索: '#ff4d4f',
    跟进中: '#1890ff',
    已成交: '#52c41a',
    已关闭: '#bfbfbf',
  }
  return colors[status] || '#bfbfbf'
}

export function UserDetailPage() {
  const { userId: rawUserId } = useParams<{ userId: string }>()
  const userId = rawUserId ? decodeURIComponent(rawUserId) : undefined

  if (!userId) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  const userInfo = (userDetails as UserDetailsMap)[userId]

  if (!userInfo) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="用户信息不存在" />
  }

  const {
    id,
    name,
    company,
    followLogs,
    intention,
    note,
    phone,
    email,
    wechat,
    region,
    createdAt,
    updatedAt,
    status,
    channel,
    owner,
  } = userInfo

  const detailInfoItems = [
    { key: 'phone', label: '联系电话', icon: <PhoneOutlined />, value: phone, type: 'phone' },
    { key: 'email', label: '邮箱', icon: <MailOutlined />, value: email, type: 'email' },
    { key: 'wechat', label: '微信号', icon: <UserOutlined />, value: wechat, type: 'text' },
    { key: 'region', label: '所在地区', icon: <PushpinOutlined />, value: region, type: 'text' },
    { key: 'channel', label: '来源渠道', icon: <AimOutlined />, value: channel, type: 'text' },
    { key: 'owner', label: '负责人', icon: <UserOutlined />, value: owner, type: 'text' },
    { key: 'createdAt', label: '创建时间', icon: <CalendarOutlined />, value: createdAt, type: 'time' },
    { key: 'updatedAt', label: '更新时间', icon: <ClockCircleOutlined />, value: updatedAt, type: 'time' },
  ]

  return (
    <div style={{ padding: '24px', background: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Card
          style={{
            marginBottom: '20px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: 'none',
          }}
          hoverable
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative' }}>
              <Avatar
                size={96}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '40px',
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                }}
              >
                {name.charAt(0)}
              </Avatar>
              <Badge
                status="processing"
                style={{
                  backgroundColor: getStatusBadge(status),
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '3px solid #fff',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>{name}</h1>
                <Tag
                  color={getStatusColor(status)}
                  style={{
                    padding: '4px 12px',
                    fontSize: '13px',
                    borderRadius: '20px',
                    fontWeight: 500,
                  }}
                >
                  {status}
                </Tag>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#6b7280' }}>
                <span>
                  <Link
                    to={`/companies/${encodeURIComponent(company)}`}
                    style={{ color: '#667eea', fontWeight: 500 }}
                  >
                    {company}
                  </Link>
                </span>
                <span>·</span>
                <span>
                  线索编号：<span style={{ fontWeight: 500 }}>{id}</span>
                </span>
              </div>
            </div>
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Card
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserOutlined style={{ color: '#667eea' }} />
                基本信息
              </span>
            }
            variant="borderless"
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {detailInfoItems.map((item) => (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLElement).style.background = '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.background = '#f9fafb'
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: '#667eea',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: 500 }}>
                      {item.type === 'phone' && <span style={{ color: '#667eea' }}>{item.value}</span>}
                      {item.type === 'email' && <span style={{ color: '#52c41a' }}>{item.value}</span>}
                      {item.type === 'time' && <span style={{ color: '#6b7280' }}>{item.value}</span>}
                      {item.type === 'text' && <span>{item.value}</span>}
                    </div>
                  </div>
                  <ArrowRightOutlined style={{ color: '#d1d5db' }} />
                </div>
              ))}
            </div>
          </Card>

          <Card
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AimOutlined style={{ color: '#52c41a' }} />
                需求与备注
              </span>
            }
            variant="borderless"
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, #f0fff4 0%, #dcfce7 100%)',
                  borderRadius: '10px',
                  borderLeft: '4px solid #52c41a',
                }}
              >
                <div style={{ fontSize: '12px', color: '#166534', marginBottom: '8px', fontWeight: 500 }}>
                  🎯 需求意向
                </div>
                <div style={{ fontSize: '15px', color: '#1f2937', lineHeight: '1.6' }}>{intention}</div>
              </div>
            </div>
            <Divider style={{ margin: '16px 0' }} />
            <div>
              <div
                style={{
                  padding: '16px',
                  background: '#f9fafb',
                  borderRadius: '10px',
                  borderLeft: '4px solid #667eea',
                }}
              >
                <div style={{ fontSize: '12px', color: '#4338ca', marginBottom: '8px', fontWeight: 500 }}>
                  📝 备注信息
                </div>
                <div style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.6' }}>{note}</div>
              </div>
            </div>
          </Card>
        </div>

        <Card
          title={
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClockCircleOutlined style={{ color: '#faad14' }} />
              跟进记录
            </span>
          }
          variant="borderless"
          style={{
            marginTop: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          }}
        >
          <Timeline
            mode="start"
            items={followLogs.map((log, index) => ({
              key: log.at,
              color: index === 0 ? '#667eea' : '#9ca3af',
              icon:
                index === 0 ? (
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)',
                    }}
                  />
                ) : undefined,
              content: (
                <div
                  style={{
                    padding: '12px 16px',
                    background: index === 0 ? '#f5f3ff' : '#f9fafb',
                    borderRadius: '10px',
                    marginLeft: '-8px',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Avatar
                      size={32}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '14px',
                      }}
                    >
                      {log.by.charAt(0)}
                    </Avatar>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1f2937' }}>{log.by}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{log.at}</div>
                    </div>
                  </div>
                  <p style={{ color: '#4b5563', lineHeight: '1.6', margin: 0 }}>{log.content}</p>
                </div>
              ),
            }))}
          />
        </Card>
      </div>
    </div>
  )
}
