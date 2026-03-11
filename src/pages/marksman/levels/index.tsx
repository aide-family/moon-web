import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { App, Button, Dropdown, Input, Radio, Space, Table, Tag, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import dayjs from 'dayjs'
import type { LevelItem, LevelListParams } from '@/api/level'
import { deleteLevel, getLevelDetail, getLevelList, GlobalStatus, updateLevelStatus } from '@/api/level'
import DetailForm from './components/DetailForm'
import DetailView from './components/DetailView'
import { useLocale } from '@/contexts/LocaleContext'
import { applySearchToUrl, getParam } from '@/utils/urlSearchParams'
import PageContent from '@/components/layout/PageContent'

const defaultSearchParams: LevelListParams = {
  keyword: '',
  status: undefined,
}

function parseSearchParamsFromUrl(params: URLSearchParams): LevelListParams {
  return {
    keyword: getParam(params, 'keyword') ?? '',
    status: (getParam(params, 'status') as GlobalStatus) ?? undefined,
  }
}

function renderStatus(status: string | undefined, t: (key: string) => string) {
  const statusMap: Record<string, { text: string; color: string }> = {
    [GlobalStatus.UNKNOWN]: { text: t('table.unknown'), color: 'default' },
    [GlobalStatus.ENABLED]: { text: t('table.enable'), color: 'success' },
    [GlobalStatus.DISABLED]: { text: t('table.disable'), color: 'error' },
  }
  const info = (status && statusMap[status]) || statusMap[GlobalStatus.UNKNOWN]
  return <Tag color={info.color}>{info.text}</Tag>
}

const LevelList: React.FC = () => {
  const { modal } = App.useApp()
  const { t } = useLocale()
  const [urlSearchParams, setUrlSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<LevelItem[]>([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchParams, setSearchParams] = useState<LevelListParams>(() =>
    parseSearchParamsFromUrl(urlSearchParams)
  )

  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [detailFormMode, setDetailFormMode] = useState<'create' | 'edit'>('create')
  const [editingData, setEditingData] = useState<LevelItem | null>(null)

  const [detailViewOpen, setDetailViewOpen] = useState(false)
  const [viewingData, setViewingData] = useState<LevelItem | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const tableContainerRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const [tableHeight, setTableHeight] = useState(400)

  const fetchData = async (page?: number, pageSize?: number) => {
    setLoading(true)
    try {
      const currentPage = page ?? pagination.current
      const currentPageSize = pageSize ?? pagination.pageSize
      const params: LevelListParams = {
        page: currentPage,
        pageSize: currentPageSize,
        keyword: searchParams.keyword || undefined,
        status: searchParams.status,
      }
      const response = await getLevelList(params)
      setDataSource(response.items ?? [])
      setPagination(prev => ({
        ...prev,
        current: currentPage,
        pageSize: currentPageSize,
        total: parseInt(String(response.total ?? '0'), 10),
      }))
    } catch (error) {
      console.error('获取告警等级列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleTableChange = (page: number, pageSize: number) => {
    fetchData(page, pageSize)
  }

  const emptyPlaceholder = (text: unknown) => (text == null || text === '' ? '-' : String(text))

  const handleAdd = () => {
    setDetailFormMode('create')
    setEditingData(null)
    setDetailFormOpen(true)
  }

  const handleViewDetail = async (record: LevelItem) => {
    if (!record.uid) return
    setDetailViewOpen(true)
    setViewingData(null)
    setDetailLoading(true)
    try {
      const data = await getLevelDetail(record.uid)
      setViewingData(data)
    } catch (error) {
      console.error('获取告警等级详情失败:', error)
      setDetailViewOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleEdit = (record: LevelItem) => {
    setDetailFormMode('edit')
    setEditingData(record)
    setDetailFormOpen(true)
  }

  const handleEditFromDetail = (data: LevelItem) => {
    setDetailViewOpen(false)
    setDetailFormMode('edit')
    setEditingData(data)
    setDetailFormOpen(true)
  }

  const handleDelete = async (record: LevelItem) => {
    if (!record.uid) return
    try {
      await deleteLevel(record.uid)
      message.success(t('message.delete.success'))
      fetchData()
      if (detailViewOpen && viewingData?.uid === record.uid) setDetailViewOpen(false)
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  const handleStatusChange = async (record: LevelItem, newStatus: GlobalStatus | string) => {
    if (!record.uid) return
    try {
      await updateLevelStatus(record.uid, newStatus)
      message.success(t('message.update.success'))
      fetchData()
      if (viewingData && viewingData.uid === record.uid) {
        setViewingData({ ...viewingData, status: newStatus })
      }
    } catch (error) {
      console.error('修改状态失败:', error)
    }
  }

  const handleDetailFormSuccess = () => {
    setDetailFormOpen(false)
    fetchData()
    if (detailViewOpen && viewingData?.uid) {
      getLevelDetail(viewingData.uid)
        .then(setViewingData)
        .catch(() => {})
    }
  }

  const columns: ColumnsType<LevelItem> = [
    {
      title: t('level.table.uid'),
      dataIndex: 'uid',
      key: 'uid',
      width: 160,
      ellipsis: true,
      render: v => emptyPlaceholder(v),
    },
    {
      title: t('level.table.name'),
      dataIndex: 'name',
      key: 'name',
      width: 160,
      render: v => emptyPlaceholder(v),
    },
    {
      title: t('table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (v: string) => renderStatus(v, t),
    },
    {
      title: t('level.table.remark'),
      dataIndex: 'remark',
      key: 'remark',
      width: 220,
      ellipsis: true,
      render: v => emptyPlaceholder(v),
    },
    {
      title: t('level.table.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: t('level.table.updatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 170,
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: t('table.action'),
      key: 'action',
      width: 140,
      fixed: 'right',
      align: 'center',
      render: (_, record) => {
        const isEnabled = record.status === GlobalStatus.ENABLED

        const handleStatusClick = () => {
          const action = isEnabled ? t('table.disable') : t('table.enable')
          modal.confirm({
            title: t('level.confirm.status.title', { action }),
            content: t('level.confirm.status.content', { action, name: record.name ?? record.uid ?? '' }),
            onOk: () => handleStatusChange(record, isEnabled ? GlobalStatus.DISABLED : GlobalStatus.ENABLED),
            okText: t('common.ok'),
            cancelText: t('common.cancel'),
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
            onClick: () => {
              modal.confirm({
                title: t('level.confirm.delete.title'),
                content: t('level.confirm.delete.content', { name: record.name ?? record.uid ?? '' }),
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

  // URL 变化时（如浏览器后退）同步到表单
  useEffect(() => {
    setSearchParams(parseSearchParamsFromUrl(urlSearchParams))
  }, [urlSearchParams.toString()])

  // 搜索条件变化即同步到 URL（replace 避免每次输入都产生历史记录）
  useEffect(() => {
    applySearchToUrl(
      setUrlSearchParams,
      { keyword: searchParams.keyword, status: searchParams.status },
      { replace: true }
    )
  }, [searchParams.keyword, searchParams.status])

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.status])

  useEffect(() => {
    const updateTableHeight = () => {
      if (tableContainerRef.current && tableWrapperRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight
        const theadEl = tableWrapperRef.current.querySelector('.ant-table-thead')
        const paginationEl = tableWrapperRef.current.querySelector('.ant-pagination')
        const theadHeight = theadEl ? (theadEl as HTMLElement).getBoundingClientRect().height : 0
        const paginationHeight = paginationEl ? (paginationEl as HTMLElement).getBoundingClientRect().height + 16 : 0
        setTableHeight(Math.max(containerHeight - theadHeight - paginationHeight - 24, 100))
      }
    }
    const timer = setTimeout(updateTableHeight, 100)
    window.addEventListener('resize', updateTableHeight)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateTableHeight)
    }
  }, [dataSource, pagination])

  return (
    <div className="h-full flex flex-col">
      {/* 搜索和操作栏（参考模板/数据源等页面表格头部搜索） */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <Space size="middle" wrap>
          <span>{t('table.search.keyword')}:</span>
          <Input
            placeholder={t('table.search.placeholder')}
            allowClear
            className="w-full min-w-[120px] sm:w-48 md:w-52"
            value={searchParams.keyword ?? ''}
            onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
          />
          <span>{t('table.search.status')}:</span>
          <Radio.Group
            value={searchParams.status}
            onChange={(e) => {
              setSearchParams(prev => ({ ...prev, status: e.target.value }))
              setPagination(prev => ({ ...prev, current: 1 }))
            }}
            buttonStyle="solid"
          >
            <Radio.Button value={undefined}>{t('table.search.all')}</Radio.Button>
            <Radio.Button value={GlobalStatus.ENABLED}>{t('table.search.enabled')}</Radio.Button>
            <Radio.Button value={GlobalStatus.DISABLED}>{t('table.search.disabled')}</Radio.Button>
          </Radio.Group>
          <Button onClick={handleSearch} type="primary">
            {t('common.search')}
          </Button>
          <Button onClick={handleReset}>{t('common.reset')}</Button>
        </Space>
        <Space>
          <Button type="primary" onClick={handleAdd}>
            {t('common.add')}
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
            scroll={{ y: tableHeight, x: '100%' }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: total => t('table.total', { total }),
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
        loading={detailLoading}
        onCancel={() => setDetailViewOpen(false)}
        onEdit={handleEditFromDetail}
      />
    </div>
  )
}

export default function LevelListWrapper() {
  return (
    <App className="h-full">
      <PageContent>
        <LevelList />
      </PageContent>
    </App>
  )
}

