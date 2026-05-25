import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import {
  App,
  Button,
  Avatar,
  Descriptions,
  Dropdown,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Select,
  Space,
  Spin,
  Table,
  Tag,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useLocale } from '@/contexts/LocaleContext'
import PageContent from '@/components/layout/PageContent'
import { GlobalStatus } from '@/api'
import {
  deleteNotificationGroup,
  getNotificationGroupDetail,
  getNotificationGroupList,
  getNotificationGroupSubscription,
  saveNotificationGroupSubscription,
  updateNotificationGroupStatus,
  type NotificationGroupItem,
  type NotificationGroupListParams,
  type SubscriptionFilter,
} from '@/api/marksman/notificationGroup'
import { getWebhookConfigSelectList } from '@/api/rabbit/webhook'
import { getTemplateSelectList } from '@/api/rabbit/template'
import { selectMembers } from '@/api/account/member'
import { getStrategyGroupSelectList } from '@/api/marksman/strategyGroup'
import { getStrategySelectList } from '@/api/marksman/strategy'
import { getDatasourceSelectList } from '@/api/marksman/datasource'
import { getLevelSelectList, LevelType } from '@/api/marksman/level'
import { MENU_DIVIDER } from '@/utils/menu'
import { emptyPlaceholder, renderStatusTag } from '@/utils/marksman'
import { NotificationGroupDetailModal } from './components/NotificationGroupDetailModal'

const defaultSearchParams: NotificationGroupListParams = {
  keyword: '',
  status: undefined,
}

const parseJsonRecord = (raw: unknown): Record<string, string> | undefined => {
  const text = raw != null ? String(raw).trim() : ''
  if (!text) return undefined
  const parsed = JSON.parse(text) as unknown
  if (typeof parsed !== 'object' || parsed == null || Array.isArray(parsed)) {
    return undefined
  }
  return Object.fromEntries(
    Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [
      String(k),
      String(v),
    ]),
  )
}

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  title?: string
}

interface SubscriptionFormValues {
  strategyGroupUids?: string[]
  strategyUids?: string[]
  datasourceUids?: string[]
  levelUids?: string[]
  datasourceLevelUids?: string[]
  labelsText?: string
  excludeLabelsText?: string
}

const NotificationGroupPage: React.FC = () => {
  const { modal } = App.useApp()
  const { t } = useLocale()

  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<NotificationGroupItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  })
  const [searchParams, setSearchParams] =
    useState<NotificationGroupListParams>(defaultSearchParams)
  const [searchForm] = Form.useForm<NotificationGroupListParams>()

  const [selectedUid, setSelectedUid] = useState<string | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const detailLoadingRef = useRef(detailLoading)
  const [detailData, setDetailData] = useState<NotificationGroupItem | null>(
    null,
  )
  const [detailViewOpen, setDetailViewOpen] = useState(false)
  const [subscriptionViewOpen, setSubscriptionViewOpen] = useState(false)
  const subscriptionViewOpenRef = useRef(subscriptionViewOpen)

  const [memberSaving, setMemberSaving] = useState(false)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)
  const [subscriptionForm] = Form.useForm<SubscriptionFormValues>()
  const [strategyGroupOptions, setStrategyGroupOptions] = useState<
    SelectOption[]
  >([])
  const [strategyOptions, setStrategyOptions] = useState<SelectOption[]>([])
  const [datasourceOptions, setDatasourceOptions] = useState<SelectOption[]>([])
  const [levelOptions, setLevelOptions] = useState<SelectOption[]>([])
  const [datasourceLevelOptions, setDatasourceLevelOptions] = useState<
    SelectOption[]
  >([])
  const [memberSelectOptions, setMemberSelectOptions] = useState<
    SelectOption[]
  >([])
  const [webhookSelectOptions, setWebhookSelectOptions] = useState<
    SelectOption[]
  >([])
  const [templateSelectOptions, setTemplateSelectOptions] = useState<
    SelectOption[]
  >([])

  const cancelledRef = useRef(false)

  const fetchList = useCallback(
    async (
      page?: number,
      pageSize?: number,
      override?: Partial<NotificationGroupListParams>,
    ) => {
      setLoading(true)
      try {
        const currentPage = page ?? pagination.current
        const currentPageSize = pageSize ?? pagination.pageSize
        const effective = override
          ? { ...searchParams, ...override }
          : searchParams

        const params: NotificationGroupListParams = {
          page: currentPage,
          pageSize: currentPageSize,
          keyword: effective.keyword || undefined,
          status: effective.status,
        }

        const response = await getNotificationGroupList(params)
        if (cancelledRef.current) return

        const items = response.items ?? []
        const total = parseInt(String(response.total ?? '0'), 10)

        setDataSource(items)
        setPagination((prev) => ({
          ...prev,
          current: currentPage,
          pageSize: currentPageSize,
          total,
        }))
      } catch (e) {
        if (cancelledRef.current) return
        console.error('获取通知组列表失败:', e)
      } finally {
        if (!cancelledRef.current) setLoading(false)
      }
    },
    [pagination, searchParams],
  )

  const fetchDetail = useCallback(async (uid: string) => {
    setDetailLoading(true)
    try {
      const data = await getNotificationGroupDetail(uid)
      if (cancelledRef.current) return
      setDetailData(data)
    } catch (e) {
      if (cancelledRef.current) return
      console.error('获取通知组详情失败:', e)
      setDetailData(null)
    } finally {
      if (!cancelledRef.current) setDetailLoading(false)
    }
  }, [])

  const fetchSubscription = useCallback(
    async (uid: string) => {
      setSubscriptionLoading(true)
      try {
        const data = await getNotificationGroupSubscription(uid)
        if (cancelledRef.current) return
        const filter = data.filter ?? {}
        subscriptionForm.setFieldsValue({
          strategyGroupUids: filter.strategyGroupUids ?? [],
          strategyUids: filter.strategyUids ?? [],
          datasourceUids: filter.datasourceUids ?? [],
          levelUids: filter.levelUids ?? [],
          datasourceLevelUids: filter.datasourceLevelUids ?? [],
          labelsText:
            filter.labels && Object.keys(filter.labels).length > 0
              ? JSON.stringify(filter.labels, null, 2)
              : '',
          excludeLabelsText:
            filter.excludeLabels && Object.keys(filter.excludeLabels).length > 0
              ? JSON.stringify(filter.excludeLabels, null, 2)
              : '',
        })
      } catch (e) {
        if (cancelledRef.current) return
        console.error('获取通知组订阅失败:', e)
        // 此处不要无条件 resetFields：当订阅弹窗处于 loading 状态时 Form 可能未挂载
        // 会触发 antd 的 useForm 未连接警告；只保留当前值即可。
      } finally {
        if (!cancelledRef.current) setSubscriptionLoading(false)
      }
    },
    [subscriptionForm],
  )

  const loadSelectOptions = useCallback(async () => {
    try {
      const [sgRes, sRes, dRes, lRes, dlRes, mRes, wRes, tRes] =
        await Promise.all([
          getStrategyGroupSelectList({ limit: 100 }),
          getStrategySelectList({ limit: 100 }),
          getDatasourceSelectList({ limit: 100 }),
          getLevelSelectList({ limit: 100, type: LevelType.LEVEL_TYPE_ALERT }),
          getLevelSelectList({
            limit: 100,
            type: LevelType.LEVEL_TYPE_DATASOURCE,
          }),
          selectMembers({ limit: 100, status: 'JOINED' }),
          getWebhookConfigSelectList({
            limit: 100,
            status: GlobalStatus.ENABLED,
          }),
          getTemplateSelectList({ limit: 100, status: GlobalStatus.ENABLED }),
        ])
      if (cancelledRef.current) return

      const toOptions = (
        items?: {
          value?: string
          label?: string
          disabled?: boolean
          tooltip?: string
        }[],
      ): SelectOption[] =>
        (items ?? [])
          .filter((i) => Boolean(i.value))
          .map((i) => ({
            value: i.value!,
            label: i.label ?? i.value!,
            disabled: i.disabled,
            title: i.tooltip,
          }))

      setStrategyGroupOptions(toOptions(sgRes.items))
      setStrategyOptions(toOptions(sRes.items))
      setDatasourceOptions(toOptions(dRes.items))
      setLevelOptions(toOptions(lRes.items))
      setDatasourceLevelOptions(toOptions(dlRes.items))
      setMemberSelectOptions(toOptions(mRes.items))
      setWebhookSelectOptions(toOptions(wRes.items))
      setTemplateSelectOptions(toOptions(tRes.items))
    } catch (e) {
      if (cancelledRef.current) return
      console.error('获取订阅筛选下拉失败:', e)
      setStrategyGroupOptions([])
      setStrategyOptions([])
      setDatasourceOptions([])
      setLevelOptions([])
      setDatasourceLevelOptions([])
      setMemberSelectOptions([])
      setWebhookSelectOptions([])
      setTemplateSelectOptions([])
    }
  }, [])

  useEffect(() => {
    cancelledRef.current = false
    fetchList(1, pagination.pageSize)
    return () => {
      cancelledRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedUid) {
      setDetailData(null)
      if (subscriptionViewOpen && !detailLoading && !subscriptionLoading)
        subscriptionForm.resetFields()
      return
    }
    fetchDetail(selectedUid)
    fetchSubscription(selectedUid)
  }, [
    selectedUid,
    fetchDetail,
    fetchSubscription,
    subscriptionForm,
    subscriptionViewOpen,
    detailLoading,
    subscriptionLoading,
  ])

  useEffect(() => {
    if (!subscriptionViewOpen) return
    void loadSelectOptions()
  }, [subscriptionViewOpen, loadSelectOptions])

  useEffect(() => {
    subscriptionViewOpenRef.current = subscriptionViewOpen
  }, [subscriptionViewOpen])

  useEffect(() => {
    detailLoadingRef.current = detailLoading
  }, [detailLoading])

  useEffect(() => {
    searchForm.setFieldsValue({
      keyword: searchParams.keyword ?? '',
      status: searchParams.status,
    })
  }, [searchParams.keyword, searchParams.status, searchForm])

  const handleSearch = (override?: Partial<NotificationGroupListParams>) => {
    if (override) setSearchParams((prev) => ({ ...prev, ...override }))
    setPagination((prev) => ({ ...prev, current: 1, total: 0 }))
    fetchList(1, pagination.pageSize, override)
  }

  const handleReset = () => {
    setSearchParams(defaultSearchParams)
    setPagination({ current: 1, pageSize: 50, total: 0 })
    fetchList(1, 10, defaultSearchParams)
  }

  const handleTableChange = (page: number, pageSize?: number) => {
    fetchList(page, pageSize ?? pagination.pageSize)
  }

  const handleSelectGroup = (record: NotificationGroupItem) => {
    if (!record.uid) return
    setSelectedUid(record.uid)
    setDetailViewOpen(true)
    setSubscriptionViewOpen(false)
  }

  const handleStatusChange = useCallback(
    async (record: NotificationGroupItem, newStatus: GlobalStatus) => {
      if (!record.uid) return
      try {
        await updateNotificationGroupStatus({
          uid: record.uid,
          status: newStatus,
        })
        message.success(t('message.update.success'))
        if (selectedUid === record.uid)
          setDetailData((prev) =>
            prev ? { ...prev, status: newStatus } : prev,
          )
        fetchList(pagination.current, pagination.pageSize)
      } catch (e) {
        console.error('修改状态失败:', e)
      }
    },
    [fetchList, pagination, selectedUid, t],
  )

  const handleDelete = useCallback(
    async (record: NotificationGroupItem) => {
      if (!record.uid) return
      try {
        await deleteNotificationGroup(record.uid)
        message.success(t('message.delete.success'))
        if (selectedUid === record.uid) {
          setSelectedUid(null)
          setDetailData(null)
        }
        fetchList(1, pagination.pageSize)
      } catch (e) {
        console.error('删除失败:', e)
      }
    },
    [fetchList, pagination, selectedUid, t],
  )

  const [upsertOpen, setUpsertOpen] = useState(false)
  const [upsertMode, setUpsertMode] = useState<'create' | 'edit'>('create')
  const [upsertData, setUpsertData] = useState<NotificationGroupItem | null>(
    null,
  )
  const [upsertLoading, setUpsertLoading] = useState(false)

  useEffect(() => {
    if (!upsertOpen) return
    void loadSelectOptions()
  }, [upsertOpen, loadSelectOptions])

  const openCreateModal = () => {
    setUpsertMode('create')
    setUpsertData(null)
    setUpsertOpen(true)
  }

  const openEditModal = async (record: NotificationGroupItem) => {
    if (!record.uid) return
    setUpsertMode('edit')
    setUpsertLoading(true)
    try {
      const detail = await getNotificationGroupDetail(record.uid)
      setUpsertData(detail)
      setUpsertOpen(true)
    } catch (e) {
      console.error('获取通知组详情失败:', e)
    } finally {
      setUpsertLoading(false)
    }
  }

  const handleUpsertSuccess = (uid?: string) => {
    void uid
    setUpsertOpen(false)
    fetchList(pagination.current, pagination.pageSize)
  }

  const handleSaveSubscription = async () => {
    if (!selectedUid) return
    setMemberSaving(true)
    try {
      const values = await subscriptionForm.validateFields()
      let labels: Record<string, string> | undefined
      let excludeLabels: Record<string, string> | undefined
      try {
        labels = parseJsonRecord(values.labelsText)
        excludeLabels = parseJsonRecord(values.excludeLabelsText)
      } catch {
        message.error(t('message.error'))
        return
      }

      const cleanedFilter: SubscriptionFilter = {
        strategyGroupUids:
          (values.strategyGroupUids ?? []).filter(Boolean).length > 0
            ? (values.strategyGroupUids ?? []).filter(Boolean)
            : undefined,
        strategyUids:
          (values.strategyUids ?? []).filter(Boolean).length > 0
            ? (values.strategyUids ?? []).filter(Boolean)
            : undefined,
        levelUids:
          (values.levelUids ?? []).filter(Boolean).length > 0
            ? (values.levelUids ?? []).filter(Boolean)
            : undefined,
        datasourceUids:
          (values.datasourceUids ?? []).filter(Boolean).length > 0
            ? (values.datasourceUids ?? []).filter(Boolean)
            : undefined,
        datasourceLevelUids:
          (values.datasourceLevelUids ?? []).filter(Boolean).length > 0
            ? (values.datasourceLevelUids ?? []).filter(Boolean)
            : undefined,
        strategyLevels: undefined,
        labels,
        excludeLabels,
      }

      await saveNotificationGroupSubscription(selectedUid, {
        notificationGroupUid: selectedUid,
        filter: cleanedFilter,
      })

      message.success(t('message.update.success'))
      await fetchSubscription(selectedUid)
    } catch (e) {
      console.error('保存订阅失败:', e)
      message.error(t('message.error'))
    } finally {
      setMemberSaving(false)
    }
  }

  const columns: ColumnsType<NotificationGroupItem> = useMemo(
    () => [
      {
        title: t('notificationGroup.table.uid'),
        dataIndex: 'uid',
        key: 'uid',
        width: 160,
        ellipsis: true,
        render: (v) => emptyPlaceholder(v),
      },
      {
        title: t('notificationGroup.table.name'),
        dataIndex: 'name',
        key: 'name',
        width: 200,
        ellipsis: true,
        render: (v) => emptyPlaceholder(v),
      },
      {
        title: t('notificationGroup.table.remark'),
        dataIndex: 'remark',
        key: 'remark',
        width: 220,
        ellipsis: true,
        render: (v) => emptyPlaceholder(v),
      },
      {
        title: t('notificationGroup.table.status'),
        dataIndex: 'status',
        key: 'status',
        width: 120,
        align: 'center',
        render: (v: GlobalStatus) => renderStatusTag(v, t),
      },
      {
        title: t('notificationGroup.table.createdAt'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 170,
        render: (v: string) =>
          v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-',
      },
      {
        title: t('notificationGroup.table.updatedAt'),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 170,
        render: (v: string) =>
          v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-',
      },
      {
        title: t('table.action'),
        key: 'action',
        width: 240,
        fixed: 'right',
        align: 'center',
        render: (_, record) => {
          const isEnabled = record.status === GlobalStatus.ENABLED
          const action = isEnabled
            ? t(`common.status.${GlobalStatus.DISABLED}`)
            : t(`common.status.${GlobalStatus.ENABLED}`)
          const menuItems: MenuProps['items'] = [
            {
              key: 'detail',
              label: t('common.detail'),
              onClick: () => {
                if (!record.uid) return
                setSelectedUid(record.uid)
                setDetailViewOpen(true)
                setSubscriptionViewOpen(false)
              },
            },
            {
              key: 'subscription',
              label: t('notificationGroup.tab.subscription'),
              onClick: () => {
                if (!record.uid) return
                setSelectedUid(record.uid)
                setSubscriptionViewOpen(true)
                setDetailViewOpen(false)
              },
            },
            {
              key: 'edit',
              label: t('common.edit'),
              onClick: () => openEditModal(record),
            },
            {
              key: 'status',
              label: action,
              onClick: () =>
                modal.confirm({
                  title: t('notificationGroup.confirm.status.title', {
                    action,
                  }),
                  content: t('notificationGroup.confirm.status.content', {
                    action,
                    name: record.name ?? record.uid ?? '',
                  }),
                  okText: t('common.ok'),
                  cancelText: t('common.cancel'),
                  onOk: () =>
                    handleStatusChange(
                      record,
                      isEnabled ? GlobalStatus.DISABLED : GlobalStatus.ENABLED,
                    ),
                }),
            },
            MENU_DIVIDER,
            {
              key: 'delete',
              label: t('common.delete'),
              danger: true,
              onClick: () => {
                modal.confirm({
                  title: t('notificationGroup.confirm.delete.title'),
                  content: t('notificationGroup.confirm.delete.content', {
                    name: record.name ?? record.uid ?? '',
                  }),
                  okText: t('common.ok'),
                  cancelText: t('common.cancel'),
                  onOk: () => handleDelete(record),
                })
              },
            },
          ]

          return (
            <Space size='small'>
              <Button
                type='link'
                size='small'
                onClick={() => handleSelectGroup(record)}
                disabled={!record.uid}
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
    ],
    [handleDelete, handleStatusChange, modal, t],
  )

  return (
    <div className='h-full flex flex-col'>
      <div className='flex-1 min-h-0'>
        <PageContent className='flex-1 min-w-0'>
          <div className='flex items-center justify-between mb-4 shrink-0'>
            <Form
              form={searchForm}
              layout='inline'
              onValuesChange={(_, allValues) => {
                setSearchParams((prev) => ({
                  ...prev,
                  keyword: allValues.keyword ?? '',
                  status: allValues.status,
                }))
              }}
            >
              <Space size='middle' wrap>
                <span>{t('table.search.keyword')}:</span>
                <Form.Item name='keyword' className='mb-0'>
                  <Input
                    placeholder={t('table.search.placeholder')}
                    allowClear
                    className='w-full min-w-[120px] sm:w-48 md:w-52'
                    onPressEnter={(e) =>
                      handleSearch({
                        keyword: (e.target as HTMLInputElement).value,
                      })
                    }
                  />
                </Form.Item>
                <span>{t('common.status')}:</span>
                <Form.Item name='status' className='mb-0'>
                  <Radio.Group buttonStyle='solid'>
                    <Radio.Button value={undefined}>
                      {t('table.search.all')}
                    </Radio.Button>
                    <Radio.Button value={GlobalStatus.ENABLED}>
                      {t(`common.status.${GlobalStatus.ENABLED}`)}
                    </Radio.Button>
                    <Radio.Button value={GlobalStatus.DISABLED}>
                      {t(`common.status.${GlobalStatus.DISABLED}`)}
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
                <Button onClick={() => handleSearch()} type='primary'>
                  {t('common.search')}
                </Button>
                <Button onClick={handleReset}>{t('common.reset')}</Button>
              </Space>
            </Form>
            <Button
              type='primary'
              onClick={openCreateModal}
              icon={<PlusOutlined />}
            >
              {t('common.add')}
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey='uid'
            loading={loading}
            size='small'
            scroll={{ y: 520, x: 'max-content' }}
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
        </PageContent>
      </div>

      <NotificationGroupDetailModal
        open={upsertOpen}
        mode={upsertMode}
        initialData={upsertData}
        loading={upsertLoading}
        memberOptions={memberSelectOptions}
        webhookOptions={webhookSelectOptions}
        templateOptions={templateSelectOptions}
        onCancel={() => setUpsertOpen(false)}
        onSuccess={handleUpsertSuccess}
      />

      <Modal
        title={t('notificationGroup.tab.detail')}
        open={detailViewOpen}
        onCancel={() => {
          setDetailViewOpen(false)
          setSelectedUid(null)
          setDetailData(null)
        }}
        footer={
          <Space>
            <Button
              onClick={() => {
                setDetailViewOpen(false)
                setSubscriptionViewOpen(true)
              }}
              disabled={!detailData}
              type='primary'
            >
              {t('notificationGroup.subscription.action.addMember')}
            </Button>
            <Button
              onClick={() => {
                setDetailViewOpen(false)
                setSelectedUid(null)
                setDetailData(null)
              }}
            >
              {t('common.close')}
            </Button>
          </Space>
        }
        width={820}
        destroyOnHidden
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size='large' />
          </div>
        ) : detailData ? (
          <Descriptions
            column={1}
            bordered
            size='small'
            styles={{ label: { width: 140, minWidth: 140 } }}
          >
            <Descriptions.Item label={t('notificationGroup.detail.uid')}>
              {emptyPlaceholder(detailData.uid)}
            </Descriptions.Item>
            <Descriptions.Item label={t('notificationGroup.detail.name')}>
              {emptyPlaceholder(detailData.name)}
            </Descriptions.Item>
            <Descriptions.Item label={t('notificationGroup.detail.status')}>
              {renderStatusTag(detailData.status ?? GlobalStatus.UNKNOWN, t)}
            </Descriptions.Item>
            <Descriptions.Item label={t('notificationGroup.detail.remark')}>
              {emptyPlaceholder(detailData.remark)}
            </Descriptions.Item>
            <Descriptions.Item label={t('notificationGroup.detail.createdAt')}>
              {detailData.createdAt
                ? dayjs(detailData.createdAt).format('YYYY-MM-DD HH:mm:ss')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('notificationGroup.detail.updatedAt')}>
              {detailData.updatedAt
                ? dayjs(detailData.updatedAt).format('YYYY-MM-DD HH:mm:ss')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('notificationGroup.detail.metadata')}>
              {detailData.metadata &&
              Object.keys(detailData.metadata).length > 0 ? (
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {JSON.stringify(detailData.metadata, null, 2)}
                </pre>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('notificationGroup.detail.members')}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {(detailData.members ?? []).map((m, idx) => (
                  <Space
                    key={`${m.memberUid ?? 'm'}-${idx}`}
                    size='small'
                    align='center'
                  >
                    <Avatar size='small' src={m.memberAvatar}>
                      {m.memberName
                        ? String(m.memberName).slice(0, 1)
                        : undefined}
                    </Avatar>
                    <span>{m.memberName ?? m.memberUid ?? '-'}</span>
                    {m.isEmail ? (
                      <Tag color='blue'>
                        {t('notificationGroup.subscription.table.email')}
                      </Tag>
                    ) : null}
                    {m.isPhone ? (
                      <Tag color='green'>
                        {t('notificationGroup.subscription.table.phone')}
                      </Tag>
                    ) : null}
                  </Space>
                ))}
                {(detailData.members ?? []).length === 0 ? '-' : null}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label={t('notificationGroup.detail.webhooks')}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(detailData.webhookItems ?? []).map((w, idx) => (
                  <Tag key={`${w.uid ?? w.name ?? 'webhook'}-${idx}`}>
                    {w.name ?? w.uid ?? '-'}
                  </Tag>
                ))}
                {(detailData.webhookItems ?? []).length === 0 ? '-' : null}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label={t('notificationGroup.detail.templates')}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(detailData.templateItems ?? []).map((tpl, idx) => (
                  <Tag key={`${tpl.uid ?? tpl.name ?? 'template'}-${idx}`}>
                    {tpl.name ?? tpl.uid ?? '-'}
                  </Tag>
                ))}
                {(detailData.templateItems ?? []).length === 0 ? '-' : null}
              </div>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            {t('common.noData')}
          </div>
        )}
      </Modal>

      <Modal
        title={t('notificationGroup.tab.subscription')}
        open={subscriptionViewOpen}
        onCancel={() => {
          setSubscriptionViewOpen(false)
          setSelectedUid(null)
          setDetailData(null)
        }}
        width={980}
        destroyOnHidden
        footer={
          <Space>
            <Button
              onClick={() => {
                setSubscriptionViewOpen(false)
                setSelectedUid(null)
                setDetailData(null)
              }}
            >
              {t('common.close')}
            </Button>
            <Button
              type='primary'
              loading={memberSaving}
              onClick={handleSaveSubscription}
              disabled={!detailData}
            >
              {t('notificationGroup.subscription.action.save')}
            </Button>
          </Space>
        }
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size='large' />
          </div>
        ) : (
          <>
            <div className='mt-4 mb-2 font-semibold'>
              {t('notificationGroup.subscription.filter.title')}
            </div>

            {subscriptionLoading ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Spin />
              </div>
            ) : (
              <Form form={subscriptionForm} layout='vertical' preserve={false}>
                <Form.Item
                  name='strategyGroupUids'
                  label={t(
                    'notificationGroup.subscription.filter.strategyGroups',
                  )}
                >
                  <Select
                    mode='multiple'
                    allowClear
                    className='w-full'
                    placeholder={t(
                      'notificationGroup.subscription.filter.strategyGroups.placeholder',
                    )}
                    options={strategyGroupOptions}
                  />
                </Form.Item>
                <Form.Item
                  name='strategyUids'
                  label={t('notificationGroup.subscription.filter.strategies')}
                >
                  <Select
                    mode='multiple'
                    allowClear
                    className='w-full'
                    placeholder={t(
                      'notificationGroup.subscription.filter.strategies.placeholder',
                    )}
                    options={strategyOptions}
                  />
                </Form.Item>
                <Form.Item
                  name='datasourceUids'
                  label={t('notificationGroup.subscription.filter.datasources')}
                >
                  <Select
                    mode='multiple'
                    allowClear
                    className='w-full'
                    placeholder={t(
                      'notificationGroup.subscription.filter.datasources.placeholder',
                    )}
                    options={datasourceOptions}
                  />
                </Form.Item>
                <Form.Item
                  name='levelUids'
                  label={t('notificationGroup.subscription.filter.levels')}
                >
                  <Select
                    mode='multiple'
                    allowClear
                    className='w-full'
                    placeholder={t(
                      'notificationGroup.subscription.filter.levels.placeholder',
                    )}
                    options={levelOptions}
                  />
                </Form.Item>
                <Form.Item
                  name='datasourceLevelUids'
                  label={t(
                    'notificationGroup.subscription.filter.datasourceLevels',
                  )}
                >
                  <Select
                    mode='multiple'
                    allowClear
                    className='w-full'
                    placeholder={t(
                      'notificationGroup.subscription.filter.datasourceLevels.placeholder',
                    )}
                    options={datasourceLevelOptions}
                  />
                </Form.Item>
                <Form.Item
                  name='labelsText'
                  label={t('notificationGroup.subscription.filter.labels')}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder={t(
                      'notificationGroup.subscription.filter.labels.placeholder',
                    )}
                  />
                </Form.Item>
                <Form.Item
                  name='excludeLabelsText'
                  label={t(
                    'notificationGroup.subscription.filter.excludeLabels',
                  )}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder={t(
                      'notificationGroup.subscription.filter.excludeLabels.placeholder',
                    )}
                  />
                </Form.Item>
              </Form>
            )}
          </>
        )}

        <div className='flex justify-end mt-4 gap-2'>
          <Button
            onClick={() => {
              if (selectedUid) {
                void fetchSubscription(selectedUid)
              } else {
                if (!detailLoading && !subscriptionLoading) {
                  subscriptionForm.resetFields()
                }
              }
            }}
            disabled={memberSaving}
          >
            {t('common.reset')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default function NotificationGroupListWrapper() {
  return (
    <App className='h-full'>
      <NotificationGroupPage />
    </App>
  )
}
