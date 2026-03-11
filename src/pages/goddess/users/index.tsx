import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Table, Input, Radio, Button, Space, message, Tag, Dropdown, App } from 'antd'
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
} from '@/api/user'
import dayjs from 'dayjs'
import UserDetailView from './components/UserDetailView'
import { useLocale } from '@/contexts/LocaleContext'
import PageContent from '@/components/layout/PageContent'
import { applySearchToUrl, getParam } from '@/utils/urlSearchParams'

const defaultSearchParams: ListUsersParams = {
  keyword: '',
  email: '',
  status: undefined,
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
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<UserItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [searchParams, setSearchParams] = useState<ListUsersParams>(() =>
    parseSearchParamsFromUrl(urlSearchParams)
  )
  const [tableHeight, setTableHeight] = useState<number>(0)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [viewingData, setViewingData] = useState<UserItem | null>(null)

  const getStatusInfo = (status?: UserStatus | string) => {
    const s = parseUserStatus(status)
    const map: Record<UserStatus, { textKey: string; color: string }> = {
      [UserStatus.UserStatus_UNKNOWN]: { textKey: 'user.status.UserStatus_UNKNOWN', color: 'default' },
      [UserStatus.ACTIVE]: { textKey: 'user.status.ACTIVE', color: 'success' },
      [UserStatus.BANNED]: { textKey: 'user.status.BANNED', color: 'error' },
    }
    const info = map[s]
    return { text: t(info.textKey), color: info.color }
  }

  const fetchData = async (page?: number, pageSize?: number) => {
    setLoading(true)
    try {
      const currentPage = page ?? pagination.current
      const currentPageSize = pageSize ?? pagination.pageSize
      const params: ListUsersParams = {
        page: currentPage,
        pageSize: currentPageSize,
        keyword: searchParams.keyword || undefined,
        email: searchParams.email || undefined,
        status: searchParams.status,
      }
      const response = await listUsers(params)
      if (response) {
        setDataSource(response.items ?? [])
        setPagination(prev => ({
          ...prev,
          current: currentPage,
          pageSize: currentPageSize,
          total: parseInt(response.total ?? '0', 10),
        }))
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setSearchParams(parseSearchParamsFromUrl(urlSearchParams))
  }, [urlSearchParams.toString()])

  useEffect(() => {
    applySearchToUrl(
      setUrlSearchParams,
      {
        keyword: searchParams.keyword,
        email: searchParams.email,
        status: searchParams.status,
      },
      { replace: true }
    )
  }, [searchParams.keyword, searchParams.email, searchParams.status])

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchData()
  }

  const handleReset = () => {
    setSearchParams(defaultSearchParams)
    setUrlSearchParams({})
    setPagination({ current: 1, pageSize: 10, total: 0 })
    fetchData()
  }

  const handleTableChange = (page: number, pageSize: number) => {
    fetchData(page, pageSize)
  }

  const handleViewDetail = async (record: UserItem) => {
    if (!record.uid) return
    try {
      const user = await getUser(record.uid)
      setViewingData(user)
      setDetailOpen(true)
    } catch (error) {
      console.error('获取用户详情失败:', error)
    }
  }

  const handleBan = (record: UserItem) => {
    const name = record.name || record.nickname || record.email || record.uid || ''
    modal.confirm({
      title: t('user.confirm.ban.title'),
      content: t('user.confirm.ban.content', { name }),
      okText: t('common.ok'),
      cancelText: t('common.cancel'),
      onOk: () => doBan(record.uid!),
    })
  }

  const handlePermit = (record: UserItem) => {
    const name = record.name || record.nickname || record.email || record.uid || ''
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
      fetchData()
      if (detailOpen && viewingData?.uid === uid) {
        setViewingData(prev => (prev ? { ...prev, status: UserStatus.BANNED } : null))
      }
    } catch (error) {
      console.error('封禁失败:', error)
    }
  }

  const doPermit = async (uid: string) => {
    try {
      await permitUser(uid)
      message.success(t('message.update.success'))
      fetchData()
      if (detailOpen && viewingData?.uid === uid) {
        setViewingData(prev => (prev ? { ...prev, status: UserStatus.ACTIVE } : null))
      }
    } catch (error) {
      console.error('解封失败:', error)
    }
  }

  const emptyPlaceholder = (text: unknown) => (text == null || text === '') ? '-' : text

  const columns: ColumnsType<UserItem> = [
    { title: t('user.table.uid'), dataIndex: 'uid', key: 'uid', width: 160, ellipsis: true, render: (txt) => emptyPlaceholder(txt) },
    { title: t('user.table.email'), dataIndex: 'email', key: 'email', minWidth: 160, ellipsis: true, render: (txt) => emptyPlaceholder(txt) },
    { title: t('user.table.name'), dataIndex: 'name', key: 'name', minWidth: 100, render: (txt) => emptyPlaceholder(txt) },
    { title: t('user.table.nickname'), dataIndex: 'nickname', key: 'nickname', minWidth: 100, render: (txt) => emptyPlaceholder(txt) },
    { title: t('user.table.phone'), dataIndex: 'phone', key: 'phone', minWidth: 120, render: (txt) => emptyPlaceholder(txt) },
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
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
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
          {
            key: 'ban',
            label: t('user.action.ban'),
            danger: true,
            onClick: () => handleBan(record),
            disabled: isBanned,
          },
        ]
        return (
          <Space size="small">
            <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
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
  ]

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.status])

  useEffect(() => {
    const updateTableHeight = () => {
      if (tableContainerRef.current && tableWrapperRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight
        const theadElement = tableWrapperRef.current.querySelector('.ant-table-thead')
        let theadHeight = 0
        if (theadElement) {
          const theadRect = theadElement.getBoundingClientRect()
          const theadStyle = window.getComputedStyle(theadElement)
          theadHeight = theadRect.height + (parseFloat(theadStyle.marginBottom) || 0)
        }
        const paginationElement = tableWrapperRef.current.querySelector('.ant-pagination')
        let paginationHeight = 0
        if (paginationElement) {
          const rect = paginationElement.getBoundingClientRect()
          const style = window.getComputedStyle(paginationElement)
          paginationHeight = rect.height + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0)
        }
        const bodyEl = tableWrapperRef.current.querySelector('.ant-table-body')
        let bodyPadding = 0
        if (bodyEl) {
          const s = window.getComputedStyle(bodyEl)
          bodyPadding = (parseFloat(s.paddingTop) || 0) + (parseFloat(s.paddingBottom) || 0)
        }
        setTableHeight(Math.max(containerHeight - theadHeight - paginationHeight - bodyPadding, 100))
      }
    }
    const timer = setTimeout(updateTableHeight, 100)
    let resizeObserver: ResizeObserver | null = null
    if (tableContainerRef.current) {
      resizeObserver = new ResizeObserver(() => setTimeout(updateTableHeight, 0))
      resizeObserver.observe(tableContainerRef.current)
    }
    window.addEventListener('resize', updateTableHeight)
    return () => {
      clearTimeout(timer)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateTableHeight)
    }
  }, [dataSource, pagination])

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-between items-start shrink-0">
        <Space size="middle" wrap>
          <span>{t('table.search.keyword')}:</span>
          <Input
            placeholder={t('table.search.placeholder')}
            allowClear
            className="w-full min-w-[120px] sm:w-48 md:w-52"
            value={searchParams.keyword ?? ''}
            onChange={e => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
          />
          <span>{t('user.search.email')}:</span>
          <Input
            placeholder={t('table.search.placeholder')}
            allowClear
            className="w-full min-w-[120px] sm:w-48"
            value={searchParams.email ?? ''}
            onChange={e => setSearchParams(prev => ({ ...prev, email: e.target.value }))}
            onPressEnter={handleSearch}
          />
          <span>{t('table.search.status')}:</span>
          <Radio.Group
            value={searchParams.status}
            onChange={e => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
            buttonStyle="solid"
          >
            <Radio.Button value={undefined}>{t('table.search.all')}</Radio.Button>
            <Radio.Button value={UserStatus.ACTIVE}>{t('user.status.ACTIVE')}</Radio.Button>
            <Radio.Button value={UserStatus.BANNED}>{t('user.status.BANNED')}</Radio.Button>
          </Radio.Group>
          <Button onClick={handleSearch} type="primary">
            {t('common.search')}
          </Button>
          <Button onClick={handleReset}>{t('common.reset')}</Button>
        </Space>
      </div>
      <div ref={tableContainerRef} className="flex-1 flex overflow-hidden flex-col" style={{ minHeight: 0 }}>
        <div ref={tableWrapperRef} className="h-full flex flex-col flex-1">
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey="uid"
            loading={loading}
            size="small"
            scroll={{ y: tableHeight, x: 'max-content' }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: total => t('table.total', { total }),
              onChange: handleTableChange,
              onShowSizeChange: handleTableChange,
            }}
          />
        </div>
      </div>
      <UserDetailView
        open={detailOpen}
        data={viewingData}
        onCancel={() => setDetailOpen(false)}
      />
    </div>
  )
}

export default function UsersListWrapper() {
  return (
    <App className="h-full">
      <PageContent>
        <UsersList />
      </PageContent>
    </App>
  )
}
