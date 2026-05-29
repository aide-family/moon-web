import {
  type NamespaceItem,
  type NamespaceListParams,
  deleteNamespace,
  getNamespaceDetail,
  getNamespaceTableList,
  updateNamespaceStatus,
} from '@/api/account/namespace/index'
import { GlobalStatus } from '@/api/common/types'
import PageContent from '@/components/layout/PageContent'
import { useLocale } from '@/contexts/LocaleContext'
import { useNamespace } from '@/contexts/useNamespace'
import { MENU_DIVIDER } from '@/utils/menu'
import { applySearchToUrl, getParam } from '@/utils/urlSearchParams'
import { usePaginatedRequest } from '@/utils/hooks/usePaginatedRequest'
import { useDetailRequest } from '@/utils/hooks/useDetailRequest'
import { useAdaptiveTableHeight } from '@/utils/hooks/useAdaptiveTableHeight'
import type { MenuProps } from 'antd'
import {
  App,
  Button,
  Dropdown,
  Image,
  Input,
  Radio,
  Space,
  Table,
  Tag,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import React, { useEffect, useRef, useState } from 'react'
import { useMemoizedFn } from 'ahooks'
import { useSearchParams } from 'react-router-dom'
import DetailForm from './components/DetailForm'
import DetailView from './components/DetailView'

const defaultSearchParams: NamespaceListParams = {
  keyword: '',
  status: undefined,
}

type NamespaceListQuery = Omit<NamespaceListParams, 'page' | 'pageSize'>

function toListQuery(params: NamespaceListParams): NamespaceListQuery {
  return {
    keyword: params.keyword ?? '',
    status: params.status,
  }
}

function parseSearchParamsFromUrl(
  params: URLSearchParams,
): NamespaceListParams {
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
  const [searchParams, setSearchParams] = useState<NamespaceListParams>(() =>
    parseSearchParamsFromUrl(urlSearchParams),
  )
  const { tableContainerRef, tableWrapperRef, tableHeight } =
    useAdaptiveTableHeight()
  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [detailFormMode, setDetailFormMode] = useState<'create' | 'edit'>(
    'create',
  )
  const [editingData, setEditingData] = useState<NamespaceItem | null>(null)
  const [detailViewOpen, setDetailViewOpen] = useState(false)
  const [viewingUid, setViewingUid] = useState<string>()
  const skipAutoSearchRef = useRef(true)

  const list = usePaginatedRequest<NamespaceItem, NamespaceListQuery>({
    service: ({ page, pageSize, keyword, status }) =>
      getNamespaceTableList({
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
  } = useDetailRequest(getNamespaceDetail, viewingUid, detailViewOpen)

  useEffect(() => {
    setSearchParams(parseSearchParamsFromUrl(urlSearchParams))
  }, [urlSearchParams])

  useEffect(() => {
    applySearchToUrl(
      setUrlSearchParams,
      { keyword: searchParams.keyword, status: searchParams.status },
      { replace: true },
    )
  }, [searchParams.keyword, searchParams.status, setUrlSearchParams])

  const handleSearch = useMemoizedFn(
    (override?: Partial<NamespaceListParams>) => {
      if (override) {
        setSearchParams((prev) => ({ ...prev, ...override }))
      }
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

  const emptyPlaceholder = (text: unknown) =>
    text == null || text === '' ? '-' : text

  const columns: ColumnsType<NamespaceItem> = [
    {
      title: t('namespace.table.uid'),
      dataIndex: 'uid',
      key: 'uid',
      width: 160,
      render: (txt) => emptyPlaceholder(txt),
    },
    {
      title: t('namespace.table.name'),
      dataIndex: 'name',
      key: 'name',
      minWidth: 120,
      render: (txt) => emptyPlaceholder(txt),
    },
    {
      title: t('namespace.table.remark'),
      dataIndex: 'remark',
      key: 'remark',
      minWidth: 100,
      ellipsis: true,
      render: (txt) => emptyPlaceholder(txt),
    },
    {
      title: t('namespace.table.logo'),
      dataIndex: 'logo',
      key: 'logo',
      minWidth: 64,
      render: (logo: string) =>
        logo ? (
          <Image
            src={logo}
            alt=''
            width={40}
            height={40}
            style={{ objectFit: 'contain' }}
          />
        ) : (
          '-'
        ),
    },
    {
      title: t('namespace.table.banners'),
      dataIndex: 'banners',
      key: 'banners',
      minWidth: 64,
      render: (banners: string[] | undefined) =>
        banners && banners.length > 0 ? (
          <Image.PreviewGroup>
            <Image
              src={banners[0]}
              alt=''
              width={40}
              height={40}
              style={{ objectFit: 'contain', borderRadius: 4 }}
            />
            {banners.slice(1, 3).map((url, i) => (
              <Image key={i} src={url} alt='' style={{ display: 'none' }} />
            ))}
          </Image.PreviewGroup>
        ) : (
          '-'
        ),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      minWidth: 60,
      align: 'center',
      render: (status: GlobalStatus) => {
        const statusMap: Record<GlobalStatus, { text: string; color: string }> =
          {
            [GlobalStatus.UNKNOWN]: {
              text: t(`common.status.${GlobalStatus.UNKNOWN}`),
              color: 'default',
            },
            [GlobalStatus.ENABLED]: {
              text: t(`common.status.${GlobalStatus.ENABLED}`),
              color: 'success',
            },
            [GlobalStatus.DISABLED]: {
              text: t(`common.status.${GlobalStatus.DISABLED}`),
              color: 'error',
            },
          }
        const statusInfo = statusMap[status]
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      },
    },
    {
      title: t('namespace.table.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      minWidth: 100,
      render: (text: string) =>
        text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: t('namespace.table.updatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      minWidth: 100,
      render: (text: string) =>
        text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
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
            title: t('namespace.confirm.status.title', { action }),
            content: t('namespace.confirm.status.content', {
              action,
              name: record.name,
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
                title: t('namespace.confirm.delete.title'),
                content: t('namespace.confirm.delete.content', {
                  name: record.name,
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

  const handleViewDetail = (record: NamespaceItem) => {
    setViewingUid(record.uid)
    setDetailViewOpen(true)
  }

  const handleEdit = (record: NamespaceItem) => {
    setDetailFormMode('edit')
    setEditingData(record)
    setDetailFormOpen(true)
  }

  const handleEditFromDetail = (data: NamespaceItem) => {
    setDetailViewOpen(false)
    setDetailFormMode('edit')
    setEditingData(data)
    setDetailFormOpen(true)
  }

  const handleDelete = async (record: NamespaceItem) => {
    try {
      await deleteNamespace(record.uid)
      message.success(t('message.delete.success'))
      list.refresh()
      refreshNamespaceList()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  const handleStatusChange = async (
    record: NamespaceItem,
    newStatus: GlobalStatus,
  ) => {
    try {
      await updateNamespaceStatus({ uid: record.uid, status: newStatus })
      message.success(t('message.update.success'))
      list.refresh()
      refreshNamespaceList()
      if (detailViewOpen && viewingData && viewingData.uid === record.uid) {
        refreshDetail()
      }
    } catch (error) {
      console.error('修改状态失败:', error)
    }
  }

  const handleDetailFormSuccess = (created?: NamespaceItem) => {
    console.log('created', created)
    if (created) {
      setCurrentNamespace(created.uid)
      refreshNamespaceList().then(() => list.refresh())
    } else {
      list.refresh()
      refreshNamespaceList()
    }
    if (detailViewOpen && viewingUid) {
      refreshDetail()
    }
  }

  const handleExport = () => {
    console.log('导出命名空间')
  }

  useEffect(() => {
    if (skipAutoSearchRef.current) {
      skipAutoSearchRef.current = false
      return
    }
    list.search(toListQuery(searchParams))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.status])

  return (
    <div className='h-full flex flex-col'>
      <div className='mb-4 flex justify-between items-start shrink-0'>
        <Space size='middle' wrap>
          <span>{t('table.search.keyword')}:</span>
          <Input
            placeholder={t('table.search.placeholder')}
            allowClear
            className='w-full min-w-[120px] sm:w-48 md:w-52'
            value={searchParams.keyword}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, keyword: e.target.value }))
            }
            onPressEnter={(e) =>
              handleSearch({ keyword: (e.target as HTMLInputElement).value })
            }
          />
          <span>{t('common.status')}:</span>
          <Radio.Group
            value={searchParams.status}
            onChange={(e) =>
              setSearchParams((prev) => ({ ...prev, status: e.target.value }))
            }
            buttonStyle='solid'
          >
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
          <Button onClick={() => handleSearch()} type='primary'>
            {t('common.search')}
          </Button>
          <Button onClick={handleReset}>{t('common.reset')}</Button>
        </Space>
        <Space>
          <Button type='primary' onClick={handleAdd}>
            {t('common.add')}
          </Button>
          <Button onClick={handleExport}>{t('common.export')}</Button>
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
            scroll={{ y: tableHeight, x: 'max-content' }}
            pagination={{
              current: list.pagination.current,
              pageSize: list.pagination.pageSize,
              total: list.pagination.total,
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

export default function NamespaceListWrapper() {
  return (
    <App className='h-full'>
      <PageContent>
        <NamespaceList />
      </PageContent>
    </App>
  )
}
