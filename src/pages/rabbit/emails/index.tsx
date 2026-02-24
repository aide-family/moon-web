import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Table, Input, Radio, Button, Space, message, Tag, Dropdown, App } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import {
  type EmailItem,
  type EmailListParams,
  getEmailTableList,
  deleteEmail,
  updateEmailStatus,
} from '@/api/email/index'
import dayjs from 'dayjs'
import DetailForm from './components/DetailForm'
import DetailView from './components/DetailView'
import { useLocale } from '@/contexts/LocaleContext'
import { GlobalStatus } from '@/api'
import { applySearchToUrl, getParam } from '@/utils/urlSearchParams'

const defaultSearchParams: EmailListParams = {
  keyword: '',
  status: undefined,
}

function parseSearchParamsFromUrl(params: URLSearchParams): EmailListParams {
  return {
    keyword: getParam(params, 'keyword') ?? '',
    status: (getParam(params, 'status') as GlobalStatus) ?? undefined,
  }
}

const EmailListContent: React.FC = () => {
  const { modal } = App.useApp()
  const { t } = useLocale()
  const [urlSearchParams, setUrlSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<EmailItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [searchParams, setSearchParams] = useState<EmailListParams>(() =>
    parseSearchParamsFromUrl(urlSearchParams)
  )
  const [tableHeight, setTableHeight] = useState<number>(0)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [detailFormMode, setDetailFormMode] = useState<'create' | 'edit'>('create')
  const [editingData, setEditingData] = useState<EmailItem | null>(null)
  const [detailViewOpen, setDetailViewOpen] = useState(false)
  const [viewingData, setViewingData] = useState<EmailItem | null>(null)

  // 获取数据（真实接口）
  const fetchData = async (page?: number, pageSize?: number) => {
    setLoading(true)
    try {
      const currentPage = page ?? pagination.current
      const currentPageSize = pageSize ?? pagination.pageSize
      const params: EmailListParams = {
        page: currentPage,
        pageSize: currentPageSize,
        keyword: searchParams.keyword || undefined,
        status: searchParams.status,
      }
      const response = await getEmailTableList(params)
      setDataSource(response?.items ?? [])
      setPagination(prev => ({
        ...prev,
        current: currentPage,
        pageSize: currentPageSize,
        total: parseInt(String(response?.total ?? 0), 10),
      }))
    } catch (error) {
      console.error('获取邮件配置列表失败:', error)
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
  const columns: ColumnsType<EmailItem> = [
    {
      title: t('email.table.uid'),
      dataIndex: 'uid',
      key: 'uid',
      minWidth: 60,
    },
    {
      title: t('email.table.name'),
      dataIndex: 'name',
      key: 'name',
      minWidth: 120,
    },
    {
      title: t('email.table.host'),
      dataIndex: 'host',
      key: 'host',
      minWidth: 60,
    },
    {
      title: t('email.table.port'),
      dataIndex: 'port',
      key: 'port',
      minWidth: 120,
    },
    {
      title: t('email.table.username'),
      dataIndex: 'username',
      key: 'username',
      minWidth: 120,
    },
    {
      title: t('table.status'),
      dataIndex: 'status',
      key: 'status',
      minWidth: 60,
      render: (status: GlobalStatus) => {
        const statusMap: Record<GlobalStatus, { text: string; color: string }> = {
          [GlobalStatus.UNKNOWN]: { text: t('table.unknown'), color: 'default' },
          [GlobalStatus.ENABLED]: { text: t('table.enable'), color: 'success' },
          [GlobalStatus.DISABLED]: { text: t('table.disable'), color: 'error' },
        }
        const statusInfo = statusMap[status] || statusMap[GlobalStatus.UNKNOWN]
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      },
    },
    {
      title: t('email.table.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      minWidth: 100,
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: t('email.table.updatedAt'),
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
        const isEnabled = record.status === GlobalStatus.ENABLED
        const handleStatusClick = () => {
          const action = isEnabled ? t('table.disable') : t('table.enable')
          modal.confirm({
            title: t('email.confirm.status.title', { action }),
            content: t('email.confirm.status.content', { action, name: record.name }),
            onOk: () => handleStatusChange(record, isEnabled ? GlobalStatus.DISABLED : GlobalStatus.ENABLED),
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
  const handleViewDetail = (record: EmailItem) => {
    setViewingData(record)
    setDetailViewOpen(true)
  }

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

  // 处理删除
  const handleDelete = async (record: EmailItem) => {
    try {
      await deleteEmail(record.uid)
      message.success(t('message.delete.success'))
      fetchData()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  // 处理修改状态
  const handleStatusChange = async (record: EmailItem, newStatus: GlobalStatus) => {
    try {
      await updateEmailStatus(record.uid, newStatus)
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
  }, [searchParams.status])

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
export default function EmailList() {
  return (
    <App className='h-full'>
      <EmailListContent />
    </App>
  )
}
