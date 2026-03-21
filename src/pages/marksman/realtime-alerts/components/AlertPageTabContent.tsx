import type { AlertEventItem, ListRealtimeAlertParams } from '@/api/marksman/alert'
import {
  getRealtimeAlertList,
  interveneAlert,
  recoverAlert,
  suppressAlert,
} from '@/api/marksman/alert'
import { useLocale } from '@/contexts/LocaleContext'
import { emptyPlaceholder } from '@/utils/marksman'
import type { MenuProps } from 'antd'
import {
  Button,
  DatePicker,
  Descriptions,
  Dropdown,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ALERT_STATUS_MAP,
  defaultListParams,
  getMockRealtimeAlerts,
} from './realtimeAlertHelpers'

/** 实时告警列表筛选表单（仅 Tab 内使用） */
interface AlertFilterFormValues {
  keyword?: string
  status?: number
  timeRange?: [dayjs.Dayjs, dayjs.Dayjs] | null
}

export interface AlertPageTabContentProps {
  alertPageUid: string
}

export const AlertPageTabContent: React.FC<AlertPageTabContentProps> = ({
  alertPageUid,
}) => {
  const { t } = useLocale()
  const [filterForm] = Form.useForm<AlertFilterFormValues>()
  const filterStatus = Form.useWatch('status', filterForm)
  const timeRange = Form.useWatch('timeRange', filterForm)
  const keyword =
    (Form.useWatch('keyword', filterForm) as string | undefined) ?? ''
  const startAt = timeRange?.[0] ?? null
  const endAt = timeRange?.[1] ?? null
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<AlertEventItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailRecord, setDetailRecord] = useState<AlertEventItem | null>(null)
  const [suppressOpen, setSuppressOpen] = useState(false)
  const [suppressRecord, setSuppressRecord] = useState<AlertEventItem | null>(
    null,
  )
  const [suppressUntil, setSuppressUntil] = useState<dayjs.Dayjs | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const mountedRef = useRef(true)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const [tableHeight, setTableHeight] = useState(400)

  const fetchData = useCallback(
    async (page?: number, pageSize?: number) => {
      setLoading(true)
      try {
        const currentPage = page ?? 1
        const currentPageSize = pageSize ?? 10
        const params: ListRealtimeAlertParams = {
          ...defaultListParams,
          page: currentPage,
          pageSize: currentPageSize,
          status: filterStatus,
          startAtUnix: startAt ? String(startAt.unix()) : undefined,
          endAtUnix: endAt ? String(endAt.unix()) : undefined,
        }
        const res = await getRealtimeAlertList(alertPageUid, params)
        if (!mountedRef.current) return
        let items = res.items ?? []
        let total = parseInt(String(res.total ?? '0'), 10)
        if (items.length === 0 && total === 0) {
          const mockAll = getMockRealtimeAlerts(100)
          const statusFiltered =
            filterStatus !== undefined
              ? mockAll.filter((item) => item.status === filterStatus)
              : mockAll
          total = statusFiltered.length
          const start = (currentPage - 1) * currentPageSize
          items = statusFiltered.slice(start, start + currentPageSize)
        }
        setDataSource(items)
        setPagination((prev) => ({
          ...prev,
          current: currentPage,
          pageSize: currentPageSize,
          total,
        }))
      } catch (e) {
        console.error('获取实时告警列表失败:', e)
        if (mountedRef.current) setDataSource([])
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    },
    [alertPageUid, filterStatus, startAt, endAt],
  )

  useEffect(() => {
    mountedRef.current = true
    fetchData()
    return () => {
      mountedRef.current = false
    }
  }, [fetchData])

  useEffect(() => {
    const updateTableHeight = () => {
      if (tableContainerRef.current && tableWrapperRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight
        const theadEl =
          tableWrapperRef.current.querySelector('.ant-table-thead')
        const paginationEl =
          tableWrapperRef.current.querySelector('.ant-pagination')
        const theadHeight = theadEl
          ? (theadEl as HTMLElement).getBoundingClientRect().height
          : 0
        const paginationHeight = paginationEl
          ? (paginationEl as HTMLElement).getBoundingClientRect().height + 16
          : 0
        setTableHeight(
          Math.max(containerHeight - theadHeight - paginationHeight - 24, 100),
        )
      }
    }
    const timer = setTimeout(updateTableHeight, 100)
    window.addEventListener('resize', updateTableHeight)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateTableHeight)
    }
  }, [dataSource, pagination])

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }))
    fetchData(1, pagination.pageSize)
  }

  const handleTableChange = (page: number, pageSize: number) => {
    fetchData(page, pageSize)
  }

  const handleReset = () => {
    filterForm.resetFields()
    setPagination((prev) => ({ ...prev, current: 1 }))
  }

  const filteredData = useMemo(() => {
    if (!keyword.trim()) return dataSource
    const k = keyword.trim().toLowerCase()
    return dataSource.filter(
      (row) =>
        (row.summary ?? '').toLowerCase().includes(k) ||
        (row.description ?? '').toLowerCase().includes(k),
    )
  }, [dataSource, keyword])

  const handleIntervene = async (record: AlertEventItem) => {
    if (!record.uid) return
    setActionLoading(true)
    try {
      await interveneAlert(record.uid)
      message.success(t('realtimeAlert.message.intervene.success'))
      fetchData(pagination.current, pagination.pageSize)
    } catch (e) {
      console.error('介入告警失败:', e)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRecover = async (record: AlertEventItem) => {
    if (!record.uid) return
    setActionLoading(true)
    try {
      await recoverAlert(record.uid)
      message.success(t('realtimeAlert.message.recover.success'))
      fetchData(pagination.current, pagination.pageSize)
    } catch (e) {
      console.error('恢复告警失败:', e)
    } finally {
      setActionLoading(false)
    }
  }

  const openSuppress = (record: AlertEventItem) => {
    setSuppressRecord(record)
    setSuppressUntil(dayjs().add(1, 'hour'))
    setSuppressOpen(true)
  }

  const handleSuppressOk = async () => {
    if (!suppressRecord?.uid || !suppressUntil) return
    setActionLoading(true)
    try {
      await suppressAlert(suppressRecord.uid, {
        suppressUntilUnix: String(suppressUntil.unix()),
      })
      message.success(t('realtimeAlert.message.suppress.success'))
      setSuppressOpen(false)
      setSuppressRecord(null)
      setSuppressUntil(null)
      fetchData(pagination.current, pagination.pageSize)
    } catch (e) {
      console.error('抑制告警失败:', e)
    } finally {
      setActionLoading(false)
    }
  }

  const renderStatus = (status: number | undefined) => {
    if (status == null) return emptyPlaceholder(status)
    const info = ALERT_STATUS_MAP[status] ?? {
      key: 'table.unknown',
      color: 'default',
    }
    return <Tag color={info.color}>{t(info.key)}</Tag>
  }

  const columns: ColumnsType<AlertEventItem> = [
    {
      title: t('realtimeAlert.table.uid'),
      dataIndex: 'uid',
      key: 'uid',
      width: 120,
      ellipsis: true,
      render: (v) => emptyPlaceholder(v),
    },
    {
      title: t('realtimeAlert.table.levelName'),
      dataIndex: 'levelName',
      key: 'levelName',
      width: 100,
      render: (v) => emptyPlaceholder(v),
    },
    {
      title: t('realtimeAlert.table.summary'),
      dataIndex: 'summary',
      key: 'summary',
      width: 180,
      ellipsis: true,
      render: (v) => emptyPlaceholder(v),
    },
    {
      title: t('realtimeAlert.table.firedAt'),
      dataIndex: 'firedAt',
      key: 'firedAt',
      width: 170,
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: t('realtimeAlert.table.value'),
      dataIndex: 'value',
      key: 'value',
      width: 90,
      render: (v) => (v != null ? String(v) : '-'),
    },
    {
      title: t('realtimeAlert.table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: renderStatus,
    },
    {
      title: t('table.action'),
      key: 'action',
      width: 140,
      fixed: 'right',
      align: 'center',
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'intervene',
            label: t('realtimeAlert.action.intervene'),
            onClick: () => handleIntervene(record),
          },
          {
            key: 'recover',
            label: t('realtimeAlert.action.recover'),
            onClick: () => handleRecover(record),
          },
          {
            key: 'suppress',
            label: t('realtimeAlert.action.suppress'),
            onClick: () => openSuppress(record),
          },
        ]
        return (
          <Space size='small'>
            <Button
              type='link'
              size='small'
              onClick={() => {
                setDetailRecord(record)
                setDetailOpen(true)
              }}
            >
              {t('common.detail')}
            </Button>
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button type='link' size='small'>
                {t('common.more')}
              </Button>
            </Dropdown>
          </Space>
        )
      },
    },
  ]

  const now = dayjs()
  const rangePresets: {
    label: string
    value: [dayjs.Dayjs, dayjs.Dayjs]
  }[] = [
    {
      label: t('realtimeAlert.filter.range.last15Minutes'),
      value: [now.subtract(15, 'minute'), now],
    },
    {
      label: t('realtimeAlert.filter.range.last1Hour'),
      value: [now.subtract(1, 'hour'), now],
    },
    {
      label: t('realtimeAlert.filter.range.last1Day'),
      value: [now.subtract(1, 'day'), now],
    },
    {
      label: t('realtimeAlert.filter.range.last3Days'),
      value: [now.subtract(3, 'day'), now],
    },
    {
      label: t('realtimeAlert.filter.range.last7Days'),
      value: [now.subtract(7, 'day'), now],
    },
    {
      label: t('realtimeAlert.filter.range.last30Days'),
      value: [now.subtract(30, 'day'), now],
    },
    {
      label: t('realtimeAlert.filter.range.last90Days'),
      value: [now.subtract(90, 'day'), now],
    },
  ]

  return (
    <div className='h-full flex flex-col min-h-0'>
      <div className='mb-4 shrink-0'>
        <Form<AlertFilterFormValues>
          form={filterForm}
          layout='inline'
          className='w-full [&_.ant-form-item]:mb-3'
          initialValues={{
            keyword: '',
            status: undefined,
            timeRange: null,
          }}
        >
          <Form.Item name='keyword' className='max-w-md flex-1 min-w-[200px]'>
            <Input.Search
              placeholder={t('realtimeAlert.search.placeholder')}
              allowClear
              className='w-full max-w-md'
              onSearch={handleSearch}
            />
          </Form.Item>
          <Form.Item
            label={t('realtimeAlert.filter.status')}
            name='status'
            className='min-w-0'
          >
            <Select
              allowClear
              placeholder={t('realtimeAlert.filter.status.all')}
              className='min-w-[140px]'
              options={[
                { label: t('realtimeAlert.filter.status.firing'), value: 0 },
                {
                  label: t('realtimeAlert.filter.status.intervened'),
                  value: 1,
                },
                { label: t('realtimeAlert.filter.status.recovered'), value: 2 },
                {
                  label: t('realtimeAlert.filter.status.suppressed'),
                  value: 3,
                },
              ]}
            />
          </Form.Item>
          <Form.Item
            label={t('realtimeAlert.filter.timeRange')}
            name='timeRange'
            className='min-w-0'
          >
            <DatePicker.RangePicker
              showTime
              format='YYYY-MM-DD HH:mm:ss'
              allowClear
              presets={rangePresets}
            />
          </Form.Item>
          <Form.Item>
            <Space size='middle' wrap>
              <Button type='primary' onClick={handleSearch}>
                {t('common.search')}
              </Button>
              <Button onClick={handleReset}>{t('common.reset')}</Button>
            </Space>
          </Form.Item>
        </Form>
      </div>

      <div
        ref={tableContainerRef}
        className='flex-1 flex overflow-hidden flex-col min-h-0'
      >
        <div
          ref={tableWrapperRef}
          className='h-full flex flex-col flex-1 min-h-0'
        >
          <Table<AlertEventItem>
            columns={columns}
            dataSource={filteredData}
            rowKey='uid'
            loading={loading}
            size='small'
            scroll={{ x: 'max-content', y: tableHeight }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => t('table.total', { total }),
              onChange: handleTableChange,
              onShowSizeChange: handleTableChange,
            }}
          />
        </div>
      </div>

      <Modal
        title={t('realtimeAlert.modal.detail.title')}
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false)
          setDetailRecord(null)
        }}
        footer={null}
        width={640}
      >
        {detailRecord && (
          <Descriptions column={1} bordered size='small'>
            <Descriptions.Item label={t('realtimeAlert.table.uid')}>
              {emptyPlaceholder(detailRecord.uid)}
            </Descriptions.Item>
            <Descriptions.Item label={t('realtimeAlert.table.levelName')}>
              {emptyPlaceholder(detailRecord.levelName)}
            </Descriptions.Item>
            <Descriptions.Item label={t('realtimeAlert.table.summary')}>
              {emptyPlaceholder(detailRecord.summary)}
            </Descriptions.Item>
            <Descriptions.Item label={t('realtimeAlert.table.description')}>
              {emptyPlaceholder(detailRecord.description)}
            </Descriptions.Item>
            <Descriptions.Item label={t('realtimeAlert.table.firedAt')}>
              {detailRecord.firedAt
                ? dayjs(detailRecord.firedAt).format('YYYY-MM-DD HH:mm:ss')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('realtimeAlert.table.value')}>
              {detailRecord.value != null ? String(detailRecord.value) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('realtimeAlert.table.status')}>
              {renderStatus(detailRecord.status)}
            </Descriptions.Item>
            <Descriptions.Item label={t('realtimeAlert.table.intervenedAt')}>
              {detailRecord.intervenedAt
                ? dayjs(detailRecord.intervenedAt).format('YYYY-MM-DD HH:mm:ss')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('realtimeAlert.table.recoveredAt')}>
              {detailRecord.recoveredAt
                ? dayjs(detailRecord.recoveredAt).format('YYYY-MM-DD HH:mm:ss')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('realtimeAlert.table.suppressedUntil')}>
              {detailRecord.suppressUntilAt
                ? dayjs(detailRecord.suppressUntilAt).format(
                    'YYYY-MM-DD HH:mm:ss',
                  )
                : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title={t('realtimeAlert.modal.suppress.title')}
        open={suppressOpen}
        onOk={handleSuppressOk}
        onCancel={() => {
          setSuppressOpen(false)
          setSuppressRecord(null)
          setSuppressUntil(null)
        }}
        confirmLoading={actionLoading}
        okText={t('common.ok')}
        cancelText={t('common.cancel')}
      >
        <Space direction='vertical' style={{ width: '100%' }}>
          <span>{t('realtimeAlert.modal.suppress.until')}:</span>
          <DatePicker
            showTime
            value={suppressUntil}
            onChange={(v) => setSuppressUntil(v)}
            format='YYYY-MM-DD HH:mm:ss'
            className='w-full'
          />
        </Space>
      </Modal>
    </div>
  )
}
