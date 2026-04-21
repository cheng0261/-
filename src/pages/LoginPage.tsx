import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { useAuth } from '@/context/auth-context'

interface LoginFormValues {
  username: string
  password: string
}

export function LoginPage() {
  const [form] = Form.useForm<LoginFormValues>()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthReady } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true)
    setErrorMessage('')
    const ok = await login(values.username.trim(), values.password)
    setSubmitting(false)
    if (!ok) {
      setErrorMessage('用户名或密码错误，请重试。演示账号：admin / 123456')
      return
    }
    navigate(fromPath, { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card style={{ width: 420, borderRadius: 14 }}>
        <Typography.Title level={3} style={{ marginBottom: 6 }}>
          线索管理系统登录
        </Typography.Title>
        <Typography.Text type="secondary">Mock API 演示账号：admin / 123456</Typography.Text>

        <Form<LoginFormValues>
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          initialValues={{ username: 'admin', password: '123456' }}
          style={{ marginTop: 18 }}
        >
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" size="large" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="请输入密码" size="large" />
          </Form.Item>

          {errorMessage && (
            <Form.Item>
              <Alert type="error" showIcon message={errorMessage} />
            </Form.Item>
          )}

          <Button type="primary" htmlType="submit" size="large" block loading={submitting || !isAuthReady}>
            登录
          </Button>
        </Form>
      </Card>
    </div>
  )
}
