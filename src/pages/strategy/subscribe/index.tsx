import { NotifyType } from '@/api/enum'
import { ActionKey, defaultPaginationReq } from '@/api/global'
import { StrategySubscribeItem } from '@/api/model-types'
import { unSubscriber, userSubscriberList, UserSubscriberListRequest } from '@/api/subscriber'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { GlobalContext } from '@/utils/context'
import { useRequest } from 'ahooks'
import { Button, Checkbox, message, Modal, Space, theme } from 'antd'
import { useContext, useEffect, useRef, useState } from 'react'
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

  const onHandleMenuOnClick = (item: StrategySubscribeItem, key: ActionKey) => {
    const { notifyType } = item
    const checkedList: NotifyType[] = []
    switch (key) {
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
            <div>
              <div>取消订阅后，将不再收到该策略的通知</div>
              <div>
                <Checkbox.Group
                  value={checkedList}
                  options={[
                    { label: '手机', value: NotifyType.NOTIFY_PHONE, disabled: true },
                    { label: '邮件', value: NotifyType.NOTIFY_EMAIL },
                    { label: '短信', value: NotifyType.NOTIFY_SMS, disabled: true }
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

  useEffect(() => {
    getDatasource(searchParams)
  }, [searchParams, getDatasource])

  return (
    <div className='h-full flex flex-col gap-3 p-3'>
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
