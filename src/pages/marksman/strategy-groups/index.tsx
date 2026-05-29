import React, { useEffect, useRef, useState } from 'react'
import { useMemoizedFn } from 'ahooks'
import { useSearchParams } from 'react-router-dom'
import {
  App,
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
import dayjs from 'dayjs'
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
import { GlobalStatus } from '@/api'
import DetailForm from './components/DetailForm'
import DetailView from './components/DetailView'
import { useLocale } from '@/contexts/LocaleContext'
import PageContent from '@/components/layout/PageContent'
import { MENU_DIVIDER } from '@/utils/menu'
import { applySearchToUrl, getParam } from '@/utils/urlSearchParams'
import { emptyPlaceholder, renderStatusTag } from '@/utils/marksman'
import { usePaginatedRequest } from '@/utils/hooks/usePaginatedRequest'
import { useDetailRequest } from '@/utils/hooks/useDetailRequest'
import { useAdaptiveTableHeight } from '@/utils/hooks/useAdaptiveTableHeight'

const defaultSearchParams: StrategyGroupListParams = {
  keyword: '',
  status: undefined,
}

type StrategyGroupListQuery = Omit<
  StrategyGroupListParams,
  'page' | 'pageSize'
>

function toListQuery(params: StrategyGroupListParams): StrategyGroupListQuery {
  return {
    keyword: params.keyword ?? '',
    status: params.status,
  }
}

function parseSearchParamsFromUrl(
  params: URLSearchParams,
): StrategyGroupListParams {
  const statusParam = getParam(params, 'status')
  const status =
    statusParam === GlobalStatus.ENABLED
      ? GlobalStatus.ENABLED
      : statusParam === GlobalStatus.DISABLED
        ? GlobalStatus.DISABLED
        : undefined
  return {
    keyword: getParam(params, 'keyword') ?? '',
    status,
  }
}

export const StrategyGroupList: React.FC = () => {
  const { modal } = App.useApp()
  const { t } = useLocale()
  const [urlSearchParams, setUrlSearchParams] = useSearchParams()
  const [searchParams, setSearchParams] = useState<StrategyGroupListParams>(
    () => parseSearchParamsFromUrl(urlSearchParams),
  )
  const [searchForm] = Form.useForm<StrategyGroupListParams>()

  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [detailFormMode, setDetailFormMode] = useState<'create' | 'edit'>(
    'create',
  )
  const [editingData, setEditingData] = useState<StrategyGroupItem | null>(null)

  const [detailViewOpen, setDetailViewOpen] = useState(false)
  const [viewingUid, setViewingUid] = useState<string>()

  const { tableContainerRef, tableWrapperRef, tableHeight } =
    useAdaptiveTableHeight()
  const skipAutoSearchRef = useRef(true)

  const list = usePaginatedRequest<StrategyGroupItem, StrategyGroupListQuery>({
    service: ({ page, pageSize, keyword, status }) =>
      getStrategyGroupList({
        page,
        pageSize,
        keyword: keyword || undefined,
        status,
      }),
    defaultQuery: toListQuery(parseSearchParamsFromUrl(urlSearchParams)),
  })

  const {
    data: viewingData,
    loading: detailLoading,
    refresh: refreshDetail,
    mutate: mutateDetail,
  } = useDetailRequest(getStrategyGroupDetail, viewingUid, detailViewOpen)

  const handleSearch = useMemoizedFn(
    (override?: Partial<StrategyGroupListParams>) => {
      if (override) setSearchParams((prev) => ({ ...prev, ...override }))
      list.search(
        toListQuery({
          ...searchParams,
          ...override,
        }),
      )
    },
  )

  const handleReset = useMemoizedFn(() => {
    setSearchParams(defaultSearchParams)
    setUrlSearchParams({})
    list.reset(toListQuery(defaultSearchParams))
  })

  const handleTableChange = useMemoizedFn((page: number, pageSize: number) => {
    list.changePage(page, pageSize)
  })

  const handleAdd = () => {
    setDetailFormMode('create')
    setEditingData(null)
    setDetailFormOpen(true)
  }

  const handleViewDetail = (record: StrategyGroupItem) => {
    if (!record.uid) return
    setViewingUid(record.uid)
    setDetailViewOpen(true)
  }

  const handleEdit = (record: StrategyGroupItem) => {
    setDetailFormMode('edit')
    setEditingData(record)
    setDetailFormOpen(true)
  }

  const handleEditFromDetail = (data: StrategyGroupItem) => {
    setDetailViewOpen(false)
    setDetailFormMode('edit')
    setEditingData(data)
    setDetailFormOpen(true)
  }

  const handleDelete = async (record: StrategyGroupItem) => {
    if (!record.uid) return
    try {
      await deleteStrategyGroup(record.uid)
      message.success(t('message.delete.success'))
      list.refresh()
      if (detailViewOpen && viewingData?.uid === record.uid)
        setDetailViewOpen(false)
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
      list.refresh()
      if (viewingData?.uid === record.uid) {
        mutateDetail({ ...viewingData, status: newStatus })
      }
    } catch (error) {
      console.error('修改状态失败:', error)
    }
  }

  const handleDetailFormSuccess = () => {
    setDetailFormOpen(false)
    list.refresh()
    if (detailViewOpen && viewingUid) {
      refreshDetail()
    }
  }

  const columns: ColumnsType<StrategyGroupItem> = [
    {
      title: t('strategyGroup.table.uid'),
      dataIndex: 'uid',
      key: 'uid',
      width: 160,
      ellipsis: true,
      render: (v) => emptyPlaceholder(v),
    },
    {
      title: t('strategyGroup.table.name'),
      dataIndex: 'name',
      key: 'name',
      width: 160,
      render: (v) => emptyPlaceholder(v),
    },
    {
      title: t('strategyGroup.table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (v: GlobalStatus) => renderStatusTag(v, t),
    },
    {
      title: t('strategyGroup.table.remark'),
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: (v) => emptyPlaceholder(v),
    },
    {
      title: t('strategyGroup.table.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (v: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: t('strategyGroup.table.updatedAt'),
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
        const action = isEnabled
          ? t(`common.status.${GlobalStatus.DISABLED}`)
          : t(`common.status.${GlobalStatus.ENABLED}`)

        const handleStatusClick = () => {
          modal.confirm({
            title: t('strategyGroup.confirm.status.title', { action }),
            content: t('strategyGroup.confirm.status.content', {
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
                title: t('strategyGroup.confirm.delete.title'),
                content: t('strategyGroup.confirm.delete.content', {
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

  useEffect(() => {
    const next = parseSearchParamsFromUrl(urlSearchParams)
    setSearchParams(next)
    searchForm.setFieldsValue(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearchParams.toString()])

  useEffect(() => {
    applySearchToUrl(
      setUrlSearchParams,
      {
        keyword: searchParams.keyword,
        status: searchParams.status,
      },
      { replace: true },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.keyword, searchParams.status])

  useEffect(() => {
    if (skipAutoSearchRef.current) {
      skipAutoSearchRef.current = false
      return
    }
    list.search(toListQuery(searchParams))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.status])

  useEffect(() => {
    searchForm.setFieldsValue({
      keyword: searchParams.keyword ?? '',
      status: searchParams.status,
    })
  }, [searchParams.keyword, searchParams.status, searchForm])

  return (
    <div className='h-full flex flex-col'>
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
            dataSource={list.dataSource}
            rowKey='uid'
            loading={list.loading}
            size='small'
            scroll={{ y: tableHeight, x: '100%' }}
            pagination={{
              current: list.pagination.current,
              pageSize: list.pagination.pageSize,
              total: list.pagination.total,
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
        onCancel={() => {
          setDetailViewOpen(false)
          setViewingUid(undefined)
        }}
        onEdit={handleEditFromDetail}
      />
    </div>
  )
}

export default function StrategyGroupListWrapper() {
  return (
    <App className='h-full'>
      <PageContent>
        <StrategyGroupList />
      </PageContent>
    </App>
  )
}
