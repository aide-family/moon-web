import React, { useState, useRef, useEffect } from 'react'
import { useMemoizedFn, useSafeState } from 'ahooks'
import { useSearchParams } from 'react-router-dom'
import {
  Table,
  Input,
  InputNumber,
  Radio,
  Button,
  Space,
  message,
  Tag,
  Dropdown,
  App,
  Modal,
  Form,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import {
  listMembers,
  getMember,
  updateMemberStatus,
  dismissMember,
  inviteMember,
  MemberStatus,
  normalizeMemberStatus,
  type MemberItem,
  type ListMembersParams,
  type InviteMemberBody,
} from '@/api/account/member'
import dayjs from 'dayjs'
import MemberDetailView from './components/MemberDetailView'
import { useLocale } from '@/contexts/LocaleContext'
import PageContent from '@/components/layout/PageContent'
import { MENU_DIVIDER } from '@/utils/menu'
import { applySearchToUrl, getParam } from '@/utils/urlSearchParams'
import { usePaginatedRequest } from '@/utils/hooks/usePaginatedRequest'
import { useDetailRequest } from '@/utils/hooks/useDetailRequest'
import { useAdaptiveTableHeight } from '@/utils/hooks/useAdaptiveTableHeight'

const defaultSearchParams: ListMembersParams = {
  keyword: '',
  email: '',
  status: undefined,
}

type MembersListQuery = Omit<ListMembersParams, 'page' | 'pageSize'>

function toListQuery(params: ListMembersParams): MembersListQuery {
  return {
    keyword: params.keyword ?? '',
    email: params.email ?? '',
    status: params.status,
  }
}

function parseSearchParamsFromUrl(params: URLSearchParams): ListMembersParams {
  const statusParam = getParam(params, 'status')
  return {
    keyword: getParam(params, 'keyword') ?? '',
    email: getParam(params, 'email') ?? '',
    status:
      statusParam !== undefined && statusParam !== '' ? statusParam : undefined,
  }
}

const STATUS_OPTIONS: { value: MemberStatus; labelKey: string }[] = [
  { value: MemberStatus.JOINED, labelKey: 'member.status.JOINED' },
  { value: MemberStatus.INVITED, labelKey: 'member.status.INVITED' },
  { value: MemberStatus.EXPIRED, labelKey: 'member.status.EXPIRED' },
]

const MembersList: React.FC = () => {
  const { modal } = App.useApp()
  const { t } = useLocale()
  const [urlSearchParams, setUrlSearchParams] = useSearchParams()
  const [searchParams, setSearchParams] = useState<ListMembersParams>(() =>
    parseSearchParamsFromUrl(urlSearchParams),
  )
  const { tableContainerRef, tableWrapperRef, tableHeight } =
    useAdaptiveTableHeight()
  const [detailOpen, setDetailOpen] = useState(false)
  const [viewingUid, setViewingUid] = useState<string>()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteSubmitting, setInviteSubmitting] = useSafeState(false)
  const [inviteForm] = Form.useForm<InviteMemberBody>()
  const skipAutoSearchRef = useRef(true)

  const list = usePaginatedRequest<MemberItem, MembersListQuery>({
    service: ({ page, pageSize, keyword, email, status }) =>
      listMembers({
        page,
        pageSize,
        keyword: keyword || undefined,
        email: email || undefined,
        status,
      }),
    defaultQuery: toListQuery(parseSearchParamsFromUrl(urlSearchParams)),
  })

  const {
    data: viewingData,
    mutate: mutateDetail,
  } = useDetailRequest(getMember, viewingUid, detailOpen)

  const getStatusInfo = (status?: string) => {
    const s = normalizeMemberStatus(status)
    const map: Record<MemberStatus, { textKey: string; color: string }> = {
      [MemberStatus.MemberStatus_UNKNOWN]: {
        textKey: 'member.status.MemberStatus_UNKNOWN',
        color: 'default',
      },
      [MemberStatus.JOINED]: {
        textKey: 'member.status.JOINED',
        color: 'success',
      },
      [MemberStatus.INVITED]: {
        textKey: 'member.status.INVITED',
        color: 'processing',
      },
      [MemberStatus.EXPIRED]: {
        textKey: 'member.status.EXPIRED',
        color: 'warning',
      },
    }
    const info = map[s]
    return { text: t(info.textKey), color: info.color }
  }

  useEffect(() => {
    setSearchParams(parseSearchParamsFromUrl(urlSearchParams))
  }, [urlSearchParams])

  useEffect(() => {
    applySearchToUrl(
      setUrlSearchParams,
      {
        keyword: searchParams.keyword,
        email: searchParams.email,
        status: searchParams.status,
      },
      { replace: true },
    )
  }, [
    searchParams.keyword,
    searchParams.email,
    searchParams.status,
    setUrlSearchParams,
  ])

  const handleSearch = useMemoizedFn((override?: Partial<ListMembersParams>) => {
    if (override) {
      setSearchParams((prev) => ({ ...prev, ...override }))
    }
    list.search(
      toListQuery({
        ...searchParams,
        ...override,
      }),
    )
  })

  const handleReset = useMemoizedFn(() => {
    setSearchParams(defaultSearchParams)
    setUrlSearchParams({})
    list.reset(toListQuery(defaultSearchParams))
  })

  const handleTableChange = useMemoizedFn((page: number, pageSize: number) => {
    list.changePage(page, pageSize)
  })

  const handleViewDetail = useMemoizedFn((record: MemberItem) => {
    if (!record.uid) return
    setViewingUid(record.uid)
    setDetailOpen(true)
  })

  const handleUpdateStatus = (record: MemberItem, newStatus: MemberStatus) => {
    if (!record.uid) return
    const name =
      record.name || record.nickname || record.email || record.uid || ''
    const statusText = t(
      STATUS_OPTIONS.find((o) => o.value === newStatus)?.labelKey ?? '',
    )
    modal.confirm({
      title: t('member.action.updateStatus'),
      content:
        t('common.confirm') + `：将 "${name}" 状态更新为 ${statusText}？`,
      okText: t('common.ok'),
      cancelText: t('common.cancel'),
      onOk: () => doUpdateStatus(record.uid!, newStatus),
    })
  }

  const doUpdateStatus = async (uid: string, newStatus: MemberStatus) => {
    try {
      await updateMemberStatus({ uid, status: newStatus })
      message.success(t('message.update.success'))
      list.refresh()
      if (detailOpen && viewingData?.uid === uid) {
        mutateDetail((prev) => (prev ? { ...prev, status: newStatus } : prev))
      }
    } catch (error) {
      console.error('更新状态失败:', error)
    }
  }

  const handleDismiss = (record: MemberItem) => {
    const name =
      record.name || record.nickname || record.email || record.uid || ''
    modal.confirm({
      title: t('member.confirm.dismiss.title'),
      content: t('member.confirm.dismiss.content', { name }),
      okText: t('common.ok'),
      cancelText: t('common.cancel'),
      onOk: () => doDismiss(record.uid!),
    })
  }

  const doDismiss = async (uid: string) => {
    try {
      await dismissMember(uid)
      message.success(t('message.update.success'))
      list.refresh()
      if (detailOpen && viewingData?.uid === uid) {
        setDetailOpen(false)
        setViewingUid(undefined)
      }
    } catch (error) {
      console.error('移除成员失败:', error)
    }
  }

  const handleInviteOk = async () => {
    try {
      const values = await inviteForm.validateFields()
      setInviteSubmitting(true)
      await inviteMember({ email: values.email, role: values.role ?? 0 })
      message.success(t('message.create.success'))
      setInviteOpen(false)
      inviteForm.resetFields()
      list.refresh()
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return
      console.error('邀请失败:', e)
    } finally {
      setInviteSubmitting(false)
    }
  }

  const emptyPlaceholder = (text: unknown) =>
    text == null || text === '' ? '-' : text

  const columns: ColumnsType<MemberItem> = [
    {
      title: t('member.table.uid'),
      dataIndex: 'uid',
      key: 'uid',
      width: 160,
      ellipsis: true,
      render: (txt) => emptyPlaceholder(txt),
    },
    {
      title: t('member.table.email'),
      dataIndex: 'email',
      key: 'email',
      minWidth: 160,
      ellipsis: true,
      render: (txt) => emptyPlaceholder(txt),
    },
    {
      title: t('member.table.name'),
      dataIndex: 'name',
      key: 'name',
      minWidth: 100,
      render: (txt) => emptyPlaceholder(txt),
    },
    {
      title: t('member.table.nickname'),
      dataIndex: 'nickname',
      key: 'nickname',
      minWidth: 100,
      render: (txt) => emptyPlaceholder(txt),
    },
    {
      title: t('member.table.phone'),
      dataIndex: 'phone',
      key: 'phone',
      minWidth: 120,
      render: (txt) => emptyPlaceholder(txt),
    },
    {
      title: t('member.table.status'),
      dataIndex: 'status',
      key: 'status',
      minWidth: 90,
      align: 'center',
      render: (status: string) => {
        const info = getStatusInfo(status)
        return <Tag color={info.color}>{info.text}</Tag>
      },
    },
    {
      title: t('member.table.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      minWidth: 160,
      render: (text: string) =>
        text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: t('table.action'),
      key: 'action',
      width: 140,
      fixed: 'right',
      align: 'center',
      render: (_, record) => {
        const currentStatus = normalizeMemberStatus(record.status)
        const menuItems: MenuProps['items'] = [
          ...STATUS_OPTIONS.map((opt) => ({
            key: `status-${opt.value}`,
            label: t(opt.labelKey),
            onClick: () => handleUpdateStatus(record, opt.value),
            disabled: currentStatus === opt.value,
          })),
          MENU_DIVIDER,
          {
            key: 'dismiss',
            label: t('member.action.dismiss'),
            danger: true,
            onClick: () => handleDismiss(record),
          },
        ]
        return (
          <Space size='small'>
            <Button
              type='link'
              size='small'
              onClick={() => handleViewDetail(record)}
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

  useEffect(() => {
    if (skipAutoSearchRef.current) {
      skipAutoSearchRef.current = false
      return
    }
    list.search(toListQuery(searchParams))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.status])

  return (
    <div className='h-full flex flex-col'>
      <div className='mb-4 flex justify-between items-start shrink-0'>
        <Space size='middle' wrap>
          <span>{t('table.search.keyword')}:</span>
          <Input
            placeholder={t('table.search.placeholder')}
            allowClear
            className='w-full min-w-[120px] sm:w-48 md:w-52'
            value={searchParams.keyword ?? ''}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, keyword: e.target.value }))
            }
            onPressEnter={(e) =>
              handleSearch({ keyword: (e.target as HTMLInputElement).value })
            }
          />
          <span>{t('member.search.email')}:</span>
          <Input
            placeholder={t('table.search.placeholder')}
            allowClear
            className='w-full min-w-[120px] sm:w-48'
            value={searchParams.email ?? ''}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, email: e.target.value }))
            }
            onPressEnter={(e) =>
              handleSearch({ email: (e.target as HTMLInputElement).value })
            }
          />
          <span>{t('common.status')}:</span>
          <Radio.Group
            value={searchParams.status}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, status: e.target.value }))
            }
            buttonStyle='solid'
          >
            <Radio.Button value={undefined}>
              {t('table.search.all')}
            </Radio.Button>
            {STATUS_OPTIONS.map((opt) => (
              <Radio.Button key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </Radio.Button>
            ))}
          </Radio.Group>
          <Button onClick={() => handleSearch()} type='primary'>
            {t('common.search')}
          </Button>
          <Button onClick={handleReset}>{t('common.reset')}</Button>
        </Space>
        <Button type='primary' onClick={() => setInviteOpen(true)}>
          {t('member.action.invite')}
        </Button>
      </div>
      <div
        ref={tableContainerRef}
        className='flex-1 flex overflow-hidden flex-col'
        style={{ minHeight: 0 }}
      >
        <div ref={tableWrapperRef} className='h-full flex flex-col flex-1'>
          <Table
            columns={columns}
            dataSource={list.dataSource}
            rowKey='uid'
            loading={list.loading}
            size='small'
            scroll={{ y: tableHeight }}
            pagination={{
              current: list.pagination.current,
              pageSize: list.pagination.pageSize,
              total: list.pagination.total,
              showSizeChanger: true,
              showTotal: (total) => t('table.total', { total }),
              onChange: handleTableChange,
              onShowSizeChange: handleTableChange,
            }}
          />
        </div>
      </div>
      <MemberDetailView
        open={detailOpen}
        data={viewingData}
        onCancel={() => {
          setDetailOpen(false)
          setViewingUid(undefined)
        }}
      />
      <Modal
        title={t('member.modal.invite.title')}
        open={inviteOpen}
        onOk={handleInviteOk}
        onCancel={() => {
          setInviteOpen(false)
          inviteForm.resetFields()
        }}
        confirmLoading={inviteSubmitting}
        okText={t('common.ok')}
        cancelText={t('common.cancel')}
        destroyOnHidden
      >
        <Form form={inviteForm} layout='vertical' initialValues={{ role: 0 }}>
          <Form.Item
            name='email'
            label={t('member.form.invite.email')}
            rules={[
              {
                required: true,
                message: t('member.form.invite.emailPlaceholder'),
              },
            ]}
          >
            <Input placeholder={t('member.form.invite.emailPlaceholder')} />
          </Form.Item>
          <Form.Item name='role' label={t('member.form.invite.roleUID')}>
            <InputNumber
              min={0}
              className='w-full'
              placeholder={t('member.form.invite.roleUIDPlaceholder')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default function MembersListWrapper() {
  return (
    <App className='h-full'>
      <PageContent>
        <MembersList />
      </PageContent>
    </App>
  )
}
