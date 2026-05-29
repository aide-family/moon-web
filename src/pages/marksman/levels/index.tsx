import React, { useEffect, useRef, useState } from 'react'
import { useMemoizedFn } from 'ahooks'
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
import { usePaginatedRequest } from '@/utils/hooks/usePaginatedRequest'
import { useDetailRequest } from '@/utils/hooks/useDetailRequest'
import { useAdaptiveTableHeight } from '@/utils/hooks/useAdaptiveTableHeight'

const defaultSearchParams: LevelListParams = {
  keyword: '',
  status: undefined,
  type: undefined,
}

type LevelListQuery = Omit<LevelListParams, 'page' | 'pageSize'>

function toListQuery(params: LevelListParams): LevelListQuery {
  return {
    keyword: params.keyword ?? '',
    status: params.status,
    type: params.type,
  }
}

function parseLevelTypeFromUrl(raw: string | undefined): LevelType | undefined {
  if (
    raw === LevelType.LEVEL_TYPE_ALERT ||
    raw === LevelType.LEVEL_TYPE_DATASOURCE
  ) {
    return raw
  }
  return undefined
}

function parseSearchParamsFromUrl(params: URLSearchParams): LevelListParams {
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
    type: parseLevelTypeFromUrl(getParam(params, 'type')),
  }
}

const LevelList: React.FC = () => {
  const { modal } = App.useApp()
  const { t } = useLocale()
  const [urlSearchParams, setUrlSearchParams] = useSearchParams()
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
  const [viewingUid, setViewingUid] = useState<string>()

  const { tableContainerRef, tableWrapperRef, tableHeight } =
    useAdaptiveTableHeight()
  const skipAutoSearchRef = useRef(true)

  const list = usePaginatedRequest<LevelItem, LevelListQuery>({
    service: ({ page, pageSize, keyword, status, type }) =>
      getLevelList({
        page,
        pageSize,
        keyword: keyword || undefined,
        status,
        type,
      }),
    defaultQuery: toListQuery(parseSearchParamsFromUrl(urlSearchParams)),
  })

  const {
    data: viewingData,
    loading: detailLoading,
    refresh: refreshDetail,
    mutate: mutateDetail,
  } = useDetailRequest(getLevelDetail, viewingUid, detailViewOpen)

  const handleSearch = useMemoizedFn((override?: Partial<LevelListParams>) => {
    if (override) setSearchParams((prev) => ({ ...prev, ...override }))
    list.search(
      toListQuery({
        ...searchParams,
        ...override,
      }),
    )
  })

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

  const handleViewDetail = (record: LevelItem) => {
    if (!record.uid) return
    setViewingUid(record.uid)
    setDetailViewOpen(true)
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
      list.refresh()
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
      list.refresh()
      if (viewingData && viewingData.uid === record.uid) {
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

  useEffect(() => {
    const next = parseSearchParamsFromUrl(urlSearchParams)
    setSearchParams(next)
    searchForm.setFieldsValue(next)
  }, [urlSearchParams, searchForm])

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
    if (skipAutoSearchRef.current) {
      skipAutoSearchRef.current = false
      return
    }
    list.search(toListQuery(searchParams))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.status, searchParams.type])

  useEffect(() => {
    searchForm.setFieldsValue({
      keyword: searchParams.keyword ?? '',
      status: searchParams.status,
      type: searchParams.type,
    })
  }, [searchParams.keyword, searchParams.status, searchParams.type, searchForm])

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
              type: allValues.type,
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

export default function LevelListWrapper() {
  return (
    <App className='h-full'>
      <PageContent>
        <LevelList />
      </PageContent>
    </App>
  )
}
