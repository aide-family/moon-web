import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Table,
  Button,
  Space,
  message as antdMessage,
  Tag,
  Select,
  DatePicker,
  App,
  Tooltip,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { MessageStatus, MessageType } from '@/api/types'
import {
  listMessageLogs,
  getMessageLog,
  cancelMessage,
  retryMessage,
  type MessageLogItem,
  type ListMessageLogsParams,
} from '@/api/message-log'
import { getStatusLabel, getStatusColor, getTypeLabel } from './constants'
import DetailView from './components/DetailView'
import { useLocale } from '@/contexts/LocaleContext'
import { applySearchToUrl, getParam } from '@/utils/urlSearchParams'

const { RangePicker } = DatePicker

const defaultDateRange = () => {
  const end = dayjs().endOf('day')
  const start = dayjs().subtract(7, 'day').startOf('day')
  return { startAtUnix: String(start.unix()), endAtUnix: String(end.unix()) }
}

function parseSearchParamsFromUrl(params: URLSearchParams): {
  status?: string
  messageType?: string
  startAtUnix?: string
  endAtUnix?: string
} {
  const start = getParam(params, 'startAtUnix')
  const end = getParam(params, 'endAtUnix')
  const def = defaultDateRange()
  return {
    status: getParam(params, 'status') ?? undefined,
    messageType: getParam(params, 'messageType') ?? undefined,
    startAtUnix: start ?? def.startAtUnix,
    endAtUnix: end ?? def.endAtUnix,
  }
}

export default function MessageManagement() {
  const { t } = useLocale()
  const { modal } = App.useApp()
  const [urlSearchParams, setUrlSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<MessageLogItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [searchParams, setSearchParams] = useState<{
    status?: string
    messageType?: string
    startAtUnix?: string
    endAtUnix?: string
  }>(() => parseSearchParamsFromUrl(urlSearchParams))
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
      const params: ListMessageLogsParams = {
        page: currentPage,
        pageSize: currentPageSize,
        status: searchParams.status,
        messageType: searchParams.messageType,
        startAtUnix: searchParams.startAtUnix,
        endAtUnix: searchParams.endAtUnix,
      }
      const res = await listMessageLogs(params)
      setDataSource(res.items ?? [])
      setPagination(prev => ({
        ...prev,
        current: currentPage,
        pageSize: currentPageSize,
        total: parseInt(String(res.total ?? 0), 10),
      }))
    } catch (error) {
      console.error('获取消息日志列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setSearchParams(parseSearchParamsFromUrl(urlSearchParams))
  }, [urlSearchParams.toString()])

  useEffect(() => {
    applySearchToUrl(
      setUrlSearchParams,
      {
        status: searchParams.status,
        messageType: searchParams.messageType,
        startAtUnix: searchParams.startAtUnix,
        endAtUnix: searchParams.endAtUnix,
      },
      { replace: true }
    )
  }, [searchParams.status, searchParams.messageType, searchParams.startAtUnix, searchParams.endAtUnix])

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchData()
  }

  const handleReset = () => {
    const def = defaultDateRange()
    setSearchParams({ ...def, status: undefined, messageType: undefined })
    setUrlSearchParams({})
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
          await retryMessage(uid)
          antdMessage.success(t('message.update.success'))
          fetchData()
        } catch (error) {
          console.error('重试消息失败:', error)
        }
      },
    })
  }

  const MAX_RANGE_DAYS = 31

  const handleTimeRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    const start = dates?.[0]
    const end = dates?.[1]
    if (!start || !end) {
      setSearchParams(prev => ({ ...prev, startAtUnix: undefined, endAtUnix: undefined }))
      return
    }
    const days = end.diff(start, 'day', true)
    if (days > MAX_RANGE_DAYS) return
    setSearchParams(prev => ({
      ...prev,
      startAtUnix: String(start.unix()),
      endAtUnix: String(end.unix()),
    }))
  }

  const columns: ColumnsType<MessageLogItem> = [
    { title: t('messageLog.table.uid'), dataIndex: 'uid', key: 'uid', width: 140, ellipsis: true },
    {
      title: t('messageLog.table.type'),
      dataIndex: 'messageType',
      key: 'messageType',
      width: 120,
      align: 'center',
      render: (messageType: MessageType | string | undefined) => getTypeLabel(messageType, t),
    },
    {
      title: t('messageLog.table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: MessageStatus | string | undefined) => (
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
      render: (text: string, record: MessageLogItem) => (
        <Space size={4} wrap direction="horizontal" align="start">
          {(record.retryTotal != null && record.retryTotal > 0) && (
            <Tag color="orange">{t('messageLog.retryBadge', { n: record.retryTotal })}</Tag>
          )}
          {record.lastError && (
            <Tooltip title={record.lastError}>
              <Tag color="red">{t('messageLog.errorLabel')}</Tag>
            </Tooltip>
          )}
          <span>{text ?? '-'}</span>
        </Space>
      ),
    },
    {
      title: t('table.action'),
      key: 'action',
      width: 180,
      fixed: 'right',
      align: 'center',
      render: (_, record) => {
        const status = record.status
        const showRetry = status === MessageStatus.FAILED
        const showCancel = status === MessageStatus.PENDING
        return (
          <Space size="small">
            <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
              {t('common.detail')}
            </Button>
            {showRetry && (
              <Button type="link" size="small" onClick={() => handleRetry(record)}>
                {t('messageLog.action.retry')}
              </Button>
            )}
            {showCancel && (
              <Button type="link" size="small" danger onClick={() => handleCancel(record)}>
                {t('messageLog.action.cancel')}
              </Button>
            )}
          </Space>
        )
      },
    },
  ]

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.status, searchParams.messageType])

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
              placeholder={t('messageLog.search.status')}
              style={{ width: 120 }}
              value={searchParams.status ?? ''}
              onChange={v => setSearchParams(prev => ({ ...prev, status: v === '' ? undefined : (v as MessageStatus) }))}
              options={[
                { label: t('table.search.all'), value: '' },
                { value: MessageStatus.PENDING, label: t('messageLog.status.pending') },
                { value: MessageStatus.SENDING, label: t('messageLog.status.sending') },
                { value: MessageStatus.SENT, label: t('messageLog.status.sent') },
                { value: MessageStatus.FAILED, label: t('messageLog.status.failed') },
                { value: MessageStatus.CANCELLED, label: t('messageLog.status.cancelled') },
              ]}
            />
            <span>{t('messageLog.search.type')}:</span>
            <Select
              placeholder={t('messageLog.search.type')}
              style={{ width: 160 }}
              value={searchParams.messageType ?? ''}
              onChange={v => setSearchParams(prev => ({ ...prev, messageType: v === '' ? undefined : (v as MessageType) }))}
              options={[
                { label: t('table.search.all'), value: '' },
                { value: MessageType.EMAIL, label: t('messageType.EMAIL') },
                { value: MessageType.SMS_ALICLOUD, label: t('messageType.SMS_ALICLOUD') },
                { value: MessageType.WEBHOOK_OTHER, label: t('messageType.WEBHOOK_OTHER') },
                { value: MessageType.WEBHOOK_DINGTALK, label: t('messageType.WEBHOOK_DINGTALK') },
                { value: MessageType.WEBHOOK_WECHAT, label: t('messageType.WEBHOOK_WECHAT') },
                { value: MessageType.WEBHOOK_FEISHU, label: t('messageType.WEBHOOK_FEISHU') },
              ]}
            />
            <span>{t('messageLog.search.timeRange')}:</span>
            <RangePicker
              showTime
              value={[
                searchParams.startAtUnix ? dayjs.unix(Number(searchParams.startAtUnix)) : null,
                searchParams.endAtUnix ? dayjs.unix(Number(searchParams.endAtUnix)) : null,
              ]}
              onChange={handleTimeRangeChange}
              disabledDate={(current, { from }) => {
                if (!from) return false
                if (current.isBefore(from, 'day')) return true
                if (current.diff(from, 'day') > MAX_RANGE_DAYS) return true
                return false
              }}
              presets={(() => {
                const now = dayjs()
                return [
                  { label: t('messageLog.preset.5m'), value: [now.subtract(5, 'minute'), now] as [dayjs.Dayjs, dayjs.Dayjs] },
                  { label: t('messageLog.preset.15m'), value: [now.subtract(15, 'minute'), now] as [dayjs.Dayjs, dayjs.Dayjs] },
                  { label: t('messageLog.preset.30m'), value: [now.subtract(30, 'minute'), now] as [dayjs.Dayjs, dayjs.Dayjs] },
                  { label: t('messageLog.preset.1h'), value: [now.subtract(1, 'hour'), now] as [dayjs.Dayjs, dayjs.Dayjs] },
                  { label: t('messageLog.preset.3h'), value: [now.subtract(3, 'hour'), now] as [dayjs.Dayjs, dayjs.Dayjs] },
                  { label: t('messageLog.preset.12h'), value: [now.subtract(12, 'hour'), now] as [dayjs.Dayjs, dayjs.Dayjs] },
                  { label: t('messageLog.preset.1d'), value: [now.subtract(1, 'day'), now] as [dayjs.Dayjs, dayjs.Dayjs] },
                  { label: t('messageLog.preset.3d'), value: [now.subtract(3, 'day'), now] as [dayjs.Dayjs, dayjs.Dayjs] },
                  { label: t('messageLog.preset.31d'), value: [now.subtract(1, 'month'), now] as [dayjs.Dayjs, dayjs.Dayjs] },
                ]
              })()}
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
