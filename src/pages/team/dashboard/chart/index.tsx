import { Status } from '@/api/enum'
import { ChartItem, DashboardItem } from '@/api/model-types'
import { listChart, ListChartRequest } from '@/api/realtime/dashboard'
import SearchBox from '@/components/data/search-box'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { useRequest } from 'ahooks'
import { Button, Space, theme } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { formList } from '../options'
import { ChartCard } from './card-chart'
import { ModalEdit } from './modal-edit'

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

  useEffect(() => {
    const dashboardId = routerSearchParams.get('id')
    const dashboardName = routerSearchParams.get('title')
    if (dashboardId && dashboardName) {
      setDashboard((prev) => ({ ...prev, id: Number(dashboardId), title: dashboardName }))
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
      <ModalEdit
        dashboardId={dashboard.id}
        chart={editModalData}
        open={editModalOpen}
        onCancel={handleEditModalClose}
        onOk={handleEditModalOk}
      />
      <div
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius
        }}
      >
        <SearchBox ref={searchRef} formList={formList} onSearch={onSearch} onReset={onReset} />
      </div>
      <div
        className='p-3'
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius
        }}
      >
        <div className='flex justify-between'>
          <div className='text-lg font-bold'>{dashboard.title}-图表列表</div>
          <Space size={8}>
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
                <ChartCard chart={item} handleEditModal={handleEditModal} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
