import React, { useState, useRef, useEffect } from 'react'
import { useMemoizedFn } from 'ahooks'
import { useSearchParams } from 'react-router-dom'
import {
  Table,
  Input,
  Radio,
  Button,
  Space,
  message,
  Tag,
  Dropdown,
  App,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import {
  listUsers,
  getUser,
  permitUser,
  banUser,
  UserStatus,
  parseUserStatus,
  type UserItem,
  type ListUsersParams,
} from '@/api/account/user'
import dayjs from 'dayjs'
import UserDetailView from './components/UserDetailView'
import { useLocale } from '@/contexts/LocaleContext'
import PageContent from '@/components/layout/PageContent'
import { MENU_DIVIDER } from '@/utils/menu'
import { applySearchToUrl, getParam } from '@/utils/urlSearchParams'
import { usePaginatedRequest } from '@/utils/hooks/usePaginatedRequest'
import { useDetailRequest } from '@/utils/hooks/useDetailRequest'
import { useAdaptiveTableHeight } from '@/utils/hooks/useAdaptiveTableHeight'

const defaultSearchParams: ListUsersParams = {
  keyword: '',
  email: '',
  status: undefined,
}

type UsersListQuery = Omit<ListUsersParams, 'page' | 'pageSize'>

function toListQuery(params: ListUsersParams): UsersListQuery {
  return {
    keyword: params.keyword ?? '',
    email: params.email ?? '',
    status: params.status,
  }
}

function parseSearchParamsFromUrl(params: URLSearchParams): ListUsersParams {
  const statusParam = getParam(params, 'status')
  const status =
    statusParam !== undefined && statusParam !== ''
      ? parseUserStatus(statusParam)
      : undefined
  return {
    keyword: getParam(params, 'keyword') ?? '',
    email: getParam(params, 'email') ?? '',
    status: status === UserStatus.UserStatus_UNKNOWN ? undefined : status,
  }
}

const UsersList: React.FC = () => {
  const { modal } = App.useApp()
  const { t } = useLocale()
  const [urlSearchParams, setUrlSearchParams] = useSearchParams()
  const [searchParams, setSearchParams] = useState<ListUsersParams>(() =>
    parseSearchParamsFromUrl(urlSearchParams),
  )
  const { tableContainerRef, tableWrapperRef, tableHeight } =
    useAdaptiveTableHeight()
  const [detailOpen, setDetailOpen] = useState(false)
  const [viewingUid, setViewingUid] = useState<string>()
  const skipAutoSearchRef = useRef(true)

  const list = usePaginatedRequest<UserItem, UsersListQuery>({
    service: ({ page, pageSize, keyword, email, status }) =>
      listUsers({
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
  } = useDetailRequest(getUser, viewingUid, detailOpen)

  const getStatusInfo = (status?: UserStatus | string) => {
    const s = parseUserStatus(status)
    const map: Record<UserStatus, { textKey: string; color: string }> = {
      [UserStatus.UserStatus_UNKNOWN]: {
        textKey: 'user.status.UserStatus_UNKNOWN',
        color: 'default',
      },
      [UserStatus.ACTIVE]: { textKey: 'user.status.ACTIVE', color: 'success' },
      [UserStatus.BANNED]: { textKey: 'user.status.BANNED', color: 'error' },
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

  const handleSearch = useMemoizedFn((override?: Partial<ListUsersParams>) => {
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

  const handleViewDetail = useMemoizedFn((record: UserItem) => {
    if (!record.uid) return
    setViewingUid(record.uid)
    setDetailOpen(true)
  })

  const handleBan = (record: UserItem) => {
    const name =
      record.name || record.nickname || record.email || record.uid || ''
    modal.confirm({
      title: t('user.confirm.ban.title'),
      content: t('user.confirm.ban.content', { name }),
      okText: t('common.ok'),
      cancelText: t('common.cancel'),
      onOk: () => doBan(record.uid!),
    })
  }

  const handlePermit = (record: UserItem) => {
    const name =
      record.name || record.nickname || record.email || record.uid || ''
    modal.confirm({
      title: t('user.confirm.permit.title'),
      content: t('user.confirm.permit.content', { name }),
      okText: t('common.ok'),
      cancelText: t('common.cancel'),
      onOk: () => doPermit(record.uid!),
    })
  }

  const doBan = async (uid: string) => {
    try {
      await banUser(uid)
      message.success(t('message.update.success'))
      list.refresh()
      if (detailOpen && viewingData?.uid === uid) {
        mutateDetail((prev) =>
          prev ? { ...prev, status: UserStatus.BANNED } : prev,
        )
      }
    } catch (error) {
      console.error('封禁失败:', error)
    }
  }

  const doPermit = async (uid: string) => {
    try {
      await permitUser(uid)
      message.success(t('message.update.success'))
      list.refresh()
      if (detailOpen && viewingData?.uid === uid) {
        mutateDetail((prev) =>
          prev ? { ...prev, status: UserStatus.ACTIVE } : prev,
        )
      }
    } catch (error) {
      console.error('解封失败:', error)
    }
  }

  const emptyPlaceholder = (text: unknown) =>
    text == null || text === '' ? '-' : text

  const columns: ColumnsType<UserItem> = [
    {
      title: t('user.table.uid'),
      dataIndex: 'uid',
      key: 'uid',
      width: 160,
      ellipsis: true,
      render: (txt) => emptyPlaceholder(txt),
    },
    {
      title: t('user.table.email'),
      dataIndex: 'email',
      key: 'email',
      minWidth: 160,
      ellipsis: true,
      render: (txt) => emptyPlaceholder(txt),
    },
    {
      title: t('user.table.name'),
      dataIndex: 'name',
      key: 'name',
      minWidth: 100,
      render: (txt) => emptyPlaceholder(txt),
    },
    {
      title: t('user.table.nickname'),
      dataIndex: 'nickname',
      key: 'nickname',
      minWidth: 100,
      render: (txt) => emptyPlaceholder(txt),
    },
    {
      title: t('user.table.phone'),
      dataIndex: 'phone',
      key: 'phone',
      minWidth: 120,
      render: (txt) => emptyPlaceholder(txt),
    },
    {
      title: t('user.table.status'),
      dataIndex: 'status',
      key: 'status',
      minWidth: 80,
      align: 'center',
      render: (status: UserItem['status']) => {
        const info = getStatusInfo(status)
        return <Tag color={info.color}>{info.text}</Tag>
      },
    },
    {
      title: t('user.table.createdAt'),
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
        const isBanned = parseUserStatus(record.status) === UserStatus.BANNED
        const menuItems: MenuProps['items'] = [
          {
            key: 'permit',
            label: t('user.action.permit'),
            onClick: () => handlePermit(record),
            disabled: !isBanned,
          },
          MENU_DIVIDER,
          {
            key: 'ban',
            label: t('user.action.ban'),
            danger: true,
            onClick: () => handleBan(record),
            disabled: isBanned,
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
          <span>{t('user.search.email')}:</span>
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
            <Radio.Button value={UserStatus.ACTIVE}>
              {t('user.status.ACTIVE')}
            </Radio.Button>
            <Radio.Button value={UserStatus.BANNED}>
              {t('user.status.BANNED')}
            </Radio.Button>
          </Radio.Group>
          <Button onClick={() => handleSearch()} type='primary'>
            {t('common.search')}
          </Button>
          <Button onClick={handleReset}>{t('common.reset')}</Button>
        </Space>
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
            scroll={{ y: tableHeight, x: 'max-content' }}
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
      <UserDetailView
        open={detailOpen}
        data={viewingData}
        onCancel={() => {
          setDetailOpen(false)
          setViewingUid(undefined)
        }}
      />
    </div>
  )
}

export default function UsersListWrapper() {
  return (
    <App className='h-full'>
      <PageContent>
        <UsersList />
      </PageContent>
    </App>
  )
}
