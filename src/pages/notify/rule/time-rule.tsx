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
import { QuestionCircleOutlined, SwapOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { Button, Space, theme, Tooltip } from 'antd'
import { RuleDetailModal } from './modal-detail-rule'
import { EditRuleModal } from './modal-edit-rule'
import { formList, getColumnList } from './options'

export interface TimeRuleProps {
  switchTimeEngine: () => void
}

const { useToken } = theme

const TimeRule: React.FC<TimeRuleProps> = ({ switchTimeEngine }) => {
  const { token } = useToken()
  const { isFullscreen } = useContext(GlobalContext)

  const [datasource, setDatasource] = useState<TimeEngineRuleItem[]>([])
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
  const [ruleDetail, setRuleDetail] = useState<TimeEngineRuleItem>()
  const [openDetailModal, setOpenDetailModal] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource, isFullscreen)

  const { run: handleGetRuleList, loading: loading } = useRequest(listTimeEngineRule, {
    manual: true,
    onSuccess: (res) => {
      setDatasource(res?.list || [])
      setTotal(res?.pagination?.total)
    }
  })
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
    pagination: searchParams.pagination
  })

  useEffect(() => {
    handleGetRuleList(searchParams)
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
            <div className='flex items-center gap-2'>
              <div className='text-lg font-bold flex items-center gap-2'>
                规则单元
                <Tooltip
                  overlayClassName='!max-w-[300px] !text-sm'
                  title={`规则单元是时间引擎的规则单元，他们由不同的方式构成一个规则单元，多个规则单元组成一个时间引擎，他们共同作用`}
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
                时间引擎
              </div>
            </div>
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

export default TimeRule
