import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Table, Input, Radio, Button, Space, message, Tag, Dropdown, App } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import { type NamespaceItem, type NamespaceListParams, getNamespaceTableList, deleteNamespace, updateNamespaceStatus } from '@/api/namespace/index'
import { GlobalStatus } from '@/api/types'
import dayjs from 'dayjs'
import DetailForm from './components/DetailForm'
import DetailView from './components/DetailView'
import { useLocale } from '@/contexts/LocaleContext'
import { useNamespace } from '@/contexts/NamespaceContext'
import { applySearchToUrl, getParam } from '@/utils/urlSearchParams'

const defaultSearchParams: NamespaceListParams = {
  keyword: '',
  status: undefined,
}

function parseSearchParamsFromUrl(params: URLSearchParams): NamespaceListParams {
  return {
    keyword: getParam(params, 'keyword') ?? '',
    status: (getParam(params, 'status') as GlobalStatus) ?? undefined,
  }
}

const NamespaceList: React.FC = () => {
  const { modal } = App.useApp()
  const { t } = useLocale()
  const { refreshNamespaceList, setCurrentNamespace } = useNamespace()
  const [urlSearchParams, setUrlSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<NamespaceItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [searchParams, setSearchParams] = useState<NamespaceListParams>(() =>
    parseSearchParamsFromUrl(urlSearchParams)
  )
  const [tableHeight, setTableHeight] = useState<number>(0)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [detailFormMode, setDetailFormMode] = useState<'create' | 'edit'>('create')
  const [editingData, setEditingData] = useState<NamespaceItem | null>(null)
  const [detailViewOpen, setDetailViewOpen] = useState(false)
  const [viewingData, setViewingData] = useState<NamespaceItem | null>(null)

  // 获取数据
  const fetchData = async (page?: number, pageSize?: number) => {
    setLoading(true)
    try {
      // 使用传入的参数或当前 state 的值
      const currentPage = page ?? pagination.current
      const currentPageSize = pageSize ?? pagination.pageSize

      const params: NamespaceListParams = {
        page: currentPage,
        pageSize: currentPageSize,
        keyword: searchParams.keyword || undefined,
        status: searchParams.status,
      }
      const response = await getNamespaceTableList(params)
      if (response) {
        setDataSource(response.items || [])
        setPagination(prev => ({
          ...prev,
          current: currentPage,
          pageSize: currentPageSize,
          total: parseInt(response.total || '0', 10),
        }))
      }
    } catch (error) {
      console.error('获取命名空间列表失败:', error)
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
      { keyword: searchParams.keyword, status: searchParams.status },
      { replace: true }
    )
  }, [searchParams.keyword, searchParams.status])

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

  // 表格列定义
  const columns: ColumnsType<NamespaceItem> = [
    {
      title: t('namespace.table.uid'),
      dataIndex: 'uid',
      key: 'uid',
      minWidth: 60,
    },
    {
      title: t('namespace.table.name'),
      dataIndex: 'name',
      key: 'name',
      minWidth: 120,
    },
    {
      title: t('table.status'),
      dataIndex: 'status',
      key: 'status',
      minWidth: 60,
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          [GlobalStatus.UNKNOWN]: { text: t('table.unknown'), color: 'default' },
          [GlobalStatus.ENABLED]: { text: t('table.enable'), color: 'success' },
          [GlobalStatus.DISABLED]: { text: t('table.disable'), color: 'error' },
        }
        const statusInfo = statusMap[status] || statusMap[GlobalStatus.UNKNOWN]
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      },
    },
    {
      title: t('namespace.table.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      minWidth: 100,
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: t('namespace.table.updatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      minWidth: 100,
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: t('table.action'),
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => {
        const handleStatusClick = () => {
          const isEnabled = record.status === GlobalStatus.ENABLED
          const action = isEnabled ? t('table.disable') : t('table.enable')
          modal.confirm({
            title: t('namespace.confirm.status.title', { action }),
            content: t('namespace.confirm.status.content', { action, name: record.name }),
            onOk: () => handleStatusChange(record, isEnabled ? GlobalStatus.DISABLED : GlobalStatus.ENABLED),
            okText: t('common.ok'),
            cancelText: t('common.cancel'),
          })
        }

        const isEnabled = record.status === GlobalStatus.ENABLED
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
            onClick: () => {
              modal.confirm({
                title: t('namespace.confirm.delete.title'),
                content: t('namespace.confirm.delete.content', { name: record.name }),
                okText: t('common.ok'),
                cancelText: t('common.cancel'),
                onOk: () => handleDelete(record),
              })
            },
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
  const handleViewDetail = (record: NamespaceItem) => {
    setViewingData(record)
    setDetailViewOpen(true)
  }

  // 处理编辑
  const handleEdit = (record: NamespaceItem) => {
    setDetailFormMode('edit')
    setEditingData(record)
    setDetailFormOpen(true)
  }

  // 从详情页跳转到编辑
  const handleEditFromDetail = (data: NamespaceItem) => {
    setDetailViewOpen(false)
    setDetailFormMode('edit')
    setEditingData(data)
    setDetailFormOpen(true)
  }

  // 处理删除
  const handleDelete = async (record: NamespaceItem) => {
    try {
      await deleteNamespace(record.uid)
      message.success(t('message.delete.success'))
      fetchData()
      refreshNamespaceList()
    } catch (error) {
      console.error('删除失败:', error)
      // 错误信息已由 API 拦截器处理
    }
  }

  // 处理修改状态
  const handleStatusChange = async (record: NamespaceItem, newStatus: GlobalStatus | string) => {
    try {
      await updateNamespaceStatus(record.uid, newStatus)
      message.success(t('message.update.success'))
      fetchData()
      refreshNamespaceList()
      // 如果详情页打开，需要更新详情页数据
      if (detailViewOpen && viewingData && viewingData.uid === record.uid) {
        const updatedData = dataSource.find(item => item.uid === record.uid)
        if (updatedData) {
          setViewingData({ ...updatedData, status: newStatus as GlobalStatus })
        }
      }
    } catch (error) {
      console.error('修改状态失败:', error)
      // 错误信息已由 API 拦截器处理
    }
  }

  // 处理详情表单成功回调（创建时传入新建的命名空间，便于设为当前选中）
  const handleDetailFormSuccess = (created?: NamespaceItem) => {
    // 新建成功：通过 Context 设为当前选中，头部下拉会立即更新
    console.log('created', created)
    if (created) {
      setCurrentNamespace(created.uid)
      refreshNamespaceList().then(() => fetchData())
    } else {
      fetchData()
      refreshNamespaceList()
    }
    // 如果详情页打开，需要更新详情页数据
    if (detailViewOpen && viewingData) {
      const updatedData = dataSource.find(item => item.uid === viewingData.uid)
      if (updatedData) {
        setViewingData(updatedData)
      }
    }
  }

  // 处理导出
  const handleExport = () => {
    // TODO: 实现导出功能
    console.log('导出命名空间')
  }

  // 初始化数据加载
  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.status]) // 只在组件挂载时执行一次

  // 计算表格高度（自动获取分页器高度、表头高度和 margin）
  useEffect(() => {
    const updateTableHeight = () => {
      if (tableContainerRef.current && tableWrapperRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight

        // 查找表头元素（Ant Design Table 的表头）
        const theadElement = tableWrapperRef.current.querySelector('.ant-table-thead')
        let theadHeight = 0
        if (theadElement) {
          const theadRect = theadElement.getBoundingClientRect()
          const theadStyle = window.getComputedStyle(theadElement)
          const theadMarginBottom = parseFloat(theadStyle.marginBottom) || 0
          theadHeight = theadRect.height + theadMarginBottom
        }

        // 查找分页器元素（Ant Design Table 的分页器）
        const paginationElement = tableWrapperRef.current.querySelector('.ant-pagination')
        let paginationHeight = 0

        if (paginationElement) {
          // 获取分页器的实际高度（包括 margin）
          const paginationRect = paginationElement.getBoundingClientRect()
          const paginationStyle = window.getComputedStyle(paginationElement)
          const marginTop = parseFloat(paginationStyle.marginTop) || 0
          const marginBottom = parseFloat(paginationStyle.marginBottom) || 0
          paginationHeight = paginationRect.height + marginTop + marginBottom
        }

        // 查找表格主体容器，获取其 padding
        const tableBodyElement = tableWrapperRef.current.querySelector('.ant-table-body')
        let tableBodyPadding = 0
        if (tableBodyElement) {
          const bodyStyle = window.getComputedStyle(tableBodyElement)
          const paddingTop = parseFloat(bodyStyle.paddingTop) || 0
          const paddingBottom = parseFloat(bodyStyle.paddingBottom) || 0
          tableBodyPadding = paddingTop + paddingBottom
        }

        // 计算表格可用的滚动高度 = 容器高度 - 表头高度 - 分页器高度 - 表格主体 padding
        const calculatedHeight = containerHeight - theadHeight - paginationHeight - tableBodyPadding
        setTableHeight(Math.max(calculatedHeight, 100)) // 最小高度100px
      }
    }

    // 初始计算（延迟一下确保 DOM 已渲染）
    const timer = setTimeout(updateTableHeight, 100)

    // 使用 ResizeObserver 监听容器大小变化
    let resizeObserver: ResizeObserver | null = null
    if (tableContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        // 延迟一下，确保分页器已渲染
        setTimeout(updateTableHeight, 0)
      })
      resizeObserver.observe(tableContainerRef.current)
    }

    // 使用 MutationObserver 监听分页器变化（比如分页器显示/隐藏、内容变化）
    let mutationObserver: MutationObserver | null = null
    if (tableWrapperRef.current) {
      mutationObserver = new MutationObserver(() => {
        setTimeout(updateTableHeight, 0)
      })
      mutationObserver.observe(tableWrapperRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      })
    }

    // 监听窗口大小变化
    window.addEventListener('resize', updateTableHeight)

    return () => {
      clearTimeout(timer)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      if (mutationObserver) {
        mutationObserver.disconnect()
      }
      window.removeEventListener('resize', updateTableHeight)
    }
  }, [dataSource, pagination]) // 当数据或分页变化时重新计算

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-between items-start shrink-0">
        <Space size="middle" wrap>
          <span>{t('table.search.keyword')}:</span>
          <Input
            placeholder={t('table.search.placeholder')}
            allowClear
            className="w-full min-w-[120px] sm:w-48 md:w-52"
            value={searchParams.keyword}
            onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
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
              showTotal: (total) => t('table.total', { total }),
              onChange: handleTableChange,
              onShowSizeChange: handleTableChange,
            }}
          />
        </div>
      </div>
      <DetailForm
        open={detailFormOpen}
        mode={detailFormMode}
        initialData={editingData}
        onCancel={() => setDetailFormOpen(false)}
        onSuccess={handleDetailFormSuccess}
      />
      <DetailView
        open={detailViewOpen}
        data={viewingData}
        onCancel={() => setDetailViewOpen(false)}
        onEdit={handleEditFromDetail}
      />
    </div>
  )
}

// 使用 App.useApp() 需要包裹在 App 组件中
export default function NamespaceListWrapper() {
  return (
    <App className='h-full'>
      <NamespaceList />
    </App>
  )
}
