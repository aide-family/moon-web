import React, { useState, useRef, useEffect } from 'react'
import { Table, Input, Button, Space, message, Dropdown, App } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import {
  type StrategyItem,
  type StrategyListParams,
  getStrategyList,
  deleteStrategy,
} from '@/api/strategy/index'
import dayjs from 'dayjs'

function getTypeLabel(value: string | undefined, t: (key: string) => string): string {
  if (value == null || value === '') return '-'
  return t(`datasource.type.${value}`) || value
}
function getDriverLabel(value: string | undefined, t: (key: string) => string): string {
  if (value == null || value === '') return '-'
  return t(`datasource.driver.${value}`) || value
}
import DetailForm from './components/DetailForm'
import DetailView from './components/DetailView'
import { useLocale } from '@/contexts/LocaleContext'

const defaultSearchParams: StrategyListParams = {
  keyword: '',
}

const StrategyListContent: React.FC = () => {
  const { modal } = App.useApp()
  const { t } = useLocale()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<StrategyItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [searchParams, setSearchParams] = useState<StrategyListParams>(defaultSearchParams)
  const [tableHeight, setTableHeight] = useState<number>(0)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [detailFormMode, setDetailFormMode] = useState<'create' | 'edit'>('create')
  const [editingData, setEditingData] = useState<StrategyItem | null>(null)
  const [detailViewOpen, setDetailViewOpen] = useState(false)
  const [viewingData, setViewingData] = useState<StrategyItem | null>(null)

  const fetchData = async (page?: number, pageSize?: number) => {
    setLoading(true)
    try {
      const currentPage = page ?? pagination.current
      const currentPageSize = pageSize ?? pagination.pageSize
      const params: StrategyListParams = {
        page: currentPage,
        pageSize: currentPageSize,
        keyword: searchParams.keyword || undefined,
        type: searchParams.type,
        driver: searchParams.driver,
        status: searchParams.status,
        strategyGroupUID: searchParams.strategyGroupUID,
      }
      const response = await getStrategyList(params)
      const items = response?.items ?? []
      const meta = response?.metadata
      const total = parseInt(String(meta?.total ?? 0), 10)
      setDataSource(items)
      setPagination(prev => ({
        ...prev,
        current: currentPage,
        pageSize: currentPageSize,
        total,
      }))
    } catch (error) {
      console.error('获取策略列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchData(1, pagination.pageSize)
  }

  const handleReset = () => {
    setSearchParams(defaultSearchParams)
    setPagination(prev => ({ ...prev, current: 1, total: 0 }))
    fetchData(1, pagination.pageSize)
  }

  const handleTableChange = (page: number, pageSize: number) => {
    fetchData(page, pageSize)
  }

  const emptyPlaceholder = (text: unknown) => (text == null || text === '') ? '-' : text
  const numPlaceholder = (val: unknown) => (val == null) ? '-' : val

  const columns: ColumnsType<StrategyItem> = [
    {
      title: t('strategy.table.uid'),
      dataIndex: 'uid',
      key: 'uid',
      width: 160,
      render: (txt) => emptyPlaceholder(txt),
    },
    {
      title: t('strategy.table.name'),
      dataIndex: 'name',
      key: 'name',
      minWidth: 120,
      render: (txt) => emptyPlaceholder(txt),
    },
    {
      title: t('strategy.table.remark'),
      dataIndex: 'remark',
      key: 'remark',
      minWidth: 120,
      ellipsis: true,
      render: (txt) => emptyPlaceholder(txt),
    },
    {
      title: t('strategy.table.type'),
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (v: string) => getTypeLabel(v, t),
    },
    {
      title: t('strategy.table.driver'),
      dataIndex: 'driver',
      key: 'driver',
      width: 120,
      render: (v: string) => getDriverLabel(v, t),
    },
    {
      title: t('strategy.table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (v) => numPlaceholder(v),
    },
    {
      title: t('strategy.table.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: t('strategy.table.updatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: t('table.action'),
      key: 'action',
      width: 140,
      fixed: 'right',
      align: 'center',
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'edit',
            label: t('common.edit'),
            onClick: () => handleEdit(record),
          },
          {
            key: 'delete',
            label: t('common.delete'),
            danger: true,
            onClick: () => {
              modal.confirm({
                title: t('strategy.confirm.delete.title'),
                content: t('strategy.confirm.delete.content', {
                  name: record.name ?? record.uid ?? '',
                }),
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

  const handleAdd = () => {
    setDetailFormMode('create')
    setEditingData(null)
    setDetailFormOpen(true)
  }

  const handleViewDetail = (record: StrategyItem) => {
    setViewingData(record)
    setDetailViewOpen(true)
  }

  const handleEdit = (record: StrategyItem) => {
    setDetailFormMode('edit')
    setEditingData(record)
    setDetailFormOpen(true)
  }

  const handleEditFromDetail = (data: StrategyItem) => {
    setDetailViewOpen(false)
    setDetailFormMode('edit')
    setEditingData(data)
    setDetailFormOpen(true)
  }

  const handleDelete = async (record: StrategyItem) => {
    if (!record.uid) return
    try {
      await deleteStrategy(record.uid)
      message.success(t('message.delete.success'))
      fetchData(pagination.current, pagination.pageSize)
      if (viewingData?.uid === record.uid) {
        setDetailViewOpen(false)
        setViewingData(null)
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  const handleFormSuccess = () => {
    setDetailFormOpen(false)
    fetchData(pagination.current, pagination.pageSize)
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const calculateTableHeight = () => {
      if (tableContainerRef.current && tableWrapperRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight
        const thead = tableWrapperRef.current.querySelector('.ant-table-thead')
        const paginationEl = tableWrapperRef.current.querySelector('.ant-pagination')
        const theadHeight = thead ? (thead as HTMLElement).offsetHeight : 0
        const paginationHeight = paginationEl ? (paginationEl as HTMLElement).offsetHeight : 0
        const tableBodyPadding = 16 * 2
        const calculatedHeight = containerHeight - theadHeight - paginationHeight - tableBodyPadding
        setTableHeight(Math.max(calculatedHeight, 100))
      }
    }
    calculateTableHeight()
    window.addEventListener('resize', calculateTableHeight)
    return () => window.removeEventListener('resize', calculateTableHeight)
  }, [dataSource])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <Space size="middle" wrap>
          <span>{t('table.search.keyword')}:</span>
          <Input
            placeholder={t('table.search.placeholder')}
            value={searchParams.keyword ?? ''}
            onChange={(e) =>
              setSearchParams(prev => ({ ...prev, keyword: e.target.value }))
            }
            onPressEnter={handleSearch}
            className="w-full min-w-[120px] sm:w-48 md:w-52"
          />
          <Button onClick={handleSearch} type="primary">
            {t('common.search')}
          </Button>
          <Button onClick={handleReset}>
            {t('common.reset')}
          </Button>
        </Space>
        <Button type="primary" onClick={handleAdd}>
          {t('common.add')}
        </Button>
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

export default function StrategyListWrapper() {
  return (
    <App className="h-full">
      <StrategyListContent />
    </App>
  )
}
