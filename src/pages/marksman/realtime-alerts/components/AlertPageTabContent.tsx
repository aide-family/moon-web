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
  Badge,
  Button,
  DatePicker,
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
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ALERT_STATUS_MAP,
  defaultListParams,
} from './realtimeAlertHelpers'
import { RealtimeAlertDetailModal } from './RealtimeAlertDetailModal'
import { AlertStatus } from '@/api/common/types'

/** 实时告警列表筛选表单（仅 Tab 内使用） */
interface AlertFilterFormValues {
  keyword?: string
  status?: number
  timeRange?: [dayjs.Dayjs, dayjs.Dayjs] | null
}

export interface AlertPageTabContentProps {
  alertPageUid: string
  autoRefreshEnabled?: boolean
  /** 是否对表格行应用接口返回的 bgColor */
  rowBgColorEnabled?: boolean
}

export const AlertPageTabContent: React.FC<AlertPageTabContentProps> = ({
  alertPageUid,
  autoRefreshEnabled = false,
  rowBgColorEnabled = true,
}) => {
  const { t } = useLocale()
  const [filterForm] = Form.useForm<AlertFilterFormValues>()
  const [recoverForm] = Form.useForm<{ recoveredReason: string }>()
  const filterStatus = Form.useWatch('status', filterForm)
  const timeRange = Form.useWatch('timeRange', filterForm)
  const startAt = timeRange?.[0] ?? null
  const endAt = timeRange?.[1] ?? null
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<AlertEventItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const paginationRef = useRef(pagination)
  useEffect(() => {
    paginationRef.current = pagination
  }, [pagination])
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailModalRecord, setDetailModalRecord] = useState<AlertEventItem | null>(
    null,
  )
  const [suppressOpen, setSuppressOpen] = useState(false)
  const [suppressRecord, setSuppressRecord] = useState<AlertEventItem | null>(
    null,
  )
  const [suppressUntil, setSuppressUntil] = useState<dayjs.Dayjs | null>(null)
  const [recoverOpen, setRecoverOpen] = useState(false)
  const [recoverRecord, setRecoverRecord] = useState<AlertEventItem | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  /** 已提交给列表接口的关键字（与输入框通过「搜索」同步） */
  const [listKeyword, setListKeyword] = useState('')
  const mountedRef = useRef(true)
  const fetchRequestSeqRef = useRef(0)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const [tableHeight, setTableHeight] = useState(400)

  const fetchData = useCallback(
    async (
      page?: number,
      pageSize?: number,
      options?: {
        silent?: boolean
        /** 本次请求使用的关键字（避免尚未 commit 的 listKeyword 状态） */
        listKeywordSnapshot?: string
      },
    ) => {
      const silent = options?.silent ?? false
      const seq = ++fetchRequestSeqRef.current
      if (!silent) setLoading(true)
      try {
        const currentPage = page ?? 1
        const currentPageSize = pageSize ?? paginationRef.current.pageSize
        const trimmedKw = (
          options?.listKeywordSnapshot !== undefined
            ? options.listKeywordSnapshot
            : listKeyword
        ).trim()
        const params: ListRealtimeAlertParams = {
          ...defaultListParams,
          page: currentPage,
          pageSize: currentPageSize,
          status: filterStatus,
          startAtUnix: startAt ? String(startAt.unix()) : undefined,
          endAtUnix: endAt ? String(endAt.unix()) : undefined,
          keyword: trimmedKw !== '' ? trimmedKw : undefined,
        }
        const res = await getRealtimeAlertList(alertPageUid, params)
        if (!mountedRef.current) return
        // 避免并发请求导致状态被旧响应覆盖
        if (seq !== fetchRequestSeqRef.current) return
        const items = res.items ?? []
        const total = parseInt(String(res.total ?? '0'), 10)

        setDataSource(items)
        setPagination((prev) => ({
          ...prev,
          current: currentPage,
          pageSize: currentPageSize,
          total,
        }))
      } catch (e) {
        console.error('获取实时告警列表失败:', e)
        if (mountedRef.current && seq === fetchRequestSeqRef.current) {
          setDataSource([])
        }
      } finally {
        if (!silent && mountedRef.current && seq === fetchRequestSeqRef.current) {
          setLoading(false)
        }
      }
    },
    [alertPageUid, filterStatus, startAt, endAt, listKeyword],
  )

  useEffect(() => {
    mountedRef.current = true
    fetchData(undefined, undefined, { silent: false })
    return () => {
      mountedRef.current = false
    }
  }, [fetchData])

  useEffect(() => {
    if (!autoRefreshEnabled) return
    const timer = window.setInterval(() => {
      const { current, pageSize } = paginationRef.current
      void fetchData(current, pageSize, { silent: true })
    }, 60_000)
    return () => {
      window.clearInterval(timer)
    }
  }, [autoRefreshEnabled, fetchData])

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

  const handleSearch = (overrideKeyword?: string) => {
    if (overrideKeyword !== undefined) {
      filterForm.setFieldValue('keyword', overrideKeyword)
    }
    const raw =
      overrideKeyword !== undefined
        ? overrideKeyword
        : ((filterForm.getFieldValue('keyword') as string | undefined) ?? '')
    const trimmed = String(raw).trim()
    setListKeyword(trimmed)
    setPagination((prev) => ({ ...prev, current: 1 }))
    void fetchData(1, paginationRef.current.pageSize, {
      listKeywordSnapshot: trimmed,
    })
  }

  const handleTableChange = (page: number, pageSize: number) => {
    fetchData(page, pageSize)
  }

  const handleReset = () => {
    filterForm.resetFields()
    setListKeyword('')
    setPagination((prev) => ({ ...prev, current: 1 }))
  }

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

  const openRecover = (record: AlertEventItem) => {
    setRecoverRecord(record)
    recoverForm.setFieldsValue({ recoveredReason: '' })
    setRecoverOpen(true)
  }

  const handleRecoverOk = async () => {
    if (!recoverRecord?.uid) return
    setActionLoading(true)
    try {
      const values = await recoverForm.validateFields()
      await recoverAlert(recoverRecord.uid, {
        recoveredReason: values.recoveredReason.trim(),
      })
      message.success(t('realtimeAlert.message.recover.success'))
      setRecoverOpen(false)
      setRecoverRecord(null)
      recoverForm.resetFields()
      fetchData(pagination.current, pagination.pageSize)
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return
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

  const renderStatus = (status?: AlertStatus) => {
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
      width: rowBgColorEnabled ? 100 : 128,
      ellipsis: true,
      render: (_, record) => {
        const nameText = emptyPlaceholder(record.levelName)
        const levelColor = record.bgColor?.trim()
        if (!rowBgColorEnabled && levelColor) {
          return (
            <span className='inline-flex max-w-full min-w-0 items-center gap-1'>
              <Badge color={levelColor} size='small' className='shrink-0' />
              <span
                className='truncate min-w-0'
                title={record.levelName ?? undefined}
              >
                {nameText}
              </span>
            </span>
          )
        }
        return nameText
      },
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
      title: t('realtimeAlert.table.datasourceName'),
      dataIndex: 'datasourceName',
      key: 'datasourceName',
      width: 140,
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
      title: t('realtimeAlert.table.duration'),
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      ellipsis: true,
      render: (v) => emptyPlaceholder(v),
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
            onClick: () => openRecover(record),
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
                setDetailModalRecord(record)
                setDetailModalOpen(true)
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
          initialValues={{
            keyword: '',
            status: undefined,
            timeRange: [
              dayjs().subtract(7, 'day'),
              dayjs(),
            ],
          }}
        >
          <Form.Item className='w-full max-w-sm' name='keyword' label={t('realtimeAlert.search.label')}>
            <Input
              autoComplete='off'
              placeholder={t('realtimeAlert.search.placeholder')}
              allowClear
              onPressEnter={(e) =>
                handleSearch((e.target as HTMLInputElement)?.value)
              }
            />
          </Form.Item>
          <Form.Item
            className='min-w-[200px]'
            label={t('realtimeAlert.filter.status')}
            name='status'
          >
            <Select
              className='w-full'
              allowClear
              placeholder={t('realtimeAlert.filter.status.all')}
              options={[
                {
                  label: t('realtimeAlert.filter.status.unknown'),
                  value: 0,
                },
                { label: t('realtimeAlert.filter.status.firing'), value: 1 },
                {
                  label: t('realtimeAlert.filter.status.recovered'),
                  value: 2,
                },
                {
                  label: t('realtimeAlert.filter.status.recoveredByManual'),
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
              <Button type='primary' onClick={() => handleSearch()}>
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
            dataSource={dataSource}
            rowKey='uid'
            loading={loading}
            size='small'
            onRow={
              rowBgColorEnabled
                ? (record) => {
                    const bg = record.bgColor?.trim()
                    return {
                      style: bg ? { backgroundColor: bg } : undefined,
                    }
                  }
                : undefined
            }
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

      <RealtimeAlertDetailModal
        open={detailModalOpen}
        alertPageUid={alertPageUid}
        fallbackRecord={detailModalRecord}
        listStatus={filterStatus}
        listStartAtUnix={startAt ? String(startAt.unix()) : undefined}
        listEndAtUnix={endAt ? String(endAt.unix()) : undefined}
        onCancel={() => {
          setDetailModalOpen(false)
          setDetailModalRecord(null)
        }}
      />

      <Modal
        title={t('realtimeAlert.modal.recover.title')}
        open={recoverOpen}
        onOk={handleRecoverOk}
        onCancel={() => {
          setRecoverOpen(false)
          setRecoverRecord(null)
          recoverForm.resetFields()
        }}
        confirmLoading={actionLoading}
        okText={t('common.ok')}
        cancelText={t('common.cancel')}
      >
        <Form form={recoverForm} layout='vertical' preserve={false}>
          <Form.Item
            name='recoveredReason'
            label={t('realtimeAlert.modal.recover.reason')}
            rules={[
              {
                required: true,
                whitespace: true,
                message: t('realtimeAlert.modal.recover.reason.required'),
              },
            ]}
          >
            <Input.TextArea
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={500}
              showCount
              placeholder={t('realtimeAlert.modal.recover.reason.placeholder')}
            />
          </Form.Item>
        </Form>
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
