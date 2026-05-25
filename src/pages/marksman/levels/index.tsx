import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  App,
  Badge,
  Button,
  Dropdown,
  Form,
  Input,
  Radio,
  Space,
  Table,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import type { LevelItem, LevelListParams } from '@/api/marksman/level'
import {
  deleteLevel,
  getLevelDetail,
  getLevelList,
  LevelType,
  updateLevelStatus,
} from '@/api/marksman/level'
import { GlobalStatus } from '@/api'
import DetailForm from './components/DetailForm'
import DetailView from './components/DetailView'
import { useLocale } from '@/contexts/LocaleContext'
import { MENU_DIVIDER } from '@/utils/menu'
import { applySearchToUrl, getParam } from '@/utils/urlSearchParams'
import PageContent from '@/components/layout/PageContent'
import {
  emptyPlaceholder,
  getLevelTypeLabel,
  renderStatusTag,
} from '@/utils/marksman'

const defaultSearchParams: LevelListParams = {
  keyword: '',
  status: undefined,
  type: undefined,
}

function parseSearchParamsFromUrl(params: URLSearchParams): LevelListParams {
  const rawType = getParam(params, 'type')
  const parsedType =
    rawType != null && rawType !== '' ? Number(rawType) : undefined
  const type =
    parsedType != null && Number.isFinite(parsedType)
      ? (parsedType as unknown as LevelType)
      : undefined
  return {
    keyword: getParam(params, 'keyword') ?? '',
    status: (getParam(params, 'status') as GlobalStatus) ?? undefined,
    type,
  }
}

const LevelList: React.FC = () => {
  const { modal } = App.useApp()
  const { t } = useLocale()
  const [urlSearchParams, setUrlSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<LevelItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  })
  const [searchParams, setSearchParams] = useState<LevelListParams>(() =>
    parseSearchParamsFromUrl(urlSearchParams),
  )
  const [searchForm] = Form.useForm<LevelListParams>()

  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [detailFormMode, setDetailFormMode] = useState<'create' | 'edit'>(
    'create',
  )
  const [editingData, setEditingData] = useState<LevelItem | null>(null)

  const [detailViewOpen, setDetailViewOpen] = useState(false)
  const [viewingData, setViewingData] = useState<LevelItem | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const tableContainerRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const [tableHeight, setTableHeight] = useState(400)

  const fetchData = async (
    page?: number,
    pageSize?: number,
    override?: Partial<LevelListParams>,
  ) => {
    setLoading(true)
    try {
      const currentPage = page ?? pagination.current
      const currentPageSize = pageSize ?? pagination.pageSize
      const effective = override
        ? { ...searchParams, ...override }
        : searchParams
      const params: LevelListParams = {
        page: currentPage,
        pageSize: currentPageSize,
        keyword: effective.keyword || undefined,
        status: effective.status,
        type: effective.type,
      }
      const response = await getLevelList(params)
      setDataSource(response.items ?? [])
      setPagination((prev) => ({
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

  const handleSearch = (override?: Partial<LevelListParams>) => {
    if (override) setSearchParams((prev) => ({ ...prev, ...override }))
    setPagination((prev) => ({ ...prev, current: 1 }))
    fetchData(1, pagination.pageSize, override)
  }

  const handleReset = () => {
    setSearchParams(defaultSearchParams)
    setUrlSearchParams({})
    setPagination({ current: 1, pageSize: 50, total: 0 })
    fetchData()
  }

  const handleTableChange = (page: number, pageSize: number) => {
    fetchData(page, pageSize)
  }

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
      if (detailViewOpen && viewingData?.uid === record.uid)
        setDetailViewOpen(false)
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  const handleStatusChange = async (
    record: LevelItem,
    newStatus: GlobalStatus,
  ) => {
    if (!record.uid) return
    try {
      await updateLevelStatus({ uid: record.uid, status: newStatus })
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
      render: (v) => emptyPlaceholder(v),
    },
    {
      title: t('level.table.name'),
      dataIndex: 'name',
      key: 'name',
      minWidth: 120,
      render: (v) => emptyPlaceholder(v),
    },
    {
      title: t('level.table.type'),
      dataIndex: 'type',
      key: 'type',
      minWidth: 100,
      align: 'center',
      render: (v) => getLevelTypeLabel(v, t),
    },
    {
      title: t('level.table.bgColor'),
      dataIndex: 'bgColor',
      key: 'bgColor',
      minWidth: 140,
      render: (v: string | undefined) => (
        <Badge color={v} size='small' text={v || '-'} />
      ),
    },
    {
      title: t('level.table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (v: GlobalStatus) => renderStatusTag(v, t),
    },
    {
      title: t('level.table.remark'),
      dataIndex: 'remark',
      key: 'remark',
      minWidth: 160,
      ellipsis: true,
      render: (v) => emptyPlaceholder(v),
    },
    {
      title: t('level.table.updatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
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
          const action = t(`common.status.${record.status}`)
          modal.confirm({
            title: t('level.confirm.status.title', { action }),
            content: t('level.confirm.status.content', {
              action,
              name: record.name ?? record.uid ?? '',
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

        const menuItems: MenuProps['items'] = [
          {
            key: 'edit',
            label: t('common.edit'),
            onClick: () => handleEdit(record),
          },
          {
            key: 'status',
            label: isEnabled
              ? t(`common.status.${GlobalStatus.DISABLED}`)
              : t(`common.status.${GlobalStatus.ENABLED}`),
            onClick: handleStatusClick,
          },
          MENU_DIVIDER,
          {
            key: 'delete',
            label: t('common.delete'),
            danger: true,
            onClick: () => {
              modal.confirm({
                title: t('level.confirm.delete.title'),
                content: t('level.confirm.delete.content', {
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

  // URL 变化时（如浏览器后退）同步到表单
  useEffect(() => {
    const next = parseSearchParamsFromUrl(urlSearchParams)
    setSearchParams(next)
    searchForm.setFieldsValue(next)
  }, [urlSearchParams, searchForm])

  // 搜索条件变化即同步到 URL（replace 避免每次输入都产生历史记录）
  useEffect(() => {
    applySearchToUrl(
      setUrlSearchParams,
      {
        keyword: searchParams.keyword,
        status: searchParams.status,
        type: searchParams.type,
      },
      { replace: true },
    )
  }, [
    searchParams.keyword,
    searchParams.status,
    searchParams.type,
    setUrlSearchParams,
  ])

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.status, searchParams.type])

  useEffect(() => {
    searchForm.setFieldsValue({
      keyword: searchParams.keyword ?? '',
      status: searchParams.status,
      type: searchParams.type,
    })
  }, [searchParams.keyword, searchParams.status, searchParams.type, searchForm])

  useEffect(() => {
    const updateTableHeight = () => {
      if (tableContainerRef.current && tableWrapperRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight
        const theadEl =
          tableWrapperRef.current.querySelector('.ant-table-thead')
        const paginationEl =
          tableWrapperRef.current.querySelector('.ant-pagination')
        const theadHeight = theadEl
          ? (theadEl as HTMLElement).getBoundingClientRect().height
          : 0
        const paginationHeight = paginationEl
          ? (paginationEl as HTMLElement).getBoundingClientRect().height + 16
          : 0
        setTableHeight(
          Math.max(containerHeight - theadHeight - paginationHeight - 24, 100),
        )
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
    <div className='h-full flex flex-col'>
      {/* 搜索和操作栏（参考模板/数据源等页面表格头部搜索） */}
      <div className='flex items-center justify-between mb-4 shrink-0'>
        <Form
          form={searchForm}
          layout='inline'
          onValuesChange={(_, allValues) => {
            setSearchParams((prev) => ({
              ...prev,
              keyword: allValues.keyword ?? '',
              status: allValues.status,
              type: allValues.type,
            }))
            setPagination((prev) => ({ ...prev, current: 1 }))
          }}
        >
          <Space size='middle' wrap>
            <span>{t('table.search.keyword')}:</span>
            <Form.Item name='keyword' className='mb-0'>
              <Input
                placeholder={t('table.search.placeholder')}
                allowClear
                className='w-full min-w-[120px] sm:w-48 md:w-52'
                onPressEnter={(e) =>
                  handleSearch({
                    keyword: (e.target as HTMLInputElement).value,
                  })
                }
              />
            </Form.Item>
            <span>{t('common.status')}:</span>
            <Form.Item name='status' className='mb-0'>
              <Radio.Group buttonStyle='solid'>
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
            </Form.Item>
            <span>{t('level.table.type')}:</span>
            <Form.Item name='type' className='mb-0'>
              <Radio.Group buttonStyle='solid'>
                <Radio.Button value={undefined}>
                  {t('table.search.all')}
                </Radio.Button>
                <Radio.Button value={LevelType.LEVEL_TYPE_ALERT}>
                  {getLevelTypeLabel(LevelType.LEVEL_TYPE_ALERT, t)}
                </Radio.Button>
                <Radio.Button value={LevelType.LEVEL_TYPE_DATASOURCE}>
                  {getLevelTypeLabel(LevelType.LEVEL_TYPE_DATASOURCE, t)}
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Button onClick={() => handleSearch()} type='primary'>
              {t('common.search')}
            </Button>
            <Button onClick={handleReset}>{t('common.reset')}</Button>
          </Space>
        </Form>
        <Space>
          <Button type='primary' onClick={handleAdd}>
            {t('common.add')}
          </Button>
        </Space>
      </div>

      <div
        ref={tableContainerRef}
        className='flex-1 flex overflow-hidden flex-col'
        style={{ minHeight: 0 }}
      >
        <div ref={tableWrapperRef} className='h-full flex flex-col flex-1'>
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey='uid'
            loading={loading}
            size='small'
            scroll={{ y: tableHeight, x: '100%' }}
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
    <App className='h-full'>
      <PageContent>
        <LevelList />
      </PageContent>
    </App>
  )
}
