import { NotifyType, StrategyType } from '@/api/enum'
import { ActionKey, defaultPaginationReq } from '@/api/global'
import { StrategyItem, StrategySubscribeItem } from '@/api/model-types'
import { unSubscriber, userSubscriberList, UserSubscriberListRequest } from '@/api/subscriber'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { GlobalContext } from '@/utils/context'
import { useRequest } from 'ahooks'
import { Alert, Button, Checkbox, message, Modal, Space, theme } from 'antd'
import { useContext, useEffect, useRef, useState } from 'react'
import { StrategyDetailDomain } from '../list/detail-modal-domain'
import { StrategyDetailEvent } from '../list/detail-modal-event'
import { StrategyDetailHttp } from '../list/detail-modal-http'
import { MetricDetail } from '../list/detail-modal-metric'
import { StrategyDetailPort } from '../list/detail-modal-port'
import { ModalSubscribe } from '../list/modal-subscribe'
import { formList, getColumnList } from './options'

const { useToken } = theme

const defaultSearchParams: UserSubscriberListRequest = {
  pagination: defaultPaginationReq
}

export default function Subscribe() {
  const { token } = useToken()
  const { isFullscreen } = useContext(GlobalContext)

  const [searchParams, setSearchParams] = useState<UserSubscriberListRequest>(defaultSearchParams)

  const [datasource, setDatasource] = useState<StrategySubscribeItem[]>([])
  const [total, setTotal] = useState<number>(0)
  const [detail, setDetail] = useState<StrategyItem>()
  const [openSubscribeModal, setOpenSubscribeModal] = useState(false)
  const [openMetricDetailModal, setOpenMetricDetailModal] = useState(false)
  const [openEventDetailModal, setOpenEventDetailModal] = useState(false)
  const [openDomainDetailModal, setOpenDomainDetailModal] = useState(false)
  const [openPortDetailModal, setOpenPortDetailModal] = useState(false)
  const [openHttpDetailModal, setOpenHttpDetailModal] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource, isFullscreen)

  const { run: getDatasource, loading } = useRequest(userSubscriberList, {
    manual: true,
    onSuccess: (data) => {
      setDatasource(data.list || [])
      setTotal(data.pagination?.total || 0)
    }
  })

  const onSearch = (formData: UserSubscriberListRequest) => {
    setSearchParams({
      ...searchParams,
      ...formData,
      pagination: {
        pageNum: 1,
        pageSize: searchParams?.pagination?.pageSize
      }
    })
  }

  // 重置
  const onReset = () => {
    setSearchParams(defaultSearchParams)
  }

  const onRefresh = () => {
    getDatasource(searchParams)
  }

  const { runAsync: cancelSubscribe, loading: cancelSubscribeLoading } = useRequest(unSubscriber, {
    manual: true
  })

  const handleOpenSubscribeModal = (item?: StrategyItem) => {
    setDetail(item)
    setOpenSubscribeModal(true)
  }

  const handleDetailModal = (item: StrategyItem) => {
    setDetail(item)
    switch (item.strategyType) {
      case StrategyType.StrategyTypeMetric:
        setOpenMetricDetailModal(true)
        break
      case StrategyType.StrategyTypeEvent:
        setOpenEventDetailModal(true)
        break
      case StrategyType.StrategyTypeDomainCertificate:
        setOpenDomainDetailModal(true)
        break
      case StrategyType.StrategyTypeDomainPort:
        setOpenPortDetailModal(true)
        break
      case StrategyType.StrategyTypeHTTP:
        setOpenHttpDetailModal(true)
        break
      default:
        setOpenMetricDetailModal(true)
        break
    }
  }

  const onHandleMenuOnClick = (item: StrategySubscribeItem, key: ActionKey) => {
    const { notifyType } = item
    const checkedList: NotifyType[] = []
    switch (key) {
      case ActionKey.DETAIL:
        handleDetailModal(item.strategy)
        break
      case ActionKey.SUBSCRIBE:
        handleOpenSubscribeModal(item.strategy)
        break
      case ActionKey.CANCEL_SUBSCRIBE:
        if (notifyType & NotifyType.NOTIFY_PHONE) {
          checkedList.push(NotifyType.NOTIFY_PHONE)
        }
        if (notifyType & NotifyType.NOTIFY_EMAIL) {
          checkedList.push(NotifyType.NOTIFY_EMAIL)
        }
        if (notifyType & NotifyType.NOTIFY_SMS) {
          checkedList.push(NotifyType.NOTIFY_SMS)
        }

        Modal.confirm({
          title: `确定要取消订阅【${item?.strategy?.name}】吗？`,
          content: (
            <div className='flex flex-col gap-2'>
              <Alert message='取消订阅后，将不再收到该策略的通知' type='info' showIcon />
              <div>
                <Checkbox.Group
                  value={checkedList}
                  options={[
                    { label: '手机', value: NotifyType.NOTIFY_PHONE },
                    { label: '邮件', value: NotifyType.NOTIFY_EMAIL },
                    { label: '短信', value: NotifyType.NOTIFY_SMS }
                  ]}
                />
              </div>
            </div>
          ),
          okText: '取消订阅',
          cancelText: '取消',
          okButtonProps: {
            loading: cancelSubscribeLoading
          },
          onOk: () => {
            cancelSubscribe({ strategyId: item?.strategy?.id }).then(() => {
              message.success('取消订阅成功')
              onRefresh()
            })
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

  const handleSubscribeOk = () => {
    setOpenSubscribeModal(false)
    setDetail(undefined)
    onRefresh()
  }

  const handleCloseSubscribeModal = () => {
    setOpenSubscribeModal(false)
    setDetail(undefined)
  }

  const handleCloseDetailModal = () => {
    setDetail(undefined)
    setOpenMetricDetailModal(false)
    setOpenEventDetailModal(false)
    setOpenDomainDetailModal(false)
    setOpenPortDetailModal(false)
    setOpenHttpDetailModal(false)
  }

  useEffect(() => {
    getDatasource(searchParams)
  }, [searchParams, getDatasource])

  return (
    <div className='h-full flex flex-col gap-3 p-3'>
      <ModalSubscribe
        title={`订阅【${detail?.name}】策略`}
        open={openSubscribeModal}
        item={detail}
        onOk={handleSubscribeOk}
        onCancel={handleCloseSubscribeModal}
      />
      <MetricDetail
        title='Metric 策略详情'
        width='60%'
        strategyId={detail?.id}
        open={openMetricDetailModal}
        onCancel={handleCloseDetailModal}
      />
      <StrategyDetailEvent
        title='事件监控策略详情'
        width='60%'
        strategyId={detail?.id}
        open={openEventDetailModal}
        onCancel={handleCloseDetailModal}
      />
      <StrategyDetailDomain
        title='证书监控策略详情'
        width='60%'
        strategyId={detail?.id}
        open={openDomainDetailModal}
        onCancel={handleCloseDetailModal}
      />
      <StrategyDetailPort
        title='端口监控策略详情'
        width='60%'
        strategyId={detail?.id}
        open={openPortDetailModal}
        onCancel={handleCloseDetailModal}
      />
      <StrategyDetailHttp
        title='HTTP监控策略详情'
        width='60%'
        strategyId={detail?.id}
        open={openHttpDetailModal}
        onCancel={handleCloseDetailModal}
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
        <div className='flex justify-between items-center'>
          <div className='font-bold text-lg'>我的订阅</div>
          <Space size={8}>
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
