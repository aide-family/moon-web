import React, { useState, useEffect } from 'react'
import { useMemoizedFn } from 'ahooks'
import { Input, Button, message, App, Dropdown, Form, Spin, Tabs } from 'antd'
import type { MenuProps } from 'antd'
import {
  type DatasourceItem,
  type DatasourceListParams,
  getDatasourceList,
  getDatasourceDetail,
  deleteDatasource,
} from '@/api/marksman/datasource/index'
import DetailForm from './components/DetailForm'
import DetailView from './components/DetailView'
import MetadataView from './components/MetadataView'
import { EllipsisOutlined } from '@ant-design/icons'
import { useLocale } from '@/contexts/LocaleContext'
import PageContent from '@/components/layout/PageContent'
import { getTypeLabel, getDriverLabel } from '@/utils/marksman'
import { MENU_DIVIDER } from '@/utils/menu'
import { useInfinitePaginatedRequest } from '@/utils/hooks/useInfinitePaginatedRequest'
import { useDetailRequest } from '@/utils/hooks/useDetailRequest'

type DatasourceListQuery = Omit<DatasourceListParams, 'page' | 'pageSize'>

const defaultSearchParams: DatasourceListQuery = {
  keyword: '',
}

const DatasourceList: React.FC = () => {
  const { modal } = App.useApp()
  const { t } = useLocale()
  const [searchParams, setSearchParams] =
    useState<DatasourceListQuery>(defaultSearchParams)
  const [searchForm] = Form.useForm<DatasourceListQuery>()
  const [detailFormOpen, setDetailFormOpen] = useState(false)
  const [detailFormMode, setDetailFormMode] = useState<'create' | 'edit'>(
    'create',
  )
  const [editingData, setEditingData] = useState<DatasourceItem | null>(null)
  const [selectedUid, setSelectedUid] = useState<string | null>(null)

  const list = useInfinitePaginatedRequest<DatasourceItem, DatasourceListQuery>(
    {
      service: ({ page, pageSize, keyword, type, driver, status }) =>
        getDatasourceList({
          page,
          pageSize,
          keyword: keyword || undefined,
          type,
          driver,
          status,
        }),
      defaultQuery: defaultSearchParams,
      defaultPageSize: 20,
    },
  )

  const {
    dataSource,
    loading,
    loadingMore,
    hasMore,
    page,
    search: listSearch,
    loadMore,
  } = list

  const {
    data: viewingData,
    loading: detailLoading,
    refresh: refreshViewingData,
  } = useDetailRequest(getDatasourceDetail, selectedUid ?? undefined, !!selectedUid)

  useEffect(() => {
    if (page !== 1 || loading) return
    const firstUid = dataSource[0]?.uid
    if (firstUid) {
      setSelectedUid(firstUid)
    } else {
      setSelectedUid(null)
    }
  }, [dataSource, page, loading])

  const handleScroll = useMemoizedFn((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const threshold = 80
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= threshold) {
      loadMore()
    }
  })

  const handleSearch = (override?: Partial<DatasourceListQuery>) => {
    if (override) setSearchParams((prev) => ({ ...prev, ...override }))
    listSearch({
      ...searchParams,
      ...override,
    })
  }

  const handleAdd = () => {
    setDetailFormMode('create')
    setEditingData(null)
    setDetailFormOpen(true)
  }

  const handleSelectItem = (record: DatasourceItem) => {
    if (!record.uid) return
    setSelectedUid(record.uid)
  }

  const handleEdit = (record: DatasourceItem) => {
    setDetailFormMode('edit')
    setEditingData(record)
    setDetailFormOpen(true)
  }

  const handleEditFromDetail = (data: DatasourceItem) => {
    setDetailFormMode('edit')
    setEditingData(data)
    setDetailFormOpen(true)
  }

  const handleDelete = async (record: DatasourceItem) => {
    if (!record.uid) return
    try {
      await deleteDatasource(record.uid)
      message.success(t('message.delete.success'))
      if (selectedUid === record.uid) {
        setSelectedUid(null)
      }
      listSearch(searchParams)
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  const handleDetailFormSuccess = () => {
    setDetailFormOpen(false)
    listSearch(searchParams)
    if (viewingData?.uid) {
      refreshViewingData()
    }
  }

  useEffect(() => {
    searchForm.setFieldsValue({
      keyword: searchParams.keyword ?? '',
    })
  }, [searchParams.keyword, searchForm])

  return (
    <div className='h-full flex flex-col'>
      <div className='flex-1 flex min-h-0 gap-4'>
        {/* 左侧：数据源列表 */}
        <PageContent className='h-full'>
          <div className='flex items-center gap-2 px-3 h-14 py-2 border-b border-(--ant-color-border-secondary) shrink-0'>
            <Form
              form={searchForm}
              layout='inline'
              className='flex-1 min-w-0'
              onValuesChange={(_, allValues) => {
                setSearchParams((prev: DatasourceListQuery) => ({
                  ...prev,
                  keyword: allValues.keyword ?? '',
                }))
              }}
            >
              <Form.Item name='keyword' className='mb-0 w-full'>
                <Input
                  placeholder={t('table.search.placeholder')}
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
            <Button type='primary' onClick={handleAdd}>
              {t('common.add')}
            </Button>
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
                  const menuItems: MenuProps['items'] = [
                    {
                      key: 'edit',
                      label: t('common.edit'),
                      onClick: () => handleEdit(item),
                    },
                    MENU_DIVIDER,
                    {
                      key: 'delete',
                      label: t('common.delete'),
                      danger: true,
                      onClick: () => {
                        modal.confirm({
                          title: t('datasource.confirm.delete.title'),
                          content: t('datasource.confirm.delete.content', {
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
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2'>
                          <div
                            className='text-xs text-(--ant-color-text-secondary) whitespace-nowrap'
                            style={{ color: item.level?.bgColor ?? '#000' }}
                          >
                            {item.level?.name}
                          </div>
                          <span className='truncate'>
                            {item.name || item.uid || '-'}
                          </span>
                        </div>
                        <div className='text-xs text-(--ant-color-text-secondary) whitespace-nowrap'>
                          {getTypeLabel(item.type, t)} /{' '}
                          {getDriverLabel(item.driver, t)}
                        </div>
                      </div>
                      <span onClick={(e) => e.stopPropagation()}>
                        <Dropdown
                          menu={{ items: menuItems }}
                          trigger={['click']}
                        >
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
            {!loading && hasMore && dataSource.length > 0 && !loadingMore && (
              <div className='text-center py-2 text-(--ant-color-text-tertiary) text-xs'>
                {t('datasource.list.scrollToLoadMore')}
              </div>
            )}
          </div>
        </PageContent>
        {/* 右侧：详情 / 元数据 / 快捷查询 */}
        <PageContent className='flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden'>
          {selectedUid ? (
            <Tabs
              className='flex-1 min-h-0 flex flex-col [&_.ant-tabs-content]:flex-1 [&_.ant-tabs-tabpane]:h-full [&_.ant-tabs-tabpane]:overflow-auto'
              style={{ height: '100%' }}
              items={[
                {
                  key: 'detail',
                  label: t('datasource.tab.detail'),
                  children: (
                    <div className='h-full overflow-auto p-4'>
                      <DetailView
                        embedded
                        data={viewingData}
                        loading={detailLoading}
                        onEdit={handleEditFromDetail}
                        onStatusUpdated={refreshViewingData}
                      />
                    </div>
                  ),
                },
                {
                  key: 'metadata',
                  label: t('datasource.tab.metadata'),
                  children: <MetadataView uid={selectedUid} />,
                },
                {
                  key: 'quickQuery',
                  label: t('datasource.tab.quickQuery'),
                  children: (
                    <div className='p-4 h-full flex flex-col gap-3'>
                      <Input.TextArea
                        placeholder={t('datasource.quickQuery.placeholder')}
                        rows={6}
                        className='font-mono text-sm'
                      />
                      <Button type='primary'>
                        {t('datasource.quickQuery.run')}
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          ) : (
            <div className='flex-1 flex items-center justify-center text-(--ant-color-text-tertiary)'>
              {t('datasource.detail.selectHint')}
            </div>
          )}
        </PageContent>
      </div>
      <DetailForm
        open={detailFormOpen}
        mode={detailFormMode}
        initialData={editingData}
        onCancel={() => setDetailFormOpen(false)}
        onSuccess={handleDetailFormSuccess}
      />
    </div>
  )
}

export default function DatasourceListWrapper() {
  return (
    <App className='h-full'>
      <DatasourceList />
    </App>
  )
}
