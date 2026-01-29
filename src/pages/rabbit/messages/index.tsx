import React, { useState, useRef, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  message as antdMessage,
  Tag,
  Select,
  DatePicker,
  App,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import {
  listMessageLogs,
  getMessageLog,
  cancelMessage,
  retryMessage,
  type MessageLogItem,
  type ListMessageLogsParams,
} from '@/api/message-log'
import DetailView from './components/DetailView'
import { useLocale } from '@/contexts/LocaleContext'

const { RangePicker } = DatePicker

// 模拟数据（接口通后可关闭，改用下方真实 API）
const USE_MOCK_DATA = true

function generateMockData(): MessageLogItem[] {
  const statuses = [0, 1, 1, 2, 1, 3, 0, 2, 1, 1]
  const types = [0, 1, 2, 0, 1, 0, 2, 1, 0, 1]
  const messages = [
    '订单支付成功通知',
    '验证码已发送',
    '系统告警：CPU 使用率过高',
    '工单状态更新',
    '邮件发送失败重试',
    'Webhook 回调成功',
    '定时任务执行完成',
    '用户注册欢迎信',
    '密码重置链接已发送',
    '库存不足提醒',
  ]
  const errors = ['', '', 'Connection timeout', '', 'SMTP 550', '', 'DNS lookup failed', '', '', 'Rate limit exceeded']
  const list: MessageLogItem[] = []
  for (let i = 0; i < 50; i++) {
    const sendAt = dayjs().subtract(i % 30, 'day').subtract(i % 24, 'hour')
    const createdAt = sendAt.subtract(1, 'minute')
    const updatedAt = sendAt.add(i % 5, 'minute')
    list.push({
      uid: `msg-${String(i + 1).padStart(6, '0')}`,
      type: types[i % types.length],
      status: statuses[i % statuses.length],
      sendAt: sendAt.toISOString(),
      message: messages[i % messages.length],
      config: `{"channel":"email","template":"tpl-${(i % 3) + 1}"}`,
      retryTotal: i % 4,
      lastError: errors[i % errors.length] || undefined,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    })
  }
  return list
}

function getStatusLabel(status: number | undefined, t: (key: string) => string): string {
  if (status === undefined) return t('messageLog.status.unknown')
  const map: Record<number, string> = {
    0: t('messageLog.status.pending'),
    1: t('messageLog.status.sent'),
    2: t('messageLog.status.failed'),
    3: t('messageLog.status.cancelled'),
  }
  return map[status] ?? t('messageLog.status.unknown')
}

function getStatusColor(status: number | undefined): string {
  if (status === undefined) return 'default'
  const map: Record<number, string> = {
    0: 'processing',
    1: 'success',
    2: 'error',
    3: 'default',
  }
  return map[status] ?? 'default'
}

export default function MessageManagement() {
  const { t } = useLocale()
  const { modal } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<MessageLogItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [searchParams, setSearchParams] = useState<{
    status?: number
    type?: number
    startAtUnix?: string
    endAtUnix?: string
  }>({})
  const [tableHeight, setTableHeight] = useState(0)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailData, setDetailData] = useState<MessageLogItem | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const fetchData = async (page?: number, pageSize?: number) => {
    setLoading(true)
    try {
      const currentPage = page ?? pagination.current
      const currentPageSize = pageSize ?? pagination.pageSize

      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300))
        let allData = generateMockData()
        if (searchParams.status !== undefined) {
          allData = allData.filter(item => item.status === searchParams.status)
        }
        if (searchParams.type !== undefined) {
          allData = allData.filter(item => item.type === searchParams.type)
        }
        if (searchParams.startAtUnix && searchParams.endAtUnix) {
          const rangeStart = Number(searchParams.startAtUnix)
          const rangeEnd = Number(searchParams.endAtUnix)
          allData = allData.filter(item => {
            const ts = item.sendAt ? dayjs(item.sendAt).unix() : 0
            return ts >= rangeStart && ts <= rangeEnd
          })
        }
        const total = allData.length
        const sliceStart = (currentPage - 1) * currentPageSize
        const paginatedData = allData.slice(sliceStart, sliceStart + currentPageSize)
        setDataSource(paginatedData)
        setPagination(prev => ({
          ...prev,
          current: currentPage,
          pageSize: currentPageSize,
          total,
        }))
      } else {

      const params: ListMessageLogsParams = {
        page: currentPage,
        pageSize: currentPageSize,
        status: searchParams.status,
        type: searchParams.type,
        startAtUnix: searchParams.startAtUnix,
        endAtUnix: searchParams.endAtUnix,
      }
      const res = await listMessageLogs(params)
      setDataSource(res.items ?? [])
      setPagination(prev => ({
        ...prev,
        current: currentPage,
        pageSize: currentPageSize,
        total: parseInt(res.total ?? '0', 10),
      }))
      }
    } catch (error) {
      console.error('获取消息日志列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchData()
  }

  const handleReset = () => {
    setSearchParams({})
    setPagination({ current: 1, pageSize: 10, total: 0 })
    fetchData()
  }

  const handleTableChange = (page: number, pageSize: number) => {
    fetchData(page, pageSize)
  }

  const handleViewDetail = async (record: MessageLogItem) => {
    const uid = record.uid
    if (!uid) return
    setDetailOpen(true)
    setDetailData(null)
    setDetailLoading(true)
    if (USE_MOCK_DATA) {
      setDetailData(record)
      setDetailLoading(false)
      return
    }
    try {
      const data = await getMessageLog(uid)
      setDetailData(data)
    } catch (error) {
      console.error('获取消息详情失败:', error)
      setDetailData(record)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleCancel = (record: MessageLogItem) => {
    const uid = record.uid
    if (!uid) return
    modal.confirm({
      title: t('messageLog.confirm.cancel.title'),
      content: t('messageLog.confirm.cancel.content', { uid }),
      okText: t('common.ok'),
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          if (USE_MOCK_DATA) {
            antdMessage.success(t('message.update.success'))
            fetchData()
            return
          }
          await cancelMessage(uid)
          antdMessage.success(t('message.update.success'))
          fetchData()
        } catch (error) {
          console.error('取消消息失败:', error)
        }
      },
    })
  }

  const handleRetry = (record: MessageLogItem) => {
    const uid = record.uid
    if (!uid) return
    modal.confirm({
      title: t('messageLog.confirm.retry.title'),
      content: t('messageLog.confirm.retry.content', { uid }),
      okText: t('common.ok'),
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          if (USE_MOCK_DATA) {
            antdMessage.success(t('message.update.success'))
            fetchData()
            return
          }
          await retryMessage(uid)
          antdMessage.success(t('message.update.success'))
          fetchData()
        } catch (error) {
          console.error('重试消息失败:', error)
        }
      },
    })
  }

  const handleTimeRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (!dates || !dates[0] || !dates[1]) {
      setSearchParams(prev => ({ ...prev, startAtUnix: undefined, endAtUnix: undefined }))
      return
    }
    setSearchParams(prev => ({
      ...prev,
      startAtUnix: String(dates[0].unix()),
      endAtUnix: String(dates[1].unix()),
    }))
  }

  const columns: ColumnsType<MessageLogItem> = [
    { title: t('messageLog.table.uid'), dataIndex: 'uid', key: 'uid', width: 140, ellipsis: true },
    { title: t('messageLog.table.type'), dataIndex: 'type', key: 'type', width: 80 },
    {
      title: t('messageLog.table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status, t)}</Tag>
      ),
    },
    {
      title: t('messageLog.table.sendAt'),
      dataIndex: 'sendAt',
      key: 'sendAt',
      width: 160,
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: t('messageLog.table.message'),
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (text: string) => text ?? '-',
    },
    { title: t('messageLog.table.retryTotal'), dataIndex: 'retryTotal', key: 'retryTotal', width: 90 },
    {
      title: t('messageLog.table.lastError'),
      dataIndex: 'lastError',
      key: 'lastError',
      width: 120,
      ellipsis: true,
      render: (text: string) => text ?? '-',
    },
    {
      title: t('messageLog.table.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: t('table.action'),
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
            {t('common.detail')}
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleRetry(record)}
            disabled={record.status === 3}
          >
            {t('messageLog.action.retry')}
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => handleCancel(record)}
            disabled={record.status === 3}
          >
            {t('messageLog.action.cancel')}
          </Button>
        </Space>
      ),
    },
  ]

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const calc = () => {
      if (!tableContainerRef.current || !tableWrapperRef.current) return
      const containerHeight = tableContainerRef.current.clientHeight
      const thead = tableWrapperRef.current.querySelector('.ant-table-thead')
      const pag = tableWrapperRef.current.querySelector('.ant-pagination')
      const theadHeight = thead ? (thead as HTMLElement).offsetHeight : 0
      const pagHeight = pag ? (pag as HTMLElement).offsetHeight : 0
      const padding = 32
      setTableHeight(Math.max(containerHeight - theadHeight - pagHeight - padding, 100))
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [dataSource])

  return (
    <App className="h-full">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4 shrink-0 flex-wrap gap-2">
          <Space size="middle" wrap>
            <span>{t('messageLog.search.status')}:</span>
            <Select
              placeholder={t('table.search.all')}
              allowClear
              style={{ width: 120 }}
              value={searchParams.status}
              onChange={v => setSearchParams(prev => ({ ...prev, status: v }))}
              options={[
                { value: 0, label: t('messageLog.status.pending') },
                { value: 1, label: t('messageLog.status.sent') },
                { value: 2, label: t('messageLog.status.failed') },
                { value: 3, label: t('messageLog.status.cancelled') },
              ]}
            />
            <span>{t('messageLog.search.type')}:</span>
            <Select
              placeholder={t('table.search.all')}
              allowClear
              style={{ width: 120 }}
              value={searchParams.type}
              onChange={v => setSearchParams(prev => ({ ...prev, type: v }))}
              options={[
                { value: 0, label: '0' },
                { value: 1, label: '1' },
                { value: 2, label: '2' },
              ]}
            />
            <span>{t('messageLog.search.timeRange')}:</span>
            <RangePicker
              showTime
              onChange={handleTimeRangeChange}
              style={{ width: 360 }}
            />
            <Button type="primary" onClick={handleSearch}>
              {t('common.search')}
            </Button>
            <Button onClick={handleReset}>
              {t('common.reset')}
            </Button>
          </Space>
        </div>
        <div
          ref={tableContainerRef}
          className="flex-1 flex overflow-hidden flex-col"
          style={{ minHeight: 0 }}
        >
          <div ref={tableWrapperRef} className="h-full flex flex-col">
            <Table
              columns={columns}
              dataSource={dataSource}
              rowKey="uid"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: total => t('table.total', { total }),
                onChange: handleTableChange,
                onShowSizeChange: handleTableChange,
              }}
              scroll={{ y: tableHeight, x: 'max-content' }}
              size="middle"
            />
          </div>
        </div>
        <DetailView
          open={detailOpen}
          data={detailData}
          loading={detailLoading}
          onCancel={() => {
            setDetailOpen(false)
            setDetailData(null)
          }}
        />
      </div>
    </App>
  )
}
