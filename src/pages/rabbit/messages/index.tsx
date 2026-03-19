import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
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
import { MessageStatus, MessageType } from '@/api/common/types'
import {
  listMessageLogs,
  getMessageLog,
  cancelMessage,
  retryMessage,
  type MessageLogItem,
  type ListMessageLogsParams,
} from '@/api/rabbit/message-log'
import { getStatusLabel, getStatusColor, getTypeLabel } from './constants'
import { getMessageTypeIconType } from '@/pages/rabbit/constants/appIcons'
import { IconFont } from '@/components/Icon/IconFont'
import DetailView from './components/DetailView'
import { useLocale } from '@/contexts/LocaleContext'
import PageContent from '@/components/layout/PageContent'
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
  const mountedRef = useRef(true)
  const paginationRef = useRef(pagination)
  paginationRef.current = pagination

  const fetchData = useCallback(
    async (page?: number, pageSize?: number) => {
      setLoading(true)
      try {
        const cur = paginationRef.current
        const currentPage = page ?? cur.current
        const currentPageSize = pageSize ?? cur.pageSize
        const params: ListMessageLogsParams = {
          page: currentPage,
          pageSize: currentPageSize,
          status: searchParams.status,
          messageType: searchParams.messageType,
          startAtUnix: searchParams.startAtUnix,
          endAtUnix: searchParams.endAtUnix,
        }
        const res = await listMessageLogs(params)
        if (!mountedRef.current) return
        setDataSource(res.items ?? [])
        setPagination(prev => ({
          ...prev,
          current: currentPage,
          pageSize: currentPageSize,
          total: parseInt(String(res.total ?? 0), 10),
        }))
      } catch (error) {
        console.error('获取消息日志列表失败:', error)
        if (mountedRef.current) setDataSource([])
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    },
    [
      searchParams.status,
      searchParams.messageType,
      searchParams.startAtUnix,
      searchParams.endAtUnix,
    ]
  )

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

  const handleSearch = useCallback(() => {
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchData(1, paginationRef.current.pageSize)
  }, [fetchData])

  const handleReset = useCallback(() => {
    const def = defaultDateRange()
    setSearchParams({ ...def, status: undefined, messageType: undefined })
    setUrlSearchParams({})
    setPagination({ current: 1, pageSize: 10, total: 0 })
    fetchData(1, 10)
  }, [fetchData])

  const handleTableChange = useCallback(
    (page: number, pageSize: number) => {
      fetchData(page, pageSize)
    },
    [fetchData]
  )

  const handleViewDetail = useCallback(async (record: MessageLogItem) => {
    const uid = record.uid
    if (!uid) return
    setDetailOpen(true)
    setDetailData(null)
    setDetailLoading(true)
    try {
      const data = await getMessageLog(uid)
      if (!mountedRef.current) return
      setDetailData(data)
    } catch (error) {
      console.error('获取消息详情失败:', error)
      if (mountedRef.current) setDetailData(record)
    } finally {
      if (mountedRef.current) setDetailLoading(false)
    }
  }, [])

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

  const columns: ColumnsType<MessageLogItem> = useMemo(() => {
    const emptyPlaceholder = (text: unknown) => (text == null || text === '') ? '-' : String(text)
    return [
    { title: t('messageLog.table.uid'), dataIndex: 'uid', key: 'uid', width: 160, ellipsis: true, render: (txt) => emptyPlaceholder(txt) },
    {
      title: t('messageLog.table.type'),
      dataIndex: 'messageType',
      key: 'messageType',
      minWidth: 120,
      align: 'center',
      render: (messageType: MessageType | string | undefined) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <IconFont type={getMessageTypeIconType(messageType ?? '')} />
          {getTypeLabel(messageType, t)}
        </span>
      ),
    },
    {
      title: t('messageLog.table.status'),
      dataIndex: 'status',
      key: 'status',
      minWidth: 100,
      align: 'center',
      render: (status: MessageStatus | string | undefined) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status, t)}</Tag>
      ),
    },
    {
      title: t('messageLog.table.sendAt'),
      dataIndex: 'sendAt',
      key: 'sendAt',
      minWidth: 160,
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: t('messageLog.table.message'),
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      minWidth: 300,
      render: (text: string, record: MessageLogItem) => (
        <Space size={4} wrap orientation="horizontal" align="start">
          {(record.retryTotal != null && record.retryTotal > 0) && (
            <Tag color="orange">{t('messageLog.retryBadge', { n: record.retryTotal })}</Tag>
          )}
          {record.lastError && (
            <Tooltip title={record.lastError}>
              <Tag color="red">{t('messageLog.errorLabel')}</Tag>
            </Tooltip>
          )}
          <span>{text || '-'}</span>
        </Space>
      ),
    },
    {
      title: t('table.action'),
      key: 'action',
      width: 140,
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
  }, [t])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

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
      <PageContent>
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
              className='w-45'
              value={searchParams.messageType ?? ''}
              onChange={v => setSearchParams(prev => ({ ...prev, messageType: v === '' ? undefined : (v as MessageType) }))}
              options={[
                { label: t('table.search.all'), value: '' },
                { value: MessageType.EMAIL, label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconFont type={getMessageTypeIconType(MessageType.EMAIL)} />{t('messageType.EMAIL')}</span> },
                { value: MessageType.SMS_ALICLOUD, label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconFont type={getMessageTypeIconType(MessageType.SMS_ALICLOUD)} />{t('messageType.SMS_ALICLOUD')}</span> },
                { value: MessageType.WEBHOOK_OTHER, label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconFont type={getMessageTypeIconType(MessageType.WEBHOOK_OTHER)} />{t('messageType.WEBHOOK_OTHER')}</span> },
                { value: MessageType.WEBHOOK_DINGTALK, label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconFont type={getMessageTypeIconType(MessageType.WEBHOOK_DINGTALK)} />{t('messageType.WEBHOOK_DINGTALK')}</span> },
                { value: MessageType.WEBHOOK_WECHAT, label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconFont type={getMessageTypeIconType(MessageType.WEBHOOK_WECHAT)} />{t('messageType.WEBHOOK_WECHAT')}</span> },
                { value: MessageType.WEBHOOK_FEISHU, label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><IconFont type={getMessageTypeIconType(MessageType.WEBHOOK_FEISHU)} />{t('messageType.WEBHOOK_FEISHU')}</span> },
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
                  { label: t('messageLog.preset.7d'), value: [now.subtract(7, 'day'), now] as [dayjs.Dayjs, dayjs.Dayjs] },
                  { label: t('messageLog.preset.15d'), value: [now.subtract(15, 'day'), now] as [dayjs.Dayjs, dayjs.Dayjs] },
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
      </PageContent>
    </App>
  )
}
