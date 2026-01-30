import React, { useState, useRef, useEffect } from 'react'
import { Table, Input, Radio, Button, Space, message, Tag, Dropdown, App, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import { type WebhookItem, type WebhookListParams } from '@/api/webhook/index'
// import { getWebhookTableList, deleteWebhook, updateWebhookStatus } from '@/api/webhook/index' // 真实API调用，需要时取消注释
import dayjs from 'dayjs'
import DetailForm from './components/DetailForm'
import DetailView from './components/DetailView'
import { useLocale } from '@/contexts/LocaleContext'
import { getAppOptions, getAppLabel, getMethodOptions, getMethodLabel } from './constants'

// 生成模拟数据
const generateMockData = (): WebhookItem[] => {
  const mockData: WebhookItem[] = []
  const names = ['订单通知Webhook', '支付回调Webhook', '用户注册Webhook', '系统告警Webhook', '数据同步Webhook', '消息推送Webhook', '日志上报Webhook', '监控告警Webhook', '备份完成Webhook', '任务完成Webhook']
  const statuses = [1, 1, 1, 2, 1, 2, 1, 1, 2, 1] // 混合启用和禁用状态
  const apps = [1, 2, 3, 4, 5, 6, 7, 1, 2, 3]
  const methods = [1, 2, 2, 2, 1, 2, 2, 2, 2, 2] // GET, POST 等
  const urls = [
    'https://api.example.com/webhook/order',
    'https://api.example.com/webhook/payment',
    'https://api.example.com/webhook/register',
    'https://api.example.com/webhook/alert',
    'https://api.example.com/webhook/sync',
    'https://api.example.com/webhook/push',
    'https://api.example.com/webhook/log',
    'https://api.example.com/webhook/monitor',
    'https://api.example.com/webhook/backup',
    'https://api.example.com/webhook/task',
  ]
  
  for (let i = 0; i < 50; i++) {
    const nameIndex = i % names.length
    const status = statuses[nameIndex] || (i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : 1)
    const app = apps[nameIndex] || apps[i % apps.length]
    const method = methods[nameIndex] || methods[i % methods.length]
    const createdAt = dayjs().subtract(Math.floor(Math.random() * 365), 'day').subtract(Math.floor(Math.random() * 24), 'hour')
    const updatedAt = createdAt.add(Math.floor(Math.random() * 30), 'day')
    
    mockData.push({
      uid: `wh-${String(i + 1).padStart(6, '0')}`,
      name: `${names[nameIndex]}${i >= names.length ? `-${Math.floor(i / names.length) + 1}` : ''}`,
      app,
      url: urls[nameIndex] || urls[i % urls.length],
      method,
      secret: '******',
      headers: i % 2 === 0 ? { 'Content-Type': 'application/json', 'X-Custom-Header': 'value' } : undefined,
      status,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    })
  }
  
  return mockData
}

const WebhookListContent: React.FC = () => {
  const { modal } = App.useApp()
  const { t } = useLocale()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<WebhookItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [searchParams, setSearchParams] = useState<WebhookListParams>({
    keyword: '',
    status: undefined,
    app: undefined,
  })
  const [tableHeight, setTableHeight] = useState<number>(0)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [detailFormMode, setDetailFormMode] = useState<'create' | 'edit'>('create')
  const [editingData, setEditingData] = useState<WebhookItem | null>(null)
  const [detailViewOpen, setDetailViewOpen] = useState(false)
  const [viewingData, setViewingData] = useState<WebhookItem | null>(null)

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
          item.uid.toLowerCase().includes(keyword) ||
          item.url.toLowerCase().includes(keyword)
        )
      }
      
      // 状态过滤
      if (searchParams.status !== undefined) {
        allData = allData.filter(item => item.status === searchParams.status)
      }
      
      // 应用过滤
      if (searchParams.app !== undefined) {
        allData = allData.filter(item => item.app === searchParams.app)
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
      const params: WebhookListParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword: searchParams.keyword || undefined,
        status: searchParams.status,
        app: searchParams.app,
      }
      const response = await getWebhookTableList(params)
      if (response) {
        setDataSource(response.items || [])
        setPagination(prev => ({
          ...prev,
          total: parseInt(response.total || '0', 10),
        }))
      }
      */
    } catch (error) {
      console.error('获取Webhook列表失败:', error)
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
      app: undefined,
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
  const columns: ColumnsType<WebhookItem> = [
    {
      title: t('webhook.table.uid'),
      dataIndex: 'uid',
      key: 'uid',
      minWidth: 100,
    },
    {
      title: t('webhook.table.name'),
      dataIndex: 'name',
      key: 'name',
      minWidth: 100,
    },
    {
      title: t('webhook.table.app'),
      dataIndex: 'app',
      key: 'app',
      minWidth: 60,
      render: (app: number) => getAppLabel(app, t),
    },
    {
      title: t('webhook.table.url'),
      dataIndex: 'url',
      key: 'url',
      minWidth: 150,
      ellipsis: true,
    },
    {
      title: t('webhook.table.method'),
      dataIndex: 'method',
      key: 'method',
      minWidth: 60,
      render: (method: number) => getMethodLabel(method, t),
    },
    {
      title: t('table.status'),
      dataIndex: 'status',
      key: 'status',
      minWidth: 60,
      render: (status: number) => {
        const statusMap: Record<number, { text: string; color: string }> = {
          0: { text: t('table.unknown'), color: 'default' },
          1: { text: t('table.enable'), color: 'success' },
          2: { text: t('table.disable'), color: 'error' },
        }
        const statusInfo = statusMap[status] || statusMap[0]
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
      width: 120,
      fixed: 'right',
      render: (_, record) => {
        const handleStatusClick = () => {
          const action = record.status === 1 ? t('table.disable') : t('table.enable')
          modal.confirm({
            title: t('webhook.confirm.status.title', { action }),
            content: t('webhook.confirm.status.content', { action, name: record.name }),
            onOk: () => handleStatusChange(record, record.status === 1 ? 2 : 1),
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
            label: record.status === 1 ? t('table.disable') : t('table.enable'),
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
      // TODO: 接口通后取消注释
      // await deleteWebhook(record.uid)
      console.log('删除Webhook:', record.uid)
      message.success(t('message.delete.success'))
      fetchData()
    } catch (error) {
      console.error('删除失败:', error)
      // 错误信息已由 API 拦截器处理
    }
  }

  // 处理修改状态
  const handleStatusChange = async (record: WebhookItem, newStatus: number) => {
    try {
      // TODO: 接口通后取消注释
      // await updateWebhookStatus(record.uid, newStatus)
      console.log('修改状态:', record.uid, newStatus)
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

  // 初始化加载数据
  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          <Input
            placeholder={t('table.search.placeholder')}
            value={searchParams.keyword}
            onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
            className="w-full min-w-[120px] sm:w-48 md:w-52"
          />
          <Radio.Group
            value={searchParams.status}
            onChange={(e) => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
            buttonStyle="solid"
          >
            <Radio.Button value={undefined}>{t('table.search.all')}</Radio.Button>
            <Radio.Button value={1}>{t('table.search.enabled')}</Radio.Button>
            <Radio.Button value={2}>{t('table.search.disabled')}</Radio.Button>
          </Radio.Group>
          <Select
            placeholder={t('webhook.search.app.placeholder')}
            value={searchParams.app}
            onChange={(value) => setSearchParams(prev => ({ ...prev, app: value || undefined }))}
            className='w-30'
            allowClear
            options={getAppOptions(t)}
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
      <WebhookListContent />
    </App>
  )
}
