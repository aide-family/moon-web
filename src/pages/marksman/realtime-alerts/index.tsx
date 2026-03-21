import { GlobalStatus } from '@/api/common/types'
import type {
  AlertEventItem,
  AlertPageFilter,
  AlertPageItem,
  GetAlertStatisticsReply,
  ListRealtimeAlertParams,
} from '@/api/marksman/alert'
import {
  createAlertPage,
  getAlertPageList,
  getAlertStatistics,
  getRealtimeAlertList,
  interveneAlert,
  listUserAlertPages,
  recoverAlert,
  saveUserAlertPages,
  suppressAlert,
} from '@/api/marksman/alert'
import type { LevelCount } from '@/api/marksman/alert/types'
import { getLevelSelectList } from '@/api/marksman/level'
import { getStrategySelectList } from '@/api/marksman/strategy'
import { getStrategyGroupSelectList } from '@/api/marksman/strategyGroup'
import PageContent from '@/components/layout/PageContent'
import { useLocale } from '@/contexts/LocaleContext'
import { useTheme } from '@/contexts/ThemeContext'
import { emptyPlaceholder } from '@/utils/marksman'
import { LinkOutlined, PlusOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import {
  App,
  Badge,
  Button,
  Col,
  ColorPicker,
  DatePicker,
  Descriptions,
  Dropdown,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Tooltip,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/** 告警状态与前端展示映射（后端 status 为数字，此处仅做展示用） */
const ALERT_STATUS_MAP: Record<number, { key: string; color: string }> = {
  0: { key: 'realtimeAlert.filter.status.firing', color: 'error' },
  1: { key: 'realtimeAlert.filter.status.intervened', color: 'processing' },
  2: { key: 'realtimeAlert.filter.status.recovered', color: 'success' },
  3: { key: 'realtimeAlert.filter.status.suppressed', color: 'default' },
}

const defaultListParams: ListRealtimeAlertParams = {
  page: 1,
  pageSize: 10,
  status: undefined,
  startAtUnix: undefined,
  endAtUnix: undefined,
}

const MOCK_LEVEL_NAMES = ['P0', 'P1', 'P2', 'P3', 'Warning', 'Critical', 'Info']
const MOCK_SUMMARIES = [
  'CPU 使用率超过阈值',
  '内存使用率告警',
  '磁盘空间不足',
  '接口响应时间过长',
  '服务实例不可用',
  '数据库连接数过高',
  '请求 QPS 超限',
  '错误率上升',
  'Pod 重启频繁',
  '网络延迟异常',
]

/** 生成模拟实时告警数据（接口无数据时用于页面效果预览） */
function getMockRealtimeAlerts(count: number): AlertEventItem[] {
  const items: AlertEventItem[] = []
  const now = Date.now()
  for (let i = 1; i <= count; i++) {
    const status = ((i - 1) % 4) as 0 | 1 | 2 | 3
    const firedAt = new Date(now - (count - i) * 60 * 60 * 1000).toISOString()
    items.push({
      uid: `mock-alert-${i}`,
      strategyUid: `strategy-${(i % 5) + 1}`,
      levelUid: `level-${(i % 3) + 1}`,
      levelName: MOCK_LEVEL_NAMES[i % MOCK_LEVEL_NAMES.length],
      summary: MOCK_SUMMARIES[i % MOCK_SUMMARIES.length] + ` #${i}`,
      description: `模拟告警描述：第 ${i} 条记录，用于查看表格与分页效果。`,
      firedAt,
      value: Math.round(80 + Math.random() * 20 * 10) / 10,
      status,
      intervenedAt:
        status >= 1
          ? new Date(now - (count - i) * 30 * 60 * 1000).toISOString()
          : undefined,
      recoveredAt:
        status >= 2
          ? new Date(now - (count - i) * 15 * 60 * 1000).toISOString()
          : undefined,
      suppressUntilAt:
        status === 3
          ? new Date(now + 24 * 60 * 60 * 1000).toISOString()
          : undefined,
      createdAt: firedAt,
      updatedAt: firedAt,
    })
  }
  return items
}

function buildCreateAlertPageFilter(values: {
  filterStrategyGroupUids?: string[]
  filterLevelUids?: string[]
  filterStrategyUids?: string[]
}): AlertPageFilter | undefined {
  const strategyGroupUids = (values.filterStrategyGroupUids ?? []).filter(
    Boolean,
  )
  const levelUids = (values.filterLevelUids ?? []).filter(Boolean)
  const strategyUids = (values.filterStrategyUids ?? []).filter(Boolean)
  if (
    strategyGroupUids.length === 0 &&
    levelUids.length === 0 &&
    strategyUids.length === 0
  ) {
    return undefined
  }
  const out: AlertPageFilter = {}
  if (strategyGroupUids.length > 0) out.strategyGroupUids = strategyGroupUids
  if (levelUids.length > 0) out.levelUids = levelUids
  if (strategyUids.length > 0) out.strategyUids = strategyUids
  return out
}

/** 实时告警列表筛选表单（仅 Tab 内使用） */
interface AlertFilterFormValues {
  keyword?: string
  status?: number
  timeRange?: [dayjs.Dayjs, dayjs.Dayjs] | null
}

/** 单个告警页 Tab 内容：筛选 + 表格 + 详情/抑制弹窗 */
interface AlertPageTabContentProps {
  alertPageUid: string
}

const AlertPageTabContent: React.FC<AlertPageTabContentProps> = ({
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

interface RealtimeAlertListProps {
  stats: GetAlertStatisticsReply | null
  statsLoading: boolean
}

const RealtimeAlertList: React.FC<RealtimeAlertListProps> = ({ stats }) => {
  const { t } = useLocale()
  const [availableAlertPages, setAvailableAlertPages] = useState<
    AlertPageItem[]
  >([])
  const [availableAlertPagesLoading, setAvailableAlertPagesLoading] =
    useState(false)
  const [boundAlertPages, setBoundAlertPages] = useState<AlertPageItem[]>([])
  const [boundAlertPagesLoading, setBoundAlertPagesLoading] = useState(false)
  const [activeTabKey, setActiveTabKey] = useState<string | undefined>(
    undefined,
  )
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [bindModalOpen, setBindModalOpen] = useState(false)
  const [bindLoading, setBindLoading] = useState(false)
  const [createFilterOptionsLoading, setCreateFilterOptionsLoading] =
    useState(false)
  const [strategyGroupSelectOptions, setStrategyGroupSelectOptions] = useState<
    { value: string; label: string; disabled?: boolean }[]
  >([])
  const [levelSelectOptions, setLevelSelectOptions] = useState<
    { value: string; label: string; disabled?: boolean }[]
  >([])
  const [strategySelectOptions, setStrategySelectOptions] = useState<
    { value: string; label: string; disabled?: boolean }[]
  >([])
  const [form] = Form.useForm()
  const [bindForm] = Form.useForm()
  const mountedRef = useRef(true)

  const disabledStrategyGroupSet = useMemo(() => {
    return new Set(
      strategyGroupSelectOptions.filter((o) => o.disabled).map((o) => o.value),
    )
  }, [strategyGroupSelectOptions])

  const disabledLevelSet = useMemo(() => {
    return new Set(
      levelSelectOptions.filter((o) => o.disabled).map((o) => o.value),
    )
  }, [levelSelectOptions])

  const disabledStrategySet = useMemo(() => {
    return new Set(
      strategySelectOptions.filter((o) => o.disabled).map((o) => o.value),
    )
  }, [strategySelectOptions])

  const fetchAvailableAlertPages = useCallback(async () => {
    setAvailableAlertPagesLoading(true)
    try {
      const res = await getAlertPageList({ page: 1, pageSize: 100 })
      if (!mountedRef.current) return
      const items = res.items ?? []
      setAvailableAlertPages(items)
    } catch (e) {
      console.error('获取告警页列表失败:', e)
    } finally {
      if (mountedRef.current) setAvailableAlertPagesLoading(false)
    }
  }, [])

  const fetchBoundAlertPages = useCallback(async () => {
    setBoundAlertPagesLoading(true)
    try {
      const res = await listUserAlertPages()
      if (!mountedRef.current) return
      const items = res.items ?? []
      setBoundAlertPages(items)
      setActiveTabKey((prev) => {
        if (items.length === 0) return undefined
        if (!prev || !items.some((p) => p.uid === prev)) return items[0]?.uid
        return prev
      })
    } catch (e) {
      console.error('获取绑定告警页失败:', e)
    } finally {
      if (mountedRef.current) setBoundAlertPagesLoading(false)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    fetchAvailableAlertPages()
    fetchBoundAlertPages()
    return () => {
      mountedRef.current = false
    }
  }, [fetchAvailableAlertPages, fetchBoundAlertPages])

  useEffect(() => {
    if (!createModalOpen) return
    let cancelled = false
    const loadFilterSelects = async () => {
      setCreateFilterOptionsLoading(true)
      try {
        const [sgRes, lvRes, stRes] = await Promise.all([
          getStrategyGroupSelectList({ limit: 100 }),
          getLevelSelectList({ limit: 100 }),
          getStrategySelectList({ limit: 100 }),
        ])
        if (cancelled || !mountedRef.current) return

        const mapItems = (
          items: { value?: string; label?: string; disabled?: unknown }[],
        ) =>
          (items ?? [])
            .filter(
              (i): i is { value: string; label?: string; disabled?: unknown } =>
                !!i.value,
            )
            .map((i) => ({
              value: i.value,
              label: i.label ?? i.value,
            }))
        setStrategyGroupSelectOptions(mapItems(sgRes.items ?? []))
        setLevelSelectOptions(mapItems(lvRes.items ?? []))
        setStrategySelectOptions(mapItems(stRes.items ?? []))
      } catch (e) {
        console.error('加载创建告警页筛选项失败:', e)
        if (!cancelled && mountedRef.current) {
          setStrategyGroupSelectOptions([])
          setLevelSelectOptions([])
          setStrategySelectOptions([])
        }
      } finally {
        if (!cancelled && mountedRef.current)
          setCreateFilterOptionsLoading(false)
      }
    }
    void loadFilterSelects()
    return () => {
      cancelled = true
    }
  }, [createModalOpen])

  const handleCreateOk = async () => {
    try {
      const values = await form.validateFields()
      setCreateLoading(true)
      const filter = buildCreateAlertPageFilter(values)
      const sortOrder =
        values.sortOrder === null || values.sortOrder === undefined
          ? undefined
          : Number(values.sortOrder)
      const res = await createAlertPage({
        name: values.name?.trim(),
        color: values.color?.trim(),
        sortOrder: sortOrder,
        filter,
      })
      const newUid = res.uid
      message.success(t('realtimeAlert.message.createAlertPage.success'))
      setCreateModalOpen(false)
      form.resetFields()
      await fetchAvailableAlertPages()
      // 新创建的告警页是否自动绑定由后端策略决定，这里不做额外假设
      if (newUid) setActiveTabKey((prev) => (prev ? prev : newUid))
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return
      console.error('创建告警页失败:', e)
    } finally {
      setCreateLoading(false)
    }
  }

  const bindAlertPageOptions = useMemo(() => {
    return availableAlertPages
      .filter((p) => p.uid)
      .map((p) => ({
        label: p.name ?? p.uid ?? '-',
        value: p.uid as string,
      }))
  }, [availableAlertPages])

  const parseCount = (v?: string) => {
    const n = v == null ? 0 : Number(v)
    return Number.isFinite(n) ? n : 0
  }

  const alertPageCountMap = useMemo(() => {
    const map = new Map<string, number>()
    ;(stats?.countByAlertPage ?? []).forEach((item) => {
      if (!item.alertPageUid) return
      map.set(item.alertPageUid, parseCount(item.count))
    })
    return map
  }, [stats])

  const tabItems = useMemo(
    () =>
      boundAlertPages
        .filter((page) => page.uid)
        .map((page) => {
          const uid = page.uid as string
          const count = alertPageCountMap.get(uid) || 100
          const labelText = page.name ?? page.uid ?? '-'
          const bgColor = page.color
          return {
            key: uid,
            label: (
              <span className='inline-flex max-w-full min-w-0 items-center gap-1'>
                <Badge color={bgColor || '#000'} size='small' />
                {labelText}
                {!!count && (
                  <span className='pl-1 text-xs text-red-400 font-bold'>
                    ({count})
                  </span>
                )}
              </span>
            ),
            children: null,
          }
        }),
    [boundAlertPages, alertPageCountMap],
  )

  const activeKey = activeTabKey ?? tabItems[0]?.key
  const openBindModal = useCallback(() => {
    const selected = boundAlertPages
      .filter((p) => p.uid)
      .map((p) => p.uid as string)
    bindForm.setFieldsValue({ alertPageUids: selected })
    setBindModalOpen(true)
  }, [bindForm, boundAlertPages])

  const handleBindOk = async () => {
    type BindFormValues = {
      alertPageUids?: string[]
    }
    try {
      const values = (await bindForm.validateFields()) as BindFormValues
      setBindLoading(true)
      await saveUserAlertPages({
        alertPageUids: values.alertPageUids,
      })
      message.success(t('realtimeAlert.message.bind.success'))
      setBindModalOpen(false)
      bindForm.resetFields()
      await fetchBoundAlertPages()
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return
      console.error('绑定个人告警页失败:', e)
    } finally {
      setBindLoading(false)
    }
  }

  const showGlobalEmpty =
    availableAlertPages.length === 0 &&
    !availableAlertPagesLoading &&
    boundAlertPages.length === 0 &&
    !boundAlertPagesLoading
  const showBindEmpty =
    availableAlertPages.length > 0 &&
    !availableAlertPagesLoading &&
    boundAlertPages.length === 0 &&
    !boundAlertPagesLoading

  return (
    <div className='h-full flex flex-col min-h-0'>
      {showGlobalEmpty ? (
        <>
          <div className='flex items-center gap-2 mb-3 shrink-0'>
            <Tooltip title={t('common.add')}>
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={() => setCreateModalOpen(true)}
              />
            </Tooltip>
          </div>
          <div className='flex-1 flex items-center justify-center text-gray-500'>
            {t('realtimeAlert.message.noAlertPages')}
          </div>
        </>
      ) : showBindEmpty ? (
        <>
          <div className='flex items-center gap-2 mb-3 shrink-0'>
            <Tooltip title={t('realtimeAlert.action.bindAlertPages')}>
              <Button icon={<LinkOutlined />} onClick={openBindModal} />
            </Tooltip>
            <Tooltip title={t('common.add')}>
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={() => setCreateModalOpen(true)}
              />
            </Tooltip>
          </div>
          <div className='flex-1 flex items-center justify-center text-gray-500'>
            {t('realtimeAlert.message.noBoundAlertPages')}
          </div>
        </>
      ) : tabItems.length > 0 ? (
        <>
          <div className='flex items-center gap-2 mb-2 shrink-0'>
            <Tooltip title={t('realtimeAlert.action.bindAlertPages')}>
              <Button icon={<LinkOutlined />} onClick={openBindModal} />
            </Tooltip>
            <Tooltip title={t('common.add')}>
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={() => setCreateModalOpen(true)}
              />
            </Tooltip>
            <Tabs
              activeKey={activeKey}
              onChange={(key) => setActiveTabKey(key)}
              items={tabItems}
              className='flex-1 min-w-0 [&_.ant-tabs-content]:hidden [&_.ant-tabs-tab]:overflow-visible'
            />
          </div>
          <div className='flex-1 min-h-0 overflow-hidden flex flex-col'>
            {activeKey ? (
              <AlertPageTabContent alertPageUid={activeKey} />
            ) : null}
          </div>
        </>
      ) : (
        <div className='flex-1 flex items-center justify-center'>
          <Spin />
        </div>
      )}

      <Modal
        title={t('realtimeAlert.modal.createAlertPage.title')}
        open={createModalOpen}
        onOk={handleCreateOk}
        onCancel={() => {
          setCreateModalOpen(false)
          form.resetFields()
        }}
        confirmLoading={createLoading}
        okText={t('common.ok')}
        cancelText={t('common.cancel')}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout='vertical' preserve={false}>
          <Form.Item
            name='name'
            label={t('realtimeAlert.form.alertPageName')}
            rules={[
              {
                required: true,
                message: t('realtimeAlert.form.alertPageName.placeholder'),
              },
            ]}
          >
            <Input
              autoComplete='off'
              placeholder={t('realtimeAlert.form.alertPageName.placeholder')}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name='sortOrder'
                label={t('realtimeAlert.form.alertPageSortOrder')}
              >
                <Input
                  type='number'
                  min={0}
                  step={1}
                  autoComplete='off'
                  placeholder={t(
                    'realtimeAlert.form.alertPageSortOrder.placeholder',
                  )}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name='color'
                label={t('realtimeAlert.form.alertPageColor')}
                getValueFromEvent={(_color, css: string) =>
                  css?.trim() ? css.trim() : undefined
                }
              >
                <ColorPicker
                  format='hex'
                  allowClear
                  showText
                  // className='w-full'
                />
              </Form.Item>
            </Col>
          </Row>
          <div className='text-sm text-gray-500 mb-2'>
            {t('realtimeAlert.form.alertPageFilter.section')}
          </div>
          <div className='text-xs text-gray-400 mb-3'>
            {t('realtimeAlert.form.alertPageFilter.hint')}
          </div>
          <Form.Item
            name='filterStrategyGroupUids'
            label={t('realtimeAlert.form.alertPageFilter.strategyGroups')}
            getValueFromEvent={(v?: string[]) =>
              (v ?? []).filter((value) => !disabledStrategyGroupSet.has(value))
            }
          >
            <Select
              mode='multiple'
              allowClear
              showSearch
              optionFilterProp='label'
              loading={createFilterOptionsLoading}
              placeholder={t(
                'realtimeAlert.form.alertPageFilter.strategyGroups.placeholder',
              )}
              options={strategyGroupSelectOptions}
            />
          </Form.Item>
          <Form.Item
            name='filterLevelUids'
            label={t('realtimeAlert.form.alertPageFilter.levels')}
            getValueFromEvent={(v?: string[]) =>
              (v ?? []).filter((value) => !disabledLevelSet.has(value))
            }
          >
            <Select
              mode='multiple'
              allowClear
              showSearch
              optionFilterProp='label'
              loading={createFilterOptionsLoading}
              placeholder={t(
                'realtimeAlert.form.alertPageFilter.levels.placeholder',
              )}
              options={levelSelectOptions}
            />
          </Form.Item>
          <Form.Item
            name='filterStrategyUids'
            label={t('realtimeAlert.form.alertPageFilter.strategies')}
            getValueFromEvent={(v?: string[]) =>
              (v ?? []).filter((value) => !disabledStrategySet.has(value))
            }
          >
            <Select
              mode='multiple'
              allowClear
              showSearch
              optionFilterProp='label'
              loading={createFilterOptionsLoading}
              placeholder={t(
                'realtimeAlert.form.alertPageFilter.strategies.placeholder',
              )}
              options={strategySelectOptions}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('realtimeAlert.modal.bindAlertPages.title')}
        open={bindModalOpen}
        onOk={handleBindOk}
        onCancel={() => {
          setBindModalOpen(false)
          bindForm.resetFields()
        }}
        confirmLoading={bindLoading}
        okText={t('common.ok')}
        cancelText={t('common.cancel')}
        destroyOnClose
      >
        <Form form={bindForm} layout='vertical' preserve={false}>
          <Form.Item
            name='alertPageUids'
            label={t('realtimeAlert.form.bindAlertPages.label')}
            rules={[
              {
                required: true,
                message: t('realtimeAlert.form.bindAlertPages.required'),
              },
            ]}
          >
            <Select
              mode='multiple'
              showSearch
              placeholder={t('realtimeAlert.form.bindAlertPages.placeholder')}
              style={{ width: '100%' }}
              options={bindAlertPageOptions}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default function RealtimeAlertListWrapper() {
  const { t } = useLocale()
  const { actualThemeMode } = useTheme()
  const isDark = actualThemeMode === 'dark'
  const [statsLoading, setStatsLoading] = useState(false)
  const [stats, setStats] = useState<GetAlertStatisticsReply | null>(null)
  const [levelSelectList, setLevelSelectList] = useState<
    { value: string; label: string }[]
  >([])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setStatsLoading(true)
      try {
        const [statsResult, levelsResult] = await Promise.allSettled([
          getAlertStatistics(),
          getLevelSelectList({ limit: 10, status: GlobalStatus.ENABLED }),
        ])
        if (cancelled) return
        if (statsResult.status === 'fulfilled') {
          setStats(statsResult.value)
        } else {
          console.error('获取告警实时统计失败:', statsResult.reason)
          setStats(null)
        }
        if (levelsResult.status === 'fulfilled') {
          const items = (levelsResult.value.items ?? [])
            .filter((i): i is { value: string; label?: string } =>
              Boolean(i?.value),
            )
            .map((i) => ({
              value: i.value,
              label: i.label ?? i.value,
            }))
          setLevelSelectList(items)
        } else {
          console.error('获取告警等级列表失败:', levelsResult.reason)
          setLevelSelectList([])
        }
      } finally {
        if (!cancelled) setStatsLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const parseCount = (v?: string) => {
    const n = v == null ? 0 : Number(v)
    return Number.isFinite(n) ? n : 0
  }

  const levelStatRows: LevelCount[] = useMemo(() => {
    const byApi = stats?.countByLevel ?? []
    const countByUid = new Map<string, string>()
    for (const row of byApi) {
      if (row.levelUid != null && row.levelUid !== '') {
        countByUid.set(row.levelUid, row.count ?? '0')
      }
    }
    if (levelSelectList.length > 0) {
      return levelSelectList.map((opt) => ({
        levelUid: opt.value,
        levelName: opt.label,
        count: countByUid.get(opt.value) ?? '0',
      }))
    }
    return byApi
  }, [stats, levelSelectList])

  const headerClassName = isDark
    ? 'sticky top-0 z-10 pt-2 pb-3 mb-2 border-b'
    : 'sticky top-0 z-10 bg-white pt-2 pb-3 mb-2 border-b border-gray-100'
  const headerStyle = isDark
    ? ({
        backgroundColor: 'var(--ant-table-header-bg)',
        borderBottomColor: 'var(--ant-color-border-secondary)',
      } as React.CSSProperties)
    : undefined
  const cardClassName = 'rounded-lg px-3 py-2.5'
  const cardStyle: React.CSSProperties = {
    backgroundColor: isDark
      ? 'var(--ant-table-header-bg)'
      : 'var(--ant-color-bg-container)',
    backgroundImage: isDark
      ? 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0))'
      : undefined,
    border: `1px solid var(--ant-color-border-secondary)`,
    borderRadius: 'var(--ant-border-radius-lg)',
    boxShadow: 'var(--ant-box-shadow-tertiary)',
  }
  const mutedTextStyle = isDark
    ? ({ color: 'var(--ant-color-text-secondary)' } as React.CSSProperties)
    : undefined
  const primaryTextStyle = isDark
    ? ({ color: 'var(--ant-color-text-heading)' } as React.CSSProperties)
    : undefined
  const secondaryTextStyle = isDark
    ? ({ color: 'var(--ant-color-text)' } as React.CSSProperties)
    : undefined

  const mutedTextClassName = isDark ? '' : 'text-gray-500'
  const primaryTextClassName = isDark ? '' : 'text-gray-900'
  const secondaryTextClassName = isDark ? '' : 'text-gray-800'

  return (
    <App className='h-full'>
      <PageContent>
        <div className={headerClassName} style={headerStyle}>
          <div
            className={`mb-2 text-base font-medium ${primaryTextClassName}`}
            style={primaryTextStyle}
          >
            {t('realtimeAlert.title')}
          </div>
          {statsLoading ? (
            <div className='py-3 flex items-center justify-start gap-2'>
              <Spin />
              <span className={mutedTextClassName} style={mutedTextStyle}>
                {t('common.loading')}
              </span>
            </div>
          ) : stats ? (
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2'>
              <div className={cardClassName} style={cardStyle}>
                <div
                  className={`text-xs ${mutedTextClassName}`}
                  style={mutedTextStyle}
                >
                  {t('realtimeAlert.statistics.totalActiveCount')}
                </div>
                <div
                  className={`mt-1 text-lg font-semibold tabular-nums ${primaryTextClassName}`}
                  style={primaryTextStyle}
                >
                  {stats.totalActiveCount ?? '-'}
                </div>
              </div>
              <div className={cardClassName} style={cardStyle}>
                <div
                  className={`text-xs ${mutedTextClassName}`}
                  style={mutedTextStyle}
                >
                  {t('realtimeAlert.statistics.todayRecoveredCount')}
                </div>
                <div
                  className={`mt-1 text-lg font-semibold tabular-nums ${primaryTextClassName}`}
                  style={primaryTextStyle}
                >
                  {stats.todayRecoveredCount ?? '-'}
                </div>
              </div>
              {levelStatRows.map((item, idx) => (
                <div
                  key={item.levelUid ?? item.levelName ?? String(idx)}
                  className={cardClassName}
                  style={cardStyle}
                >
                  <div
                    className={`text-xs truncate ${secondaryTextClassName}`}
                    style={secondaryTextStyle}
                    title={emptyPlaceholder(item.levelName)}
                  >
                    {emptyPlaceholder(item.levelName)}
                  </div>
                  <div
                    className={`mt-1 text-lg font-semibold tabular-nums ${primaryTextClassName}`}
                    style={primaryTextStyle}
                  >
                    {parseCount(item.count)}
                  </div>
                </div>
              ))}
              {levelStatRows.length === 0 ? (
                <div className={cardClassName} style={cardStyle}>
                  <div
                    className={`text-xs ${mutedTextClassName}`}
                    style={mutedTextStyle}
                  >
                    {t('realtimeAlert.statistics.byLevel')}
                  </div>
                  <div
                    className={`mt-1 text-sm ${mutedTextClassName}`}
                    style={mutedTextStyle}
                  >
                    {t('common.noData')}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className={mutedTextClassName} style={mutedTextStyle}>
              {t('common.noData')}
            </div>
          )}
        </div>

        <RealtimeAlertList stats={stats} statsLoading={statsLoading} />
      </PageContent>
    </App>
  )
}
