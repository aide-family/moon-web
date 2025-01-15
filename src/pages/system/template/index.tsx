import { Status } from '@/api/enum'
import { ActionKey } from '@/api/global'
import type { SendTemplateItem } from '@/api/model-types'
import {
  type GetTemplateListRequest,
  deleteTemplate,
  getTemplateList,
  updateTemplateStatus
} from '@/api/notify/template'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { GlobalContext } from '@/utils/context'
import { useRequest } from 'ahooks'
import { Button, Space, theme } from 'antd'
import type React from 'react'
import { useContext, useEffect, useRef, useState } from 'react'
import { SendTemplateDetailModal } from './modal-detail'
import { EditSendTemplateModal } from './modal-edit'
import { formList, getColumnList } from './options'

const { useToken } = theme

const Template: React.FC = () => {
  const { token } = useToken()
  const { isFullscreen } = useContext(GlobalContext)

  const [datasource, setDatasource] = useState<SendTemplateItem[]>([])
  const [total, setTotal] = useState(0)
  const [searchParams, setSearchParams] = useState<GetTemplateListRequest>({
    pagination: {
      pageNum: 1,
      pageSize: 50
    }
  })
  const [showModal, setShowModal] = useState(false)
  const [SendTemplateDetail, setSendTemplateDetail] = useState<SendTemplateItem>()
  const [openDetailModal, setOpenDetailModal] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource, isFullscreen)

  const onOpenDetailModal = (item: SendTemplateItem) => {
    setSendTemplateDetail(item)
    setOpenDetailModal(true)
  }

  const onCloseDetailModal = () => {
    setOpenDetailModal(false)
    setSendTemplateDetail(undefined)
  }

  const onSearch = (values: GetTemplateListRequest) => {
    setSearchParams({
      ...searchParams,
      ...values
    })
  }

  const { run: runGetTemplateList, loading: getTemplateListLoading } = useRequest(getTemplateList, {
    manual: true,
    onSuccess: (res) => {
      setDatasource(res?.list || [])
      setTotal(res?.pagination?.total)
    }
  })

  const onReset = () => {
    setSearchParams({
      pagination: {
        pageNum: 1,
        pageSize: 50
      }
    })
  }

  const handleEditModal = (detail?: SendTemplateItem) => {
    setShowModal(true)
    setSendTemplateDetail(detail)
  }

  const onRefresh = () => {
    runGetTemplateList(searchParams, true)
  }

  const handleDelete = (id: number) => {
    deleteTemplate(id, true).then(onRefresh)
  }

  const onChangeStatus = (SendTemplateId: number, status: Status) => {
    updateTemplateStatus({ ids: [SendTemplateId], status }, true).then(onRefresh)
  }

  const onHandleMenuOnClick = (item: SendTemplateItem, key: ActionKey) => {
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

  const closeEditSendTemplateModal = () => {
    setShowModal(false)
  }

  const handleEditSendTemplateModalOnOk = () => {
    setShowModal(false)
    onRefresh()
  }

  const columns = getColumnList({
    onHandleMenuOnClick,
    current: searchParams.pagination.pageNum,
    pageSize: searchParams.pagination.pageSize
  })

  useEffect(() => {
    runGetTemplateList(searchParams, true)
  }, [searchParams, runGetTemplateList])

  return (
    <>
      <EditSendTemplateModal
        width='80%'
        open={showModal}
        sendTemplateId={SendTemplateDetail?.id}
        onCancel={closeEditSendTemplateModal}
        onOk={handleEditSendTemplateModalOnOk}
      />
      <SendTemplateDetailModal
        width='50%'
        sendTemplateId={SendTemplateDetail?.id || 0}
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
            <div className='text-lg font-bold'>通知模板</div>
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
              loading={getTemplateListLoading}
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

export default Template
