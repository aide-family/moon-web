import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useMemoizedFn } from 'ahooks'
import { useSearchParams } from 'react-router-dom'
import {
  Table,
  Input,
  Radio,
  Button,
  Space,
  message,
  Dropdown,
  App,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import {
  type EmailItem,
  type EmailListParams,
  getEmailTableList,
  getEmailDetail,
  deleteEmail,
  updateEmailStatus,
} from '@/api/rabbit/email/index'
import dayjs from 'dayjs'
import DetailForm from './components/DetailForm'
import DetailView from './components/DetailView'
import { useLocale } from '@/contexts/LocaleContext'
import PageContent from '@/components/layout/PageContent'
import { GlobalStatus } from '@/api'
import { MENU_DIVIDER } from '@/utils/menu'
import { applySearchToUrl, getParam } from '@/utils/urlSearchParams'
import { renderStatusTag } from '@/utils/marksman'
import { usePaginatedRequest } from '@/utils/hooks/usePaginatedRequest'
import { useDetailRequest } from '@/utils/hooks/useDetailRequest'
import { useAdaptiveTableHeight } from '@/utils/hooks/useAdaptiveTableHeight'

type EmailListQuery = Omit<EmailListParams, 'page' | 'pageSize'>

const defaultSearchParams: EmailListQuery = {
  keyword: '',
  status: undefined,
}

function parseSearchParamsFromUrl(params: URLSearchParams): EmailListQuery {
  return {
    keyword: getParam(params, 'keyword') ?? '',
    status: (getParam(params, 'status') as GlobalStatus) ?? undefined,
  }
}

const EmailListContent: React.FC = () => {
  const { modal } = App.useApp()
  const { t } = useLocale()
  const [urlSearchParams, setUrlSearchParams] = useSearchParams()
  const [searchParams, setSearchParams] = useState<EmailListQuery>(() =>
    parseSearchParamsFromUrl(urlSearchParams),
  )
  const list = usePaginatedRequest<EmailItem, EmailListQuery>({
    service: (params) =>
      getEmailTableList({
        ...params,
        keyword: params.keyword || undefined,
      }),
    defaultQuery: parseSearchParamsFromUrl(urlSearchParams),
  })
  const { dataSource, loading, pagination, refresh, search, reset, changePage } =
    list
  const { tableContainerRef, tableWrapperRef, tableHeight } =
    useAdaptiveTableHeight()
  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [detailFormMode, setDetailFormMode] = useState<'create' | 'edit'>(
    'create',
  )
  const [editingData, setEditingData] = useState<EmailItem | null>(null)
  const [detailViewOpen, setDetailViewOpen] = useState(false)
  const [viewingUid, setViewingUid] = useState<string>()
  const skipAutoSearchRef = useRef(true)
  const {
    data: viewingData,
    loading: detailLoading,
    error: detailError,
    mutate: mutateViewingData,
  } = useDetailRequest(getEmailDetail, viewingUid, detailViewOpen)

  useEffect(() => {
    setSearchParams(parseSearchParamsFromUrl(urlSearchParams))
  }, [urlSearchParams])

  useEffect(() => {
    applySearchToUrl(
      setUrlSearchParams,
      { keyword: searchParams.keyword, status: searchParams.status },
      { replace: true },
    )
  }, [searchParams.keyword, searchParams.status, setUrlSearchParams])

  const handleSearch = useMemoizedFn((keywordFromInput?: string) => {
    if (keywordFromInput !== undefined) {
      setSearchParams((prev) => ({ ...prev, keyword: keywordFromInput }))
    }
    const keyword =
      keywordFromInput !== undefined ? keywordFromInput : searchParams.keyword
    search({
      keyword: keyword || undefined,
      status: searchParams.status,
    })
  })

  const handleReset = useMemoizedFn(() => {
    setSearchParams(defaultSearchParams)
    setUrlSearchParams({})
    reset(defaultSearchParams)
  })

  const handleTableChange = useMemoizedFn((page: number, pageSize: number) => {
    changePage(page, pageSize)
  })

  const handleDelete = useMemoizedFn(async (record: EmailItem) => {
    try {
      await deleteEmail(record.uid)
      message.success(t('message.delete.success'))
      refresh()
    } catch (error) {
      console.error('删除失败:', error)
    }
  })

  const handleStatusChange = useMemoizedFn(
    async (record: EmailItem, newStatus: GlobalStatus) => {
      try {
        await updateEmailStatus({ uid: record.uid, status: newStatus })
        message.success(t('message.update.success'))
        refresh()
        if (viewingUid === record.uid && viewingData) {
          mutateViewingData({ ...viewingData, status: newStatus })
        }
      } catch (error) {
        console.error('修改状态失败:', error)
      }
    },
  )

  const columns: ColumnsType<EmailItem> = useMemo(() => {
    const emptyPlaceholder = (text: unknown) =>
      text == null || text === '' ? '-' : String(text)
    const numPlaceholder = (val: unknown) => (val == null ? '-' : val)
    return [
      {
        title: t('email.table.uid'),
        dataIndex: 'uid',
        key: 'uid',
        width: 160,
        render: (txt) => emptyPlaceholder(txt),
      },
      {
        title: t('email.table.name'),
        dataIndex: 'name',
        key: 'name',
        minWidth: 120,
        render: (txt) => emptyPlaceholder(txt),
      },
      {
        title: t('email.table.host'),
        dataIndex: 'host',
        key: 'host',
        minWidth: 60,
        render: (txt) => emptyPlaceholder(txt),
      },
      {
        title: t('email.table.port'),
        dataIndex: 'port',
        key: 'port',
        minWidth: 120,
        render: (txt) => numPlaceholder(txt),
      },
      {
        title: t('email.table.username'),
        dataIndex: 'username',
        key: 'username',
        minWidth: 120,
        render: (txt) => emptyPlaceholder(txt),
      },
      {
        title: t('email.table.status'),
        dataIndex: 'status',
        key: 'status',
        minWidth: 60,
        align: 'center',
        render: (status: GlobalStatus) => {
          return renderStatusTag(status, t)
        },
      },
      {
        title: t('email.table.createdAt'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        minWidth: 100,
        render: (text: string) =>
          text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
      },
      {
        title: t('email.table.updatedAt'),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        minWidth: 100,
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
          const isEnabled = record.status === GlobalStatus.ENABLED
          const action = isEnabled
            ? t(`common.status.${GlobalStatus.DISABLED}`)
            : t(`common.status.${GlobalStatus.ENABLED}`)
          const handleStatusClick = () => {
            modal.confirm({
              title: t('email.confirm.status.title', { action }),
              content: t('email.confirm.status.content', {
                action,
                name: record.name,
              }),
              onOk: () =>
                handleStatusChange(
                  record,
                  isEnabled ? GlobalStatus.DISABLED : GlobalStatus.ENABLED,
                ),
              okText: t('common.ok'),
              cancelText: t('common.cancel'),
            })
          }

          const handleDeleteClick = () => {
            modal.confirm({
              title: t('email.confirm.delete.title'),
              content: t('email.confirm.delete.content', { name: record.name }),
              okText: t('common.ok'),
              cancelText: t('common.cancel'),
              onOk: () => handleDelete(record),
            })
          }

          const menuItems: MenuProps['items'] = [
            {
              key: 'edit',
              label: t('common.edit'),
              onClick: () => handleEdit(record),
            },
            {
              key: 'status',
              label: action,
              onClick: handleStatusClick,
            },
            MENU_DIVIDER,
            {
              key: 'delete',
              label: t('common.delete'),
              danger: true,
              onClick: handleDeleteClick,
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
  }, [handleDelete, handleStatusChange, modal, t])

  // 处理新增
  const handleAdd = () => {
    setDetailFormMode('create')
    setEditingData(null)
    setDetailFormOpen(true)
  }

  const handleViewDetail = useMemoizedFn((record: EmailItem) => {
    if (!record.uid) return
    setViewingUid(record.uid)
    setDetailViewOpen(true)
  })

  // 处理编辑
  const handleEdit = (record: EmailItem) => {
    setDetailFormMode('edit')
    setEditingData(record)
    setDetailFormOpen(true)
  }

  // 从详情页跳转到编辑
  const handleEditFromDetail = (data: EmailItem) => {
    setDetailViewOpen(false)
    setDetailFormMode('edit')
    setEditingData(data)
    setDetailFormOpen(true)
  }

  // 处理导出
  const handleExport = () => {
    message.info(t('common.export'))
  }

  const handleFormSuccess = () => {
    refresh()
  }

  useEffect(() => {
    if (detailViewOpen && detailError) {
      console.error('获取邮件配置详情失败:', detailError)
      setDetailViewOpen(false)
      setViewingUid(undefined)
    }
  }, [detailViewOpen, detailError])

  useEffect(() => {
    if (skipAutoSearchRef.current) {
      skipAutoSearchRef.current = false
      return
    }
    search({ ...list.query, status: searchParams.status })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.status])

  return (
    <div className='flex flex-col h-full'>
      {/* 搜索和操作栏 */}
      <div className='flex items-center justify-between mb-4 shrink-0'>
        <Space size='middle' wrap>
          <span>{t('table.search.keyword')}:</span>
          <Input
            placeholder={t('table.search.placeholder')}
            value={searchParams.keyword}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, keyword: e.target.value }))
            }
            onPressEnter={(e) =>
              handleSearch((e.target as HTMLInputElement).value)
            }
            className='w-full min-w-[120px] sm:w-48 md:w-52'
          />
          <span>{t('common.status')}:</span>
          <Radio.Group
            value={searchParams.status}
            onChange={(e) => {
              setSearchParams((prev) => ({ ...prev, status: e.target.value }))
            }}
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
          <Button onClick={() => handleSearch()} type='primary'>
            {t('common.search')}
          </Button>
          <Button onClick={handleReset}>{t('common.reset')}</Button>
        </Space>
        <Space>
          <Button type='primary' onClick={handleAdd}>
            {t('common.add')}
          </Button>
          <Button onClick={handleExport}>{t('common.export')}</Button>
        </Space>
      </div>
      <div
        ref={tableContainerRef}
        className='flex-1 flex overflow-hidden flex-col'
        style={{ minHeight: 0 }}
      >
        <div ref={tableWrapperRef} className='h-full flex flex-col'>
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey='uid'
            loading={loading}
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
            scroll={{ y: tableHeight, x: 'max-content' }}
            size='middle'
          />
        </div>
      </div>

      {/* 详情表单弹窗 */}
      <DetailForm
        open={detailFormOpen}
        mode={detailFormMode}
        initialData={editingData}
        onCancel={() => {
          setDetailFormOpen(false)
          setEditingData(null)
        }}
        onSuccess={handleFormSuccess}
      />

      {/* 详情查看弹窗 */}
      <DetailView
        open={detailViewOpen}
        data={viewingData ?? null}
        loading={detailLoading}
        onCancel={() => {
          setDetailViewOpen(false)
          setViewingUid(undefined)
        }}
        onEdit={handleEditFromDetail}
      />
    </div>
  )
}

// 使用 App.useApp() 需要包裹在 App 组件中
export default function EmailList() {
  return (
    <App className='h-full'>
      <PageContent>
        <EmailListContent />
      </PageContent>
    </App>
  )
}
