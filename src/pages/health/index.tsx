import { useEffect, useState } from 'react'
import { Card, Alert, Spin, Button, Descriptions } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { healthService } from '../../api/services'
import { HealthCheckReply } from '../../api/types'

export default function Health() {
  const [health, setHealth] = useState<HealthCheckReply | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadHealth()
  }, [])

  const loadHealth = async () => {
    try {
      setLoading(true)
      const res = await healthService.check()
      setHealth(res.data)
    } catch (error) {
      console.error('Failed to load health status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !health) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size='large' />
      </div>
    )
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>健康检查</h1>
        <Button
          icon={<ReloadOutlined />}
          onClick={loadHealth}
          loading={loading}
        >
          刷新
        </Button>
      </div>

      {health && (
        <>
          <Alert
            message='系统状态'
            description={health.status === 'UP' ? '系统运行正常' : '系统异常'}
            type={health.status === 'UP' ? 'success' : 'error'}
            icon={
              health.status === 'UP' ? (
                <CheckCircleOutlined />
              ) : (
                <CloseCircleOutlined />
              )
            }
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Card title='健康状态详情'>
            <Descriptions column={1} bordered>
              <Descriptions.Item label='状态'>
                {health.status}
              </Descriptions.Item>
              <Descriptions.Item label='消息'>
                {health.message}
              </Descriptions.Item>
              <Descriptions.Item label='检查时间'>
                {health.timestamp}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </>
      )}
    </div>
  )
}
