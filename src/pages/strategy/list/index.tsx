import { Status, StrategyType } from '@/api/enum'
import { ActionKey, defaultPaginationReq, StrategyTypeData } from '@/api/global'
import { StrategyItem } from '@/api/model-types'
import { deleteStrategy, listStrategy, ListStrategyRequest, pushStrategy, updateStrategyStatus } from '@/api/strategy'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table/index'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { GlobalContext } from '@/utils/context'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { Button, message, Modal, Space, theme } from 'antd'
import { debounce } from 'lodash'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { DomainEditModal } from './edit-modal-domain'
import EventEditModal from './edit-modal-event'
import { HTTPEditModal } from './edit-modal-http'
import MetricEditModal from './edit-modal-metric'
import { PortEditModal } from './edit-modal-port'
import StrategyTypeModal from './edit-modal-strategy-type'
import { formList, getColumnList } from './options'
import StrategyCharts from './strategy-metric-charts'
import { Detail } from './strategy-metric-detail'

const { confirm } = Modal
const { useToken } = theme

const defaultSearchParams: ListStrategyRequest = {
  pagination: defaultPaginationReq
}

const StrategyMetric: React.FC = () => {
  const { token } = useToken()
  const { isFullscreen } = useContext(GlobalContext)

  const [datasource, setDatasource] = useState<StrategyItem[]>([])
  const [searchParams, setSearchParams] = useState<ListStrategyRequest>(defaultSearchParams)
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [total, setTotal] = useState(0)
  const [openMetricEditModal, setOpenMetricEditModal] = useState(false)
  const [openEventEditModal, setOpenEventEditModal] = useState(false)
  const [openDomainEditModal, setOpenDomainEditModal] = useState(false)
  const [openPortEditModal, setOpenPortEditModal] = useState(false)
  const [openHttpEditModal, setOpenHttpEditModal] = useState(false)
  const [editDetail, setEditDetail] = useState<StrategyItem>()
  const [openChartModal, setOpenChartModal] = useState(false)
  const [openStrategyTypeModal, setOpenStrategyTypeModal] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource, isFullscreen)
  const [detailId, setDetailId] = useState<number>()
  const [openDetailModal, setOpenDetailModal] = useState(false)

  const handleOpenMetricEditModal = (item?: StrategyItem) => {
    setEditDetail(item)
    setOpenMetricEditModal(true)
  }

  const handleOpenEventEditModal = (item?: StrategyItem) => {
    setEditDetail(item)
    setOpenEventEditModal(true)
  }

  const handleOpenDomainEditModal = (item?: StrategyItem) => {
    setEditDetail(item)
    setOpenDomainEditModal(true)
  }

  const handleOpenPortEditModal = (item?: StrategyItem) => {
    setEditDetail(item)
    setOpenPortEditModal(true)
  }

  const handleOpenHttpEditModal = (item?: StrategyItem) => {
    setEditDetail(item)
    setOpenHttpEditModal(true)
  }

  const handleDetailModal = (id: number) => {
    setDetailId(id)
    setOpenDetailModal(true)
  }

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false)
    setDetailId(0)
  }

  const handleCloseMetricEditModal = () => {
    setOpenMetricEditModal(false)
    setEditDetail(undefined)
  }

  const handleCloseEventEditModal = () => {
    setOpenEventEditModal(false)
    setEditDetail(undefined)
  }

  const handleCloseDomainEditModal = () => {
    setOpenDomainEditModal(false)
    setEditDetail(undefined)
  }

  const handleClosePortEditModal = () => {
    setOpenPortEditModal(false)
    setEditDetail(undefined)
  }

  const handleCloseHttpEditModal = () => {
    setOpenHttpEditModal(false)
    setEditDetail(undefined)
  }

  const onRefresh = () => {
    setRefresh(!refresh)
  }

  const handleOpenChartModal = (id: number) => {
    setOpenChartModal(true)
    setDetailId(id)
  }

  const handleCloseChartModal = () => {
    setOpenChartModal(false)
    setDetailId(0)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchData = useCallback(
    debounce(async (params) => {
      setLoading(true)
      try {
        const { list, pagination } = await listStrategy(params)
        setDatasource(list || [])
        setTotal(pagination?.total || 0)
      } finally {
        setLoading(false)
      }
    }, 500),
    []
  )

  useEffect(() => {
    fetchData(searchParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, searchParams, fetchData])

  const onSearch = (formData: ListStrategyRequest) => {
    setSearchParams({
      ...searchParams,
      ...formData,
      pagination: {
        pageNum: 1,
        pageSize: searchParams?.pagination?.pageSize
      }
    })
  }

  // 切换分页
  const handleTurnPage = (page: number, pageSize: number) => {
    setSearchParams({
      ...searchParams,
      pagination: {
        pageNum: page,
        pageSize: pageSize
      }
    })
  }

  // 重置
  const onReset = () => {
    setSearchParams(defaultSearchParams)
  }

  const handleOpenEditModal = (item: StrategyItem) => {
    switch (item.strategyType) {
      case StrategyType.StrategyTypeMetric:
        handleOpenMetricEditModal(item)
        break
      case StrategyType.StrategyTypeMQ:
        handleOpenEventEditModal(item)
        break
      case StrategyType.StrategyTypeDomainCertificate:
        handleOpenDomainEditModal(item)
        break
      case StrategyType.StrategyTypeDomainPort:
        handleOpenPortEditModal(item)
        break
      case StrategyType.StrategyTypeHTTP:
        handleOpenHttpEditModal(item)
        break
      default:
        message.warning(`${StrategyTypeData[item.strategyType]}未开通`)
        break
    }
  }

  const onHandleMenuOnClick = (item: StrategyItem, key: ActionKey) => {
    switch (key) {
      case ActionKey.ENABLE:
        updateStrategyStatus({ ids: [item.id], status: Status.StatusEnable }).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.DISABLE:
        updateStrategyStatus({ ids: [item.id], status: Status.StatusDisable }).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.OPERATION_LOG:
        break
      case ActionKey.DETAIL:
        handleDetailModal(item.id)
        break
      case ActionKey.EDIT:
        handleOpenEditModal(item)
        break
      case ActionKey.CHART:
        handleOpenChartModal(item.id)
        break
      case ActionKey.IMMEDIATELY_PUSH:
        pushStrategy(item.id)
          .then(() => message.success('推送成功'))
          .catch(() => message.error('推送失败'))
        break
      case ActionKey.DELETE:
        confirm({
          title: `请确认是否删除该策略组?`,
          icon: <ExclamationCircleFilled />,
          content: '此操作不可逆',
          onOk() {
            deleteStrategy({ id: item.id }).then(() => {
              message.success('删除成功')
              onRefresh()
            })
          },
          onCancel() {
            message.info('取消操作')
          }
        })
        break
    }
  }

  const columns = getColumnList({
    onHandleMenuOnClick,
    current: searchParams.pagination.pageNum,
    pageSize: searchParams.pagination.pageSize
  })

  const handleOpenStrategyTypeModal = () => {
    setOpenStrategyTypeModal(true)
  }

  const handleStrategyTypeSubmit = (type: StrategyType) => {
    setOpenStrategyTypeModal(false)
    switch (type) {
      case StrategyType.StrategyTypeMetric:
        handleOpenMetricEditModal()
        break
      case StrategyType.StrategyTypeMQ:
        handleOpenEventEditModal()
        break
      case StrategyType.StrategyTypeDomainCertificate:
        handleOpenDomainEditModal()
        break
      case StrategyType.StrategyTypeDomainPort:
        handleOpenPortEditModal()
        break
      case StrategyType.StrategyTypeHTTP:
        handleOpenHttpEditModal()
        break
      default:
        message.warning(`${StrategyTypeData[type]}未开通`)
        break
    }
  }

  const handleStrategyTypeCancel = () => {
    setOpenStrategyTypeModal(false)
  }

  return (
    <div className='h-full flex flex-col gap-3 p-3'>
      <StrategyTypeModal
        title='选择策略类型'
        open={openStrategyTypeModal}
        onSubmit={handleStrategyTypeSubmit}
        onCancel={handleStrategyTypeCancel}
      />
      <MetricEditModal
        title='指标策略编辑'
        width='60%'
        strategyDetail={editDetail}
        open={openMetricEditModal}
        onCancel={handleCloseMetricEditModal}
      />
      <DomainEditModal
        title='证书策略编辑'
        width='60%'
        strategyDetail={editDetail}
        open={openDomainEditModal}
        onCancel={handleCloseDomainEditModal}
      />
      <PortEditModal
        title='端口策略编辑'
        width='60%'
        strategyDetail={editDetail}
        open={openPortEditModal}
        onCancel={handleClosePortEditModal}
      />
      <EventEditModal
        title='事件策略编辑'
        width='60%'
        eventStrategyDetail={editDetail}
        open={openEventEditModal}
        onCancel={handleCloseEventEditModal}
      />
      <HTTPEditModal
        title='HTTP策略编辑'
        width='60%'
        strategyDetail={editDetail}
        open={openHttpEditModal}
        onCancel={handleCloseHttpEditModal}
      />
      <StrategyCharts
        title='策略图表'
        width='60%'
        strategyID={detailId}
        open={openChartModal}
        onCancel={handleCloseChartModal}
      />
      <Detail width='60%' strategyId={detailId} open={openDetailModal} onCancel={handleCloseDetailModal} />
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
        <div className='flex justify-between items-center'>
          <div className='font-bold text-lg'>策略组</div>
          <Space size={8}>
            <Button type='primary' onClick={handleOpenStrategyTypeModal}>
              添加
            </Button>
            {/* <Button onClick={() => handleEditModal()}>批量导入</Button> */}
            <Button color='default' variant='filled' onClick={onRefresh}>
              刷新
            </Button>
          </Space>
        </div>
        <div className='mt-3' ref={ADivRef}>
          <AutoTable
            rowKey={(record) => record.id}
            dataSource={datasource}
            total={total}
            loading={loading}
            columns={columns}
            handleTurnPage={handleTurnPage}
            pageSize={searchParams.pagination.pageSize}
            pageNum={searchParams.pagination.pageNum}
            showSizeChanger={true}
            style={{
              background: token.colorBgContainer,
              borderRadius: token.borderRadius
            }}
            scroll={{
              y: `calc(100vh - 170px  - ${AutoTableHeight}px)`,
              x: 1000
            }}
            size='middle'
          />
        </div>
      </div>
    </div>
  )
}

export default StrategyMetric
