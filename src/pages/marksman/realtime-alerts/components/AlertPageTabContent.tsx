import type {
  AlertEventItem,
  ListRealtimeAlertParams,
} from '@/api/marksman/alert'
import {
  getRealtimeAlertList,
  interveneAlert,
  batchInterveneAlert,
  batchRecoverAlert,
  recoverAlert,
  suppressAlert,
} from '@/api/marksman/alert'
import { useLocale } from '@/contexts/LocaleContext'
import { emptyPlaceholder, renderSummary } from '@/utils/marksman'
import type { MenuProps } from 'antd'
import {
  App,
  Button,
  DatePicker,
  Dropdown,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Select,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import React, { useEffect, useRef, useState } from 'react'
import { useMemoizedFn, useRequest } from 'ahooks'
import {
  selectMembers,
  type SelectMemberItem,
} from '@/api/account/member'
import { defaultListParams } from './realtimeAlertHelpers'
import { RealtimeAlertDetailModal } from './RealtimeAlertDetailModal'
import { useAdaptiveTableHeight } from '@/utils/hooks/useAdaptiveTableHeight'

/** 实时告警列表筛选表单（仅 Tab 内使用） */
interface AlertFilterFormValues {
  keyword?: string
  timeRange?: [dayjs.Dayjs, dayjs.Dayjs] | null
}

type AlertListData = {
  items: AlertEventItem[]
  total: number
}

export interface AlertPageTabContentProps {
  alertPageUid: string
  /** 是否对表格行应用接口返回的 bgColor */
  rowBgColorEnabled?: boolean
  /** 父级触发刷新（自动刷新 / 搜索时递增） */
  refreshSignal?: number
  /** 点击搜索时刷新告警页列表与页头统计 */
  onSearchRefresh?: () => void | Promise<void>
}

export const AlertPageTabContent: React.FC<AlertPageTabContentProps> = ({
  alertPageUid,
  rowBgColorEnabled = true,
  refreshSignal = 0,
  onSearchRefresh,
}) => {
  const { message } = App.useApp()
  const { t } = useLocale()
  const [filterForm] = Form.useForm<AlertFilterFormValues>()
  const [recoverForm] = Form.useForm<{ recoveredReason: string }>()
  const [suppressForm] = Form.useForm<{
    suppressedReason: string
    suppressUntil?: dayjs.Dayjs | null
  }>()
  const timeRange = Form.useWatch('timeRange', filterForm)
  const startAt = timeRange?.[0] ?? null
  const endAt = timeRange?.[1] ?? null
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  })
  const [selectedUids, setSelectedUids] = useState<string[]>([])
  const [batchActionLoading, setBatchActionLoading] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailModalUid, setDetailModalUid] = useState<string | null>(null)
  const [suppressOpen, setSuppressOpen] = useState(false)
  const [suppressRecord, setSuppressRecord] = useState<AlertEventItem | null>(
    null,
  )
  const [recoverOpen, setRecoverOpen] = useState(false)
  const [recoverRecord, setRecoverRecord] = useState<AlertEventItem | null>(
    null,
  )
  const [actionLoading, setActionLoading] = useState(false)

  const [interveneMemberModalOpen, setInterveneMemberModalOpen] =
    useState(false)
  const [interveneTargetUids, setInterveneTargetUids] = useState<string[]>([])
  const [interveneMemberSaving, setInterveneMemberSaving] = useState(false)
  const [batchRecoverOpen, setBatchRecoverOpen] = useState(false)
  const [batchRecoverSaving, setBatchRecoverSaving] = useState(false)
  const [batchRecoverForm] = Form.useForm<{ recoveredReason?: string }>()
  const [memberSearchKeyword, setMemberSearchKeyword] = useState<
    string | undefined
  >(undefined)
  const [interveneMemberForm] = Form.useForm<{ memberUid?: string }>()

  /** 已提交给列表接口的关键字（与输入框通过「搜索」同步） */
  const [listKeyword, setListKeyword] = useState('')
  const skipNextEffectFetchRef = useRef(false)
  const { tableContainerRef, tableWrapperRef, tableHeight } =
    useAdaptiveTableHeight()

  const buildListParams = useMemoizedFn(
    (overrides?: { page?: number; pageSize?: number; keyword?: string }) => {
      const trimmedKw = (overrides?.keyword ?? listKeyword).trim()
      return {
        ...defaultListParams,
        page: overrides?.page ?? pagination.current,
        pageSize: overrides?.pageSize ?? pagination.pageSize,
        startAtUnix: startAt ? String(startAt.unix()) : undefined,
        endAtUnix: endAt ? String(endAt.unix()) : undefined,
        keyword: trimmedKw !== '' ? trimmedKw : undefined,
      } satisfies ListRealtimeAlertParams
    },
  )

  const {
    data: listData,
    loading,
    refresh,
    mutate,
    cancel: cancelListFetch,
  } = useRequest(
    async (): Promise<AlertListData> => {
      try {
        const res = await getRealtimeAlertList(
          alertPageUid,
          buildListParams(),
        )
        const items = res.items ?? []
        const total = Number.parseInt(String(res.total ?? '0'), 10)
        return { items, total }
      } catch (e) {
        console.error('获取实时告警列表失败:', e)
        return { items: [], total: 0 }
      }
    },
    {
      refreshDeps: [
        listKeyword,
        startAt,
        endAt,
        pagination.current,
        pagination.pageSize,
        alertPageUid,
      ],
      debounceWait: 300,
      onBefore: () => {
        if (skipNextEffectFetchRef.current) {
          skipNextEffectFetchRef.current = false
          return { stopNow: true }
        }
      },
      onSuccess: (result) => {
        setPagination((prev) => ({ ...prev, total: result.total }))
      },
    },
  )

  const dataSource = listData?.items ?? []
  const tableLoading = loading && listData === undefined

  const lastRefreshSignalRef = useRef(0)
  useEffect(() => {
    if (refreshSignal <= 0 || refreshSignal === lastRefreshSignalRef.current) {
      return
    }
    lastRefreshSignalRef.current = refreshSignal
    void (async () => {
      try {
        const res = await getRealtimeAlertList(
          alertPageUid,
          buildListParams(),
        )
        const items = res.items ?? []
        const total = Number.parseInt(String(res.total ?? '0'), 10)
        mutate({ items, total })
        setPagination((prev) => ({ ...prev, total }))
      } catch (e) {
        console.error('获取实时告警列表失败:', e)
      }
    })()
  }, [refreshSignal, alertPageUid, buildListParams, mutate])

  const handleSearch = useMemoizedFn((overrideKeyword?: string) => {
    cancelListFetch()
    skipNextEffectFetchRef.current = true
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
    void (async () => {
      await onSearchRefresh?.()
      try {
        const res = await getRealtimeAlertList(
          alertPageUid,
          buildListParams({ page: 1, keyword: trimmed }),
        )
        const items = res.items ?? []
        const total = Number.parseInt(String(res.total ?? '0'), 10)
        mutate({ items, total })
        setPagination((prev) => ({ ...prev, current: 1, total }))
      } catch (e) {
        console.error('获取实时告警列表失败:', e)
        mutate({ items: [], total: 0 })
      }
    })()
  })

  const handleTableChange = useMemoizedFn((page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }))
  })

  const handleReset = useMemoizedFn(() => {
    filterForm.resetFields()
    setListKeyword('')
    setPagination((prev) => ({ ...prev, current: 1 }))
  })

  const {
    data: memberOptions = [],
    loading: memberOptionsLoading,
    mutate: mutateMemberOptions,
  } = useRequest(
    async () => {
      try {
        const res = await selectMembers({
          keyword: memberSearchKeyword?.trim() || undefined,
          limit: 20,
        })
        return res.items ?? []
      } catch (e) {
        console.error('拉取成员下拉失败:', e)
        return [] as SelectMemberItem[]
      }
    },
    {
      ready: interveneMemberModalOpen,
      refreshDeps: [memberSearchKeyword, interveneMemberModalOpen],
      debounceWait: 300,
    },
  )

  const openInterveneMemberModal = useMemoizedFn((uids: string[]) => {
    const cleaned = (uids ?? []).map(String).filter(Boolean)
    if (cleaned.length === 0) return
    setInterveneTargetUids(cleaned)
    setMemberSearchKeyword(undefined)
    mutateMemberOptions([])
    setInterveneMemberSaving(false)
    setBatchActionLoading(false)
    interveneMemberForm.resetFields()
    setInterveneMemberModalOpen(true)
  })

  const handleIntervene = useMemoizedFn(async (record: AlertEventItem) => {
    if (!record.uid) return
    setActionLoading(true)
    try {
      await interveneAlert(record.uid)
      message.success(t('realtimeAlert.message.intervene.success'))
      refresh()
    } catch (e) {
      console.error('介入告警失败:', e)
    } finally {
      setActionLoading(false)
    }
  })

  const handleBatchIntervene = useMemoizedFn(async () => {
    if (selectedUids.length === 0) return
    openInterveneMemberModal(selectedUids)
  })

  const handleInterveneMemberOk = useMemoizedFn(async () => {
    const count = interveneTargetUids.length
    if (count === 0) return

    try {
      const values = await interveneMemberForm.validateFields()
      const memberUid = values.memberUid as string | undefined
      if (!memberUid) return

      setBatchActionLoading(true)
      setInterveneMemberSaving(true)

      await batchInterveneAlert({
        uids: interveneTargetUids,
        intervenedMemberUid: memberUid,
      })
      message.success(
        t('realtimeAlert.message.batchIntervene.successAll', { count }),
      )

      setSelectedUids([])
      setInterveneTargetUids([])
      setInterveneMemberModalOpen(false)
      interveneMemberForm.resetFields()
      refresh()
    } catch (e) {
      console.error('介入失败:', e)
      message.error(t('message.error'))
    } finally {
      setBatchActionLoading(false)
      setInterveneMemberSaving(false)
    }
  })

  const handleBatchRecoverOk = useMemoizedFn(async () => {
    const count = selectedUids.length
    if (count === 0) return
    try {
      const values = await batchRecoverForm.validateFields()
      const recoveredReason = String(values.recoveredReason ?? '').trim()
      setBatchActionLoading(true)
      setBatchRecoverSaving(true)
      await batchRecoverAlert({
        uids: selectedUids,
        recoveredReason,
      })
      message.success(
        t('realtimeAlert.message.batchRecover.successAll', { count }),
      )
      setSelectedUids([])
      setBatchRecoverOpen(false)
      batchRecoverForm.resetFields()
      refresh()
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return
      console.error('批量恢复失败:', e)
      message.error(t('message.error'))
    } finally {
      setBatchActionLoading(false)
      setBatchRecoverSaving(false)
    }
  })

  const openRecover = useMemoizedFn((record: AlertEventItem) => {
    setRecoverRecord(record)
    recoverForm.setFieldsValue({ recoveredReason: '' })
    setRecoverOpen(true)
  })

  const handleRecoverOk = useMemoizedFn(async () => {
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
      refresh()
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return
      console.error('恢复告警失败:', e)
    } finally {
      setActionLoading(false)
    }
  })

  const openSuppress = useMemoizedFn((record: AlertEventItem) => {
    setSuppressRecord(record)
    suppressForm.setFieldsValue({
      suppressedReason: '',
      suppressUntil: dayjs().add(1, 'hour'),
    })
    setSuppressOpen(true)
  })

  const handleSuppressOk = useMemoizedFn(async () => {
    if (!suppressRecord?.uid) return
    setActionLoading(true)
    try {
      const values = await suppressForm.validateFields()
      const suppressUntil = values.suppressUntil
      if (!suppressUntil) return
      await suppressAlert(suppressRecord.uid, {
        suppressUntilUnix: String(suppressUntil.unix()),
        suppressedReason: values.suppressedReason.trim(),
      })
      message.success(t('realtimeAlert.message.suppress.success'))
      setSuppressOpen(false)
      setSuppressRecord(null)
      suppressForm.resetFields()
      refresh()
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return
      console.error('抑制告警失败:', e)
    } finally {
      setActionLoading(false)
    }
  })

  const renderInterveneInfo = (record: AlertEventItem) => {
    const intervenedByText = emptyPlaceholder(record.intervenedByName)
    const intervenedAtText = record.intervenedAt
      ? dayjs(record.intervenedAt).format('YYYY-MM-DD HH:mm:ss')
      : '-'

    return (
      <div className='flex flex-col min-w-0'>
        <div className='text-xs truncate'>
          {t('realtimeAlert.table.intervenedBy')}: {intervenedByText}
        </div>
        <div className='text-xs truncate'>
          {t('realtimeAlert.table.intervenedAt')}: {intervenedAtText}
        </div>
      </div>
    )
  }

  const batchMenuItems: MenuProps['items'] = [
    {
      key: 'intervene',
      label: t('realtimeAlert.action.batchIntervene'),
      onClick: () => {
        void handleBatchIntervene()
      },
    },
    {
      key: 'recover',
      label: t('realtimeAlert.action.batchRecover'),
      onClick: () => {
        if (selectedUids.length === 0) return
        setBatchRecoverOpen(true)
        batchRecoverForm.setFieldsValue({ recoveredReason: '' })
      },
    },
  ]

  const columns: ColumnsType<AlertEventItem> = [
    {
      title: t('realtimeAlert.table.firedAt'),
      dataIndex: 'firedAt',
      key: 'firedAt',
      minWidth: 150,
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
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
      title: t('realtimeAlert.table.levelName'),
      dataIndex: 'levelName',
      key: 'levelName',
      width: 128,
      ellipsis: true,
      align: 'center',
      render: (_, record) => {
        const nameText = emptyPlaceholder(record.levelName)
        const levelColor = record.bgColor?.trim()
        return <Tag color={levelColor}>{nameText}</Tag>
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
      ellipsis: true,
      render: (v) => emptyPlaceholder(v),
    },
    {
      title: t('realtimeAlert.table.value'),
      dataIndex: 'value',
      key: 'value',
      width: 90,
      align: 'right',
      render: (v) => (v != null ? String(v) : '-'),
    },
    {
      title: t('realtimeAlert.table.intervenedInfo'),
      dataIndex: 'intervenedAt',
      key: 'intervenedAt',
      width: 200,
      render: (_, record) => renderInterveneInfo(record),
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
                if (!record.uid) return
                setDetailModalUid(record.uid)
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
          }}
        >
          <Form.Item
            className='w-full max-w-sm'
            name='keyword'
            label={t('realtimeAlert.search.label')}
          >
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
              <Dropdown menu={{ items: batchMenuItems }} trigger={['click']}>
                <Button
                  disabled={selectedUids.length === 0}
                  loading={batchActionLoading}
                >
                  {t('realtimeAlert.action.batchAction')}
                </Button>
              </Dropdown>
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
            loading={tableLoading}
            size='small'
            rowSelection={{
              selectedRowKeys: selectedUids,
              onChange: (keys) => {
                setSelectedUids(
                  (keys ?? []).map((k) => String(k)).filter(Boolean),
                )
              },
              preserveSelectedRowKeys: false,
              getCheckboxProps: (record) => ({
                disabled: !record.uid,
              }),
            }}
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
        uid={detailModalUid}
        onCancel={() => {
          setDetailModalOpen(false)
          setDetailModalUid(null)
        }}
      />

      <Modal
        title={t('realtimeAlert.modal.interveneMember.title', {
          count: interveneTargetUids.length,
        })}
        open={interveneMemberModalOpen}
        onOk={handleInterveneMemberOk}
        onCancel={() => {
          setInterveneMemberModalOpen(false)
          setInterveneTargetUids([])
          interveneMemberForm.resetFields()
          mutateMemberOptions([])
        }}
        confirmLoading={interveneMemberSaving}
        okText={t('common.ok')}
        cancelText={t('common.cancel')}
        destroyOnHidden
      >
        <Form form={interveneMemberForm} layout='vertical' preserve={false}>
          <Form.Item
            name='memberUid'
            label={t(
              'realtimeAlert.modal.interveneMember.form.memberUid.label',
            )}
            rules={[
              {
                required: true,
                message: t(
                  'realtimeAlert.modal.interveneMember.form.memberUid.required',
                ),
              },
            ]}
          >
            <Select
              showSearch={{
                filterOption: false,
                onSearch: (value) => setMemberSearchKeyword(value),
              }}
              allowClear
              placeholder={t(
                'realtimeAlert.modal.interveneMember.form.memberUid.placeholder',
              )}
              loading={memberOptionsLoading}
              options={memberOptions
                .filter((i) => Boolean(i.value))
                .map((i) => ({
                  value: i.value!,
                  label: i.label ?? i.value!,
                  disabled: i.disabled,
                  title: i.tooltip,
                }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('realtimeAlert.modal.batchRecover.title', {
          count: selectedUids.length,
        })}
        open={batchRecoverOpen}
        onOk={handleBatchRecoverOk}
        onCancel={() => {
          setBatchRecoverOpen(false)
          batchRecoverForm.resetFields()
        }}
        confirmLoading={batchRecoverSaving}
        okText={t('common.ok')}
        cancelText={t('common.cancel')}
        destroyOnHidden
      >
        <Form form={batchRecoverForm} layout='vertical' preserve={false}>
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
          suppressForm.resetFields()
        }}
        confirmLoading={actionLoading}
        okText={t('common.ok')}
        cancelText={t('common.cancel')}
      >
        <Form form={suppressForm} layout='vertical' preserve={false}>
          <Form.Item
            name='suppressedReason'
            label={t('realtimeAlert.modal.suppress.reason')}
            rules={[
              {
                required: true,
                whitespace: true,
                message: t('realtimeAlert.modal.suppress.reason.required'),
              },
            ]}
          >
            <Input.TextArea
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={500}
              showCount
              placeholder={t('realtimeAlert.modal.suppress.reason.placeholder')}
            />
          </Form.Item>
          <Form.Item
            name='suppressUntil'
            label={t('realtimeAlert.modal.suppress.until')}
          >
            <DatePicker
              showTime
              allowClear
              format='YYYY-MM-DD HH:mm:ss'
              className='w-full'
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
