import React, { useContext, useEffect, useRef, useState } from 'react'

import { Status } from '@/api/enum'
import { ActionKey } from '@/api/global'
import { TimeEngineRuleItem } from '@/api/model-types'
import {
  deleteTimeEngineRule,
  listTimeEngineRule,
  ListTimeEngineRuleRequest,
  updateTimeEngineRuleStatus
} from '@/api/notify/rule'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { GlobalContext } from '@/utils/context'
import { Button, Space, theme } from 'antd'
import { RuleDetailModal } from './modal-detail'
import { EditRuleModal } from './modal-edit'
import { formList, getColumnList } from './options'

const { useToken } = theme

let timer: NodeJS.Timeout | null = null
const Rule: React.FC = () => {
  const { token } = useToken()
  const { isFullscreen } = useContext(GlobalContext)

  const [datasource, setDatasource] = useState<TimeEngineRuleItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    pagination: {
      pageNum: 1,
      pageSize: 10
    }
  })
  const [refresh, setRefresh] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [ruleDetail, setRuleDetail] = useState<TimeEngineRuleItem>()
  const [openDetailModal, setOpenDetailModal] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource, isFullscreen)

  const onOpenDetailModal = (item: TimeEngineRuleItem) => {
    setRuleDetail(item)
    setOpenDetailModal(true)
  }

  const onCloseDetailModal = () => {
    setOpenDetailModal(false)
    setRuleDetail(undefined)
  }

  const onSearch = (values: ListTimeEngineRuleRequest) => {
    setSearchParams({
      ...searchParams,
      ...values
    })
  }

  const handleGetRuleList = () => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      setLoading(true)
      listTimeEngineRule(searchParams)
        .then((res) => {
          setDatasource(res?.list || [])
          setTotal(res?.pagination?.total)
        })
        .finally(() => {
          setLoading(false)
        })
    }, 200)
  }

  const onReset = () => {}

  const handleEditModal = (detail?: TimeEngineRuleItem) => {
    setShowModal(true)
    setRuleDetail(detail)
  }

  const onRefresh = () => {
    setRefresh(!refresh)
  }

  const handleDelete = (id: number) => {
    deleteTimeEngineRule(id).then(onRefresh)
  }

  const onChangeStatus = (hookId: number, status: Status) => {
    updateTimeEngineRuleStatus({ ids: [hookId], status }).then(onRefresh)
  }

  const onHandleMenuOnClick = (item: TimeEngineRuleItem, key: ActionKey) => {
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

  const closeEditRuleModal = () => {
    setShowModal(false)
  }

  const handleEditRuleModalOnOk = () => {
    setShowModal(false)
    onRefresh()
  }

  const columns = getColumnList({
    onHandleMenuOnClick,
    current: searchParams.pagination.pageNum,
    pageSize: searchParams.pagination.pageSize
  })

  useEffect(() => {
    handleGetRuleList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, refresh])

  return (
    <>
      <EditRuleModal
        open={showModal}
        ruleId={ruleDetail?.id}
        onCancel={closeEditRuleModal}
        onOk={handleEditRuleModalOnOk}
      />
      <RuleDetailModal
        ruleId={ruleDetail?.id || 0}
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
            <div className='text-lg font-bold'>通知规则</div>
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

export default Rule
