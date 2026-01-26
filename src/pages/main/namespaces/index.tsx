import React, { useState, useRef, useEffect } from 'react'
import { Table, Input, Radio, Button, Space, message, Tag, Dropdown, App } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import { SearchOutlined, ReloadOutlined, PlusOutlined, ExportOutlined, MoreOutlined } from '@ant-design/icons'
import { type NamespaceItem, type NamespaceListParams, deleteNamespace, updateNamespaceStatus } from '@/api/namespace/index'
// import { getNamespaceTableList } from '@/api/namespace/index' // 真实API调用，需要时取消注释
import dayjs from 'dayjs'
import DetailForm from './components/DetailForm'
import DetailView from './components/DetailView'

// 生成模拟数据
const generateMockData = (): NamespaceItem[] => {
  const mockData: NamespaceItem[] = []
  const names = ['生产环境', '测试环境', '开发环境', '预发布环境', '演示环境', '沙箱环境', 'UAT环境', 'SIT环境', '生产备份', '测试备份']
  const statuses = [1, 1, 1, 2, 1, 2, 1, 1, 2, 1] // 混合启用和禁用状态
  
  for (let i = 0; i < 50; i++) {
    const nameIndex = i % names.length
    const status = statuses[nameIndex] || (i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : 1)
    const createdAt = dayjs().subtract(Math.floor(Math.random() * 365), 'day').subtract(Math.floor(Math.random() * 24), 'hour')
    const updatedAt = createdAt.add(Math.floor(Math.random() * 30), 'day')
    
    mockData.push({
      uid: `ns-${String(i + 1).padStart(6, '0')}`,
      name: `${names[nameIndex]}${i >= names.length ? `-${Math.floor(i / names.length) + 1}` : ''}`,
      status,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      metadata: {
        description: `这是${names[nameIndex]}的命名空间`,
        owner: `user-${Math.floor(Math.random() * 10) + 1}`,
      },
    })
  }
  
  return mockData
}

const NamespaceList: React.FC = () => {
  const { modal } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<NamespaceItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [searchParams, setSearchParams] = useState<NamespaceListParams>({
    keyword: '',
    status: undefined,
  })
  const [tableHeight, setTableHeight] = useState<number>(0)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [detailFormMode, setDetailFormMode] = useState<'create' | 'edit'>('create')
  const [editingData, setEditingData] = useState<NamespaceItem | null>(null)
  const [detailViewOpen, setDetailViewOpen] = useState(false)
  const [viewingData, setViewingData] = useState<NamespaceItem | null>(null)

  // 获取数据（使用模拟数据）
  const fetchData = async (page?: number, pageSize?: number) => {
    setLoading(true)
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 使用传入的参数或当前 state 的值
      const currentPage = page ?? pagination.current
      const currentPageSize = pageSize ?? pagination.pageSize
      
      // 生成所有模拟数据
      let allData = generateMockData()
      
      // 关键字过滤
      if (searchParams.keyword) {
        const keyword = searchParams.keyword.toLowerCase()
        allData = allData.filter(item => 
          item.name.toLowerCase().includes(keyword) || 
          item.uid.toLowerCase().includes(keyword)
        )
      }
      
      // 状态过滤
      if (searchParams.status !== undefined) {
        allData = allData.filter(item => item.status === searchParams.status)
      }
      
      // 分页处理
      const total = allData.length
      const start = (currentPage - 1) * currentPageSize
      const end = start + currentPageSize
      const paginatedData = allData.slice(start, end)
      
      setDataSource(paginatedData)
      setPagination(prev => ({
        ...prev,
        current: currentPage,
        pageSize: currentPageSize,
        total,
      }))
      
      // 如果需要使用真实API，取消下面的注释并注释掉上面的模拟数据逻辑
      /*
      const params: NamespaceListParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword: searchParams.keyword || undefined,
        status: searchParams.status,
      }
      const response = await getNamespaceTableList(params)
      if (response) {
        setDataSource(response.items || [])
        setPagination(prev => ({
          ...prev,
          total: parseInt(response.total || '0', 10),
        }))
      }
      */
    } catch (error) {
      console.error('获取命名空间列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 处理搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchData()
  }

  // 处理重置
  const handleReset = () => {
    setSearchParams({
      keyword: '',
      status: undefined,
    })
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    })
    // 重置后查询
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
      title: 'UID',
      dataIndex: 'uid',
      key: 'uid',
      width: 200,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => {
        const statusMap: Record<number, { text: string; color: string }> = {
          0: { text: '未知', color: 'default' },
          1: { text: '启用', color: 'success' },
          2: { text: '禁用', color: 'error' },
        }
        const statusInfo = statusMap[status] || statusMap[0]
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => {
        const handleStatusClick = () => {
          // 使用 modal.confirm 自动继承主题配置
          modal.confirm({
            title: `确定要${record.status === 1 ? '禁用' : '启用'}吗？`,
            content: `${record.status === 1 ? '禁用' : '启用'}命名空间 "${record.name}"`,
            onOk: () => handleStatusChange(record, record.status === 1 ? 2 : 1),
            okText: '确定',
            cancelText: '取消',
          })
        }

        const menuItems: MenuProps['items'] = [
          {
            key: 'detail',
            label: '详情',
            onClick: () => handleViewDetail(record),
          },
          {
            key: 'edit',
            label: '编辑',
            onClick: () => handleEdit(record),
          },
          {
            key: 'status',
            label: record.status === 1 ? '禁用' : '启用',
            onClick: handleStatusClick,
          },
        ]

        return (
          <Space size="small">
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button type="link" size="small" icon={<MoreOutlined />}>
                更多
              </Button>
            </Dropdown>
            <Button
              type="link"
              danger
              size="small"
              onClick={() => {
                modal.confirm({
                  title: '确定要删除吗？',
                  content: `删除命名空间 "${record.name}"`,
                  onOk: () => handleDelete(record),
                  okText: '确定',
                  cancelText: '取消',
                })
              }}
            >
              删除
            </Button>
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
      // TODO: 接口通后取消注释
      // await deleteNamespace(record.uid)
      console.log('删除命名空间:', record.uid)
      message.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('删除失败:', error)
      // 错误信息已由 API 拦截器处理
    }
  }

  // 处理修改状态
  const handleStatusChange = async (record: NamespaceItem, newStatus: number) => {
    try {
      // TODO: 接口通后取消注释
      // await updateNamespaceStatus(record.uid, newStatus)
      console.log('修改状态:', record.uid, newStatus)
      message.success('状态修改成功')
      fetchData()
      // 如果详情页打开，需要更新详情页数据
      if (detailViewOpen && viewingData && viewingData.uid === record.uid) {
        const updatedData = dataSource.find(item => item.uid === record.uid)
        if (updatedData) {
          setViewingData({ ...updatedData, status: newStatus })
        }
      }
    } catch (error) {
      console.error('修改状态失败:', error)
      // 错误信息已由 API 拦截器处理
    }
  }

  // 处理详情表单成功回调
  const handleDetailFormSuccess = () => {
    // 刷新列表
    fetchData()
    // 如果详情页打开，需要更新详情页数据
    if (detailViewOpen && viewingData) {
      // 从表格数据中查找对应的数据并更新
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
        console.log('containerHeight', containerHeight)
        console.log('theadHeight', theadHeight)
        console.log('paginationHeight', paginationHeight)
        console.log('tableBodyPadding', tableBodyPadding)
        const calculatedHeight = containerHeight - theadHeight - paginationHeight - tableBodyPadding
        setTableHeight(Math.max(calculatedHeight, 200)) // 最小高度200px
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
          <Input
            placeholder="请输入关键字"
            allowClear
            className='w-50'
            value={searchParams.keyword}
            onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
          />
          <Radio.Group
            value={searchParams.status}
            onChange={(e) => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
            buttonStyle="solid"
          >
            <Radio.Button value={undefined}>全部</Radio.Button>
            <Radio.Button value={1}>启用</Radio.Button>
            <Radio.Button value={2}>禁用</Radio.Button>
          </Radio.Group>
          <Button icon={<SearchOutlined />} onClick={handleSearch} type="primary">
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Space>
        <Space>
          <Button icon={<PlusOutlined />} type="primary" onClick={handleAdd}>
            新增
          </Button>
          <Button icon={<ExportOutlined />} onClick={handleExport}>
            导出
          </Button>
        </Space>
      </div>
      <div ref={tableContainerRef} className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
        <div ref={tableWrapperRef} className="h-full flex flex-col">
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey="uid"
            loading={loading}
            size="small"
            scroll={tableHeight > 0 ? { y: tableHeight } : undefined}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
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
