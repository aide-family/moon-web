import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Table, Input, Radio, Button, Space, message, Tag, Dropdown, App, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import { type TemplateItem, type TemplateListParams, getTemplateTableList, deleteTemplate, updateTemplateStatus, GlobalStatus } from '@/api/rabbit/template/index'
import dayjs from 'dayjs'
import DetailForm from './components/DetailForm'
import DetailView from './components/DetailView'
import { useLocale } from '@/contexts/LocaleContext'
import PageContent from '@/components/layout/PageContent'
import { getMessageTypeOptions, getMessageTypeLabel } from './constants'
import { getMessageTypeIconType } from '@/pages/rabbit/constants/appIcons'
import { IconFont } from '@/components/Icon/IconFont'
import { applySearchToUrl, getParam } from '@/utils/urlSearchParams'
import { MessageType } from '@/api'
import { renderStatusTag } from '@/utils/marksman'

const defaultSearchParams: TemplateListParams = {
  keyword: '',
  status: undefined,
  messageType: undefined,
}

function parseSearchParamsFromUrl(params: URLSearchParams): TemplateListParams {
  return {
    keyword: getParam(params, 'keyword') ?? '',
    status: (getParam(params, 'status') as GlobalStatus) ,
    messageType: getParam(params, 'messageType') as MessageType,
  }
}

const TemplateListContent: React.FC = () => {
  const { modal } = App.useApp()
  const { t } = useLocale()
  const [urlSearchParams, setUrlSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<TemplateItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [searchParams, setSearchParams] = useState<TemplateListParams>(() =>
    parseSearchParamsFromUrl(urlSearchParams)
  )
  const [tableHeight, setTableHeight] = useState<number>(0)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [detailFormMode, setDetailFormMode] = useState<'create' | 'edit'>('create')
  const [editingData, setEditingData] = useState<TemplateItem | null>(null)
  const [detailViewOpen, setDetailViewOpen] = useState(false)
  const [viewingData, setViewingData] = useState<TemplateItem | null>(null)
  const mountedRef = useRef(true)
  const paginationRef = useRef(pagination)
  paginationRef.current = pagination

  const fetchData = useCallback(
    async (page?: number, pageSize?: number, keywordOverride?: string) => {
      setLoading(true)
      try {
        const cur = paginationRef.current
        const currentPage = page ?? cur.current
        const currentPageSize = pageSize ?? cur.pageSize
        const keyword = keywordOverride !== undefined ? (keywordOverride || undefined) : (searchParams.keyword || undefined)
        const params: TemplateListParams = {
          page: currentPage,
          pageSize: currentPageSize,
          keyword,
          status: searchParams.status,
          messageType: searchParams.messageType,
        }
        const response = await getTemplateTableList(params)
        if (!mountedRef.current) return
        if (response) {
          setDataSource(response.items ?? [])
          setPagination(prev => ({
            ...prev,
            current: currentPage,
            pageSize: currentPageSize,
            total: parseInt(response.total || '0', 10),
          }))
        }
      } catch (error) {
        console.error('获取模板列表失败:', error)
        if (mountedRef.current) setDataSource([])
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    },
    [searchParams.keyword, searchParams.status, searchParams.messageType]
  )

  // URL 变化时（如浏览器后退）同步到表单
  useEffect(() => {
    setSearchParams(parseSearchParamsFromUrl(urlSearchParams))
  }, [urlSearchParams.toString()])

  // 搜索条件变化即同步到 URL（replace 避免每次输入都产生历史记录）
  useEffect(() => {
    applySearchToUrl(
      setUrlSearchParams,
      {
        keyword: searchParams.keyword,
        status: searchParams.status,
        messageType: searchParams.messageType,
      },
      { replace: true }
    )
  }, [searchParams.keyword, searchParams.status, searchParams.messageType])

  const handleSearch = useCallback((keywordFromInput?: string) => {
    if (keywordFromInput !== undefined) {
      setSearchParams(prev => ({ ...prev, keyword: keywordFromInput }))
    }
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchData(1, paginationRef.current.pageSize, keywordFromInput)
  }, [fetchData])

  const handleReset = useCallback(() => {
    setSearchParams(defaultSearchParams)
    setUrlSearchParams({})
    setPagination({ current: 1, pageSize: 10, total: 0 })
    fetchData(1, 10)
  }, [fetchData])

  const handleTableChange = useCallback(
    (page: number, pageSize: number) => {
      fetchData(page, pageSize)
    },
    [fetchData]
  )

  const columns: ColumnsType<TemplateItem> = useMemo(() => {
    const emptyPlaceholder = (text: unknown) => (text == null || text === '') ? '-' : String(text)
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
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <IconFont type={getMessageTypeIconType(messageType)} />
            {getMessageTypeLabel(messageType, t)}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: t('table.status'),
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
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: t('template.table.updatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      minWidth: 100,
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: t('table.action'),
      key: 'action',
      fixed: 'right',
      width: 140,
      align: 'center',
      render: (_, record) => {
        const isEnabled = record.status === GlobalStatus.ENABLED
        const action = isEnabled ? t(`common.status.${GlobalStatus.DISABLED}`) : t(`common.status.${GlobalStatus.ENABLED}`)
        const handleStatusClick = () => {
          modal.confirm({
            title: t('template.confirm.status.title', { action }),
            content: t('template.confirm.status.content', { action, name: record.name }),
            onOk: () => handleStatusChange(record, isEnabled ? GlobalStatus.DISABLED : GlobalStatus.ENABLED),
            okText: t('common.ok'),
            cancelText: t('common.cancel'),
          })
        }

        const handleDeleteClick = () => {
          modal.confirm({
            title: t('template.confirm.delete.title'),
            content: t('template.confirm.delete.content', { name: record.name }),
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
  }, [t])

  // 处理新增
  const handleAdd = () => {
    setDetailFormMode('create')
    setEditingData(null)
    setDetailFormOpen(true)
  }

  // 处理查看详情
  const handleViewDetail = (record: TemplateItem) => {
    setViewingData(record)
    setDetailViewOpen(true)
  }

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

  // 处理删除
  const handleDelete = async (record: TemplateItem) => {
    try {
      await deleteTemplate(record.uid)
      message.success(t('message.delete.success'))
      fetchData()
    } catch (error) {
      console.error('删除失败:', error)
      // 错误信息已由 API 拦截器处理
    }
  }

  // 处理修改状态
  const handleStatusChange = async (record: TemplateItem, newStatus: GlobalStatus) => {
    try {
      await updateTemplateStatus({ uid: record.uid, status: newStatus })
      message.success(t('message.update.success'))
      fetchData()
      // 如果详情页打开，需要更新详情页数据
      if (viewingData && viewingData.uid === record.uid) {
        setViewingData({ ...viewingData, status: newStatus })
      }
    } catch (error) {
      console.error('修改状态失败:', error)
      // 错误信息已由 API 拦截器处理
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

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    fetchData()
    // 仅在 status / messageType 变化时重新拉取，keyword 由「搜索」按钮触发
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.status, searchParams.messageType])

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
            onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
            className="w-full min-w-[120px] sm:w-48 md:w-52"
          />
          <span>{t('common.status')}:</span>
          <Radio.Group
            value={searchParams.status}
            onChange={(e) => {
              setSearchParams(prev => ({ ...prev, status: e.target.value }))
              setPagination(prev => ({ ...prev, current: 1 }))
            }}
            buttonStyle="solid"
          >
            <Radio.Button value={undefined}>{t('table.search.all')}</Radio.Button>
            <Radio.Button value={GlobalStatus.ENABLED}>{t(`common.status.${GlobalStatus.ENABLED}`)}</Radio.Button>
            <Radio.Button value={GlobalStatus.DISABLED}>{t(`common.status.${GlobalStatus.DISABLED}`)}</Radio.Button>
          </Radio.Group>
          <span>{t('template.table.app')}:</span>
          <Select
            placeholder={t('template.search.app.placeholder')}
            value={searchParams.messageType ?? null}
            onChange={(value:MessageType) => {
              setSearchParams(prev => ({ ...prev, messageType: value  }))
              setPagination(prev => ({ ...prev, current: 1 }))
            }}
            className='w-45'
            options={[
              { label: t('table.search.all'), value: null },
              ...getMessageTypeOptions(t).map(opt => ({
                value: opt.value,
                label: (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <IconFont type={getMessageTypeIconType(opt.value)} />
                    {opt.label}
                  </span>
                ),
              })),
            ]}
          />
          <Button onClick={() => handleSearch()} type="primary">
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
export default function TemplateList() {
  return (
    <App className='h-full'>
      <PageContent>
        <TemplateListContent />
      </PageContent>
    </App>
  )
}
