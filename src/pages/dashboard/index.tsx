import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Alert, Spin } from 'antd'
import {
  AppstoreOutlined,
  MailOutlined,
  ApiOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import {
  namespaceService,
  emailService,
  webhookService,
  templateService,
  messageLogService,
  healthService,
} from '../../api/services'
import {
  MessageLogItem,
  HealthCheckReply,
  GlobalStatus,
  MessageStatus,
  MessageType,
} from '../../api/types'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    namespaces: 0,
    emailConfigs: 0,
    webhookConfigs: 0,
    templates: 0,
  })
  const [recentLogs, setRecentLogs] = useState<MessageLogItem[]>([])
  const [health, setHealth] = useState<HealthCheckReply | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [
        namespaceRes,
        emailRes,
        webhookRes,
        templateRes,
        logsRes,
        healthRes,
      ] = await Promise.all([
        namespaceService.list({ page: 1, pageSize: 1 }),
        emailService.list({
          page: 1,
          pageSize: 1,
          status: GlobalStatus.ENABLED,
        }),
        webhookService.list({
          page: 1,
          pageSize: 1,
          status: GlobalStatus.ENABLED,
        }),
        templateService.list({ page: 1, pageSize: 1 }),
        messageLogService.list({ page: 1, pageSize: 10 }),
        healthService.check(),
      ])

      setStats({
        namespaces: namespaceRes.data.total,
        emailConfigs: emailRes.data.total,
        webhookConfigs: webhookRes.data.total,
        templates: templateRes.data.total,
      })
      setRecentLogs(logsRes.data.items)
      setHealth(healthRes.data)
    } catch {
      console.error('Failed to load dashboard data:')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'UID',
      dataIndex: 'uid',
      key: 'uid',
      width: 120,
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: MessageType) =>
        type === MessageType.Email ? (
          <Tag color='blue'>邮件</Tag>
        ) : (
          <Tag color='green'>Webhook</Tag>
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: MessageStatus) => {
        const statusMap: Partial<Record<MessageStatus, React.ReactNode>> = {
          [MessageStatus.Pending]: <Tag color='default'>待发送</Tag>,
          [MessageStatus.Sent]: <Tag color='success'>已发送</Tag>,
          [MessageStatus.Failed]: <Tag color='error'>失败</Tag>,
          [MessageStatus.Cancelled]: <Tag color='warning'>已取消</Tag>,
        }
        return statusMap[status] || <Tag color='default'>未知</Tag>
      },
    },
    {
      title: '消息内容',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '发送时间',
      dataIndex: 'sendAt',
      key: 'sendAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: () => <Link to={`/message-logs`}>查看</Link>,
    },
  ]

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size='large' />
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24, fontSize: 24, fontWeight: 600 }}>
        仪表盘
      </h1>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title='命名空间'
              value={stats.namespaces}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title='启用的邮件配置'
              value={stats.emailConfigs}
              prefix={<MailOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title='启用的 Webhook 配置'
              value={stats.webhookConfigs}
              prefix={<ApiOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title='模板数'
              value={stats.templates}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {health && (
        <Alert
          message='系统健康状态'
          description={
            <div>
              <div>
                <strong>状态:</strong> {health.status}
              </div>
              <div>
                <strong>消息:</strong> {health.message}
              </div>
              <div>
                <strong>时间:</strong> {health.timestamp}
              </div>
            </div>
          }
          type={health.status === 'UP' ? 'success' : 'error'}
          icon={
            health.status === 'UP' ? (
              <CheckCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
          style={{ marginBottom: 24 }}
          showIcon
        />
      )}

      <Card title='最近消息日志' style={{ marginTop: 24 }}>
        <Table
          dataSource={recentLogs}
          columns={columns}
          rowKey='uid'
          pagination={false}
        />
      </Card>
    </div>
  )
}
