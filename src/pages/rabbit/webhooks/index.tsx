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
  Select,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import {
  type WebhookItem,
  type WebhookListParams,
  getWebhookTableList,
  getWebhookDetail,
  deleteWebhook,
  updateWebhookStatus,
} from '@/api/rabbit/webhook/index'
import { GlobalStatus } from '@/api'
import DetailForm from './components/DetailForm'
import DetailView from './components/DetailView'
import { useLocale } from '@/contexts/LocaleContext'
import PageContent from '@/components/layout/PageContent'
import {
  getAppOptions,
  getAppLabel,
  getAppIconType,
  getMethodLabel,
} from './constants'
import { IconFont } from '@/components/Icon/IconFont'
import { MENU_DIVIDER } from '@/utils/menu'
import { applySearchToUrl, getParam } from '@/utils/urlSearchParams'
import { renderStatusTag } from '@/utils/marksman'
import { usePaginatedRequest } from '@/utils/hooks/usePaginatedRequest'
import { useDetailRequest } from '@/utils/hooks/useDetailRequest'
import { useAdaptiveTableHeight } from '@/utils/hooks/useAdaptiveTableHeight'

type WebhookListQuery = Omit<WebhookListParams, 'page' | 'pageSize'>

const defaultSearchParams: WebhookListQuery = {
  keyword: '',
  status: undefined,
  app: undefined,
}

function parseSearchParamsFromUrl(params: URLSearchParams): WebhookListQuery {
  return {
    keyword: getParam(params, 'keyword') ?? '',
    status:
      (getParam(params, 'status') as WebhookListParams['status']) ?? undefined,
    app: (getParam(params, 'app') as WebhookListParams['app']) ?? undefined,
  }
}

const WebhookListContent: React.FC = () => {
  const { modal } = App.useApp()
  const { t } = useLocale()
  const [urlSearchParams, setUrlSearchParams] = useSearchParams()
  const [searchParams, setSearchParams] = useState<WebhookListQuery>(() =>
    parseSearchParamsFromUrl(urlSearchParams),
  )
  const list = usePaginatedRequest<WebhookItem, WebhookListQuery>({
    service: (params) =>
      getWebhookTableList({
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
  const [editingData, setEditingData] = useState<WebhookItem | null>(null)
  const [detailViewOpen, setDetailViewOpen] = useState(false)
  const [viewingUid, setViewingUid] = useState<string>()
  const skipAutoSearchRef = useRef(true)
  const {
    data: viewingData,
    loading: detailLoading,
    error: detailError,
    mutate: mutateViewingData,
  } = useDetailRequest(getWebhookDetail, viewingUid, detailViewOpen)

  useEffect(() => {
    setSearchParams(parseSearchParamsFromUrl(urlSearchParams))
  }, [urlSearchParams])

  useEffect(() => {
    applySearchToUrl(
      setUrlSearchParams,
      {
        keyword: searchParams.keyword,
        status: searchParams.status,
        app: searchParams.app,
      },
      { replace: true },
    )
  }, [
    searchParams.keyword,
    searchParams.status,
    searchParams.app,
    setUrlSearchParams,
  ])

  const handleSearch = useMemoizedFn((keywordFromInput?: string) => {
    if (keywordFromInput !== undefined) {
      setSearchParams((prev) => ({ ...prev, keyword: keywordFromInput }))
    }
    const keyword =
      keywordFromInput !== undefined ? keywordFromInput : searchParams.keyword
    search({
      keyword: keyword || undefined,
      status: searchParams.status,
      app: searchParams.app,
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

  const handleDelete = useMemoizedFn(async (record: WebhookItem) => {
    try {
      await deleteWebhook(record.uid)
      message.success(t('message.delete.success'))
      refresh()
    } catch (error) {
      console.error('删除失败:', error)
    }
  })

  const handleStatusChange = useMemoizedFn(
    async (record: WebhookItem, newStatus: GlobalStatus) => {
      try {
        await updateWebhookStatus({ uid: record.uid, status: newStatus })
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

  const columns: ColumnsType<WebhookItem> = useMemo(() => {
    const emptyPlaceholder = (text: unknown) =>
      text == null || text === '' ? '-' : String(text)
    return [
      {
        title: t('webhook.table.uid'),
        dataIndex: 'uid',
        key: 'uid',
        width: 160,
        render: (txt) => emptyPlaceholder(txt),
      },
      {
        title: t('webhook.table.name'),
        dataIndex: 'name',
        key: 'name',
        minWidth: 100,
        render: (txt) => emptyPlaceholder(txt),
      },
      {
        title: t('webhook.table.app'),
        dataIndex: 'app',
        key: 'app',
        minWidth: 60,
        render: (app: number | string) =>
          app != null && app !== '' ? (
            <span
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <IconFont type={getAppIconType(app)} />
              {getAppLabel(app, t)}
            </span>
          ) : (
            '-'
          ),
      },
      {
        title: t('webhook.table.url'),
        dataIndex: 'url',
        key: 'url',
        minWidth: 150,
        ellipsis: true,
        render: (txt) => emptyPlaceholder(txt),
      },
      {
        title: t('webhook.table.method'),
        dataIndex: 'method',
        key: 'method',
        minWidth: 60,
        render: (method: number | string) =>
          method != null && method !== '' ? getMethodLabel(method, t) : '-',
      },
      {
        title: t('webhook.table.status'),
        dataIndex: 'status',
        key: 'status',
        minWidth: 60,
        align: 'center',
        render: (status: GlobalStatus) => {
          return renderStatusTag(status, t)
        },
      },
      {
        title: t('webhook.table.createdAt'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        minWidth: 100,
      },
      {
        title: t('webhook.table.updatedAt'),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        minWidth: 100,
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
              title: t('webhook.confirm.status.title', { action }),
              content: t('webhook.confirm.status.content', {
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
              title: t('webhook.confirm.delete.title'),
              content: t('webhook.confirm.delete.content', {
                name: record.name,
              }),
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

  const handleViewDetail = useMemoizedFn((record: WebhookItem) => {
    if (!record.uid) return
    setViewingUid(record.uid)
    setDetailViewOpen(true)
  })

  // 处理编辑
  const handleEdit = (record: WebhookItem) => {
    setDetailFormMode('edit')
    setEditingData(record)
    setDetailFormOpen(true)
  }

  // 从详情页跳转到编辑
  const handleEditFromDetail = (data: WebhookItem) => {
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
      console.error('获取 Webhook 详情失败:', detailError)
      setDetailViewOpen(false)
      setViewingUid(undefined)
    }
  }, [detailViewOpen, detailError])

  useEffect(() => {
    if (skipAutoSearchRef.current) {
      skipAutoSearchRef.current = false
      return
    }
    search({
      ...list.query,
      status: searchParams.status,
      app: searchParams.app,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.status, searchParams.app])

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
          <span>{t('webhook.table.app')}:</span>
          <Select
            placeholder={t('webhook.search.app.placeholder')}
            value={searchParams.app ?? null}
            onChange={(value) => {
              setSearchParams((prev) => ({
                ...prev,
                app: value === '' ? undefined : value,
              }))
            }}
            className='w-30'
            allowClear
            options={[
              { label: t('table.search.all'), value: '' },
              ...getAppOptions(t).map((opt) => ({
                value: opt.value,
                label: (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <IconFont type={getAppIconType(opt.value)} />
                    {opt.label}
                  </span>
                ),
              })),
            ]}
          />
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
export default function WebhookList() {
  return (
    <App className='h-full'>
      <PageContent>
        <WebhookListContent />
      </PageContent>
    </App>
  )
}
