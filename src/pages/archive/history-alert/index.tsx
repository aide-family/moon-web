import { batchUpdateDictStatus } from '@/api/dict'
import { Status } from '@/api/enum'
import { ActionKey } from '@/api/global'
import { AlarmHistoryItem, listHistory, ListHistoryRequest } from '@/api/realtime/history'
import { ListStrategyGroupRequest } from '@/api/strategy'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table/index'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { GlobalContext } from '@/utils/context'
import { useRequest } from 'ahooks'
import { Button, message, Space, theme } from 'antd'
import React, { useContext, useEffect, useRef, useState } from 'react'
import ModalDetail from './modal-detail'
import { formList, getColumnList } from './options'

const { useToken } = theme

const defaultSearchParams: ListHistoryRequest = {
  pagination: {
    pageNum: 1,
    pageSize: 10
  },
  keyword: '',
  alarmStatuses: []
}

const Group: React.FC = () => {
  const { token } = useToken()
  const { isFullscreen } = useContext(GlobalContext)

  const [datasource, setDatasource] = useState<AlarmHistoryItem[]>([])
  const [searchParams, setSearchParams] = useState<ListHistoryRequest>(defaultSearchParams)
  const [total, setTotal] = useState(0)
  const [detail, setDetail] = useState<AlarmHistoryItem>()
  const [detailOpen, setDetailOpen] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource, isFullscreen)

  const { run: initListHistory, loading } = useRequest(listHistory, {
    manual: true,
    onSuccess: (res) => {
      setDatasource(res.list || [])
      setTotal(res.pagination?.total || 0)
    }
  })

  const onRefresh = () => {
    initListHistory(searchParams)
  }

  useEffect(() => {
    initListHistory(searchParams)
  }, [searchParams, initListHistory])

  const onSearch = (formData: ListStrategyGroupRequest) => {
    setSearchParams({
      ...searchParams,
      ...formData,
      pagination: {
        pageNum: 1,
        pageSize: searchParams.pagination.pageSize
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

  const onDetail = (item: AlarmHistoryItem) => {
    setDetail(item)
    setDetailOpen(true)
  }

  const onCloseDetail = () => {
    setDetailOpen(false)
    setDetail(undefined)
  }

  const onHandleMenuOnClick = (item: AlarmHistoryItem, key: ActionKey) => {
    switch (key) {
      case ActionKey.ENABLE:
        batchUpdateDictStatus({ ids: [item.id], status: Status.StatusEnable }).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.DISABLE:
        batchUpdateDictStatus({ ids: [item.id], status: Status.StatusDisable }).then(() => {
          message.success('更改状态成功')
          onRefresh()
        })
        break
      case ActionKey.OPERATION_LOG:
        break
      case ActionKey.DETAIL:
        onDetail(item)
        break
    }
  }

  const columns = getColumnList({
    onHandleMenuOnClick,
    current: searchParams.pagination.pageNum,
    pageSize: searchParams.pagination.pageSize
  })

  return (
    <div className='p-3 flex flex-col gap-3'>
      <ModalDetail
        width='70%'
        open={detailOpen}
        onClose={onCloseDetail}
        onCancel={onCloseDetail}
        historyItem={detail}
      />
      <div
        className='p-3'
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
          <div className='text-lg font-bold'>历史告警</div>
          <Space size={8}>
            <Button color='default' variant='filled' onClick={onRefresh}>
              刷新
            </Button>
          </Space>
        </div>
        <div className='mt-5' ref={ADivRef}>
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
              y: `calc(100vh - 174px - ${AutoTableHeight}px)`,
              x: 1000
            }}
            size='middle'
          />
        </div>
      </div>
    </div>
  )
}

export default Group
