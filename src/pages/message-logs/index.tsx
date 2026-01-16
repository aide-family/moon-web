import { useEffect, useState } from 'react'
import {
  Table,
  Tag,
  Button,
  Space,
  message,
  Select,
  DatePicker,
  Popconfirm,
  Drawer,
  Descriptions,
} from 'antd'
import { ReloadOutlined, StopOutlined } from '@ant-design/icons'
import { MessageLogFilter, messageLogService } from '../../api/services'
import { MessageLogItem, MessageType, MessageStatus } from '../../api/types'

const { RangePicker } = DatePicker

export default function MessageLogs() {
  const [data, setData] = useState<MessageLogItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState<MessageLogFilter>({})
  const [selectedItem, setSelectedItem] = useState<MessageLogItem | null>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)

  useEffect(() => {
    loadData()
  }, [page, pageSize, filters])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await messageLogService.list({ page, pageSize, ...filters })
      setData(res.data.items)
      setTotal(res.data.total)
    } catch {
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = async (record: MessageLogItem) => {
    try {
      await messageLogService.retry(record.uid, record.sendAt)
      message.success('重试请求已提交')
      loadData()
    } catch {
      message.error('重试失败')
    }
  }

  const handleCancel = async (record: MessageLogItem) => {
    try {
      await messageLogService.cancel(record.uid, record.sendAt)
      message.success('取消成功')
      loadData()
    } catch {
      message.error('取消失败')
    }
  }

  const handleViewDetail = async (record: MessageLogItem) => {
    try {
      const res = await messageLogService.get(record.uid, record.sendAt)
      setSelectedItem(res.data)
      setDrawerVisible(true)
    } catch {
      message.error('加载详情失败')
    }
  }

  const columns = [
    { title: 'UID', dataIndex: 'uid', key: 'uid', width: 120, ellipsis: true },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
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
      width: 100,
      render: (status: MessageStatus) => {
        const statusMap: Partial<Record<MessageStatus, React.ReactNode>> = {
          [MessageStatus.Pending]: <Tag color='default'>待发送</Tag>,
          [MessageStatus.Sending]: <Tag color='success'>已发送</Tag>,
          [MessageStatus.Failed]: <Tag color='error'>失败</Tag>,
          [MessageStatus.Cancelled]: <Tag color='warning'>已取消</Tag>,
        }
        return statusMap[status] || <Tag color='default'>未知</Tag>
      },
    },
    { title: '消息内容', dataIndex: 'message', key: 'message', ellipsis: true },
    { title: '发送时间', dataIndex: 'sendAt', key: 'sendAt', width: 180 },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: MessageLogItem) => (
        <Space>
          <Button
            type='link'
            size='small'
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === MessageStatus.Failed && (
            <Popconfirm
              title='确定重试？'
              onConfirm={() => handleRetry(record)}
              okText='确定'
              cancelText='取消'
            >
              <Button type='link' size='small' icon={<ReloadOutlined />}>
                重试
              </Button>
            </Popconfirm>
          )}
          {record.status === MessageStatus.Pending && (
            <Popconfirm
              title='确定取消？'
              onConfirm={() => handleCancel(record)}
              okText='确定'
              cancelText='取消'
            >
              <Button type='link' danger size='small' icon={<StopOutlined />}>
                取消
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div
        style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}
      >
        <Select
          placeholder='类型'
          style={{ width: 120 }}
          allowClear
          onChange={(value) => setFilters({ ...filters, type: value })}
        >
          <Select.Option value={MessageType.Email}>邮件</Select.Option>
          <Select.Option value={MessageType.Webhook}>Webhook</Select.Option>
        </Select>
        <Select
          placeholder='状态'
          style={{ width: 120 }}
          allowClear
          onChange={(value) => setFilters({ ...filters, status: value })}
        >
          <Select.Option value={MessageStatus.Pending}>待发送</Select.Option>
          <Select.Option value={MessageStatus.Sending}>已发送</Select.Option>
          <Select.Option value={MessageStatus.Failed}>失败</Select.Option>
          <Select.Option value={MessageStatus.Cancelled}>已取消</Select.Option>
        </Select>
        <RangePicker
          showTime
          onChange={(dates) => {
            if (dates) {
              setFilters({
                ...filters,
                startAtUnix: dates[0]?.unix().toString(),
                endAtUnix: dates[1]?.unix().toString(),
              })
            } else {
              const { ...rest } = filters
              setFilters(rest)
            }
          }}
        />
      </div>

      <Table
        dataSource={data}
        columns={columns}
        rowKey='uid'
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => {
            setPage(p)
            setPageSize(ps)
          },
        }}
      />

      <Drawer
        title='消息详情'
        placement='right'
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedItem && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label='UID'>
              {selectedItem.uid}
            </Descriptions.Item>
            <Descriptions.Item label='类型'>
              {selectedItem.type === MessageType.Email ? '邮件' : 'Webhook'}
            </Descriptions.Item>
            <Descriptions.Item label='状态'>
              {MessageStatus[selectedItem.status] || (
                <Tag color='default'>{selectedItem.status}</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label='消息内容'>
              {selectedItem.message}
            </Descriptions.Item>
            <Descriptions.Item label='发送时间'>
              {selectedItem.sendAt}
            </Descriptions.Item>
            <Descriptions.Item label='创建时间'>
              {selectedItem.createdAt}
            </Descriptions.Item>
            <Descriptions.Item label='更新时间'>
              {selectedItem.updatedAt}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}
