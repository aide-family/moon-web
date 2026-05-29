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
import RecipientGroupDetailForm from './components/DetailForm'
import PageContent from '@/components/layout/PageContent'
import { useLocale } from '@/contexts/LocaleContext'
import { MENU_DIVIDER } from '@/utils/menu'
import { emptyPlaceholder, renderStatusTag } from '@/utils/marksman'
import { GlobalStatus } from '@/api/common/types'
import {
  deleteRecipientGroup,
  getRecipientGroupDetail,
  getRecipientGroupList,
  updateRecipientGroupStatus,
  type RecipientGroupItem,
  type RecipientGroupListParams,
} from '@/api/rabbit/recipient-group'
import { usePaginatedRequest } from '@/utils/hooks/usePaginatedRequest'
import { useDetailRequest } from '@/utils/hooks/useDetailRequest'

type RecipientGroupListQuery = Omit<
  RecipientGroupListParams,
  'page' | 'pageSize'
>

const { Text } = Typography

const defaultSearchParams: RecipientGroupListQuery = {
  keyword: '',
  status: undefined,
}

function RecipientGroupsContent() {
  const { modal, message } = App.useApp()
  const { t } = useLocale()

  const [searchParams, setSearchParams] =
    useState<RecipientGroupListQuery>(defaultSearchParams)
  const list = usePaginatedRequest<RecipientGroupItem, RecipientGroupListQuery>(
    {
      service: (params) =>
        getRecipientGroupList({
          ...params,
          keyword: params.keyword || undefined,
        }),
      defaultQuery: defaultSearchParams,
    },
  )
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
  } = useDetailRequest(getRecipientGroupDetail, detailUid, detailOpen)

  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingData, setEditingData] = useState<RecipientGroupItem | null>(
    null,
  )
  const { runAsync: fetchEditDetail, loading: formLoading } = useRequest(
    (uid: string) => getRecipientGroupDetail(uid),
    { manual: true },
  )

  const openCreateModal = () => {
    setFormMode('create')
    setEditingData(null)
    setDetailFormOpen(true)
  }

  const openEditModal = useMemoizedFn(async (record: RecipientGroupItem) => {
    if (!record.uid) return
    setFormMode('edit')
    setEditingData(null)
    setDetailFormOpen(true)
    try {
      const detail = await fetchEditDetail(record.uid)
      setEditingData(detail)
    } catch (error) {
      console.error('获取收件人组详情失败:', error)
      setDetailFormOpen(false)
    }
  })

  const openDetailModal = useMemoizedFn((record: RecipientGroupItem) => {
    if (!record.uid) return
    setDetailUid(record.uid)
    setDetailOpen(true)
  })

  const handleSearch = useMemoizedFn(
    (override?: Partial<RecipientGroupListQuery>) => {
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

  const handleDelete = async (record: RecipientGroupItem) => {
    if (!record.uid) return
    await deleteRecipientGroup(record.uid)
    message.success(t('message.delete.success'))
    refresh()
  }

  const handleStatusChange = async (
    record: RecipientGroupItem,
    status: GlobalStatus,
  ) => {
    if (!record.uid) return
    await updateRecipientGroupStatus({ uid: record.uid, status })
    message.success(t('message.update.success'))
    refresh()
    if (detailData?.uid === record.uid) {
      mutateDetailData((prev) => (prev ? { ...prev, status } : prev))
    }
  }

  const columns: ColumnsType<RecipientGroupItem> = [
    {
      title: t('recipientGroup.table.uid'),
      dataIndex: 'uid',
      key: 'uid',
      width: 160,
      render: emptyPlaceholder,
    },
    {
      title: t('recipientGroup.table.name'),
      dataIndex: 'name',
      key: 'name',
      minWidth: 180,
      render: emptyPlaceholder,
    },
    {
      title: t('recipientGroup.table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: GlobalStatus) => renderStatusTag(status, t),
    },
    {
      title: t('recipientGroup.table.metadata'),
      key: 'metadata',
      minWidth: 220,
      render: (_, record) => {
        const entries = Object.entries(record.metadata ?? {})
        return entries.length > 0 ? (
          <Space size={[4, 4]} wrap>
            {entries.slice(0, 3).map(([key, value]) => (
              <Tag key={key}>{`${key}=${value}`}</Tag>
            ))}
          </Space>
        ) : (
          '-'
        )
      },
    },
    {
      title: t('recipientGroup.table.templates'),
      key: 'templates',
      width: 120,
      align: 'center',
      render: (_, record) => record.templates?.length ?? 0,
    },
    {
      title: t('recipientGroup.table.emailConfigs'),
      key: 'emailConfigs',
      width: 120,
      align: 'center',
      render: (_, record) => record.emailConfigs?.length ?? 0,
    },
    {
      title: t('recipientGroup.table.webhookConfigs'),
      key: 'webhookConfigs',
      width: 140,
      align: 'center',
      render: (_, record) => record.webhookConfigs?.length ?? 0,
    },
    {
      title: t('recipientGroup.table.members'),
      key: 'members',
      width: 100,
      align: 'center',
      render: (_, record) => record.members?.length ?? 0,
    },
    {
      title: t('recipientGroup.table.updatedAt'),
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
                title: t('recipientGroup.confirm.status.title', {
                  action: actionText,
                }),
                content: t('recipientGroup.confirm.status.content', {
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
                title: t('recipientGroup.confirm.delete.title'),
                content: t('recipientGroup.confirm.delete.content', {
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

        <Table<RecipientGroupItem>
          rowKey='uid'
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
          }}
          onChange={(page) => changePage(page.current!, page.pageSize!)}
        />
      </div>

      <RecipientGroupDetailForm
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
        title={t('recipientGroup.modal.detail.title')}
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
        width={860}
        destroyOnHidden
      >
        {detailLoading ? null : detailData ? (
          <Descriptions
            column={1}
            bordered
            size='small'
            styles={{ label: { width: 180, minWidth: 180 } }}
          >
            <Descriptions.Item label={t('recipientGroup.detail.uid')}>
              <Space>
                <span>{emptyPlaceholder(detailData.uid)}</span>
                <CopyButton copyValue={detailData.uid} />
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t('recipientGroup.detail.name')}>
              {emptyPlaceholder(detailData.name)}
            </Descriptions.Item>
            <Descriptions.Item label={t('recipientGroup.detail.status')}>
              {renderStatusTag(detailData.status, t)}
            </Descriptions.Item>
            <Descriptions.Item label={t('recipientGroup.detail.metadata')}>
              {detailData.metadata &&
              Object.keys(detailData.metadata).length > 0 ? (
                <div className='flex flex-col gap-2'>
                  <Space wrap size={[4, 4]}>
                    {Object.entries(detailData.metadata).map(([key, value]) => (
                      <Tag key={key}>{`${key}=${value}`}</Tag>
                    ))}
                  </Space>
                  <CopyButton
                    copyValue={formatRecordJson(detailData.metadata)}
                    className='self-start'
                  />
                </div>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('recipientGroup.detail.templates')}>
              <Space wrap>
                {(detailData.templates ?? []).length > 0
                  ? detailData.templates?.map((item) => (
                      <Tag key={item.uid}>{item.name || item.uid}</Tag>
                    ))
                  : '-'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t('recipientGroup.detail.emailConfigs')}>
              <Space wrap>
                {(detailData.emailConfigs ?? []).length > 0
                  ? detailData.emailConfigs?.map((item) => (
                      <Tag key={item.uid}>{item.name || item.uid}</Tag>
                    ))
                  : '-'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item
              label={t('recipientGroup.detail.webhookConfigs')}
            >
              <Space wrap>
                {(detailData.webhookConfigs ?? []).length > 0
                  ? detailData.webhookConfigs?.map((item) => (
                      <Tag key={item.uid}>{item.name || item.uid}</Tag>
                    ))
                  : '-'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t('recipientGroup.detail.members')}>
              {(detailData.members ?? []).length > 0 ? (
                <div className='flex flex-col gap-2'>
                  {detailData.members?.map((member) => {
                    const channels = [
                      member.isEmail
                        ? t('recipientGroup.form.channel.email')
                        : null,
                      member.isSms
                        ? t('recipientGroup.form.channel.sms')
                        : null,
                      member.isPhone
                        ? t('recipientGroup.form.channel.phone')
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
            <Descriptions.Item label={t('recipientGroup.detail.updatedAt')}>
              {detailData.updatedAt
                ? dayjs(detailData.updatedAt).format('YYYY-MM-DD HH:mm:ss')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('recipientGroup.detail.createdAt')}>
              {detailData.createdAt
                ? dayjs(detailData.createdAt).format('YYYY-MM-DD HH:mm:ss')
                : '-'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Text>{t('common.noData')}</Text>
        )}
        {detailData ? (
          <div className='mt-3 text-xs text-(--ant-color-text-secondary)'>
            {t('recipientGroup.detail.tip', {
              templates: String(detailData.templates?.length ?? 0),
              emails: String(detailData.emailConfigs?.length ?? 0),
              webhooks: String(detailData.webhookConfigs?.length ?? 0),
              members: String(detailData.members?.length ?? 0),
            })}
          </div>
        ) : null}
      </Modal>
    </>
  )
}

export default function RecipientGroupsPage() {
  return (
    <App className='h-full'>
      <PageContent>
        <RecipientGroupsContent />
      </PageContent>
    </App>
  )
}
