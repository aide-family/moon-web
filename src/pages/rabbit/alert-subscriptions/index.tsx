import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  App,
  Button,
  Checkbox,
  Descriptions,
  Divider,
  Dropdown,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import dayjs from 'dayjs'
import CopyButton from '@/components/CopyButton'
import KeyValueEditor, {
  formatRecordJson,
  keyValueRowsToRecord,
  recordToKeyValueRows,
  type KeyValueRow,
} from '@/components/KeyValueEditor'
import PageContent from '@/components/layout/PageContent'
import { useLocale } from '@/contexts/LocaleContext'
import { MENU_DIVIDER } from '@/utils/menu'
import { emptyPlaceholder, renderStatusTag } from '@/utils/marksman'
import { GlobalStatus } from '@/api/common/types'
import {
  createAlertSubscription,
  deleteAlertSubscription,
  getAlertSubscriptionDetail,
  getAlertSubscriptionList,
  updateAlertSubscription,
  updateAlertSubscriptionStatus,
  type AlertSubscriptionItem,
  type AlertSubscriptionMemberRequest,
  type CreateAlertSubscriptionParams,
  type ListAlertSubscriptionsParams,
  type UpdateAlertSubscriptionParams,
} from '@/api/rabbit/alert'
import { getRecipientGroupSelectList } from '@/api/rabbit/recipient-group'
import { getEmailConfigSelectList } from '@/api/rabbit/email'
import { getTemplateSelectList } from '@/api/rabbit/template'
import { selectMembers } from '@/api/account/member'
import { MemberStatus } from '@/api/account/member'

const { Text } = Typography
const { TextArea } = Input

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  tooltip?: string
}

interface SubscriptionMemberFormValue {
  memberUid?: string
  isEmail?: boolean
  isSms?: boolean
  isPhone?: boolean
}

interface AlertSubscriptionFormValues {
  name?: string
  remark?: string
  labelsPairs?: KeyValueRow[]
  excludeLabelsPairs?: KeyValueRow[]
  recipientGroupUids?: string[]
  members?: SubscriptionMemberFormValue[]
  directMemberEmailConfigUid?: string
  directMemberTemplateUid?: string
}

const defaultSearchParams: ListAlertSubscriptionsParams = {
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

export default function AlertSubscriptionsPage() {
  const { modal, message } = App.useApp()
  const { t } = useLocale()
  const [form] = Form.useForm<AlertSubscriptionFormValues>()

  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<AlertSubscriptionItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  })
  const [searchParams, setSearchParams] =
    useState<ListAlertSubscriptionsParams>(defaultSearchParams)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailData, setDetailData] = useState<AlertSubscriptionItem | null>(
    null,
  )

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [formLoading, setFormLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingData, setEditingData] = useState<AlertSubscriptionItem | null>(
    null,
  )

  const [recipientGroupOptions, setRecipientGroupOptions] = useState<
    SelectOption[]
  >([])
  const [memberOptions, setMemberOptions] = useState<SelectOption[]>([])
  const [emailOptions, setEmailOptions] = useState<SelectOption[]>([])
  const [templateOptions, setTemplateOptions] = useState<SelectOption[]>([])
  const paginationRef = useRef(pagination)
  paginationRef.current = pagination
  const watchedMembers = Form.useWatch('members', form) ?? []

  const groupLabelMap = useMemo(() => {
    const map = new Map<string, string>()
    recipientGroupOptions.forEach((item) => map.set(item.value, item.label))
    return map
  }, [recipientGroupOptions])

  const memberLabelMap = useMemo(() => {
    const map = new Map<string, string>()
    memberOptions.forEach((item) => map.set(item.value, item.label))
    return map
  }, [memberOptions])

  const loadOptions = useCallback(async () => {
    const [groupRes, memberRes, emailRes, templateRes] = await Promise.all([
      getRecipientGroupSelectList({
        limit: 100,
        status: GlobalStatus.ENABLED,
      }),
      selectMembers({ limit: 100, status: MemberStatus.JOINED }),
      getEmailConfigSelectList({ limit: 100, status: GlobalStatus.ENABLED }),
      getTemplateSelectList({
        limit: 100,
        status: GlobalStatus.ENABLED,
      }),
    ])
    setRecipientGroupOptions(toSelectOptions(groupRes.items))
    setMemberOptions(toSelectOptions(memberRes.items))
    setEmailOptions(toSelectOptions(emailRes.items))
    setTemplateOptions(toSelectOptions(templateRes.items))
  }, [])

  const fetchData = useCallback(
    async (
      page?: number,
      pageSize?: number,
      override?: Partial<ListAlertSubscriptionsParams>,
    ) => {
      setLoading(true)
      try {
        const currentPagination = paginationRef.current
        const currentPage = page ?? currentPagination.current
        const currentPageSize = pageSize ?? currentPagination.pageSize
        const effective = override
          ? { ...searchParams, ...override }
          : searchParams
        const response = await getAlertSubscriptionList({
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
        console.error('获取告警订阅列表失败:', error)
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

  const openCreateModal = async () => {
    setFormMode('create')
    setEditingData(null)
    form.resetFields()
    form.setFieldsValue({
      labelsPairs: [],
      excludeLabelsPairs: [],
      members: [],
    })
    setFormOpen(true)
    await loadOptions()
  }

  const openEditModal = async (record: AlertSubscriptionItem) => {
    if (!record.uid) return
    setFormMode('edit')
    setFormLoading(true)
    setFormOpen(true)
    try {
      await loadOptions()
      const detail = await getAlertSubscriptionDetail(record.uid)
      setEditingData(detail)
      form.setFieldsValue({
        name: detail.name,
        remark: detail.remark,
        labelsPairs: recordToKeyValueRows(detail.labels),
        excludeLabelsPairs: recordToKeyValueRows(detail.excludeLabels),
        recipientGroupUids: detail.recipientGroupUids ?? [],
        directMemberEmailConfigUid: detail.directMemberEmailConfigUid,
        directMemberTemplateUid: detail.directMemberTemplateUid,
        members: (detail.members ?? []).map((item) => ({
          memberUid: item.memberUid,
          isEmail: item.isEmail,
          isSms: item.isSms,
          isPhone: item.isPhone,
        })),
      })
    } catch (error) {
      console.error('获取告警订阅详情失败:', error)
      setFormOpen(false)
    } finally {
      setFormLoading(false)
    }
  }

  const openDetailModal = async (record: AlertSubscriptionItem) => {
    if (!record.uid) return
    setDetailOpen(true)
    setDetailLoading(true)
    setDetailData(null)
    try {
      await loadOptions()
      const detail = await getAlertSubscriptionDetail(record.uid)
      setDetailData(detail)
    } catch (error) {
      console.error('获取告警订阅详情失败:', error)
      setDetailOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleSearch = (override?: Partial<ListAlertSubscriptionsParams>) => {
    if (override) {
      setSearchParams((prev) => ({ ...prev, ...override }))
    }
    void fetchData(1, pagination.pageSize, override)
  }

  const handleReset = () => {
    setSearchParams(defaultSearchParams)
    void fetchData(1, pagination.pageSize, defaultSearchParams)
  }

  const handleDelete = async (record: AlertSubscriptionItem) => {
    if (!record.uid) return
    await deleteAlertSubscription(record.uid)
    message.success(t('message.delete.success'))
    void fetchData()
  }

  const handleStatusChange = async (
    record: AlertSubscriptionItem,
    status: GlobalStatus,
  ) => {
    if (!record.uid) return
    await updateAlertSubscriptionStatus({ uid: record.uid, status })
    message.success(t('message.update.success'))
    void fetchData()
    if (detailData?.uid === record.uid) {
      setDetailData((prev) => (prev ? { ...prev, status } : prev))
    }
  }

  const normalizeMembers = (
    members?: SubscriptionMemberFormValue[],
  ): AlertSubscriptionMemberRequest[] => {
    return (members ?? [])
      .filter((item) => item.memberUid)
      .map((item) => ({
        memberUid: item.memberUid,
        isEmail: Boolean(item.isEmail),
        isSms: Boolean(item.isSms),
        isPhone: Boolean(item.isPhone),
      }))
      .filter((item) => item.isEmail || item.isSms || item.isPhone)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const members = normalizeMembers(values.members)
      const payload:
        | CreateAlertSubscriptionParams
        | UpdateAlertSubscriptionParams = {
        name: values.name?.trim(),
        remark: values.remark?.trim(),
        labels: keyValueRowsToRecord(values.labelsPairs),
        excludeLabels: keyValueRowsToRecord(values.excludeLabelsPairs),
        recipientGroupUids: values.recipientGroupUids ?? [],
        members,
        directMemberEmailConfigUid: values.directMemberEmailConfigUid,
        directMemberTemplateUid: values.directMemberTemplateUid,
      }

      setSubmitting(true)
      if (formMode === 'create') {
        await createAlertSubscription(payload)
        message.success(t('message.create.success'))
      } else if (editingData?.uid) {
        await updateAlertSubscription(editingData.uid, {
          ...payload,
          uid: editingData.uid,
        })
        message.success(t('message.update.success'))
      }
      setFormOpen(false)
      setEditingData(null)
      form.resetFields()
      void fetchData()
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) return
      console.error('保存告警订阅失败:', error)
      message.error(t('message.error'))
    } finally {
      setSubmitting(false)
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
        record.directMemberEmailConfigUid
          ? emailOptions.find(
              (item) => item.value === record.directMemberEmailConfigUid,
            )?.label || record.directMemberEmailConfigUid
          : '-',
    },
    {
      title: t('alertSubscription.table.directTemplate'),
      key: 'directMemberTemplateUid',
      minWidth: 180,
      render: (_, record) =>
        record.directMemberTemplateUid
          ? templateOptions.find(
              (item) => item.value === record.directMemberTemplateUid,
            )?.label || record.directMemberTemplateUid
          : '-',
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
    <App className='h-full'>
      <PageContent>
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
              <Button onClick={handleReset}>{t('common.reset')}</Button>
            </Space>
            <Button type='primary' onClick={() => void openCreateModal()}>
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
            onChange={(page) =>
              void fetchData(page.current, page.pageSize, searchParams)
            }
          />
        </div>

        <Modal
          title={
            formMode === 'create'
              ? t('alertSubscription.modal.create.title')
              : t('alertSubscription.modal.edit.title')
          }
          open={formOpen}
          onOk={() => void handleSubmit()}
          onCancel={() => {
            setFormOpen(false)
            setEditingData(null)
            form.resetFields()
          }}
          destroyOnHidden
          confirmLoading={submitting}
          okText={t('common.submit')}
          width={900}
        >
          <Form form={form} layout='vertical' preserve={false}>
            <Form.Item
              name='name'
              label={t('alertSubscription.form.name.label')}
              rules={[
                {
                  required: true,
                  message: t('alertSubscription.form.name.required'),
                },
              ]}
            >
              <Input
                placeholder={t('alertSubscription.form.name.placeholder')}
                maxLength={100}
                disabled={formLoading}
              />
            </Form.Item>

            <Form.Item
              name='remark'
              label={t('alertSubscription.form.remark.label')}
            >
              <TextArea
                rows={3}
                placeholder={t('alertSubscription.form.remark.placeholder')}
                disabled={formLoading}
              />
            </Form.Item>

            <Divider>{t('alertSubscription.form.filter.title')}</Divider>

            <KeyValueEditor
              name='labelsPairs'
              label={t('alertSubscription.form.labels.label')}
              extra={t('alertSubscription.form.labels.help')}
              disabled={formLoading}
            />

            <KeyValueEditor
              name='excludeLabelsPairs'
              label={t('alertSubscription.form.excludeLabels.label')}
              disabled={formLoading}
            />

            <Divider>{t('alertSubscription.form.delivery.title')}</Divider>

            <Form.Item
              name='recipientGroupUids'
              label={t('alertSubscription.form.recipientGroups.label')}
            >
              <Select
                mode='multiple'
                allowClear
                showSearch
                options={recipientGroupOptions}
                placeholder={t(
                  'alertSubscription.form.recipientGroups.placeholder',
                )}
                disabled={formLoading}
                optionFilterProp='label'
                maxTagCount='responsive'
              />
            </Form.Item>

            <Form.Item
              name='directMemberEmailConfigUid'
              label={t('alertSubscription.form.directEmailConfig.label')}
            >
              <Select
                allowClear
                showSearch
                options={emailOptions}
                placeholder={t(
                  'alertSubscription.form.directEmailConfig.placeholder',
                )}
                disabled={formLoading}
                optionFilterProp='label'
              />
            </Form.Item>

            <Form.Item
              name='directMemberTemplateUid'
              label={t('alertSubscription.form.directTemplate.label')}
            >
              <Select
                allowClear
                showSearch
                options={templateOptions}
                placeholder={t(
                  'alertSubscription.form.directTemplate.placeholder',
                )}
                disabled={formLoading}
                optionFilterProp='label'
              />
            </Form.Item>

            <Divider>{t('alertSubscription.form.members.title')}</Divider>

            <Form.List
              name='members'
              rules={[
                {
                  validator: async (
                    _,
                    members?: SubscriptionMemberFormValue[],
                  ) => {
                    const selected = (members ?? [])
                      .map((item) => item?.memberUid)
                      .filter((item): item is string => Boolean(item))
                    if (new Set(selected).size !== selected.length) {
                      throw new Error(
                        t('alertSubscription.form.member.duplicate'),
                      )
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <div className='flex flex-col gap-3'>
                  {fields.map((field) => (
                    <div
                      key={field.key}
                      className='rounded-md border border-(--ant-color-border-secondary) p-3'
                    >
                      <Space
                        wrap
                        align='start'
                        className='w-full justify-between'
                      >
                        <div className='grid grid-cols-1 md:grid-cols-4 gap-3 flex-1'>
                          <Form.Item
                            name={[field.name, 'memberUid']}
                            label={t('alertSubscription.form.member.label')}
                            rules={[
                              {
                                required: true,
                                message: t(
                                  'alertSubscription.form.member.required',
                                ),
                              },
                            ]}
                          >
                            <Select
                              showSearch
                              allowClear
                              options={memberOptions.map((item) => ({
                                ...item,
                                disabled:
                                  item.disabled ||
                                  watchedMembers.some(
                                    (member, index) =>
                                      index !== field.name &&
                                      member?.memberUid === item.value,
                                  ),
                              }))}
                              placeholder={t(
                                'alertSubscription.form.member.placeholder',
                              )}
                              disabled={formLoading}
                              optionFilterProp='label'
                            />
                          </Form.Item>
                          <Form.Item
                            name={[field.name, 'isEmail']}
                            valuePropName='checked'
                            label={t('alertSubscription.form.channel.email')}
                          >
                            <Checkbox disabled={formLoading}>
                              {t('alertSubscription.form.channel.email')}
                            </Checkbox>
                          </Form.Item>
                          <Form.Item
                            name={[field.name, 'isSms']}
                            valuePropName='checked'
                            label={t('alertSubscription.form.channel.sms')}
                          >
                            <Checkbox disabled={formLoading}>
                              {t('alertSubscription.form.channel.sms')}
                            </Checkbox>
                          </Form.Item>
                          <Form.Item
                            name={[field.name, 'isPhone']}
                            valuePropName='checked'
                            label={t('alertSubscription.form.channel.phone')}
                          >
                            <Checkbox disabled={formLoading}>
                              {t('alertSubscription.form.channel.phone')}
                            </Checkbox>
                          </Form.Item>
                        </div>
                        <Button danger onClick={() => remove(field.name)}>
                          {t('common.delete')}
                        </Button>
                      </Space>
                    </div>
                  ))}
                  <Button onClick={() => add()}>{t('common.add')}</Button>
                  <Form.ErrorList errors={errors} />
                </div>
              )}
            </Form.List>
          </Form>
        </Modal>

        <Modal
          title={t('alertSubscription.modal.detail.title')}
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
                          <Tag
                            key={key}
                            color='orange'
                          >{`${key}=${value}`}</Tag>
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
                  {(detailData.recipientGroupUids ?? []).length > 0
                    ? detailData.recipientGroupUids?.map((uid) => (
                        <Tag key={uid}>{groupLabelMap.get(uid) ?? uid}</Tag>
                      ))
                    : '-'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item
                label={t('alertSubscription.detail.directEmailConfig')}
              >
                {detailData.directMemberEmailConfigUid
                  ? emailOptions.find(
                      (item) =>
                        item.value === detailData.directMemberEmailConfigUid,
                    )?.label || detailData.directMemberEmailConfigUid
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item
                label={t('alertSubscription.detail.directTemplate')}
              >
                {detailData.directMemberTemplateUid
                  ? templateOptions.find(
                      (item) =>
                        item.value === detailData.directMemberTemplateUid,
                    )?.label || detailData.directMemberTemplateUid
                  : '-'}
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
                      return (
                        <div key={`${member.memberUid}-${channels.join('-')}`}>
                          <Space wrap>
                            <Tag color='blue'>
                              {member.memberName ||
                                member.memberEmail ||
                                memberLabelMap.get(member.memberUid ?? '') ||
                                member.memberUid}
                            </Tag>
                            {member.memberUid ? (
                              <CopyButton
                                copyValue={member.memberUid}
                                text={member.memberUid}
                              />
                            ) : null}
                            {channels.map((channel) => (
                              <Tag key={channel}>{channel}</Tag>
                            ))}
                            {member.memberEmail ? (
                              <Tag color='cyan'>{member.memberEmail}</Tag>
                            ) : null}
                            {member.memberPhone ? (
                              <Tag color='gold'>{member.memberPhone}</Tag>
                            ) : null}
                          </Space>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
              <Descriptions.Item
                label={t('alertSubscription.detail.createdAt')}
              >
                {detailData.createdAt
                  ? dayjs(detailData.createdAt).format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item
                label={t('alertSubscription.detail.updatedAt')}
              >
                {detailData.updatedAt
                  ? dayjs(detailData.updatedAt).format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Text>{t('common.noData')}</Text>
          )}
        </Modal>
      </PageContent>
    </App>
  )
}
