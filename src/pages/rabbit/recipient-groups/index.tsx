import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  App,
  Avatar,
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
import { formatRecordJson } from '@/components/KeyValueEditor'
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
import { getTemplateSelectList } from '@/api/rabbit/template'
import { getEmailConfigSelectList } from '@/api/rabbit/email'
import { getWebhookConfigSelectList } from '@/api/rabbit/webhook'
import { selectMembers } from '@/api/account/member'
import { MemberStatus } from '@/api/account/member'

const { Text } = Typography

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  tooltip?: string
}

const defaultSearchParams: RecipientGroupListParams = {
  keyword: '',
  status: undefined,
}

const toSelectOptions = (
  items?: Array<{
    value?: string
    label?: string
    disabled?: boolean
    tooltip?: string
  }>,
): SelectOption[] =>
  (items ?? [])
    .filter((item) => Boolean(item.value))
    .map((item) => ({
      value: item.value!,
      label: item.label ?? item.value!,
      disabled: item.disabled,
      tooltip: item.tooltip,
    }))

function RecipientGroupsContent() {
  const { modal, message } = App.useApp()
  const { t } = useLocale()

  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<RecipientGroupItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  })
  const [searchParams, setSearchParams] =
    useState<RecipientGroupListParams>(defaultSearchParams)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailData, setDetailData] = useState<RecipientGroupItem | null>(null)

  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [formLoading, setFormLoading] = useState(false)
  const [editingData, setEditingData] = useState<RecipientGroupItem | null>(
    null,
  )

  const [templateOptions, setTemplateOptions] = useState<SelectOption[]>([])
  const [emailOptions, setEmailOptions] = useState<SelectOption[]>([])
  const [webhookOptions, setWebhookOptions] = useState<SelectOption[]>([])
  const [memberOptions, setMemberOptions] = useState<SelectOption[]>([])
  const paginationRef = useRef(pagination)
  paginationRef.current = pagination

  const optionLabelMap = useMemo(() => {
    const map = new Map<string, string>()
    ;[
      ...templateOptions,
      ...emailOptions,
      ...webhookOptions,
      ...memberOptions,
    ].forEach((item) => map.set(item.value, item.label))
    return map
  }, [emailOptions, memberOptions, templateOptions, webhookOptions])

  const loadOptions = useCallback(async () => {
    const [templateRes, emailRes, webhookRes, memberRes] = await Promise.all([
      getTemplateSelectList({ limit: 100, status: GlobalStatus.ENABLED }),
      getEmailConfigSelectList({ limit: 100, status: GlobalStatus.ENABLED }),
      getWebhookConfigSelectList({ limit: 100, status: GlobalStatus.ENABLED }),
      selectMembers({ limit: 100, status: MemberStatus.JOINED }),
    ])
    setTemplateOptions(toSelectOptions(templateRes.items))
    setEmailOptions(toSelectOptions(emailRes.items))
    setWebhookOptions(toSelectOptions(webhookRes.items))
    setMemberOptions(toSelectOptions(memberRes.items))
  }, [])

  const fetchData = useCallback(
    async (
      page?: number,
      pageSize?: number,
      override?: Partial<RecipientGroupListParams>,
    ) => {
      setLoading(true)
      try {
        const currentPagination = paginationRef.current
        const currentPage = page ?? currentPagination.current
        const currentPageSize = pageSize ?? currentPagination.pageSize
        const effective = override
          ? { ...searchParams, ...override }
          : searchParams
        const response = await getRecipientGroupList({
          page: currentPage,
          pageSize: currentPageSize,
          keyword: effective.keyword || undefined,
          status: effective.status,
        })
        setDataSource(response.items ?? [])
        setPagination((prev) => ({
          ...prev,
          current: currentPage,
          pageSize: currentPageSize,
          total: parseInt(String(response.total ?? 0), 10),
        }))
      } catch (error) {
        console.error('获取收件人组列表失败:', error)
        setDataSource([])
      } finally {
        setLoading(false)
      }
    },
    [searchParams],
  )

  useEffect(() => {
    void fetchData(1, pagination.pageSize)
  }, [fetchData, pagination.pageSize])

  const openCreateModal = () => {
    setFormMode('create')
    setEditingData(null)
    setFormLoading(false)
    setDetailFormOpen(true)
  }

  const openEditModal = async (record: RecipientGroupItem) => {
    if (!record.uid) return
    setFormMode('edit')
    setEditingData(null)
    setFormLoading(true)
    setDetailFormOpen(true)
    try {
      const detail = await getRecipientGroupDetail(record.uid)
      setEditingData(detail)
    } catch (error) {
      console.error('获取收件人组详情失败:', error)
      setDetailFormOpen(false)
    } finally {
      setFormLoading(false)
    }
  }

  const openDetailModal = async (record: RecipientGroupItem) => {
    if (!record.uid) return
    setDetailOpen(true)
    setDetailLoading(true)
    setDetailData(null)
    try {
      await loadOptions()
      const detail = await getRecipientGroupDetail(record.uid)
      setDetailData(detail)
    } catch (error) {
      console.error('获取收件人组详情失败:', error)
      setDetailOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleSearch = (override?: Partial<RecipientGroupListParams>) => {
    if (override) {
      setSearchParams((prev) => ({ ...prev, ...override }))
    }
    void fetchData(1, pagination.pageSize, override)
  }

  const handleReset = () => {
    setSearchParams(defaultSearchParams)
    void fetchData(1, pagination.pageSize, defaultSearchParams)
  }

  const handleDelete = async (record: RecipientGroupItem) => {
    if (!record.uid) return
    await deleteRecipientGroup(record.uid)
    message.success(t('message.delete.success'))
    void fetchData()
  }

  const handleStatusChange = async (
    record: RecipientGroupItem,
    status: GlobalStatus,
  ) => {
    if (!record.uid) return
    await updateRecipientGroupStatus({ uid: record.uid, status })
    message.success(t('message.update.success'))
    void fetchData()
    if (detailData?.uid === record.uid) {
      setDetailData((prev) => (prev ? { ...prev, status } : prev))
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
            <Button type='link' onClick={() => void openDetailModal(record)}>
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
            onChange={(page) =>
              void fetchData(page.current, page.pageSize, searchParams)
            }
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
        onSuccess={() => void fetchData()}
      />

      <Modal
          title={t('recipientGroup.modal.detail.title')}
          open={detailOpen}
          onCancel={() => {
            setDetailOpen(false)
            setDetailData(null)
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
                      {Object.entries(detailData.metadata).map(
                        ([key, value]) => (
                          <Tag key={key}>{`${key}=${value}`}</Tag>
                        ),
                      )}
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
              <Descriptions.Item
                label={t('recipientGroup.detail.emailConfigs')}
              >
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
                    {detailData.members?.map((item) => (
                      <div key={item.uid} className='flex items-center gap-2'>
                        <Avatar size='small' src={item.avatar}>
                          {(item.name || item.email || item.uid || '?')
                            .slice(0, 1)
                            .toUpperCase()}
                        </Avatar>
                        <Space wrap size={[4, 4]}>
                          <Tag>{item.name || item.email || item.uid}</Tag>
                          {item.email ? (
                            <Tag color='blue'>{item.email}</Tag>
                          ) : null}
                          {item.phone ? (
                            <Tag color='gold'>{item.phone}</Tag>
                          ) : null}
                        </Space>
                      </div>
                    ))}
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
          {detailData?.members?.length ? (
            <div className='mt-3'>
              {detailData.members.map((member) => (
                <Tag key={member.uid}>
                  {optionLabelMap.get(member.uid ?? '') ||
                    member.name ||
                    member.email ||
                    member.uid}
                </Tag>
              ))}
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
