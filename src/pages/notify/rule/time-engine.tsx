import React, { useContext, useEffect, useRef, useState } from 'react'

import { Status } from '@/api/enum'
import { ActionKey } from '@/api/global'
import { TimeEngineItem } from '@/api/model-types'
import {
  deleteTimeEngine,
  listTimeEngine,
  ListTimeEngineRequest,
  updateTimeEngineStatus
} from '@/api/notify/time-engine'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { GlobalContext } from '@/utils/context'
import { QuestionCircleOutlined, SwapOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { Button, Space, theme, Tooltip } from 'antd'
import { EngineDetailModal } from './modal-detail-engine'
import { EngineEditModal } from './modal-edit-engine'
import { engineFormList, getEngineColumnList } from './options'

export interface TimeEngineProps {
  switchTimeEngine: () => void
}

const { useToken } = theme

const TimeEngine: React.FC<TimeEngineProps> = ({ switchTimeEngine }) => {
  const { token } = useToken()
  const { isFullscreen } = useContext(GlobalContext)

  const [datasource, setDatasource] = useState<TimeEngineItem[]>([])
  const [total, setTotal] = useState(0)
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    pagination: {
      pageNum: 1,
      pageSize: 10
    }
  })
  const [refresh, setRefresh] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [Detail, setDetail] = useState<TimeEngineItem>()
  const [openDetailModal, setOpenDetailModal] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource, isFullscreen)

  const onOpenDetailModal = (item: TimeEngineItem) => {
    setDetail(item)
    setOpenDetailModal(true)
  }

  const onCloseDetailModal = () => {
    setOpenDetailModal(false)
    setDetail(undefined)
  }

  const onSearch = (values: ListTimeEngineRequest) => {
    setSearchParams({
      ...searchParams,
      ...values
    })
  }

  const { run: handleGetList, loading } = useRequest((params: ListTimeEngineRequest) => listTimeEngine(params), {
    manual: true, // 手动触发请求
    onSuccess: (res) => {
      setDatasource(res?.list || [])
      setTotal(res?.pagination?.total || 0)
    }
  })

  const onReset = () => {}

  const handleEditModal = (detail?: TimeEngineItem) => {
    setShowModal(true)
    setDetail(detail)
  }

  const onRefresh = () => {
    setRefresh(!refresh)
  }

  const handleDelete = (id: number) => {
    deleteTimeEngine(id).then(onRefresh)
  }

  const onChangeStatus = (hookId: number, status: Status) => {
    updateTimeEngineStatus({ ids: [hookId], status }).then(onRefresh)
  }

  const onHandleMenuOnClick = (item: TimeEngineItem, key: ActionKey) => {
    switch (key) {
      case ActionKey.EDIT:
        handleEditModal(item)
        break
      case ActionKey.DELETE:
        handleDelete(item.id)
        break
      case ActionKey.DETAIL:
        onOpenDetailModal(item)
        break
      case ActionKey.DISABLE:
        onChangeStatus(item.id, Status.StatusDisable)
        break
      case ActionKey.ENABLE:
        onChangeStatus(item.id, Status.StatusEnable)
        break
      default:
        break
    }
  }

  const handleTurnPage = (pageNum: number, pageSize: number) => {
    setSearchParams({
      ...searchParams,
      pagination: {
        pageNum,
        pageSize
      }
    })
  }

  const closeEditModal = () => {
    setShowModal(false)
  }

  const handleEditModalOnOk = () => {
    setShowModal(false)
    onRefresh()
  }

  const columns = getEngineColumnList({
    onHandleMenuOnClick,
    pagination: searchParams.pagination
  })

  useEffect(() => {
    handleGetList(searchParams)
  }, [searchParams, refresh, handleGetList])

  return (
    <>
      <EngineEditModal open={showModal} engineId={Detail?.id} onCancel={closeEditModal} onOk={handleEditModalOnOk} />
      <EngineDetailModal
        Id={Detail?.id || 0}
        open={openDetailModal}
        onCancel={onCloseDetailModal}
        onOk={onCloseDetailModal}
      />
      <div className='flex flex-col gap-3 p-3'>
        <div
          style={{
            background: token.colorBgContainer,
            borderRadius: token.borderRadius
          }}
        >
          <SearchBox ref={searchRef} formList={engineFormList} onSearch={onSearch} onReset={onReset} />
        </div>
        <div
          className='p-3'
          style={{
            background: token.colorBgContainer,
            borderRadius: token.borderRadius
          }}
        >
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <div className='text-lg font-bold flex items-center gap-2'>
                时间引擎
                <Tooltip
                  overlayClassName='!max-w-[300px] !text-sm'
                  title={`时间引擎包含多个规则单元，他们之前是且的关系，也就是说，只有当所有规则单元都满足时，才表示满足条件;
                    多个时间引擎作用时，他们是或的关系，也就是说，只要有一个时间引擎满足条件，就表示满足条件`}
                >
                  <QuestionCircleOutlined className='text-slate-400 text-sm' />
                </Tooltip>
              </div>
              <Button type='link' onClick={switchTimeEngine}>
                <SwapOutlined />
              </Button>
              <div
                className='text-lg font-bold text-slate-400 cursor-pointer hover:text-purple-500'
                onClick={switchTimeEngine}
              >
                规则单元
              </div>
            </div>
            <Space size={8}>
              <Button type='primary' onClick={() => handleEditModal()}>
                添加
              </Button>
              <Button color='default' variant='filled' onClick={onRefresh}>
                刷新
              </Button>
            </Space>
          </div>
          <div className='mt-4' ref={ADivRef}>
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
    </>
  )
}

export default TimeEngine
