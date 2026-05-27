import type {
  AlertEventItem,
  HistoryAlertExportTaskItem,
  ListHistoryAlertParams,
} from '@/api/marksman/alert'
import {
  createHistoryAlertExportTask,
  getHistoryAlertList,
  listHistoryAlertExportTasks,
} from '@/api/marksman/alert'
import { AlertStatus, GlobalStatus } from '@/api/common/types'
import { getDatasourceSelectList } from '@/api/marksman/datasource'
import { getLevelSelectList, LevelType } from '@/api/marksman/level'
import { getStrategySelectList } from '@/api/marksman/strategy'
import { getStrategyGroupSelectList } from '@/api/marksman/strategyGroup'
import PageContent from '@/components/layout/PageContent'
import { useLocale } from '@/contexts/LocaleContext'
import { emptyPlaceholder, renderSummary } from '@/utils/marksman'
import { subscribeHistoryAlertExportEvents } from '@/utils/sseClient'
import {
  App,
  Badge,
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ALERT_STATUS_MAP } from '../realtime-alerts/components/realtimeAlertHelpers'
import { RealtimeAlertDetailModal } from '../realtime-alerts/components/RealtimeAlertDetailModal'
import { ExportTaskPanel } from './components/ExportTaskPanel'
import {
  buildExportFilter,
  isExportTaskActive,
  isExportTaskCompleted,
  isExportTaskFailed,
  mergeExportTaskEvent,
  normalizeExportTaskItem,
} from './exportTaskHelpers'
import type { HistoryFilterFormValues } from './types'

const { RangePicker } = DatePicker

const MAX_RANGE_SECONDS = 31 * 24 * 60 * 60
const SELECT_LIMIT = 100

interface SelectOption {
  value: string
  label: string
}

const defaultTimeRange = (): [dayjs.Dayjs, dayjs.Dayjs] => {
  const end = dayjs()
  const start = dayjs().subtract(14, 'day')
  return [start, end]
}

const STATUS_FILTER_OPTIONS: { value: number; labelKey: string }[] = [
  { value: 1, labelKey: 'realtimeAlert.filter.status.firing' },
  { value: 2, labelKey: 'realtimeAlert.filter.status.recovered' },
  { value: 3, labelKey: 'realtimeAlert.filter.status.recoveredByManual' },
]

function resolveStatusTag(status?: AlertStatus | number) {
  if (status == null) {
    return ALERT_STATUS_MAP[AlertStatus.ALERT_STATUS_UNKNOWN]
  }
  if (typeof status === 'number') {
    const byNumber: Record<number, (typeof ALERT_STATUS_MAP)[AlertStatus]> = {
      0: ALERT_STATUS_MAP[AlertStatus.ALERT_STATUS_UNKNOWN],
      1: ALERT_STATUS_MAP[AlertStatus.ALERT_EVENT_STATUS_FIRING],
      2: ALERT_STATUS_MAP[AlertStatus.ALERT_EVENT_STATUS_RECOVERED],
      3: ALERT_STATUS_MAP[AlertStatus.ALERT_EVENT_STATUS_RECOVERED_BY_MANUAL],
    }
    return (
      byNumber[status] ?? ALERT_STATUS_MAP[AlertStatus.ALERT_STATUS_UNKNOWN]
    )
  }
  return (
    ALERT_STATUS_MAP[status] ??
    ALERT_STATUS_MAP[AlertStatus.ALERT_STATUS_UNKNOWN]
  )
}

function formatTime(value?: string): string {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'
}

function mapSelectItems(
  items: Array<{ value?: string; label?: string }> | undefined,
): SelectOption[] {
  return (items ?? [])
    .filter((item): item is { value: string; label?: string } =>
      Boolean(item?.value),
    )
    .map((item) => ({
      value: item.value,
      label: item.label ?? item.value,
    }))
}

function buildListParams(
  values: HistoryFilterFormValues,
  page: number,
  pageSize: number,
): ListHistoryAlertParams {
  const params: ListHistoryAlertParams = {
    page,
    pageSize,
    keyword: values.keyword?.trim() || undefined,
    status: values.status,
    strategyGroupUids: values.strategyGroupUids?.length
      ? values.strategyGroupUids
      : undefined,
    levelUids: values.levelUids?.length ? values.levelUids : undefined,
    strategyUids: values.strategyUids?.length ? values.strategyUids : undefined,
    datasourceUids: values.datasourceUids?.length
      ? values.datasourceUids
      : undefined,
  }
  const range = values.timeRange
  if (range?.[0] && range?.[1]) {
    params.startAtUnix = String(range[0].unix())
    params.endAtUnix = String(range[1].unix())
  }
  return params
}

export function HistoryAlertList() {
  const { message } = App.useApp()
  const { t } = useLocale()
  const [filterForm] = Form.useForm<HistoryFilterFormValues>()
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportTaskDrawerOpen, setExportTaskDrawerOpen] = useState(false)
  const [exportTasks, setExportTasks] = useState<HistoryAlertExportTaskItem[]>(
    [],
  )
  const [exportTasksLoading, setExportTasksLoading] = useState(false)
  const [dataSource, setDataSource] = useState<AlertEventItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  })
  const [filterValues, setFilterValues] = useState<HistoryFilterFormValues>({
    timeRange: defaultTimeRange(),
  })
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailModalRecord, setDetailModalRecord] =
    useState<AlertEventItem | null>(null)
  const [strategyGroupOptions, setStrategyGroupOptions] = useState<
    SelectOption[]
  >([])
  const [levelOptions, setLevelOptions] = useState<SelectOption[]>([])
  const [strategyOptions, setStrategyOptions] = useState<SelectOption[]>([])
  const [datasourceOptions, setDatasourceOptions] = useState<SelectOption[]>([])
  const mountedRef = useRef(true)
  const paginationRef = useRef(pagination)
  paginationRef.current = pagination

  const statusOptions = useMemo(
    () =>
      STATUS_FILTER_OPTIONS.map((item) => ({
        value: item.value,
        label: t(item.labelKey),
      })),
    [t],
  )

  const rangePresets = useMemo(() => {
    const now = dayjs()
    return [
      {
        label: t('historyAlert.filter.range.last7Days'),
        value: [now.subtract(7, 'day'), now] as [dayjs.Dayjs, dayjs.Dayjs],
      },
      {
        label: t('historyAlert.filter.range.last14Days'),
        value: [now.subtract(14, 'day'), now] as [dayjs.Dayjs, dayjs.Dayjs],
      },
      {
        label: t('historyAlert.filter.range.last30Days'),
        value: [now.subtract(30, 'day'), now] as [dayjs.Dayjs, dayjs.Dayjs],
      },
    ]
  }, [t])

  const fetchData = useCallback(
    async (page?: number, pageSize?: number, filters = filterValues) => {
      setLoading(true)
      try {
        const currentPage = page ?? paginationRef.current.current
        const currentPageSize = pageSize ?? paginationRef.current.pageSize
        const params = buildListParams(filters, currentPage, currentPageSize)
        const res = await getHistoryAlertList(params)
        if (!mountedRef.current) return
        setDataSource(res.items ?? [])
        setPagination((prev) => ({
          ...prev,
          current: currentPage,
          pageSize: currentPageSize,
          total: parseInt(String(res.total ?? '0'), 10),
        }))
      } catch (error) {
        console.error('获取历史告警列表失败:', error)
        if (mountedRef.current) setDataSource([])
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    },
    [filterValues],
  )

  const validateTimeRange = useCallback(
    (range?: [dayjs.Dayjs, dayjs.Dayjs]) => {
      if (!range?.[0] || !range?.[1]) return true
      const diff = range[1].unix() - range[0].unix()
      if (diff > MAX_RANGE_SECONDS) {
        message.warning(t('historyAlert.message.timeRangeTooLong'))
        return false
      }
      return true
    },
    [message, t],
  )

  const handleSearch = useCallback(async () => {
    const values = await filterForm.validateFields()
    if (!validateTimeRange(values.timeRange)) return
    setFilterValues(values)
    setPagination((prev) => ({ ...prev, current: 1 }))
    await fetchData(1, paginationRef.current.pageSize, values)
  }, [filterForm, fetchData, validateTimeRange])

  const handleReset = useCallback(() => {
    const initialValues: HistoryFilterFormValues = {
      keyword: '',
      timeRange: defaultTimeRange(),
      status: undefined,
      strategyGroupUids: [],
      levelUids: [],
      strategyUids: [],
      datasourceUids: [],
    }
    filterForm.setFieldsValue(initialValues)
    setFilterValues(initialValues)
    setPagination((prev) => ({ ...prev, current: 1 }))
    void fetchData(1, paginationRef.current.pageSize, initialValues)
  }, [filterForm, fetchData])

  const refreshExportTasks = useCallback(async () => {
    setExportTasksLoading(true)
    try {
      const res = await listHistoryAlertExportTasks({ page: 1, pageSize: 50 })
      setExportTasks((res.items ?? []).map(normalizeExportTaskItem))
    } catch (error) {
      console.error('获取导出任务列表失败:', error)
    } finally {
      setExportTasksLoading(false)
    }
  }, [])

  const handleExport = useCallback(async () => {
    const values = await filterForm.validateFields()
    if (!validateTimeRange(values.timeRange)) return

    setExporting(true)
    try {
      await createHistoryAlertExportTask({
        filter: buildExportFilter(values),
      })
      message.success(t('historyAlert.exportTask.message.create.success'))
      setExportTaskDrawerOpen(true)
      await refreshExportTasks()
    } catch (error) {
      console.error('提交历史告警导出任务失败:', error)
      message.error(t('historyAlert.message.export.failed'))
    } finally {
      setExporting(false)
    }
  }, [filterForm, message, refreshExportTasks, t, validateTimeRange])

  const activeExportTaskCount = useMemo(
    () => exportTasks.filter((item) => isExportTaskActive(item.status)).length,
    [exportTasks],
  )

  useEffect(() => {
    void refreshExportTasks()
    const unsubscribe = subscribeHistoryAlertExportEvents({
      onEvent: (event) => {
        setExportTasks((prev) => mergeExportTaskEvent(prev, event))
        if (isExportTaskCompleted(event.status)) {
          message.success(t('historyAlert.exportTask.message.completed'))
        } else if (isExportTaskFailed(event.status)) {
          message.error(
            event.errorMessage || t('historyAlert.exportTask.message.failed'),
          )
        }
      },
      onError: (error) => {
        console.error('导出任务 SSE 连接失败:', error)
      },
    })
    return unsubscribe
  }, [message, refreshExportTasks, t])

  useEffect(() => {
    mountedRef.current = true
    filterForm.setFieldsValue({
      keyword: '',
      timeRange: defaultTimeRange(),
    })

    const loadFilterOptions = async () => {
      try {
        const [strategyGroups, levels, strategies, datasources] =
          await Promise.all([
            getStrategyGroupSelectList({
              limit: SELECT_LIMIT,
              status: GlobalStatus.ENABLED,
            }),
            getLevelSelectList({
              limit: SELECT_LIMIT,
              status: GlobalStatus.ENABLED,
              type: LevelType.LEVEL_TYPE_ALERT,
            }),
            getStrategySelectList({
              limit: SELECT_LIMIT,
              status: GlobalStatus.ENABLED,
            }),
            getDatasourceSelectList({
              limit: SELECT_LIMIT,
            }),
          ])
        if (!mountedRef.current) return
        setStrategyGroupOptions(mapSelectItems(strategyGroups.items))
        setLevelOptions(mapSelectItems(levels.items))
        setStrategyOptions(mapSelectItems(strategies.items))
        setDatasourceOptions(mapSelectItems(datasources.items))
      } catch (error) {
        console.error('加载历史告警筛选项失败:', error)
      }
    }

    void loadFilterOptions()
    void fetchData(1, paginationRef.current.pageSize, {
      timeRange: defaultTimeRange(),
    })

    return () => {
      mountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tableContainerRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const [tableHeight, setTableHeight] = useState(400)

  useEffect(() => {
    const updateTableHeight = () => {
      if (!tableContainerRef.current || !tableWrapperRef.current) return
      const containerHeight = tableContainerRef.current.clientHeight
      const thead = tableWrapperRef.current.querySelector('.ant-table-thead')
      const paginationEl =
        tableWrapperRef.current.querySelector('.ant-pagination')
      const theadHeight = thead ? (thead as HTMLElement).offsetHeight : 0
      const paginationHeight = paginationEl
        ? (paginationEl as HTMLElement).offsetHeight
        : 0
      const calculatedHeight = containerHeight - theadHeight - paginationHeight - 32
      setTableHeight(Math.max(calculatedHeight, 100))
    }

    updateTableHeight()
    window.addEventListener('resize', updateTableHeight)
    return () => window.removeEventListener('resize', updateTableHeight)
  }, [dataSource, pagination])

  const columns: ColumnsType<AlertEventItem> = [
    {
      title: t('realtimeAlert.table.firedAt'),
      dataIndex: 'firedAt',
      key: 'firedAt',
      width: 170,
      render: (value: string) => formatTime(value),
    },
    {
      title: t('realtimeAlert.table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: AlertStatus | number | undefined) => {
        const info = resolveStatusTag(status)
        return <Tag color={info.color}>{t(info.key)}</Tag>
      },
    },
    {
      title: t('historyAlert.table.strategyGroupName'),
      dataIndex: 'strategyGroupName',
      key: 'strategyGroupName',
      width: 140,
      ellipsis: true,
      render: (value) => emptyPlaceholder(value),
    },
    {
      title: t('historyAlert.table.strategyName'),
      dataIndex: 'strategyName',
      key: 'strategyName',
      width: 140,
      ellipsis: true,
      render: (value) => emptyPlaceholder(value),
    },
    {
      title: t('realtimeAlert.table.levelName'),
      dataIndex: 'levelName',
      key: 'levelName',
      width: 120,
      ellipsis: true,
      render: (_, record) => {
        const nameText = emptyPlaceholder(record.levelName)
        const levelColor = record.bgColor?.trim()
        return <Tag color={levelColor}>{nameText}</Tag>
      },
    },
    {
      title: t('realtimeAlert.table.datasourceName'),
      dataIndex: 'datasourceName',
      key: 'datasourceName',
      width: 140,
      ellipsis: true,
      render: (_, record) => {
        const nameText = emptyPlaceholder(record.datasourceName)
        const levelText = emptyPlaceholder(record.datasourceLevelName)
        if (!levelText || levelText === '-') return nameText
        return (
          <Space size='small'>
            <Tag color='default'>{levelText}</Tag>
            <span className='truncate' title={nameText}>
              {nameText}
            </span>
          </Space>
        )
      },
    },
    {
      title: t('realtimeAlert.table.summary'),
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
      render: (_, record) => renderSummary(record),
    },
    {
      title: t('realtimeAlert.table.duration'),
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (value) => emptyPlaceholder(value),
    },
    {
      title: t('historyAlert.table.recoveredAt'),
      dataIndex: 'recoveredAt',
      key: 'recoveredAt',
      width: 170,
      render: (value: string) => formatTime(value),
    },
    {
      title: t('table.action'),
      key: 'action',
      width: 90,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Button
          type='link'
          size='small'
          onClick={() => {
            setDetailModalRecord(record)
            setDetailModalOpen(true)
          }}
        >
          {t('common.detail')}
        </Button>
      ),
    },
  ]

  const listStartAtUnix = filterValues.timeRange?.[0]
    ? String(filterValues.timeRange[0].unix())
    : undefined
  const listEndAtUnix = filterValues.timeRange?.[1]
    ? String(filterValues.timeRange[1].unix())
    : undefined

  return (
    <PageContent>
        <div className='mb-4 shrink-0'>
          <div className='mb-3 flex items-center justify-between gap-3'>
            <div className='text-base font-medium'>{t('historyAlert.title')}</div>
            <Badge count={activeExportTaskCount} size='small' showZero={false}>
              <Button onClick={() => setExportTaskDrawerOpen(true)}>
                {t('historyAlert.exportTask.action.openList')}
              </Button>
            </Badge>
          </div>
          <Form<HistoryFilterFormValues>
            form={filterForm}
            layout='inline'
            className='gap-y-2'
            initialValues={{
              keyword: '',
              timeRange: defaultTimeRange(),
              strategyGroupUids: [],
              levelUids: [],
              strategyUids: [],
              datasourceUids: [],
            }}
          >
            <Form.Item
              name='keyword'
              label={t('historyAlert.search.label')}
              className='w-full max-w-sm'
            >
              <Input
                allowClear
                autoComplete='off'
                placeholder={t('historyAlert.search.placeholder')}
                onPressEnter={() => void handleSearch()}
              />
            </Form.Item>
            <Form.Item
              name='timeRange'
              label={t('historyAlert.filter.timeRange')}
            >
              <RangePicker
                showTime
                presets={rangePresets}
                allowClear={false}
              />
            </Form.Item>
            <Form.Item name='status' label={t('historyAlert.filter.status')}>
              <Select
                allowClear
                placeholder={t('realtimeAlert.filter.status.all')}
                style={{ minWidth: 140 }}
                options={statusOptions}
              />
            </Form.Item>
            <Form.Item
              name='strategyGroupUids'
              label={t('historyAlert.filter.strategyGroup')}
            >
              <Select
                mode='multiple'
                allowClear
                maxTagCount='responsive'
                placeholder={t('historyAlert.filter.strategyGroup.placeholder')}
                style={{ minWidth: 180 }}
                options={strategyGroupOptions}
              />
            </Form.Item>
            <Form.Item name='levelUids' label={t('historyAlert.filter.level')}>
              <Select
                mode='multiple'
                allowClear
                maxTagCount='responsive'
                placeholder={t('historyAlert.filter.level.placeholder')}
                style={{ minWidth: 160 }}
                options={levelOptions}
              />
            </Form.Item>
            <Form.Item
              name='strategyUids'
              label={t('historyAlert.filter.strategy')}
            >
              <Select
                mode='multiple'
                allowClear
                maxTagCount='responsive'
                placeholder={t('historyAlert.filter.strategy.placeholder')}
                style={{ minWidth: 160 }}
                options={strategyOptions}
              />
            </Form.Item>
            <Form.Item
              name='datasourceUids'
              label={t('historyAlert.filter.datasource')}
            >
              <Select
                mode='multiple'
                allowClear
                maxTagCount='responsive'
                placeholder={t('historyAlert.filter.datasource.placeholder')}
                style={{ minWidth: 160 }}
                options={datasourceOptions}
              />
            </Form.Item>
            <Form.Item>
              <Space wrap>
                <Button type='primary' onClick={() => void handleSearch()}>
                  {t('common.search')}
                </Button>
                <Button onClick={handleReset}>{t('common.reset')}</Button>
                <Button loading={exporting} onClick={() => void handleExport()}>
                  {t('common.export')}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>

        <div
          ref={tableContainerRef}
          className='flex-1 flex overflow-hidden flex-col min-h-0'
        >
          <div ref={tableWrapperRef} className='h-full flex flex-col flex-1'>
            <Table
              columns={columns}
              dataSource={dataSource}
              rowKey='uid'
              loading={loading}
              size='small'
              scroll={{ y: tableHeight, x: 'max-content' }}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => t('table.total', { total }),
                onChange: (page, pageSize) => {
                  void fetchData(page, pageSize)
                },
              }}
            />
          </div>
        </div>

        <RealtimeAlertDetailModal
          open={detailModalOpen}
          onCancel={() => setDetailModalOpen(false)}
          alertPageUid='0'
          fallbackRecord={detailModalRecord}
          listStartAtUnix={listStartAtUnix}
          listEndAtUnix={listEndAtUnix}
        />

        <ExportTaskPanel
          open={exportTaskDrawerOpen}
          onClose={() => setExportTaskDrawerOpen(false)}
          tasks={exportTasks}
          loading={exportTasksLoading}
          onRefresh={refreshExportTasks}
        />
    </PageContent>
  )
}

export default function HistoryAlertListWrapper() {
  return (
    <App className='h-full'>
      <HistoryAlertList />
    </App>
  )
}
