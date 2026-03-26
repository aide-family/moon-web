import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Table,
  Input,
  Radio,
  Button,
  Space,
  message,
  Tag,
  Dropdown,
  App,
  Image,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import {
  type NamespaceItem,
  type NamespaceListParams,
  getNamespaceTableList,
  getNamespaceDetail,
  deleteNamespace,
  updateNamespaceStatus,
} from '@/api/account/namespace/index'
import { GlobalStatus } from '@/api/common/types'
import dayjs from 'dayjs'
import DetailForm from './components/DetailForm'
import DetailView from './components/DetailView'
import { useLocale } from '@/contexts/LocaleContext'
import PageContent from '@/components/layout/PageContent'
import { useNamespace } from '@/contexts/NamespaceContext'
import { applySearchToUrl, getParam } from '@/utils/urlSearchParams'

const defaultSearchParams: NamespaceListParams = {
  keyword: '',
  status: undefined,
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
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<NamespaceItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  })
  const [searchParams, setSearchParams] = useState<NamespaceListParams>(() =>
    parseSearchParamsFromUrl(urlSearchParams),
  )
  const [tableHeight, setTableHeight] = useState<number>(0)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [detailFormMode, setDetailFormMode] = useState<'create' | 'edit'>(
    'create',
  )
  const [editingData, setEditingData] = useState<NamespaceItem | null>(null)
  const [detailViewOpen, setDetailViewOpen] = useState(false)
  const [viewingData, setViewingData] = useState<NamespaceItem | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // 获取数据（override 用于回车搜索时传入当前输入值，避免 state 未更新）
  const fetchData = async (
    page?: number,
    pageSize?: number,
    override?: Partial<NamespaceListParams>,
  ) => {
    setLoading(true)
    try {
      const currentPage = page ?? pagination.current
      const currentPageSize = pageSize ?? pagination.pageSize
      const params: NamespaceListParams = {
        page: currentPage,
        pageSize: currentPageSize,
        keyword:
          override?.keyword !== undefined
            ? override.keyword || undefined
            : searchParams.keyword || undefined,
        status:
          override?.status !== undefined
            ? override.status
            : searchParams.status,
      }
      const response = await getNamespaceTableList(params)
      if (response) {
        setDataSource(response.items || [])
        setPagination((prev) => ({
          ...prev,
          current: currentPage,
          pageSize: currentPageSize,
          total: parseInt(response.total || '0', 10),
        }))
      }
    } catch (error) {
      console.error('获取命名空间列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleSearch = (override?: Partial<NamespaceListParams>) => {
    if (override) {
      setSearchParams((prev) => ({ ...prev, ...override }))
    }
    setPagination((prev) => ({ ...prev, current: 1 }))
    fetchData(1, pagination.pageSize, override)
  }

  const handleReset = () => {
    setSearchParams(defaultSearchParams)
    setUrlSearchParams({})
    setPagination({ current: 1, pageSize: 50, total: 0 })
    fetchData()
  }

  // 处理表格变化（分页）
  const handleTableChange = (page: number, pageSize: number) => {
    // 直接传递新的分页参数给 fetchData
    fetchData(page, pageSize)
  }

  const emptyPlaceholder = (text: unknown) =>
    text == null || text === '' ? '-' : text

  // 表格列定义
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
        const handleStatusClick = () => {
          const isEnabled = record.status === GlobalStatus.ENABLED
          const action = isEnabled
            ? t(`common.status.${GlobalStatus.DISABLED}`)
            : t(`common.status.${GlobalStatus.ENABLED}`)
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
            label: t(`common.status.${record.status}`),
            onClick: handleStatusClick,
          },
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

  // 处理新增
  const handleAdd = () => {
    setDetailFormMode('create')
    setEditingData(null)
    setDetailFormOpen(true)
  }

  // 处理查看详情（调接口拉取最新详情）
  const handleViewDetail = async (record: NamespaceItem) => {
    setDetailViewOpen(true)
    setViewingData(null)
    setDetailLoading(true)
    try {
      const data = await getNamespaceDetail(record.uid)
      setViewingData(data)
    } catch (error) {
      console.error('获取命名空间详情失败:', error)
      setDetailViewOpen(false)
    } finally {
      setDetailLoading(false)
    }
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
      await deleteNamespace(record.uid)
      message.success(t('message.delete.success'))
      fetchData()
      refreshNamespaceList()
    } catch (error) {
      console.error('删除失败:', error)
      // 错误信息已由 API 拦截器处理
    }
  }

  // 处理修改状态
  const handleStatusChange = async (
    record: NamespaceItem,
    newStatus: GlobalStatus,
  ) => {
    try {
      await updateNamespaceStatus({ uid: record.uid, status: newStatus })
      message.success(t('message.update.success'))
      fetchData()
      refreshNamespaceList()
      // 如果详情页打开，重新拉取详情
      if (detailViewOpen && viewingData && viewingData.uid === record.uid) {
        try {
          const data = await getNamespaceDetail(record.uid)
          setViewingData(data)
        } catch {
          // 忽略，列表已刷新
        }
      }
    } catch (error) {
      console.error('修改状态失败:', error)
      // 错误信息已由 API 拦截器处理
    }
  }

  // 处理详情表单成功回调（创建时传入新建的命名空间，便于设为当前选中）
  const handleDetailFormSuccess = (created?: NamespaceItem) => {
    // 新建成功：通过 Context 设为当前选中，头部下拉会立即更新
    console.log('created', created)
    if (created) {
      setCurrentNamespace(created.uid)
      refreshNamespaceList().then(() => fetchData())
    } else {
      fetchData()
      refreshNamespaceList()
    }
    // 如果详情页打开，重新拉取详情
    if (detailViewOpen && viewingData) {
      getNamespaceDetail(viewingData.uid)
        .then(setViewingData)
        .catch(() => {})
    }
  }

  // 处理导出
  const handleExport = () => {
    // TODO: 实现导出功能
    console.log('导出命名空间')
  }

  // 初始化数据加载
  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.status]) // 只在组件挂载时执行一次

  // 计算表格高度（自动获取分页器高度、表头高度和 margin）
  useEffect(() => {
    const updateTableHeight = () => {
      if (tableContainerRef.current && tableWrapperRef.current) {
        const containerHeight = tableContainerRef.current.clientHeight

        // 查找表头元素（Ant Design Table 的表头）
        const theadElement =
          tableWrapperRef.current.querySelector('.ant-table-thead')
        let theadHeight = 0
        if (theadElement) {
          const theadRect = theadElement.getBoundingClientRect()
          const theadStyle = window.getComputedStyle(theadElement)
          const theadMarginBottom = parseFloat(theadStyle.marginBottom) || 0
          theadHeight = theadRect.height + theadMarginBottom
        }

        // 查找分页器元素（Ant Design Table 的分页器）
        const paginationElement =
          tableWrapperRef.current.querySelector('.ant-pagination')
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
        const tableBodyElement =
          tableWrapperRef.current.querySelector('.ant-table-body')
        let tableBodyPadding = 0
        if (tableBodyElement) {
          const bodyStyle = window.getComputedStyle(tableBodyElement)
          const paddingTop = parseFloat(bodyStyle.paddingTop) || 0
          const paddingBottom = parseFloat(bodyStyle.paddingBottom) || 0
          tableBodyPadding = paddingTop + paddingBottom
        }

        // 计算表格可用的滚动高度 = 容器高度 - 表头高度 - 分页器高度 - 表格主体 padding
        const calculatedHeight =
          containerHeight - theadHeight - paginationHeight - tableBodyPadding
        setTableHeight(Math.max(calculatedHeight, 100)) // 最小高度100px
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
            dataSource={dataSource}
            rowKey='uid'
            loading={loading}
            size='small'
            scroll={{ y: tableHeight, x: 'max-content' }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
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
      <PageContent>
        <NamespaceList />
      </PageContent>
    </App>
  )
}
