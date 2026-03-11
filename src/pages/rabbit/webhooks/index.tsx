import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Table, Input, Radio, Button, Space, message, Tag, Dropdown, App, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import {
  type WebhookItem,
  type WebhookListParams,
  getWebhookTableList,
  deleteWebhook,
  updateWebhookStatus,
} from '@/api/webhook/index'
import { GlobalStatus } from '@/api'
import dayjs from 'dayjs'
import DetailForm from './components/DetailForm'
import DetailView from './components/DetailView'
import { useLocale } from '@/contexts/LocaleContext'
import PageContent from '@/components/layout/PageContent'
import { getAppOptions, getAppLabel, getAppIconType, getMethodLabel } from './constants'
import { IconFont } from '@/components/Icon/IconFont'
import { applySearchToUrl, getParam } from '@/utils/urlSearchParams'

const defaultSearchParams: WebhookListParams = {
  keyword: '',
  status: undefined,
  app: undefined,
}

function parseSearchParamsFromUrl(params: URLSearchParams): WebhookListParams {
  return {
    keyword: getParam(params, 'keyword') ?? '',
    status: (getParam(params, 'status') as WebhookListParams['status']) ?? undefined,
    app: (getParam(params, 'app') as WebhookListParams['app']) ?? undefined,
  }
}

// 将接口返回的 status（数字或字符串）转为 GlobalStatus，用于展示与筛选
const normalizeStatus = (status: number | string | undefined): GlobalStatus | string => {
  if (status === 1 || status === GlobalStatus.ENABLED) return GlobalStatus.ENABLED
  if (status === 2 || status === GlobalStatus.DISABLED) return GlobalStatus.DISABLED
  return GlobalStatus.UNKNOWN
}

const WebhookListContent: React.FC = () => {
  const { modal } = App.useApp()
  const { t } = useLocale()
  const [urlSearchParams, setUrlSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<WebhookItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [searchParams, setSearchParams] = useState<WebhookListParams>(() =>
    parseSearchParamsFromUrl(urlSearchParams)
  )
  const [tableHeight, setTableHeight] = useState<number>(0)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [detailFormMode, setDetailFormMode] = useState<'create' | 'edit'>('create')
  const [editingData, setEditingData] = useState<WebhookItem | null>(null)
  const [detailViewOpen, setDetailViewOpen] = useState(false)
  const [viewingData, setViewingData] = useState<WebhookItem | null>(null)

  // 获取数据（真实接口）
  const fetchData = async (page?: number, pageSize?: number) => {
    setLoading(true)
    try {
      const currentPage = page ?? pagination.current
      const currentPageSize = pageSize ?? pagination.pageSize
      const params: WebhookListParams = {
        page: currentPage,
        pageSize: currentPageSize,
        keyword: searchParams.keyword || undefined,
        status: searchParams.status,
        app: searchParams.app,
      }
      const response = await getWebhookTableList(params)
      setDataSource(response?.items ?? [])
      setPagination(prev => ({
        ...prev,
        current: currentPage,
        pageSize: currentPageSize,
        total: parseInt(String(response?.total ?? 0), 10),
      }))
    } catch (error) {
      console.error('获取Webhook列表失败:', error)
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
      { keyword: searchParams.keyword, status: searchParams.status, app: searchParams.app },
      { replace: true }
    )
  }, [searchParams.keyword, searchParams.status, searchParams.app])

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

  // 处理表格变化（分页）
  const handleTableChange = (page: number, pageSize: number) => {
    // 直接传递新的分页参数给 fetchData
    fetchData(page, pageSize)
  }

  const emptyPlaceholder = (text: unknown) => (text == null || text === '') ? '-' : text

  // 表格列定义
  const columns: ColumnsType<WebhookItem> = [
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
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
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
      render: (method: number | string) => (method != null && method !== '') ? getMethodLabel(method, t) : '-',
    },
    {
      title: t('table.status'),
      dataIndex: 'status',
      key: 'status',
      minWidth: 60,
      align: 'center',
      render: (status: number | string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          [GlobalStatus.UNKNOWN]: { text: t('table.unknown'), color: 'default' },
          [GlobalStatus.ENABLED]: { text: t('table.enable'), color: 'success' },
          [GlobalStatus.DISABLED]: { text: t('table.disable'), color: 'error' },
        }
        const statusInfo = statusMap[normalizeStatus(status)] || statusMap[GlobalStatus.UNKNOWN]
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      },
    },
    {
      title: t('webhook.table.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      minWidth: 100,
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: t('webhook.table.updatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      minWidth: 100,
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: t('table.action'),
      key: 'action',
      width: 140,
      fixed: 'right',
      align: 'center',
      render: (_, record) => {
        const isEnabled = normalizeStatus(record.status) === GlobalStatus.ENABLED
        const handleStatusClick = () => {
          const action = isEnabled ? t('table.disable') : t('table.enable')
          modal.confirm({
            title: t('webhook.confirm.status.title', { action }),
            content: t('webhook.confirm.status.content', { action, name: record.name }),
            onOk: () => handleStatusChange(record, isEnabled ? GlobalStatus.DISABLED : GlobalStatus.ENABLED),
            okText: t('common.ok'),
            cancelText: t('common.cancel'),
          })
        }

        const handleDeleteClick = () => {
          modal.confirm({
            title: t('webhook.confirm.delete.title'),
            content: t('webhook.confirm.delete.content', { name: record.name }),
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
            label: isEnabled ? t('table.disable') : t('table.enable'),
            onClick: handleStatusClick,
          },
          {
            key: 'delete',
            label: t('common.delete'),
            danger: true,
            onClick: handleDeleteClick,
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

  // 处理新增
  const handleAdd = () => {
    setDetailFormMode('create')
    setEditingData(null)
    setDetailFormOpen(true)
  }

  // 处理查看详情
  const handleViewDetail = (record: WebhookItem) => {
    setViewingData(record)
    setDetailViewOpen(true)
  }

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

  // 处理删除
  const handleDelete = async (record: WebhookItem) => {
    try {
      await deleteWebhook(record.uid)
      message.success(t('message.delete.success'))
      fetchData()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  // 处理修改状态
  const handleStatusChange = async (record: WebhookItem, newStatus: GlobalStatus | string) => {
    try {
      await updateWebhookStatus(record.uid, newStatus)
      message.success(t('message.update.success'))
      fetchData()
      if (viewingData && viewingData.uid === record.uid) {
        setViewingData({ ...viewingData, status: newStatus })
      }
    } catch (error) {
      console.error('修改状态失败:', error)
    }
  }

  // 处理导出
  const handleExport = () => {
    message.info(t('common.export'))
  }

  // 处理表单成功
  const handleFormSuccess = () => {
    fetchData()
  }

  // 初始化加载数据
  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.status, searchParams.app])

  // 计算表格高度
  useEffect(() => {
    const calculateTableHeight = () => {
      if (tableContainerRef.current && tableWrapperRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight
        const thead = tableWrapperRef.current.querySelector('.ant-table-thead')
        const pagination = tableWrapperRef.current.querySelector('.ant-pagination')
        
        const theadHeight = thead ? (thead as HTMLElement).offsetHeight : 0
        const paginationHeight = pagination ? (pagination as HTMLElement).offsetHeight : 0
        const tableBodyPadding = 16 * 2 // 上下各16px
        
        // 计算表格可用的滚动高度 = 容器高度 - 表头高度 - 分页器高度 - 表格主体 padding
        const calculatedHeight = containerHeight - theadHeight - paginationHeight - tableBodyPadding
        setTableHeight(Math.max(calculatedHeight, 100)) // 最小高度100px
      }
    }

    calculateTableHeight()
    window.addEventListener('resize', calculateTableHeight)
    return () => {
      window.removeEventListener('resize', calculateTableHeight)
    }
  }, [dataSource])

  return (
    <div className="flex flex-col h-full">
      {/* 搜索和操作栏 */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <Space size="middle" wrap>
          <span>{t('table.search.keyword')}:</span>
          <Input
            placeholder={t('table.search.placeholder')}
            value={searchParams.keyword}
            onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
            className="w-full min-w-[120px] sm:w-48 md:w-52"
          />
          <span>{t('table.search.status')}:</span>
          <Radio.Group
            value={searchParams.status}
            onChange={(e) => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
            buttonStyle="solid"
          >
            <Radio.Button value={undefined}>{t('table.search.all')}</Radio.Button>
            <Radio.Button value={GlobalStatus.ENABLED}>{t('table.search.enabled')}</Radio.Button>
            <Radio.Button value={GlobalStatus.DISABLED}>{t('table.search.disabled')}</Radio.Button>
          </Radio.Group>
          <span>{t('webhook.table.app')}:</span>
          <Select
            placeholder={t('webhook.search.app.placeholder')}
            value={searchParams.app ?? ''}
            onChange={(value) => setSearchParams(prev => ({ ...prev, app: value === '' ? undefined : value }))}
            className='w-30'
            allowClear
            options={[
              { label: t('table.search.all'), value: '' },
              ...getAppOptions(t).map(opt => ({
                value: opt.value,
                label: (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <IconFont type={getAppIconType(opt.value)} />
                    {opt.label}
                  </span>
                ),
              })),
            ]}
          />
          <Button onClick={handleSearch} type="primary">
            {t('common.search')}
          </Button>
          <Button onClick={handleReset}>
            {t('common.reset')}
          </Button>
        </Space>
        <Space>
          <Button type="primary" onClick={handleAdd}>
            {t('common.add')}
          </Button>
          <Button onClick={handleExport}>
            {t('common.export')}
          </Button>
        </Space>
      </div>
      <div ref={tableContainerRef} className="flex-1 flex overflow-hidden flex-col" style={{ minHeight: 0 }}>
        <div ref={tableWrapperRef} className="h-full flex flex-col">
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey="uid"
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
            size="middle"
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
        data={viewingData}
        onCancel={() => {
          setDetailViewOpen(false)
          setViewingData(null)
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
