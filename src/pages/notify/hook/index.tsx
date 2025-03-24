import React, { useContext, useEffect, useRef, useState } from 'react'

import { Status } from '@/api/enum'
import { ActionKey } from '@/api/global'
import { AlarmHookItem } from '@/api/model-types'
import { deleteHook, listHook, ListHookRequest, updateHookStatus } from '@/api/notify/hook'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { GlobalContext } from '@/utils/context'
import { useRequest } from 'ahooks'
import { Button, Space, theme } from 'antd'
import { HookDetailModal } from './modal-detail'
import { EditHookModal } from './modal-edit'
import { formList, getColumnList } from './options'

export interface HookProps {}

const { useToken } = theme

const Hook: React.FC<HookProps> = () => {
  const { token } = useToken()
  const { isFullscreen } = useContext(GlobalContext)

  const [datasource, setDatasource] = useState<AlarmHookItem[]>([])
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
  const [hookDetail, setHookDetail] = useState<AlarmHookItem>()
  const [openDetailModal, setOpenDetailModal] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource, isFullscreen)

  const onOpenDetailModal = (item: AlarmHookItem) => {
    setHookDetail(item)
    setOpenDetailModal(true)
  }

  const onCloseDetailModal = () => {
    setOpenDetailModal(false)
    setHookDetail(undefined)
  }

  const onSearch = (values: ListHookRequest) => {
    setSearchParams({
      ...searchParams,
      ...values
    })
  }

  const { run: handleGetHookList, loading } = useRequest((params: ListHookRequest) => listHook(params), {
    manual: true, // 手动触发请求
    onSuccess: (res) => {
      setDatasource(res?.list || [])
      setTotal(res?.pagination?.total || 0)
    }
  })

  const onReset = () => {}

  const handleEditModal = (detail?: AlarmHookItem) => {
    setShowModal(true)
    setHookDetail(detail)
  }

  const onRefresh = () => {
    setRefresh(!refresh)
  }

  const handleDelete = (id: number) => {
    deleteHook({ id }).then(onRefresh)
  }

  const onChangeStatus = (hookId: number, status: Status) => {
    updateHookStatus({ ids: [hookId], status }).then(onRefresh)
  }

  const onHandleMenuOnClick = (item: AlarmHookItem, key: ActionKey) => {
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

  const closeEditHookModal = () => {
    setShowModal(false)
  }

  const handleEditHookModalOnOk = () => {
    setShowModal(false)
    onRefresh()
  }

  const columns = getColumnList({
    onHandleMenuOnClick,
    current: searchParams.pagination.pageNum,
    pageSize: searchParams.pagination.pageSize
  })

  useEffect(() => {
    handleGetHookList(searchParams)
  }, [searchParams, refresh, handleGetHookList])

  return (
    <>
      <EditHookModal
        open={showModal}
        hookId={hookDetail?.id}
        onCancel={closeEditHookModal}
        onOk={handleEditHookModalOnOk}
      />
      <HookDetailModal
        hookId={hookDetail?.id || 0}
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
            <div className='text-lg font-bold'>告警Hook</div>
            <Space size={8}>
              <Button type='primary' onClick={() => handleEditModal()}>
                添加
              </Button>
              <Button disabled>批量导入</Button>
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

export default Hook
