import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import {
  App,
  Button,
  Checkbox,
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
  createNotificationGroup,
  deleteNotificationGroup,
  getNotificationGroupDetail,
  getNotificationGroupList,
  updateNotificationGroup,
  updateNotificationGroupStatus,
  type NotificationGroupItem,
  type NotificationGroupListParams,
  type CreateNotificationGroupParams,
  type UpdateNotificationGroupParams,
  type NotificationMemberItem,
} from '@/api/marksman/notificationGroup'
import { selectMembers, type SelectMemberItem, type SelectMembersParams } from '@/api/account/member'
import { emptyPlaceholder, renderStatusTag } from '@/utils/marksman'

const defaultSearchParams: NotificationGroupListParams = {
  keyword: '',
  status: undefined,
}

const parseMetadata = (
  raw: unknown,
): Record<string, string> | undefined => {
  const text = raw != null ? String(raw).trim() : ''
  if (!text) return undefined
  const parsed = JSON.parse(text) as unknown
  if (typeof parsed !== 'object' || parsed == null || Array.isArray(parsed)) return undefined
  return Object.fromEntries(Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [k, String(v)]))
}

interface NotificationMemberTableRow extends NotificationMemberItem {
  uid: string
}

const NotificationGroupDetailModal: React.FC<{
  open: boolean
  mode: 'create' | 'edit'
  initialData?: NotificationGroupItem | null
  loading?: boolean
  onCancel: () => void
  onSuccess: (uid?: string) => void
}> = ({ open, mode, initialData, loading = false, onCancel, onSuccess }) => {
  const { t } = useLocale()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (mode === 'edit') {
      form.setFieldsValue({
        name: initialData?.name ?? '',
        remark: initialData?.remark ?? '',
        metadata: initialData?.metadata ? JSON.stringify(initialData.metadata, null, 2) : '',
      })
    } else {
      form.resetFields()
    }
  }, [open, mode, initialData, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      let metadata: Record<string, string> | undefined
      try {
        metadata = parseMetadata(values.metadata)
      } catch {
        message.error(t('message.error'))
        return
      }
      const name = values.name?.trim() || undefined
      const remark = values.remark?.trim() || undefined

      if (mode === 'create') {
        const params: CreateNotificationGroupParams = {
          name,
          remark,
          metadata,
        }
        const created = await createNotificationGroup(params)
        message.success(t('message.create.success'))
        onSuccess(created.uid)
      } else if (mode === 'edit' && initialData?.uid) {
        const params: UpdateNotificationGroupParams = {
          uid: initialData.uid,
          name,
          remark,
          metadata,
          // 关键：编辑时保持订阅/配置不被覆盖
          members: initialData.members ?? [],
          webhooks: initialData.webhooks ?? [],
          templates: initialData.templates ?? [],
        }
        await updateNotificationGroup(initialData.uid, params)
        message.success(t('message.update.success'))
        onSuccess(initialData.uid)
      } else {
        onSuccess(initialData?.uid)
      }
      onCancel()
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return
      console.error('提交通知组失败:', e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={mode === 'create' ? t('notificationGroup.modal.create.title') : t('notificationGroup.modal.edit.title')}
      open={open}
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields()
        onCancel()
      }}
      destroyOnHidden
      maskClosable
      confirmLoading={submitting || loading}
      okText={t('common.submit')}
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="name"
          label={t('notificationGroup.form.name.label')}
          rules={[{ required: true, message: t('notificationGroup.form.name.placeholder') }]}
        >
          <Input placeholder={t('notificationGroup.form.name.placeholder')} allowClear />
        </Form.Item>
        <Form.Item name="remark" label={t('notificationGroup.form.remark.label')}>
          <Input.TextArea rows={2} placeholder={t('notificationGroup.form.remark.placeholder')} allowClear />
        </Form.Item>
        <Form.Item name="metadata" label={t('notificationGroup.form.metadata.label')}>
          <Input.TextArea rows={4} placeholder={t('notificationGroup.form.metadata.placeholder')} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

const NotificationMemberSelectModal: React.FC<{
  open: boolean
  onCancel: () => void
  onConfirm: (item: NotificationMemberItem) => void
  existingMemberUids: Set<string>
}> = ({ open, onCancel, onConfirm, existingMemberUids }) => {
  const { t } = useLocale()
  const [form] = Form.useForm()
  const [options, setOptions] = useState<SelectMemberItem[]>([])
  const [optionsLoading, setOptionsLoading] = useState(false)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchOptions = useCallback(async (keyword?: string) => {
    setOptionsLoading(true)
    try {
      const params: SelectMembersParams = {
        keyword: keyword?.trim() || undefined,
        limit: 20,
      }
      const res = await selectMembers(params)
      setOptions(res.items ?? [])
    } catch (e) {
      console.error('拉取成员下拉失败:', e)
      setOptions([])
    } finally {
      setOptionsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    fetchOptions()
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [open, fetchOptions])

  useEffect(() => {
    if (!open) return
    form.resetFields()
  }, [open, form])

  const handleSearch = (value: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      fetchOptions(value)
    }, 300)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const memberUid = values.memberUid as string | undefined
      const isEmail = Boolean(values.isEmail)
      const isPhone = Boolean(values.isPhone)
      if (!memberUid) return
      if (!isEmail && !isPhone) {
        message.warning(t('notificationGroup.memberModal.validation.atLeastOneChannel'))
        return
      }
      if (existingMemberUids.has(memberUid)) {
        message.warning(t('notificationGroup.subscription.member.duplicate'))
        return
      }
      onConfirm({ memberUid, isEmail, isPhone })
      onCancel()
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return
      console.error('添加成员失败:', e)
    }
  }

  return (
    <Modal
      title={t('notificationGroup.memberModal.title')}
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields()
        onCancel()
      }}
      destroyOnHidden
      maskClosable
      okText={t('common.ok')}
      cancelText={t('common.cancel')}
    >
      <Form form={form} layout="vertical" preserve={false} initialValues={{ isEmail: false, isPhone: false }}>
        <Form.Item
          name="memberUid"
          label={t('notificationGroup.memberModal.form.memberUid.label')}
          rules={[{ required: true, message: t('notificationGroup.memberModal.validation.memberRequired') }]}
        >
          <Select
            showSearch
            allowClear
            placeholder={t('notificationGroup.memberModal.form.memberUid.placeholder')}
            filterOption={false}
            loading={optionsLoading}
            options={options
              .filter((i) => (i.value ?? '') !== '')
              .map((i) => ({
                value: i.value!,
                label: i.label ?? i.value!,
                disabled: i.disabled,
                title: i.tooltip,
              }))}
            onSearch={handleSearch}
          />
        </Form.Item>

        <Form.Item
          name="isEmail"
          valuePropName="checked"
          label={t('notificationGroup.memberModal.form.isEmail')}
        >
          <Checkbox />
        </Form.Item>

        <Form.Item
          name="isPhone"
          valuePropName="checked"
          label={t('notificationGroup.memberModal.form.isPhone')}
        >
          <Checkbox />
        </Form.Item>

        {/* 通道校验在 onOk 里强校验，避免规则项不生效 */}
      </Form>
    </Modal>
  )
}

const NotificationMemberSubscriptionTable: React.FC<{
  members: NotificationMemberItem[]
  onRemove: (memberUid: string) => void
}> = ({ members, onRemove }) => {
  const { t } = useLocale()
  const data = useMemo<NotificationMemberTableRow[]>(() => {
    return (members ?? []).map((m, idx) => ({
      ...m,
      uid: m.memberUid ? String(m.memberUid) : `row-${idx}`,
    }))
  }, [members])

  const columns: ColumnsType<NotificationMemberTableRow> = [
    {
      title: t('notificationGroup.subscription.table.member'),
      dataIndex: 'memberUid',
      key: 'memberUid',
      width: 260,
      render: (v) => emptyPlaceholder(v),
    },
    {
      title: t('notificationGroup.subscription.table.email'),
      dataIndex: 'isEmail',
      key: 'isEmail',
      width: 120,
      align: 'center',
      render: (v) => <Checkbox checked={Boolean(v)} disabled />,
    },
    {
      title: t('notificationGroup.subscription.table.phone'),
      dataIndex: 'isPhone',
      key: 'isPhone',
      width: 120,
      align: 'center',
      render: (v) => <Checkbox checked={Boolean(v)} disabled />,
    },
    {
      title: t('notificationGroup.subscription.table.action'),
      key: 'action',
      width: 120,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Button type="link" danger size="small" onClick={() => onRemove(record.memberUid ?? '')} disabled={!record.memberUid}>
          {t('common.delete')}
        </Button>
      ),
    },
  ]

  return (
    <Table
      rowKey="uid"
      size="small"
      columns={columns}
      dataSource={data}
      pagination={false}
      locale={{ emptyText: t('notificationGroup.subscription.empty') }}
    />
  )
}

const NotificationGroupPage: React.FC = () => {
  const { modal } = App.useApp()
  const { t } = useLocale()

  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<NotificationGroupItem[]>([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchParams, setSearchParams] = useState<NotificationGroupListParams>(defaultSearchParams)

  const [selectedUid, setSelectedUid] = useState<string | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailData, setDetailData] = useState<NotificationGroupItem | null>(null)
  const [detailViewOpen, setDetailViewOpen] = useState(false)
  const [subscriptionViewOpen, setSubscriptionViewOpen] = useState(false)

  const [draftMembers, setDraftMembers] = useState<NotificationMemberItem[]>([])
  const [memberModalOpen, setMemberModalOpen] = useState(false)
  const [memberSaving, setMemberSaving] = useState(false)

  const cancelledRef = useRef(false)

  const fetchList = useCallback(
    async (page?: number, pageSize?: number, override?: Partial<NotificationGroupListParams>) => {
      setLoading(true)
      try {
        const currentPage = page ?? pagination.current
        const currentPageSize = pageSize ?? pagination.pageSize
        const effective = override ? { ...searchParams, ...override } : searchParams

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
    [pagination.current, pagination.pageSize, searchParams, selectedUid],
  )

  const fetchDetail = useCallback(async (uid: string) => {
    setDetailLoading(true)
    try {
      const data = await getNotificationGroupDetail(uid)
      if (cancelledRef.current) return
      setDetailData(data)
      setDraftMembers(data.members ?? [])
    } catch (e) {
      if (cancelledRef.current) return
      console.error('获取通知组详情失败:', e)
      setDetailData(null)
      setDraftMembers([])
    } finally {
      if (!cancelledRef.current) setDetailLoading(false)
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
      setDraftMembers([])
      return
    }
    fetchDetail(selectedUid)
  }, [selectedUid, fetchDetail])

  const handleSearch = (override?: Partial<NotificationGroupListParams>) => {
    if (override) setSearchParams((prev) => ({ ...prev, ...override }))
    setPagination((prev) => ({ ...prev, current: 1, total: 0 }))
    fetchList(1, pagination.pageSize, override)
  }

  const handleReset = () => {
    setSearchParams(defaultSearchParams)
    setPagination({ current: 1, pageSize: 10, total: 0 })
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

  const handleStatusChange = async (record: NotificationGroupItem, newStatus: GlobalStatus) => {
    if (!record.uid) return
    try {
      await updateNotificationGroupStatus({ uid: record.uid, status: newStatus })
      message.success(t('message.update.success'))
      if (selectedUid === record.uid) setDetailData((prev) => (prev ? { ...prev, status: newStatus } : prev))
      fetchList(pagination.current, pagination.pageSize)
    } catch (e) {
      console.error('修改状态失败:', e)
    }
  }

  const handleDelete = async (record: NotificationGroupItem) => {
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
  }

  const [upsertOpen, setUpsertOpen] = useState(false)
  const [upsertMode, setUpsertMode] = useState<'create' | 'edit'>('create')
  const [upsertData, setUpsertData] = useState<NotificationGroupItem | null>(null)
  const [upsertLoading, setUpsertLoading] = useState(false)

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

  const existingMemberUids = useMemo(() => new Set(draftMembers.map((m) => m.memberUid).filter(Boolean) as string[]), [draftMembers])

  const handleRemoveMember = (memberUid: string) => {
    setDraftMembers((prev) => prev.filter((m) => m.memberUid !== memberUid))
  }

  const handleAddMemberConfirm = (item: NotificationMemberItem) => {
    setDraftMembers((prev) => {
      if (item.memberUid && prev.some((m) => m.memberUid === item.memberUid)) return prev
      return [...prev, item]
    })
  }

  const handleSaveSubscription = async () => {
    if (!selectedUid || !detailData) return
    setMemberSaving(true)
    try {
      const params: UpdateNotificationGroupParams = {
        uid: selectedUid,
        name: detailData.name,
        remark: detailData.remark,
        metadata: detailData.metadata,
        members: draftMembers,
        webhooks: detailData.webhooks ?? [],
        templates: detailData.templates ?? [],
      }
      await updateNotificationGroup(selectedUid, params)
      message.success(t('message.update.success'))
      const fresh = await getNotificationGroupDetail(selectedUid)
      setDetailData(fresh)
      setDraftMembers(fresh.members ?? [])
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
        render: (v: GlobalStatus | string | undefined) => renderStatusTag(v as string, t),
      },
      {
        title: t('notificationGroup.table.createdAt'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 170,
        render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
      },
      {
        title: t('notificationGroup.table.updatedAt'),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 170,
        render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
      },
      {
        title: t('table.action'),
        key: 'action',
        width: 240,
        fixed: 'right',
        align: 'center',
        render: (_, record) => {
          const isEnabled = record.status === GlobalStatus.ENABLED
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
              label: isEnabled ? t('table.disable') : t('table.enable'),
              onClick: () =>
                modal.confirm({
                  title: t('notificationGroup.confirm.status.title', {
                    action: isEnabled ? t('table.disable') : t('table.enable'),
                  }),
                  content: t('notificationGroup.confirm.status.content', {
                    action: isEnabled ? t('table.disable') : t('table.enable'),
                    name: record.name ?? record.uid ?? '',
                  }),
                  okText: t('common.ok'),
                  cancelText: t('common.cancel'),
                  onOk: () => handleStatusChange(record, isEnabled ? GlobalStatus.DISABLED : GlobalStatus.ENABLED),
                }),
            },
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
            <Space size="small">
              <Button type="link" size="small" onClick={() => handleSelectGroup(record)} disabled={!record.uid}>
                {t('common.detail')}
              </Button>
              <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                <Button type="link" size="small">
                  {t('common.more')}
                </Button>
              </Dropdown>
            </Space>
          )
        },
      },
    ],
    [modal, pagination.current, pagination.pageSize, t, upsertData],
  )

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <PageContent className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <Space size="middle" wrap>
              <span>{t('table.search.keyword')}:</span>
              <Input
                placeholder={t('table.search.placeholder')}
                allowClear
                className="w-full min-w-[120px] sm:w-48 md:w-52"
                value={searchParams.keyword ?? ''}
                onChange={(e) => setSearchParams((prev) => ({ ...prev, keyword: e.target.value }))}
                onPressEnter={(e) => handleSearch({ keyword: (e.target as HTMLInputElement).value })}
              />
              <span>{t('table.search.status')}:</span>
              <Radio.Group
                value={searchParams.status}
                onChange={(e) => {
                  setSearchParams((prev) => ({ ...prev, status: e.target.value }))
                }}
                buttonStyle="solid"
              >
                <Radio.Button value={undefined}>{t('table.search.all')}</Radio.Button>
                <Radio.Button value={GlobalStatus.ENABLED}>{t('table.search.enabled')}</Radio.Button>
                <Radio.Button value={GlobalStatus.DISABLED}>{t('table.search.disabled')}</Radio.Button>
              </Radio.Group>
              <Button onClick={() => handleSearch()} type="primary">
                {t('common.search')}
              </Button>
              <Button onClick={handleReset}>{t('common.reset')}</Button>
            </Space>
            <Button type="primary" onClick={openCreateModal} icon={<PlusOutlined />}>
              {t('common.add')}
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey="uid"
            loading={loading}
            size="small"
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
          setDraftMembers([])
        }}
        footer={
          <Space>
            <Button
              onClick={() => {
                setDetailViewOpen(false)
                setSubscriptionViewOpen(true)
              }}
              disabled={!detailData}
              type="primary"
            >
              {t('notificationGroup.subscription.action.addMember')}
            </Button>
            <Button
              onClick={() => {
                setDetailViewOpen(false)
                setSelectedUid(null)
                setDetailData(null)
                setDraftMembers([])
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
            <Spin size="large" />
          </div>
        ) : detailData ? (
          <Descriptions
            column={1}
            bordered
            size="small"
            styles={{ label: { width: 140, minWidth: 140 } }}
          >
            <Descriptions.Item label={t('notificationGroup.detail.uid')}>{emptyPlaceholder(detailData.uid)}</Descriptions.Item>
            <Descriptions.Item label={t('notificationGroup.detail.name')}>{emptyPlaceholder(detailData.name)}</Descriptions.Item>
            <Descriptions.Item label={t('notificationGroup.detail.status')}>{renderStatusTag(detailData.status, t)}</Descriptions.Item>
            <Descriptions.Item label={t('notificationGroup.detail.remark')}>{emptyPlaceholder(detailData.remark)}</Descriptions.Item>
            <Descriptions.Item label={t('notificationGroup.detail.createdAt')}>
              {detailData.createdAt ? dayjs(detailData.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('notificationGroup.detail.updatedAt')}>
              {detailData.updatedAt ? dayjs(detailData.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('notificationGroup.detail.metadata')}>
              {detailData.metadata && Object.keys(detailData.metadata).length > 0 ? (
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {JSON.stringify(detailData.metadata, null, 2)}
                </pre>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('notificationGroup.tab.subscription')}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(detailData.members ?? []).map((m, idx) => (
                  <Tag key={`${m.memberUid ?? 'm'}-${idx}`}>{m.memberUid ?? '-'}</Tag>
                ))}
                {(detailData.members ?? []).length === 0 ? '-' : null}
              </div>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>{t('common.noData')}</div>
        )}
      </Modal>

      <Modal
        title={t('notificationGroup.tab.subscription')}
        open={subscriptionViewOpen}
        onCancel={() => {
          setSubscriptionViewOpen(false)
          setSelectedUid(null)
          setDetailData(null)
          setDraftMembers([])
          setMemberModalOpen(false)
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
                setDraftMembers([])
                setMemberModalOpen(false)
              }}
            >
              {t('common.close')}
            </Button>
            <Button
              type="primary"
              loading={memberSaving}
              onClick={handleSaveSubscription}
              disabled={!detailData}
            >
              {t('notificationGroup.subscription.action.save')}
            </Button>
          </Space>
        }
      >
        <div className="flex justify-between items-center mb-3">
          <div style={{ fontWeight: 600 }}>{t('notificationGroup.tab.subscription')}</div>
          <Button
            type="primary"
            onClick={() => setMemberModalOpen(true)}
            disabled={!selectedUid}
          >
            {t('notificationGroup.subscription.action.addMember')}
          </Button>
        </div>

        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <NotificationMemberSubscriptionTable
            members={draftMembers}
            onRemove={(uid) => uid && handleRemoveMember(uid)}
          />
        )}

        <div className="flex justify-end mt-4 gap-2">
          <Button
            onClick={() => setDraftMembers(detailData?.members ?? [])}
            disabled={!detailData || memberSaving}
          >
            {t('common.reset')}
          </Button>
        </div>
      </Modal>

      <NotificationMemberSelectModal
        open={memberModalOpen}
        onCancel={() => setMemberModalOpen(false)}
        existingMemberUids={existingMemberUids}
        onConfirm={(item) => handleAddMemberConfirm(item)}
      />
    </div>
  )
}

export default function NotificationGroupListWrapper() {
  return (
    <App className="h-full">
      <NotificationGroupPage />
    </App>
  )
}

