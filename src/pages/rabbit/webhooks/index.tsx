import React, { useState, useRef, useEffect } from 'react'
import { useMemoizedFn } from 'ahooks'
import { useSearchParams } from 'react-router-dom'
import {
  Input,
  Radio,
  Button,
  Space,
  message,
  App,
  Select,
  Pagination,
  Spin,
  Empty,
} from 'antd'
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
import WebhookCard from './components/WebhookCard'
import { useLocale } from '@/contexts/LocaleContext'
import PageContent from '@/components/layout/PageContent'
import {
  getAppOptions,
  getAppIconType,
} from './constants'
import { IconFont } from '@/components/Icon/IconFont'
import { MENU_DIVIDER } from '@/utils/menu'
import { applySearchToUrl, getParam } from '@/utils/urlSearchParams'
import { usePaginatedRequest } from '@/utils/hooks/usePaginatedRequest'
import { useDetailRequest } from '@/utils/hooks/useDetailRequest'

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

  const handlePageChange = useMemoizedFn((page: number, pageSize: number) => {
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

  const handleViewDetail = useMemoizedFn((record: WebhookItem) => {
    if (!record.uid) return
    setViewingUid(record.uid)
    setDetailViewOpen(true)
  })

  const handleEdit = useMemoizedFn((record: WebhookItem) => {
    setDetailFormMode('edit')
    setEditingData(record)
    setDetailFormOpen(true)
  })

  const getWebhookMenuItems = useMemoizedFn(
    (record: WebhookItem): MenuProps['items'] => {
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

      return [
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
    },
  )

  const handleAdd = () => {
    setDetailFormMode('create')
    setEditingData(null)
    setDetailFormOpen(true)
  }

  const handleEditFromDetail = (data: WebhookItem) => {
    setDetailViewOpen(false)
    setDetailFormMode('edit')
    setEditingData(data)
    setDetailFormOpen(true)
  }

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
    <div className='flex flex-col h-full min-h-0 min-w-0'>
      <div className='flex flex-wrap items-center justify-between gap-y-3 gap-x-4 mb-4 shrink-0 min-w-0'>
        <Space size='middle' wrap className='min-w-0'>
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
                  <span className='inline-flex items-center gap-2'>
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

      <div className='flex-1 min-h-0 overflow-y-auto overflow-x-hidden min-w-0'>
        <Spin spinning={loading}>
          {dataSource.length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-0'>
              {dataSource.map((item) => (
                <WebhookCard
                  key={item.uid}
                  item={item}
                  menuItems={getWebhookMenuItems(item)}
                  onView={() => handleViewDetail(item)}
                />
              ))}
            </div>
          ) : (
            !loading && (
              <Empty className='py-16' description={t('common.noData')} />
            )
          )}
        </Spin>
      </div>

      <div className='shrink-0 pt-3 mt-3 border-t border-(--ant-color-border-secondary) min-w-0'>
        <Pagination
          className='flex justify-end'
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          showSizeChanger
          showQuickJumper
          responsive
          showTotal={(total) => t('table.total', { total })}
          onChange={handlePageChange}
          onShowSizeChange={handlePageChange}
        />
      </div>

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

export default function WebhookList() {
  return (
    <App className='h-full min-h-0'>
      <PageContent className='overflow-hidden!'>
        <WebhookListContent />
      </PageContent>
    </App>
  )
}
