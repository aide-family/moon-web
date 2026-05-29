import { useState } from 'react'
import { useMemoizedFn, useRequest } from 'ahooks'
import {
  App,
  Button,
  Descriptions,
  Dropdown,
  Input,
  Modal,
  Radio,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import dayjs from 'dayjs'
import CopyButton from '@/components/CopyButton'
import { formatRecordJson } from '@/components/keyValueUtils'
import AlertSubscriptionDetailForm from './components/DetailForm'
import PageContent from '@/components/layout/PageContent'
import { useLocale } from '@/contexts/LocaleContext'
import { MENU_DIVIDER } from '@/utils/menu'
import { emptyPlaceholder, renderStatusTag } from '@/utils/marksman'
import { GlobalStatus } from '@/api/common/types'
import {
  deleteAlertSubscription,
  getAlertSubscriptionDetail,
  getAlertSubscriptionList,
  updateAlertSubscriptionStatus,
  type AlertSubscriptionItem,
  type ListAlertSubscriptionsParams,
} from '@/api/rabbit/alert'
import { usePaginatedRequest } from '@/utils/hooks/usePaginatedRequest'
import { useDetailRequest } from '@/utils/hooks/useDetailRequest'

type AlertSubscriptionListQuery = Omit<
  ListAlertSubscriptionsParams,
  'page' | 'pageSize'
>

const { Text } = Typography

const defaultSearchParams: AlertSubscriptionListQuery = {
  keyword: '',
  status: undefined,
}

const formatDirectConfigDisplay = (name?: string, uid?: string) => {
  if (name) return name
  if (!uid || uid === '0') return '-'
  return uid
}

function AlertSubscriptionsContent() {
  const { modal, message } = App.useApp()
  const { t } = useLocale()

  const [searchParams, setSearchParams] =
    useState<AlertSubscriptionListQuery>(defaultSearchParams)
  const list = usePaginatedRequest<
    AlertSubscriptionItem,
    AlertSubscriptionListQuery
  >({
    service: (params) =>
      getAlertSubscriptionList({
        ...params,
        keyword: params.keyword || undefined,
      }),
    defaultQuery: defaultSearchParams,
  })
  const {
    dataSource,
    loading,
    pagination,
    refresh,
    search,
    reset,
    changePage,
  } = list

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailUid, setDetailUid] = useState<string>()
  const {
    data: detailData,
    loading: detailLoading,
    mutate: mutateDetailData,
  } = useDetailRequest(getAlertSubscriptionDetail, detailUid, detailOpen)

  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingData, setEditingData] = useState<AlertSubscriptionItem | null>(
    null,
  )
  const { runAsync: fetchEditDetail, loading: formLoading } = useRequest(
    (uid: string) => getAlertSubscriptionDetail(uid),
    { manual: true },
  )

  const openCreateModal = () => {
    setFormMode('create')
    setEditingData(null)
    setDetailFormOpen(true)
  }

  const openEditModal = useMemoizedFn(async (record: AlertSubscriptionItem) => {
    if (!record.uid) return
    setFormMode('edit')
    setEditingData(null)
    setDetailFormOpen(true)
    try {
      const detail = await fetchEditDetail(record.uid)
      setEditingData(detail)
    } catch (error) {
      console.error('获取告警订阅详情失败:', error)
      setDetailFormOpen(false)
    }
  })

  const openDetailModal = useMemoizedFn((record: AlertSubscriptionItem) => {
    if (!record.uid) return
    setDetailUid(record.uid)
    setDetailOpen(true)
  })

  const handleSearch = useMemoizedFn(
    (override?: Partial<AlertSubscriptionListQuery>) => {
      if (override) {
        setSearchParams((prev) => ({ ...prev, ...override }))
      }
      const next = { ...searchParams, ...override }
      search({
        keyword: next.keyword || undefined,
        status: next.status,
      })
    },
  )

  const handleReset = useMemoizedFn(() => {
    setSearchParams(defaultSearchParams)
    reset(defaultSearchParams)
  })

  const handleDelete = async (record: AlertSubscriptionItem) => {
    if (!record.uid) return
    await deleteAlertSubscription(record.uid)
    message.success(t('message.delete.success'))
    refresh()
  }

  const handleStatusChange = async (
    record: AlertSubscriptionItem,
    status: GlobalStatus,
  ) => {
    if (!record.uid) return
    await updateAlertSubscriptionStatus({ uid: record.uid, status })
    message.success(t('message.update.success'))
    refresh()
    if (detailData?.uid === record.uid) {
      mutateDetailData((prev) => (prev ? { ...prev, status } : prev))
    }
  }

  const columns: ColumnsType<AlertSubscriptionItem> = [
    {
      title: t('alertSubscription.table.uid'),
      dataIndex: 'uid',
      key: 'uid',
      width: 160,
      render: emptyPlaceholder,
    },
    {
      title: t('alertSubscription.table.name'),
      dataIndex: 'name',
      key: 'name',
      minWidth: 180,
      render: emptyPlaceholder,
    },
    {
      title: t('alertSubscription.table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: GlobalStatus) => renderStatusTag(status, t),
    },
    {
      title: t('alertSubscription.table.remark'),
      dataIndex: 'remark',
      key: 'remark',
      minWidth: 180,
      render: emptyPlaceholder,
    },
    {
      title: t('alertSubscription.table.recipientGroups'),
      key: 'recipientGroupUids',
      width: 140,
      align: 'center',
      render: (_, record) => record.recipientGroupUids?.length ?? 0,
    },
    {
      title: t('alertSubscription.table.members'),
      key: 'members',
      width: 100,
      align: 'center',
      render: (_, record) => record.members?.length ?? 0,
    },
    {
      title: t('alertSubscription.table.labels'),
      key: 'labels',
      minWidth: 220,
      render: (_, record) => {
        const entries = Object.entries(record.labels ?? {})
        return entries.length > 0 ? (
          <Space size={[4, 4]} wrap>
            {entries.slice(0, 4).map(([key, value]) => (
              <Tag key={key}>{`${key}=${value}`}</Tag>
            ))}
          </Space>
        ) : (
          '-'
        )
      },
    },
    {
      title: t('alertSubscription.table.excludeLabels'),
      key: 'excludeLabels',
      minWidth: 220,
      render: (_, record) => {
        const entries = Object.entries(record.excludeLabels ?? {})
        return entries.length > 0 ? (
          <Space size={[4, 4]} wrap>
            {entries.slice(0, 3).map(([key, value]) => (
              <Tag key={key} color='orange'>{`${key}=${value}`}</Tag>
            ))}
          </Space>
        ) : (
          '-'
        )
      },
    },
    {
      title: t('alertSubscription.table.directEmailConfig'),
      key: 'directMemberEmailConfigUid',
      minWidth: 180,
      render: (_, record) =>
        formatDirectConfigDisplay(
          record.directMemberEmailConfig?.name,
          record.directMemberEmailConfigUid,
        ),
    },
    {
      title: t('alertSubscription.table.directTemplate'),
      key: 'directMemberTemplateUid',
      minWidth: 180,
      render: (_, record) =>
        formatDirectConfigDisplay(
          record.directMemberTemplate?.name,
          record.directMemberTemplateUid,
        ),
    },
    {
      title: t('alertSubscription.table.updatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (value?: string) =>
        value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: t('table.action'),
      key: 'action',
      width: 140,
      fixed: 'right',
      align: 'center',
      render: (_, record) => {
        const isEnabled = record.status === GlobalStatus.ENABLED
        const actionText = isEnabled
          ? t(`common.status.${GlobalStatus.DISABLED}`)
          : t(`common.status.${GlobalStatus.ENABLED}`)
        const menuItems: MenuProps['items'] = [
          {
            key: 'edit',
            label: t('common.edit'),
            onClick: () => void openEditModal(record),
          },
          {
            key: 'status',
            label: actionText,
            onClick: () =>
              modal.confirm({
                title: t('alertSubscription.confirm.status.title', {
                  action: actionText,
                }),
                content: t('alertSubscription.confirm.status.content', {
                  action: actionText,
                  name: record.name ?? record.uid ?? '',
                }),
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
            onClick: () =>
              modal.confirm({
                title: t('alertSubscription.confirm.delete.title'),
                content: t('alertSubscription.confirm.delete.content', {
                  name: record.name ?? record.uid ?? '',
                }),
                onOk: () => handleDelete(record),
              }),
          },
        ]
        return (
          <Space size='small'>
            <Button type='link' onClick={() => openDetailModal(record)}>
              {t('common.detail')}
            </Button>
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button type='link'>{t('common.more')}</Button>
            </Dropdown>
          </Space>
        )
      },
    },
  ]

  return (
    <>
      <div className='flex flex-col gap-4 h-full'>
        <div className='flex items-center justify-between gap-3'>
          <Space wrap>
            <Input
              value={searchParams.keyword}
              placeholder={t('table.search.placeholder')}
              allowClear
              style={{ width: 240 }}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  keyword: e.target.value,
                }))
              }
              onPressEnter={() =>
                handleSearch({ keyword: searchParams.keyword ?? '' })
              }
            />
            <Radio.Group
              value={searchParams.status}
              onChange={(e) => handleSearch({ status: e.target.value })}
              optionType='button'
              buttonStyle='solid'
            >
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
            <Button
              type='primary'
              onClick={() =>
                handleSearch({ keyword: searchParams.keyword ?? '' })
              }
            >
              {t('common.search')}
            </Button>
            <Button onClick={handleReset}>{t('common.reset')}</Button>
          </Space>
          <Button type='primary' onClick={openCreateModal}>
            {t('common.add')}
          </Button>
        </div>

        <Table<AlertSubscriptionItem>
          rowKey='uid'
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: 1480 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
          }}
          onChange={(page) => changePage(page.current!, page.pageSize!)}
        />
      </div>

      <AlertSubscriptionDetailForm
        open={detailFormOpen}
        mode={formMode}
        initialData={editingData}
        formLoading={formLoading}
        onCancel={() => {
          setDetailFormOpen(false)
          setEditingData(null)
        }}
        onSuccess={() => refresh()}
      />

      <Modal
        title={t('alertSubscription.modal.detail.title')}
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false)
          setDetailUid(undefined)
        }}
        footer={
          <Button onClick={() => setDetailOpen(false)}>
            {t('common.close')}
          </Button>
        }
        width={900}
        destroyOnHidden
      >
        {detailLoading ? null : detailData ? (
          <Descriptions
            column={1}
            bordered
            size='small'
            styles={{ label: { width: 220, minWidth: 220 } }}
          >
            <Descriptions.Item label={t('alertSubscription.detail.uid')}>
              <Space>
                <span>{emptyPlaceholder(detailData.uid)}</span>
                <CopyButton copyValue={detailData.uid} />
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t('alertSubscription.detail.name')}>
              {emptyPlaceholder(detailData.name)}
            </Descriptions.Item>
            <Descriptions.Item label={t('alertSubscription.detail.status')}>
              {renderStatusTag(detailData.status ?? GlobalStatus.UNKNOWN, t)}
            </Descriptions.Item>
            <Descriptions.Item label={t('alertSubscription.detail.remark')}>
              {emptyPlaceholder(detailData.remark)}
            </Descriptions.Item>
            <Descriptions.Item label={t('alertSubscription.detail.labels')}>
              {detailData.labels &&
              Object.keys(detailData.labels).length > 0 ? (
                <div className='flex flex-col gap-2'>
                  <Space wrap size={[4, 4]}>
                    {Object.entries(detailData.labels).map(([key, value]) => (
                      <Tag key={key}>{`${key}=${value}`}</Tag>
                    ))}
                  </Space>
                  <CopyButton
                    copyValue={formatRecordJson(detailData.labels)}
                    className='self-start'
                  />
                </div>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item
              label={t('alertSubscription.detail.excludeLabels')}
            >
              {detailData.excludeLabels &&
              Object.keys(detailData.excludeLabels).length > 0 ? (
                <div className='flex flex-col gap-2'>
                  <Space wrap size={[4, 4]}>
                    {Object.entries(detailData.excludeLabels).map(
                      ([key, value]) => (
                        <Tag key={key} color='orange'>{`${key}=${value}`}</Tag>
                      ),
                    )}
                  </Space>
                  <CopyButton
                    copyValue={formatRecordJson(detailData.excludeLabels)}
                    className='self-start'
                  />
                </div>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item
              label={t('alertSubscription.detail.recipientGroups')}
            >
              <Space wrap>
                {(detailData.recipientGroups ?? []).length > 0
                  ? detailData.recipientGroups?.map((group) => (
                      <Tag key={group.uid}>{group.name || group.uid}</Tag>
                    ))
                  : (detailData.recipientGroupUids ?? []).length > 0
                    ? detailData.recipientGroupUids?.map((uid) => (
                        <Tag key={uid}>{uid}</Tag>
                      ))
                    : '-'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item
              label={t('alertSubscription.detail.directEmailConfig')}
            >
              {formatDirectConfigDisplay(
                detailData.directMemberEmailConfig?.name,
                detailData.directMemberEmailConfigUid,
              )}
            </Descriptions.Item>
            <Descriptions.Item
              label={t('alertSubscription.detail.directTemplate')}
            >
              {formatDirectConfigDisplay(
                detailData.directMemberTemplate?.name,
                detailData.directMemberTemplateUid,
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('alertSubscription.detail.members')}>
              {(detailData.members ?? []).length > 0 ? (
                <div className='flex flex-col gap-2'>
                  {detailData.members?.map((member) => {
                    const channels = [
                      member.isEmail
                        ? t('alertSubscription.form.channel.email')
                        : null,
                      member.isSms
                        ? t('alertSubscription.form.channel.sms')
                        : null,
                      member.isPhone
                        ? t('alertSubscription.form.channel.phone')
                        : null,
                    ].filter(Boolean)
                    const displayName =
                      member.memberName || member.memberUid || '-'
                    return (
                      <div key={`${member.memberUid}-${channels.join('-')}`}>
                        <Space wrap>
                          <span>{displayName}</span>
                          {channels.map((channel) => (
                            <Tag key={channel}>{channel}</Tag>
                          ))}
                        </Space>
                      </div>
                    )
                  })}
                </div>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('alertSubscription.detail.createdAt')}>
              {detailData.createdAt
                ? dayjs(detailData.createdAt).format('YYYY-MM-DD HH:mm:ss')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('alertSubscription.detail.updatedAt')}>
              {detailData.updatedAt
                ? dayjs(detailData.updatedAt).format('YYYY-MM-DD HH:mm:ss')
                : '-'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Text>{t('common.noData')}</Text>
        )}
      </Modal>
    </>
  )
}

export default function AlertSubscriptionsPage() {
  return (
    <App className='h-full'>
      <PageContent>
        <AlertSubscriptionsContent />
      </PageContent>
    </App>
  )
}
