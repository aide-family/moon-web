import { GlobalStatus } from '@/api'
import {
  type StrategyItem,
  type StrategyListParams,
  deleteStrategy,
  getStrategyList,
  updateStrategyStatus,
} from '@/api/marksman/strategy/index'
import type {
  StrategyGroupItem,
  StrategyGroupListParams,
} from '@/api/marksman/strategyGroup'
import {
  deleteStrategyGroup,
  getStrategyGroupDetail,
  getStrategyGroupList,
  updateStrategyGroupStatus,
} from '@/api/marksman/strategyGroup'
import PageContent from '@/components/layout/PageContent'
import { useLocale } from '@/contexts/LocaleContext'
import StrategyGroupDetailForm from '@/pages/marksman/strategy-groups/components/DetailForm'
import StrategyGroupDetailView from '@/pages/marksman/strategy-groups/components/DetailView'
import {
  emptyPlaceholder,
  getDriverLabel,
  getStatusTagInfo,
  getTypeLabel,
} from '@/utils/marksman'
import { MENU_DIVIDER } from '@/utils/menu'
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import {
  App,
  Button,
  Dropdown,
  Form,
  Input,
  Radio,
  Space,
  Spin,
  Table,
  Tag,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React, { useEffect, useRef, useState } from 'react'
import { useMemoizedFn } from 'ahooks'
import { useNavigate } from 'react-router-dom'
import DetailForm from './components/DetailForm'
import { usePaginatedRequest } from '@/utils/hooks/usePaginatedRequest'
import { useInfinitePaginatedRequest } from '@/utils/hooks/useInfinitePaginatedRequest'
import { useDetailRequest } from '@/utils/hooks/useDetailRequest'
import { useAdaptiveTableHeight } from '@/utils/hooks/useAdaptiveTableHeight'

type StrategyListQuery = Omit<StrategyListParams, 'page' | 'pageSize'>

const defaultSearchParams: StrategyListQuery = {
  keyword: '',
  status: undefined,
}

type StrategyGroupSidebarQuery = Pick<StrategyGroupListParams, 'keyword'>

export interface StrategyListContentProps {
  /** 左侧选中的策略组 UID，用于过滤右侧列表 */
  selectedStrategyGroupUID?: string | null
}

export const StrategyListContent: React.FC<StrategyListContentProps> = ({
  selectedStrategyGroupUID,
}) => {
  const { modal } = App.useApp()
  const { t } = useLocale()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] =
    useState<StrategyListQuery>(defaultSearchParams)
  const [searchForm] = Form.useForm<StrategyListQuery>()
  const { tableContainerRef, tableWrapperRef, tableHeight } =
    useAdaptiveTableHeight()
  const skipAutoSearchRef = useRef(true)
  const isFirstStrategyGroupMount = useRef(true)
  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [detailFormMode, setDetailFormMode] = useState<'create' | 'edit'>(
    'create',
  )
  const [editingData, setEditingData] = useState<StrategyItem | null>(null)

  const list = usePaginatedRequest<StrategyItem, StrategyListQuery>({
    service: ({
      page,
      pageSize,
      keyword,
      type,
      driver,
      status,
      strategyGroupUID,
    }) =>
      getStrategyList({
        page,
        pageSize,
        keyword: keyword || undefined,
        type,
        driver,
        status,
        strategyGroupUID,
      }),
    defaultQuery: defaultSearchParams,
  })

  const {
    dataSource,
    loading,
    pagination,
    refresh,
    search,
    reset,
    changePage,
  } = list

  const buildListQuery = (
    override?: Partial<StrategyListQuery>,
  ): StrategyListQuery => ({
    keyword: searchParams.keyword,
    status: searchParams.status,
    type: searchParams.type,
    driver: searchParams.driver,
    strategyGroupUID: selectedStrategyGroupUID ?? undefined,
    ...override,
  })

  const handleSearch = (override?: Partial<StrategyListQuery>) => {
    if (override) setSearchParams((prev) => ({ ...prev, ...override }))
    search(buildListQuery(override))
  }

  const handleReset = () => {
    setSearchParams(defaultSearchParams)
    reset({
      ...defaultSearchParams,
      strategyGroupUID: selectedStrategyGroupUID ?? undefined,
    })
  }

  const handleTableChange = (page: number, pageSize: number) => {
    changePage(page, pageSize)
  }

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
      title: t('strategy.table.type'),
      dataIndex: 'type',
      key: 'type',
      width: 80,
      align: 'center',
      render: (v: string) => getTypeLabel(v, t),
    },
    {
      title: t('strategy.table.driver'),
      dataIndex: 'driver',
      key: 'driver',
      width: 80,
      align: 'center',
      render: (v: string) => getDriverLabel(v, t),
    },
    {
      title: t('strategy.table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 90,
      align: 'center',
      render: (status: GlobalStatus) => {
        const info = getStatusTagInfo(status)
        return <Tag color={info.color}>{t(info.textKey)}</Tag>
      },
    },
    {
      title: t('strategy.table.updatedAt'),
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
        const action = isEnabled
          ? t(`common.status.${GlobalStatus.DISABLED}`)
          : t(`common.status.${GlobalStatus.ENABLED}`)
        const handleStatusClick = () => {
          modal.confirm({
            title: t('strategy.confirm.status.title', { action }),
            content: t('strategy.confirm.status.content', {
              action,
              name: record.name ?? record.uid ?? '',
            }),
            okText: t('common.ok'),
            cancelText: t('common.cancel'),
            onOk: () =>
              handleStatusChange(
                record,
                isEnabled ? GlobalStatus.DISABLED : GlobalStatus.ENABLED,
              ),
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

  const handleAdd = () => {
    setDetailFormMode('create')
    setEditingData(null)
    setDetailFormOpen(true)
  }

  const handleViewDetail = (record: StrategyItem) => {
    if (!record.uid) return
    navigate(`/strategies/${record.uid}`, { state: { type: record.type } })
  }

  const handleEdit = (record: StrategyItem) => {
    setDetailFormMode('edit')
    setEditingData(record)
    setDetailFormOpen(true)
  }

  const handleDelete = async (record: StrategyItem) => {
    if (!record.uid) return
    try {
      await deleteStrategy(record.uid)
      message.success(t('message.delete.success'))
      refresh()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  const handleStatusChange = async (
    record: StrategyItem,
    newStatus: GlobalStatus,
  ) => {
    if (!record.uid) return
    try {
      await updateStrategyStatus({ uid: record.uid, status: newStatus })
      message.success(t('message.update.success'))
      refresh()
    } catch (error) {
      console.error('修改状态失败:', error)
    }
  }

  const handleFormSuccess = () => {
    setDetailFormOpen(false)
    refresh()
  }

  // 左侧选中策略组变化时重新请求（跳过首次挂载，避免与初始请求重复）
  useEffect(() => {
    if (isFirstStrategyGroupMount.current) {
      isFirstStrategyGroupMount.current = false
      return
    }
    search(buildListQuery())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStrategyGroupUID])

  // 状态筛选变更时自动请求列表
  useEffect(() => {
    if (skipAutoSearchRef.current) {
      skipAutoSearchRef.current = false
      return
    }
    search(buildListQuery())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.status])

  useEffect(() => {
    searchForm.setFieldsValue({
      keyword: searchParams.keyword ?? '',
      status: searchParams.status,
    })
  }, [searchParams.keyword, searchParams.status, searchForm])

  return (
    <div className='flex flex-col h-full'>
      <div className='flex items-center justify-between mb-4 shrink-0'>
        <Form
          form={searchForm}
          layout='inline'
          onValuesChange={(_, allValues) => {
            setSearchParams((prev) => ({
              ...prev,
              keyword: allValues.keyword ?? '',
              status: allValues.status,
            }))
          }}
        >
          <Space size='middle' wrap>
            <span>{t('table.search.keyword')}:</span>
            <Form.Item name='keyword' className='mb-0'>
              <Input
                placeholder={t('table.search.placeholder')}
                onPressEnter={(e) =>
                  handleSearch({
                    keyword: (e.target as HTMLInputElement).value,
                  })
                }
                className='w-full min-w-[120px] sm:w-48 md:w-52'
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
            <Button onClick={() => handleSearch()} type='primary'>
              {t('common.search')}
            </Button>
            <Button onClick={handleReset}>{t('common.reset')}</Button>
          </Space>
        </Form>
        <Button type='primary' onClick={handleAdd}>
          {t('common.add')}
        </Button>
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

      <DetailForm
        open={detailFormOpen}
        mode={detailFormMode}
        initialData={editingData}
        defaultStrategyGroupUID={
          detailFormMode === 'create' ? selectedStrategyGroupUID : undefined
        }
        onCancel={() => {
          setDetailFormOpen(false)
          setEditingData(null)
        }}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}

/** 左侧策略组列表 */
const StrategyGroupSidebar: React.FC<{
  selectedUid: string | null
  onSelect: (uid: string | null) => void
  onRefresh?: () => void
}> = ({ selectedUid, onSelect, onRefresh }) => {
  const { modal } = App.useApp()
  const { t } = useLocale()
  const [keyword, setKeyword] = useState('')
  const [sidebarSearchForm] = Form.useForm<{ keyword?: string }>()
  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [detailFormMode, setDetailFormMode] = useState<'create' | 'edit'>(
    'create',
  )
  const [editingData, setEditingData] = useState<StrategyGroupItem | null>(null)
  const [detailViewOpen, setDetailViewOpen] = useState(false)
  const [viewingUid, setViewingUid] = useState<string>()

  const list = useInfinitePaginatedRequest<
    StrategyGroupItem,
    StrategyGroupSidebarQuery
  >({
    service: ({ page, pageSize, keyword: kw }) =>
      getStrategyGroupList({
        page,
        pageSize,
        keyword: kw || undefined,
      }),
    defaultQuery: { keyword: '' },
    defaultPageSize: 50,
  })

  const {
    dataSource,
    loading,
    loadingMore,
    page,
    search: listSearch,
    loadMore,
  } = list

  const {
    data: viewingData,
    loading: detailLoading,
    mutate: mutateViewingData,
  } = useDetailRequest(getStrategyGroupDetail, viewingUid, detailViewOpen)

  useEffect(() => {
    if (page === 1 && !loading && dataSource.length === 0) {
      onSelect(null)
    }
  }, [page, loading, dataSource.length, onSelect])

  const handleScroll = useMemoizedFn((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const threshold = 80
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= threshold) {
      loadMore()
    }
  })

  useEffect(() => {
    sidebarSearchForm.setFieldsValue({ keyword })
  }, [keyword, sidebarSearchForm])

  const handleSearch = (override?: { keyword?: string }) => {
    if (override?.keyword !== undefined) setKeyword(override.keyword)
    listSearch({ keyword: override?.keyword ?? keyword })
  }

  const handleAdd = () => {
    setDetailFormMode('create')
    setEditingData(null)
    setDetailFormOpen(true)
  }

  const handleSelectItem = (record: StrategyGroupItem) => {
    if (!record.uid) return
    if (selectedUid === record.uid) {
      onSelect(null)
      return
    }
    onSelect(record.uid)
  }

  const handleEdit = async (record: StrategyGroupItem) => {
    if (!record.uid) return
    const hide = message.loading(t('common.loading'), 0)
    try {
      const data = await getStrategyGroupDetail(record.uid)
      setDetailFormMode('edit')
      setEditingData(data)
      setDetailFormOpen(true)
    } catch (error) {
      console.error('获取策略组详情失败:', error)
    } finally {
      hide()
    }
  }

  const handleEditFromDetail = async (data: StrategyGroupItem) => {
    if (!data?.uid) return
    const hide = message.loading(t('common.loading'), 0)
    try {
      const detail = await getStrategyGroupDetail(data.uid)
      setDetailFormMode('edit')
      setEditingData(detail)
      setDetailFormOpen(true)
    } catch (error) {
      console.error('获取策略组详情失败:', error)
    } finally {
      hide()
    }
  }

  const handleViewDetail = (record: StrategyGroupItem) => {
    if (!record.uid) return
    setViewingUid(record.uid)
    setDetailViewOpen(true)
  }

  const handleDelete = async (record: StrategyGroupItem) => {
    if (!record.uid) return
    try {
      await deleteStrategyGroup(record.uid)
      message.success(t('message.delete.success'))
      if (selectedUid === record.uid) {
        onSelect(null)
      }
      listSearch({ keyword })
      onRefresh?.()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  const handleStatusChange = async (
    record: StrategyGroupItem,
    newStatus: GlobalStatus,
  ) => {
    if (!record.uid) return
    try {
      await updateStrategyGroupStatus({ uid: record.uid, status: newStatus })
      message.success(t('message.update.success'))
      listSearch({ keyword })
      if (viewingData?.uid === record.uid) {
        mutateViewingData({ ...viewingData, status: newStatus })
      }
      onRefresh?.()
    } catch (error) {
      console.error('修改状态失败:', error)
    }
  }

  const handleDetailFormSuccess = (created?: StrategyGroupItem) => {
    setDetailFormOpen(false)
    listSearch({ keyword })
    onRefresh?.()
    if (created?.uid) {
      onSelect(created.uid)
    }
  }

  return (
    <>
      <div className='flex flex-col h-full'>
        <div className='flex items-center gap-2 px-3 h-14 py-2 shrink-0'>
          <Form
            form={sidebarSearchForm}
            layout='inline'
            className='flex-1 min-w-0'
            onValuesChange={(_, allValues) => {
              setKeyword(allValues.keyword ?? '')
            }}
          >
            <Form.Item name='keyword' className='mb-0 w-full'>
              <Input
                placeholder={t('strategyGroup.search.placeholder')}
                allowClear
                className='flex-1 min-w-0'
                onPressEnter={(e) =>
                  handleSearch({
                    keyword: (e.target as HTMLInputElement).value,
                  })
                }
              />
            </Form.Item>
          </Form>
          <Button type='primary' onClick={handleAdd} icon={<PlusOutlined />} />
        </div>
        <div
          className='flex-1 min-h-0 overflow-auto p-2'
          onScroll={handleScroll}
        >
          {loading ? (
            <div className='flex justify-center py-8'>
              <Spin size='small' />
            </div>
          ) : (
            <>
              {dataSource.map((item) => {
                const isSelected = selectedUid === item.uid
                const isEnabled = item.status === GlobalStatus.ENABLED
                const action = isEnabled
                  ? t(`common.status.${GlobalStatus.DISABLED}`)
                  : t(`common.status.${GlobalStatus.ENABLED}`)
                const menuItems: MenuProps['items'] = [
                  {
                    key: 'edit',
                    label: t('common.edit'),
                    onClick: () => handleEdit(item),
                  },
                  {
                    key: 'view',
                    label: t('common.view'),
                    onClick: () => handleViewDetail(item),
                  },
                  {
                    key: 'status',
                    label: action,
                    onClick: () => {
                      modal.confirm({
                        title: t('strategyGroup.confirm.status.title', {
                          action,
                        }),
                        content: t('strategyGroup.confirm.status.content', {
                          action,
                          name: item.name ?? item.uid ?? '',
                        }),
                        onOk: () =>
                          handleStatusChange(
                            item,
                            isEnabled
                              ? GlobalStatus.DISABLED
                              : GlobalStatus.ENABLED,
                          ),
                        okText: t('common.ok'),
                        cancelText: t('common.cancel'),
                      })
                    },
                  },
                  MENU_DIVIDER,
                  {
                    key: 'delete',
                    label: t('common.delete'),
                    danger: true,
                    onClick: () => {
                      modal.confirm({
                        title: t('strategyGroup.confirm.delete.title'),
                        content: t('strategyGroup.confirm.delete.content', {
                          name: item.name ?? item.uid ?? '',
                        }),
                        okText: t('common.ok'),
                        cancelText: t('common.cancel'),
                        onOk: () => handleDelete(item),
                      })
                    },
                  },
                ]
                return (
                  <div
                    key={item.uid}
                    className={`
                      flex items-center justify-between gap-2 cursor-pointer px-3 py-2 border-b border-(--ant-color-border-secondary)
                      transition-colors rounded-(--ant-border-radius)
                      ${isSelected ? 'bg-(--ant-color-primary-bg) text-(--ant-color-primary)' : 'hover:bg-(--ant-color-fill-tertiary)'}
                    `}
                    onClick={() => handleSelectItem(item)}
                  >
                    <div className='min-w-0 flex-1 flex items-center gap-2'>
                      <span
                        className='shrink-0 w-1.5 h-1.5 rounded-full'
                        style={{
                          backgroundColor:
                            item.status === GlobalStatus.ENABLED
                              ? 'var(--ant-color-success)'
                              : item.status === GlobalStatus.DISABLED
                                ? 'var(--ant-color-error)'
                                : 'var(--ant-color-text-tertiary)',
                        }}
                        title={t(`common.status.${item.status}`)}
                      />
                      <div className='truncate min-w-0'>
                        {item.name || item.uid || '-'}
                      </div>
                    </div>
                    <span onClick={(e) => e.stopPropagation()}>
                      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                        <Button
                          type='text'
                          size='small'
                          icon={<EllipsisOutlined />}
                          title={t('common.more')}
                        />
                      </Dropdown>
                    </span>
                  </div>
                )
              })}
            </>
          )}
          {loadingMore && (
            <div className='flex justify-center py-3'>
              <Spin size='small' />
            </div>
          )}
        </div>
      </div>

      <StrategyGroupDetailForm
        open={detailFormOpen}
        mode={detailFormMode}
        initialData={editingData}
        onCancel={() => {
          setDetailFormOpen(false)
          setEditingData(null)
        }}
        onSuccess={handleDetailFormSuccess}
      />
      <StrategyGroupDetailView
        open={detailViewOpen}
        data={viewingData}
        loading={detailLoading}
        onCancel={() => {
          setDetailViewOpen(false)
          setViewingUid(undefined)
        }}
        onEdit={handleEditFromDetail}
      />
    </>
  )
}

/** 策略列表页：左侧策略组，右侧策略列表（布局同数据源，无标题） */
function StrategyListPage() {
  const [selectedGroupUid, setSelectedGroupUid] = useState<string | null>(null)
  return (
    <div className='h-full flex flex-col'>
      <div className='flex-1 flex min-h-0 gap-4'>
        <PageContent>
          <StrategyGroupSidebar
            selectedUid={selectedGroupUid}
            onSelect={setSelectedGroupUid}
          />
        </PageContent>
        <PageContent className='flex-1'>
          <StrategyListContent selectedStrategyGroupUID={selectedGroupUid} />
        </PageContent>
      </div>
    </div>
  )
}

export default function StrategyListWrapper() {
  return (
    <App className='h-full'>
      <StrategyListPage />
    </App>
  )
}
