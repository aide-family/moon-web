import type {
  AlertPageItem,
  GetAlertStatisticsReply,
} from '@/api/marksman/alert'
import {
  createAlertPage,
  deleteAlertPage,
  getAlertPage,
  getAlertPageList,
  listUserAlertPages,
  saveUserAlertPages,
  updateAlertPage,
} from '@/api/marksman/alert'
import { getLevelSelectList, LevelType } from '@/api/marksman/level'
import { getStrategySelectList } from '@/api/marksman/strategy'
import { getStrategyGroupSelectList } from '@/api/marksman/strategyGroup'
import { useLocale } from '@/contexts/LocaleContext'
import { useNamespace } from '@/contexts/useNamespace'
import { emptyPlaceholder } from '@/utils/marksman'
import { useDetailRequest } from '@/utils/hooks/useDetailRequest'
import { GlobalStatus } from '@/api'
import { LinkOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons'
import {
  App,
  Badge,
  Button,
  Col,
  ColorPicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React, { useEffect, useMemo, useState } from 'react'
import { useInterval, useMemoizedFn, useRequest } from 'ahooks'
import { AlertPageTabContent } from './AlertPageTabContent'
import { buildCreateAlertPageFilter } from './realtimeAlertHelpers'
import { getDatasourceSelectList } from '@/api/marksman/datasource'
import {
  compareAlertPagePriority,
  readStoredActiveAlertPageUid,
  resolveActiveAlertPageUid,
  type RealtimeAlertRefreshIntervalMs,
  writeStoredActiveAlertPageUid,
} from '../realtimeAlertStorage'

type AlertPageFormMode = 'create' | 'edit'

type SelectOption = { value: string; label: string; disabled?: boolean }

type CreateFilterOptions = {
  strategyGroupSelectOptions: SelectOption[]
  levelSelectOptions: SelectOption[]
  strategySelectOptions: SelectOption[]
  datasourceSelectOptions: SelectOption[]
  datasourceLevelSelectOptions: SelectOption[]
}

const mapSelectItems = (
  items: { value?: string; label?: string; disabled?: unknown }[],
): SelectOption[] =>
  (items ?? [])
    .filter(
      (i): i is { value: string; label?: string; disabled?: unknown } =>
        !!i.value,
    )
    .map((i) => ({
      value: i.value,
      label: i.label ?? i.value,
    }))

export interface RealtimeAlertListProps {
  stats: GetAlertStatisticsReply | null
  refreshIntervalMs: RealtimeAlertRefreshIntervalMs
  rowBgColorEnabled: boolean
  /** 刷新页头统计（与告警页 Tab 计数联动） */
  onRefreshStats?: () => Promise<void>
}

export const RealtimeAlertList: React.FC<RealtimeAlertListProps> = ({
  stats,
  refreshIntervalMs,
  rowBgColorEnabled,
  onRefreshStats,
}) => {
  const { message } = App.useApp()
  const { t } = useLocale()
  const { currentNamespace } = useNamespace()
  const [activeTabKey, setActiveTabKey] = useState<string | undefined>(
    undefined,
  )
  const [alertPageModalOpen, setAlertPageModalOpen] = useState(false)
  const [alertPageFormMode, setAlertPageFormMode] =
    useState<AlertPageFormMode>('create')
  const [editingAlertPageUid, setEditingAlertPageUid] = useState<string | null>(
    null,
  )
  const [deletingAlertPageUid, setDeletingAlertPageUid] = useState<
    string | null
  >(null)
  const [manageAlertPagesModalOpen, setManageAlertPagesModalOpen] =
    useState(false)
  const [bindModalOpen, setBindModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [bindForm] = Form.useForm()
  const [listRefreshSignal, setListRefreshSignal] = useState(0)

  const updateActiveTabFromBoundPages = useMemoizedFn(
    (items: AlertPageItem[]) => {
      const storedUid = readStoredActiveAlertPageUid(currentNamespace)
      setActiveTabKey((prev) => {
        const next = resolveActiveAlertPageUid(items, {
          preferredUid: prev,
          storedUid,
        })
        if (next) {
          writeStoredActiveAlertPageUid(currentNamespace, next)
        }
        return next
      })
    },
  )

  const {
    data: availableAlertPages = [],
    loading: availableAlertPagesLoading,
    refresh: refreshAvailableAlertPages,
  } = useRequest(
    async () => {
      try {
        const res = await getAlertPageList({ page: 1, pageSize: 50 })
        return res.items ?? []
      } catch (e) {
        console.error('获取告警页列表失败:', e)
        return [] as AlertPageItem[]
      }
    },
    { refreshDeps: [currentNamespace] },
  )

  const {
    data: boundAlertPages = [],
    loading: boundAlertPagesLoading,
    refresh: refreshBoundAlertPages,
    mutate: mutateBoundAlertPages,
  } = useRequest(
    async () => {
      try {
        const res = await listUserAlertPages()
        return res.items ?? []
      } catch (e) {
        console.error('获取绑定告警页失败:', e)
        return [] as AlertPageItem[]
      }
    },
    {
      refreshDeps: [currentNamespace],
      onSuccess: (items) => {
        updateActiveTabFromBoundPages(items)
      },
    },
  )

  const refreshBoundAlertPagesSilent = useMemoizedFn(async () => {
    try {
      const res = await listUserAlertPages()
      const items = res.items ?? []
      mutateBoundAlertPages(items)
      updateActiveTabFromBoundPages(items)
    } catch (e) {
      console.error('获取绑定告警页失败:', e)
    }
  })

  const refreshPageMetadata = useMemoizedFn(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false
      await Promise.all([
        silent ? refreshBoundAlertPagesSilent() : refreshBoundAlertPages(),
        onRefreshStats?.(),
      ])
    },
  )

  const refreshPageContext = useMemoizedFn(
    async (options?: { silent?: boolean }) => {
      await refreshPageMetadata(options)
      setListRefreshSignal((n) => n + 1)
    },
  )

  useInterval(
    () => {
      void refreshPageContext({ silent: true })
    },
    refreshIntervalMs > 0 ? refreshIntervalMs : undefined,
  )

  const filterModalOpen = alertPageModalOpen || manageAlertPagesModalOpen

  const { data: createFilterOptions, loading: createFilterOptionsLoading } =
    useRequest(
      async (): Promise<CreateFilterOptions> => {
        try {
          const [sgRes, lvRes, stRes, dsRes, dsLevelRes] = await Promise.all([
            getStrategyGroupSelectList({ limit: 100 }),
            getLevelSelectList({
              limit: 100,
              status: GlobalStatus.ENABLED,
              type: LevelType.LEVEL_TYPE_ALERT,
            }),
            getStrategySelectList({ limit: 100 }),
            getDatasourceSelectList({ limit: 100 }),
            getLevelSelectList({
              limit: 100,
              status: GlobalStatus.ENABLED,
              type: LevelType.LEVEL_TYPE_DATASOURCE,
            }),
          ])

          return {
            strategyGroupSelectOptions: mapSelectItems(sgRes.items ?? []),
            levelSelectOptions: mapSelectItems(lvRes.items ?? []),
            strategySelectOptions: mapSelectItems(stRes.items ?? []),
            datasourceSelectOptions: mapSelectItems(dsRes.items ?? []),
            datasourceLevelSelectOptions: mapSelectItems(
              dsLevelRes.items ?? [],
            ),
          }
        } catch (e) {
          console.error('加载告警页筛选项失败:', e)
          return {
            strategyGroupSelectOptions: [],
            levelSelectOptions: [],
            strategySelectOptions: [],
            datasourceSelectOptions: [],
            datasourceLevelSelectOptions: [],
          }
        }
      },
      { ready: filterModalOpen, refreshDeps: [filterModalOpen] },
    )

  const strategyGroupSelectOptions =
    createFilterOptions?.strategyGroupSelectOptions ?? []
  const levelSelectOptions = createFilterOptions?.levelSelectOptions ?? []
  const strategySelectOptions = createFilterOptions?.strategySelectOptions ?? []
  const datasourceSelectOptions =
    createFilterOptions?.datasourceSelectOptions ?? []
  const datasourceLevelSelectOptions =
    createFilterOptions?.datasourceLevelSelectOptions ?? []

  const {
    data: editingAlertPageDetail,
    loading: alertPageDetailLoading,
    error: editingAlertPageDetailError,
  } = useDetailRequest(
    getAlertPage,
    editingAlertPageUid ?? undefined,
    alertPageModalOpen && alertPageFormMode === 'edit' && !!editingAlertPageUid,
  )

  useEffect(() => {
    if (!editingAlertPageDetail || alertPageFormMode !== 'edit') return
    form.setFieldsValue({
      name: editingAlertPageDetail.name,
      color: editingAlertPageDetail.color,
      sortOrder: editingAlertPageDetail.sortOrder,
      filterStrategyGroupUids:
        editingAlertPageDetail.filter?.strategyGroupUids ?? [],
      filterLevelUids: editingAlertPageDetail.filter?.levelUids ?? [],
      filterStrategyUids: editingAlertPageDetail.filter?.strategyUids ?? [],
      filterDatasourceUids: editingAlertPageDetail.filter?.datasourceUids ?? [],
      filterDatasourceLevelUids:
        editingAlertPageDetail.filter?.datasourceLevelUids ?? [],
    })
  }, [alertPageFormMode, editingAlertPageDetail, form])

  useEffect(() => {
    if (!editingAlertPageDetailError || alertPageFormMode !== 'edit') return
    console.error('获取告警页详情失败:', editingAlertPageDetailError)
    setAlertPageModalOpen(false)
    setEditingAlertPageUid(null)
  }, [alertPageFormMode, editingAlertPageDetailError])

  const { loading: alertPageSubmitLoading, runAsync: submitAlertPageAsync } =
    useRequest(
      async (payload: {
        mode: AlertPageFormMode
        editingUid?: string | null
        values: Record<string, unknown>
      }) => {
        const { mode, editingUid, values } = payload
        const filter = buildCreateAlertPageFilter(
          values as Parameters<typeof buildCreateAlertPageFilter>[0],
        )
        const sortOrder =
          values.sortOrder === null || values.sortOrder === undefined
            ? undefined
            : Number(values.sortOrder)
        const name = String(values.name ?? '').trim()
        const color = String(values.color ?? '').trim()

        if (mode === 'create') {
          return createAlertPage({
            name,
            color,
            sortOrder,
            filter,
          })
        }
        if (editingUid) {
          await updateAlertPage(editingUid, {
            name,
            color,
            sortOrder,
            filter,
          })
        }
        return undefined
      },
      { manual: true },
    )

  const { runAsync: deleteAlertPageAsync } = useRequest(deleteAlertPage, {
    manual: true,
  })

  const { loading: bindLoading, runAsync: saveUserAlertPagesAsync } =
    useRequest(saveUserAlertPages, { manual: true })

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

  const disabledDatasourceSet = useMemo(() => {
    return new Set(
      datasourceSelectOptions.filter((o) => o.disabled).map((o) => o.value),
    )
  }, [datasourceSelectOptions])

  const disabledDatasourceLevelSet = useMemo(() => {
    return new Set(
      datasourceLevelSelectOptions
        .filter((o) => o.disabled)
        .map((o) => o.value),
    )
  }, [datasourceLevelSelectOptions])

  const openCreateAlertPageModal = useMemoizedFn(() => {
    setAlertPageFormMode('create')
    setEditingAlertPageUid(null)
    form.resetFields()
    setAlertPageModalOpen(true)
  })

  const handleAlertPageModalOk = useMemoizedFn(async () => {
    try {
      const values = await form.validateFields()
      const res = await submitAlertPageAsync({
        mode: alertPageFormMode,
        editingUid: editingAlertPageUid,
        values,
      })
      if (alertPageFormMode === 'create') {
        const newUid = res?.uid
        message.success(t('realtimeAlert.message.createAlertPage.success'))
        setAlertPageModalOpen(false)
        form.resetFields()
        setEditingAlertPageUid(null)
        await refreshAvailableAlertPages()
        if (newUid) {
          writeStoredActiveAlertPageUid(currentNamespace, newUid)
          setActiveTabKey((prev) => (prev ? prev : newUid))
        }
      } else if (editingAlertPageUid) {
        message.success(t('realtimeAlert.message.updateAlertPage.success'))
        setAlertPageModalOpen(false)
        form.resetFields()
        setEditingAlertPageUid(null)
        await refreshAvailableAlertPages()
        await refreshBoundAlertPages()
      }
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return
      console.error(
        alertPageFormMode === 'create' ? '创建告警页失败:' : '更新告警页失败:',
        e,
      )
    }
  })

  const bindAlertPageOptions = useMemo(() => {
    return availableAlertPages
      .filter((p) => p.uid)
      .map((p) => ({
        label: p.name ?? p.uid ?? '-',
        value: p.uid as string,
      }))
  }, [availableAlertPages])

  const boundAlertPageUidSet = useMemo(
    () =>
      new Set(
        boundAlertPages
          .map((p) => p.uid)
          .filter((uid): uid is string => Boolean(uid)),
      ),
    [boundAlertPages],
  )

  const sortedAlertPagesForManage = useMemo(() => {
    return [...availableAlertPages].sort((a, b) => {
      const ao = a.sortOrder ?? 999999
      const bo = b.sortOrder ?? 999999
      if (ao !== bo) return ao - bo
      return (a.name ?? '').localeCompare(b.name ?? '', undefined, {
        numeric: true,
      })
    })
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
      [...boundAlertPages]
        .filter((page) => page.uid)
        .sort(compareAlertPagePriority)
        .map((page) => {
          const uid = page.uid as string
          const count = alertPageCountMap.get(uid)
          const labelText = page.name ?? page.uid ?? '-'
          const bgColor = page.color
          return {
            key: uid,
            label: (
              <span className='inline-flex max-w-full min-w-0 items-center gap-1'>
                <Badge color={bgColor || '#000'} size='small' />
                {labelText}
                {count != null && count > 0 ? (
                  <span className='pl-1 text-xs text-red-400 font-bold'>
                    ({count})
                  </span>
                ) : null}
              </span>
            ),
            children: null,
          }
        }),
    [boundAlertPages, alertPageCountMap],
  )

  const activeKey = activeTabKey ?? tabItems[0]?.key

  const openManageAlertPagesModal = useMemoizedFn(() => {
    setManageAlertPagesModalOpen(true)
    void refreshAvailableAlertPages()
  })

  const openEditAlertPageModal = useMemoizedFn((uid: string) => {
    if (!uid) return
    setAlertPageFormMode('edit')
    setEditingAlertPageUid(uid)
    form.resetFields()
    setAlertPageModalOpen(true)
  })

  const handleDeleteAlertPage = useMemoizedFn(async (uid: string) => {
    setDeletingAlertPageUid(uid)
    try {
      await deleteAlertPageAsync(uid)
      message.success(t('realtimeAlert.message.deleteAlertPage.success'))
      await refreshAvailableAlertPages()
      await refreshBoundAlertPages()
    } catch (e) {
      console.error('删除告警页失败:', e)
    } finally {
      setDeletingAlertPageUid(null)
    }
  })

  const manageAlertPagesColumns: ColumnsType<AlertPageItem> = useMemo(
    () => [
      {
        title: t('realtimeAlert.form.alertPageName'),
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        render: (v, record) => emptyPlaceholder(v ?? record.uid),
      },
      {
        title: t('realtimeAlert.form.alertPageColor'),
        key: 'color',
        width: 100,
        render: (_, record) =>
          record.color ? (
            <Badge color={record.color} size='small' />
          ) : (
            <span className='text-gray-400'>-</span>
          ),
      },
      {
        title: t('realtimeAlert.form.alertPageSortOrder'),
        dataIndex: 'sortOrder',
        key: 'sortOrder',
        width: 100,
        render: (v) =>
          v != null && Number.isFinite(Number(v)) ? String(v) : '-',
      },
      {
        title: t('realtimeAlert.manageAlertPages.column.bound'),
        key: 'bound',
        width: 120,
        render: (_, record) => {
          const uid = record.uid
          if (!uid) return emptyPlaceholder(uid)
          return boundAlertPageUidSet.has(uid) ? (
            <Tag color='success'>
              {t('realtimeAlert.manageAlertPages.bound.yes')}
            </Tag>
          ) : (
            <Tag>{t('realtimeAlert.manageAlertPages.bound.no')}</Tag>
          )
        },
      },
      {
        title: t('table.action'),
        key: 'action',
        width: 160,
        fixed: 'right',
        render: (_, record) => {
          const uid = record.uid
          if (!uid) return null
          return (
            <Space size='small'>
              <Button
                type='link'
                size='small'
                onClick={() => openEditAlertPageModal(uid)}
              >
                {t('common.edit')}
              </Button>
              <Popconfirm
                title={t('realtimeAlert.confirm.deleteAlertPage.title')}
                description={t(
                  'realtimeAlert.confirm.deleteAlertPage.description',
                )}
                okText={t('common.confirm')}
                cancelText={t('common.cancel')}
                okButtonProps={{
                  loading: deletingAlertPageUid === uid,
                  danger: true,
                }}
                onConfirm={() => void handleDeleteAlertPage(uid)}
              >
                <Button type='link' size='small' danger>
                  {t('common.delete')}
                </Button>
              </Popconfirm>
            </Space>
          )
        },
      },
    ],
    [
      boundAlertPageUidSet,
      deletingAlertPageUid,
      handleDeleteAlertPage,
      openEditAlertPageModal,
      t,
    ],
  )

  const openBindModal = useMemoizedFn(() => {
    const selected = boundAlertPages
      .filter((p) => p.uid)
      .map((p) => p.uid as string)
    bindForm.setFieldsValue({ alertPageUids: selected })
    setBindModalOpen(true)
  })

  const handleBindOk = useMemoizedFn(async () => {
    type BindFormValues = {
      alertPageUids?: string[]
    }
    try {
      const values = (await bindForm.validateFields()) as BindFormValues
      await saveUserAlertPagesAsync({
        alertPageUids: values.alertPageUids,
      })
      message.success(t('realtimeAlert.message.bind.success'))
      setBindModalOpen(false)
      bindForm.resetFields()
      await refreshBoundAlertPages()
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return
      console.error('绑定个人告警页失败:', e)
    }
  })

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
                onClick={openCreateAlertPageModal}
              />
            </Tooltip>
            <Tooltip title={t('realtimeAlert.action.manageAlertPages')}>
              <Button
                icon={<SettingOutlined />}
                onClick={openManageAlertPagesModal}
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
                onClick={openCreateAlertPageModal}
              />
            </Tooltip>
            <Tooltip title={t('realtimeAlert.action.manageAlertPages')}>
              <Button
                icon={<SettingOutlined />}
                onClick={openManageAlertPagesModal}
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
                onClick={openCreateAlertPageModal}
              />
            </Tooltip>
            <Tooltip title={t('realtimeAlert.action.manageAlertPages')}>
              <Button
                icon={<SettingOutlined />}
                onClick={openManageAlertPagesModal}
              />
            </Tooltip>
            <Tabs
              activeKey={activeKey}
              onChange={(key) => {
                setActiveTabKey(key)
                writeStoredActiveAlertPageUid(currentNamespace, key)
              }}
              items={tabItems}
              className='flex-1 min-w-0 [&_.ant-tabs-content]:hidden [&_.ant-tabs-tab]:overflow-visible'
            />
          </div>
          <div className='flex-1 min-h-0 overflow-hidden flex flex-col'>
            {activeKey ? (
              <AlertPageTabContent
                alertPageUid={activeKey}
                rowBgColorEnabled={rowBgColorEnabled}
                refreshSignal={listRefreshSignal}
                onSearchRefresh={() => refreshPageMetadata({ silent: false })}
              />
            ) : null}
          </div>
        </>
      ) : (
        <div className='flex-1 flex items-center justify-center'>
          <Spin />
        </div>
      )}

      <Modal
        title={
          alertPageFormMode === 'create'
            ? t('realtimeAlert.modal.createAlertPage.title')
            : t('realtimeAlert.modal.editAlertPage.title')
        }
        open={alertPageModalOpen}
        onOk={() => void handleAlertPageModalOk()}
        onCancel={() => {
          setAlertPageModalOpen(false)
          form.resetFields()
          setEditingAlertPageUid(null)
        }}
        confirmLoading={alertPageSubmitLoading}
        okButtonProps={{ disabled: alertPageDetailLoading }}
        okText={t('common.ok')}
        cancelText={t('common.cancel')}
        destroyOnHidden
        width={560}
      >
        <Spin spinning={alertPageDetailLoading}>
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
                  <ColorPicker format='hex' allowClear showText />
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
                (v ?? []).filter(
                  (value) => !disabledStrategyGroupSet.has(value),
                )
              }
            >
              <Select
                mode='multiple'
                allowClear
                showSearch={{ optionFilterProp: 'label' }}
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
                showSearch={{ optionFilterProp: 'label' }}
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
                showSearch={{ optionFilterProp: 'label' }}
                loading={createFilterOptionsLoading}
                placeholder={t(
                  'realtimeAlert.form.alertPageFilter.strategies.placeholder',
                )}
                options={strategySelectOptions}
              />
            </Form.Item>
            <Form.Item
              name='filterDatasourceUids'
              label={t('realtimeAlert.form.alertPageFilter.datasources')}
              getValueFromEvent={(v?: string[]) =>
                (v ?? []).filter((value) => !disabledDatasourceSet.has(value))
              }
            >
              <Select
                mode='multiple'
                allowClear
                showSearch={{ optionFilterProp: 'label' }}
                loading={createFilterOptionsLoading}
                placeholder={t(
                  'realtimeAlert.form.alertPageFilter.datasources.placeholder',
                )}
                options={datasourceSelectOptions}
              />
            </Form.Item>
            <Form.Item
              name='filterDatasourceLevelUids'
              label={t('realtimeAlert.form.alertPageFilter.datasourceLevels')}
              getValueFromEvent={(v?: string[]) =>
                (v ?? []).filter(
                  (value) => !disabledDatasourceLevelSet.has(value),
                )
              }
            >
              <Select
                mode='multiple'
                allowClear
                showSearch={{ optionFilterProp: 'label' }}
                loading={createFilterOptionsLoading}
                placeholder={t(
                  'realtimeAlert.form.alertPageFilter.datasourceLevels.placeholder',
                )}
                options={datasourceLevelSelectOptions}
              />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      <Modal
        title={t('realtimeAlert.modal.manageAlertPages.title')}
        open={manageAlertPagesModalOpen}
        onCancel={() => setManageAlertPagesModalOpen(false)}
        footer={null}
        width={800}
      >
        <Table<AlertPageItem>
          rowKey='uid'
          columns={manageAlertPagesColumns}
          dataSource={sortedAlertPagesForManage.filter((p) => p.uid)}
          loading={availableAlertPagesLoading}
          pagination={false}
          scroll={{ x: 'max-content', y: 380 }}
          size='small'
        />
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
        destroyOnHidden
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
