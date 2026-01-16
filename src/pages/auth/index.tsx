import { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (values: { token: string }) => {
    setLoading(true)
    setTimeout(() => {
      localStorage.setItem('auth_token', values.token)
      message.success('登录成功')
      navigate('/')
      setLoading(false)
    }, 500)
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        title={
          <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 600 }}>
            Rabbit 通知中心
          </div>
        }
        style={{ width: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
      >
        <Form onFinish={handleSubmit} layout='vertical'>
          <Form.Item
            name='token'
            label='访问令牌'
            rules={[{ required: true, message: '请输入访问令牌' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder='请输入 JWT Token'
              size='large'
            />
          </Form.Item>
          <Form.Item>
            <Button
              type='primary'
              htmlType='submit'
              loading={loading}
              block
              size='large'
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
