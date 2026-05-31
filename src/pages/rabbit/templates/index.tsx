import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useMemoizedFn } from 'ahooks'
import { useSearchParams } from 'react-router-dom'
import {
  Table,
  Input,
  Radio,
  Button,
  Space,
  Dropdown,
  App,
  Select,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import {
  type TemplateItem,
  type TemplateListParams,
  getTemplateTableList,
  getTemplateDetail,
  deleteTemplate,
  updateTemplateStatus,
  GlobalStatus,
} from '@/api/rabbit/template/index'
import dayjs from 'dayjs'
import DetailForm from './components/DetailForm'
import DetailView from './components/DetailView'
import { useLocale } from '@/contexts/LocaleContext'
import PageContent from '@/components/layout/PageContent'
import { getMessageTypeOptions, getMessageTypeLabel } from './constants'
import { getMessageTypeIconType } from '@/pages/rabbit/constants/appIcons'
import { IconFont } from '@/components/Icon/IconFont'
import { MENU_DIVIDER } from '@/utils/menu'
import { applySearchToUrl, getParam } from '@/utils/urlSearchParams'
import { MessageType } from '@/api'
import { renderStatusTag } from '@/utils/marksman'
import { usePaginatedRequest } from '@/utils/hooks/usePaginatedRequest'
import { useDetailRequest } from '@/utils/hooks/useDetailRequest'
import { useAdaptiveTableHeight } from '@/utils/hooks/useAdaptiveTableHeight'

type TemplateListQuery = Omit<TemplateListParams, 'page' | 'pageSize'>

const defaultSearchParams: TemplateListQuery = {}

function parseSearchParamsFromUrl(params: URLSearchParams): TemplateListQuery {
  return {
    keyword: getParam(params, 'keyword') ?? '',
    status: getParam(params, 'status') as GlobalStatus,
    messageType: getParam(params, 'messageType') as MessageType,
  }
}

const TemplateListContent: React.FC = () => {
  const { modal, message } = App.useApp()
  const { t } = useLocale()
  const [urlSearchParams, setUrlSearchParams] = useSearchParams()
  const [searchParams, setSearchParams] = useState<TemplateListQuery>(() =>
    parseSearchParamsFromUrl(urlSearchParams),
  )
  const list = usePaginatedRequest<TemplateItem, TemplateListQuery>({
    service: (params) =>
      getTemplateTableList({
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
  const [editingData, setEditingData] = useState<TemplateItem | null>(null)
  const [detailViewOpen, setDetailViewOpen] = useState(false)
  const [viewingUid, setViewingUid] = useState<string>()
  const skipAutoSearchRef = useRef(true)
  const {
    data: viewingData,
    loading: detailLoading,
    error: detailError,
    mutate: mutateViewingData,
  } = useDetailRequest(getTemplateDetail, viewingUid, detailViewOpen)

  // URL 变化时（如浏览器后退）同步到表单
  useEffect(() => {
    setSearchParams(parseSearchParamsFromUrl(urlSearchParams))
  }, [urlSearchParams])

  // 搜索条件变化即同步到 URL（replace 避免每次输入都产生历史记录）
  useEffect(() => {
    applySearchToUrl(
      setUrlSearchParams,
      {
        keyword: searchParams.keyword,
        status: searchParams.status,
        messageType: searchParams.messageType,
      },
      { replace: true },
    )
  }, [
    searchParams.keyword,
    searchParams.status,
    searchParams.messageType,
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
      messageType: searchParams.messageType,
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

  const handleDelete = useMemoizedFn(async (record: TemplateItem) => {
    try {
      await deleteTemplate(record.uid)
      message.success(t('message.delete.success'))
      refresh()
    } catch (error) {
      console.error('删除失败:', error)
    }
  })

  const handleStatusChange = useMemoizedFn(
    async (record: TemplateItem, newStatus: GlobalStatus) => {
      try {
        await updateTemplateStatus({ uid: record.uid, status: newStatus })
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

  const columns: ColumnsType<TemplateItem> = useMemo(() => {
    const emptyPlaceholder = (text: unknown) =>
      text == null || text === '' ? '-' : String(text)
    return [
      {
        title: t('template.table.uid'),
        dataIndex: 'uid',
        key: 'uid',
        width: 160,
        render: (txt) => emptyPlaceholder(txt),
      },
      {
        title: t('template.table.name'),
        dataIndex: 'name',
        key: 'name',
        minWidth: 120,
        render: (txt) => emptyPlaceholder(txt),
      },
      {
        title: t('template.table.app'),
        dataIndex: 'messageType',
        key: 'messageType',
        minWidth: 60,
        render: (messageType: string) =>
          messageType != null && messageType !== '' ? (
            <span
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <IconFont type={getMessageTypeIconType(messageType)} />
              {getMessageTypeLabel(messageType, t)}
            </span>
          ) : (
            '-'
          ),
      },
      {
        title: t('template.table.status'),
        dataIndex: 'status',
        key: 'status',
        minWidth: 60,
        align: 'center',
        render: (status: GlobalStatus) => {
          return renderStatusTag(status, t)
        },
      },
      {
        title: t('template.table.createdAt'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        minWidth: 100,
        render: (text: string) =>
          text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
      },
      {
        title: t('template.table.updatedAt'),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        minWidth: 100,
        render: (text: string) =>
          text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
      },
      {
        title: t('table.action'),
        key: 'action',
        fixed: 'right',
        width: 140,
        align: 'center',
        render: (_, record) => {
          const isEnabled = record.status === GlobalStatus.ENABLED
          const action = isEnabled
            ? t(`common.status.${GlobalStatus.DISABLED}`)
            : t(`common.status.${GlobalStatus.ENABLED}`)
          const handleStatusClick = () => {
            modal.confirm({
              title: t('template.confirm.status.title', { action }),
              content: t('template.confirm.status.content', {
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
              title: t('template.confirm.delete.title'),
              content: t('template.confirm.delete.content', {
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

  const handleViewDetail = useMemoizedFn((record: TemplateItem) => {
    if (!record.uid) return
    setViewingUid(record.uid)
    setDetailViewOpen(true)
  })

  // 处理编辑
  const handleEdit = (record: TemplateItem) => {
    setDetailFormMode('edit')
    setEditingData(record)
    setDetailFormOpen(true)
  }

  // 从详情页跳转到编辑
  const handleEditFromDetail = (data: TemplateItem) => {
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
      console.error('获取模板详情失败:', detailError)
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
      messageType: searchParams.messageType,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.status, searchParams.messageType])

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
          <span>{t('template.table.app')}:</span>
          <Select
            placeholder={t('template.search.app.placeholder')}
            value={searchParams.messageType}
            onChange={(value: MessageType) => {
              setSearchParams((prev) => ({
                ...prev,
                messageType: value,
              }))
            }}
            className='w-45'
            options={[
              { label: t('table.search.all') },
              ...getMessageTypeOptions(t).map((opt) => ({
                value: opt.value,
                label: (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <IconFont type={getMessageTypeIconType(opt.value)} />
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
export default function TemplateList() {
  return (
    <App className='h-full'>
      <PageContent>
        <TemplateListContent />
      </PageContent>
    </App>
  )
}
