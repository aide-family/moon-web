import { Status } from '@/api/enum'
import type { ChartItem, DashboardItem } from '@/api/model-types'
import { type ListChartRequest, batchUpdateChartSort, listChart } from '@/api/realtime/dashboard'
import SearchBox from '@/components/data/search-box'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { useRequest } from 'ahooks'
import { Button, Space, message, theme } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { formList } from '../options'
import { ChartCard, type SortType } from './card-chart'
import { ModalEdit } from './modal-edit'
import { ModalPreview } from './modal-preview'

const { useToken } = theme
const defaultSearchParams: ListChartRequest = {
  dashboardId: 0,
  pagination: {
    pageSize: 10,
    pageNum: 1
  }
}

const defaultDashboard: DashboardItem = {
  id: 0,
  title: '',
  remark: '',
  createdAt: '',
  updatedAt: '',
  color: '',
  status: Status.StatusAll,
  charts: [],
  groups: []
}

export default function Chart() {
  const [routerSearchParams] = useSearchParams()

  const { token } = useToken()

  const [dashboard, setDashboard] = useState<DashboardItem>(defaultDashboard)
  const [searchParams, setSearchParams] = useState<ListChartRequest>(defaultSearchParams)
  const [datasource, setDatasource] = useState<ChartItem[]>([])

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editModalData, setEditModalData] = useState<ChartItem>()

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource)

  const [previewModalOpen, setPreviewModalOpen] = useState(false)

  const handlePreviewModal = () => {
    setPreviewModalOpen(true)
  }

  const handlePreviewModalClose = () => {
    setPreviewModalOpen(false)
  }

  const { runAsync: fetchData } = useRequest(listChart, {
    manual: true,
    onSuccess: (res) => {
      setDatasource(res.list)
    }
  })

  const onRefresh = () => {
    if (dashboard.id) {
      fetchData(searchParams)
    }
  }

  const onSearch = (formData: ListChartRequest) => {
    setSearchParams({
      ...searchParams,
      ...formData,
      pagination: {
        pageNum: 1,
        pageSize: searchParams.pagination.pageSize
      }
    })
  }

  // 重置
  const onReset = () => {
    setSearchParams(defaultSearchParams)
  }

  const handleEditModal = (data?: ChartItem) => {
    setEditModalData(data)
    setEditModalOpen(true)
  }

  const handleEditModalClose = () => {
    setEditModalOpen(false)
    setEditModalData(undefined)
  }

  const handleEditModalOk = () => {
    setEditModalOpen(false)
    setEditModalData(undefined)
    onRefresh()
  }

  const { run: runUpdateChartSort } = useRequest(batchUpdateChartSort, {
    manual: true,
    onSuccess: () => {
      message.success('更新图表排序成功')
      onRefresh()
    }
  })

  const handleUpdateChartSort = (data: { id: number; sort: SortType }) => {
    const ids = datasource.map((item) => item.id)
    const index = ids.indexOf(data.id)
    const prevIndex = index - 1
    const nextIndex = index + 1
    switch (data.sort) {
      case 'up':
        ids.splice(index, 1)
        if (prevIndex >= 0) {
          ids.splice(prevIndex, 0, data.id)
        } else {
          ids.unshift(data.id)
        }
        break
      case 'down':
        ids.splice(index, 1)
        if (nextIndex < ids.length) {
          ids.splice(nextIndex, 0, data.id)
        } else {
          ids.push(data.id)
        }
        break
      case 'top':
        ids.splice(index, 1)
        ids.unshift(data.id)
        break
      case 'bottom':
        ids.splice(index, 1)
        ids.push(data.id)
        break
    }
    runUpdateChartSort({ dashboardId: dashboard.id, ids })
  }

  useEffect(() => {
    const dashboardId = routerSearchParams.get('id')
    const dashboardName = routerSearchParams.get('title')
    if (dashboardId && dashboardName) {
      setDashboard((prev) => ({
        ...prev,
        id: Number(dashboardId),
        title: dashboardName
      }))
    }
  }, [routerSearchParams])

  useEffect(() => {
    if (dashboard) {
      setSearchParams((prev) => ({
        ...prev,
        dashboardId: dashboard.id
      }))
    }
  }, [dashboard])

  useEffect(() => {
    if (dashboard.id) {
      fetchData(searchParams)
    }
  }, [dashboard, searchParams, fetchData])

  return (
    <div className='p-3 gap-3 flex flex-col'>
      <ModalPreview
        width='80vw'
        title={<div className='text-lg font-bold'>{dashboard.title}-预览</div>}
        dashboardId={dashboard.id}
        open={previewModalOpen}
        onClose={handlePreviewModalClose}
        centered
      />
      <ModalEdit
        dashboardId={dashboard.id}
        chart={editModalData}
        open={editModalOpen}
        onCancel={handleEditModalClose}
        onOk={handleEditModalOk}
      />
      <div style={{ background: token.colorBgContainer, borderRadius: token.borderRadius }}>
        <SearchBox ref={searchRef} formList={formList} onSearch={onSearch} onReset={onReset} />
      </div>
      <div className='p-3' style={{ background: token.colorBgContainer, borderRadius: token.borderRadius }}>
        <div className='flex justify-between'>
          <div className='text-lg font-bold'>{dashboard.title}-图表列表</div>
          <Space size={8}>
            <Button color='primary' variant='filled' onClick={handlePreviewModal}>
              预览
            </Button>
            <Button type='primary' onClick={() => handleEditModal()}>
              添加
            </Button>
            <Button color='default' variant='filled' onClick={onRefresh}>
              刷新
            </Button>
          </Space>
        </div>
        <div
          className='mt-4 overflow-y-auto flex flex-wrap gap-4'
          ref={ADivRef}
          style={{ height: `calc(100vh - 72px - ${AutoTableHeight}px)` }}
        >
          {datasource.map((item) => {
            return (
              <div key={item.id} className='w-[400px]'>
                <ChartCard
                  dashboardId={dashboard.id}
                  chart={item}
                  handleEditModal={handleEditModal}
                  refreshChart={onRefresh}
                  updateChartSort={handleUpdateChartSort}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
