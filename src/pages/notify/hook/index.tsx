import React, { useEffect, useRef, useState } from 'react'

import { Status } from '@/api/enum'
import { ActionKey } from '@/api/global'
import { AlarmHookItem } from '@/api/model-types'
import { deleteHook, listHook, updateHookStatus } from '@/api/notify/hook'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { Button, Space, theme } from 'antd'
import styles from './index.module.scss'
import { HookDetailModal } from './modal-detail'
import { EditHookModal } from './modal-edit'
import { formList, getColumnList } from './options'

export interface HookProps {}

const { useToken } = theme

let timer: NodeJS.Timeout | null = null
const Hook: React.FC<HookProps> = (props) => {
  const {} = props

  const { token } = useToken()
  const [datasource, setDatasource] = useState<any[]>([])
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
  const [hookDetail, setHookDetail] = useState<AlarmHookItem>()
  const [openDetailModal, setOpenDetailModal] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource)

  const onOpenDetailModal = (item: AlarmHookItem) => {
    setHookDetail(item)
    setOpenDetailModal(true)
  }

  const onCloseDetailModal = () => {
    setOpenDetailModal(false)
    setHookDetail(undefined)
  }

  const onSearch = (values: any) => {
    setSearchParams({
      ...searchParams,
      ...values
    })
  }

  const handleGetHookList = () => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      setLoading(true)
      listHook(searchParams)
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

  const handlerBatchData = (selectedRowKeys: React.Key[], selectedRows: any[]) => {
    console.log(selectedRowKeys, selectedRows)
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
    handleGetHookList()
  }, [searchParams, refresh])

  return (
    <>
      <EditHookModal
        open={showModal}
        hookId={hookDetail?.id}
        onCancel={closeEditHookModal}
        onOk={handleEditHookModalOnOk}
      />
      <HookDetailModal
        hookId={hookDetail?.id!}
        open={openDetailModal}
        onCancel={onCloseDetailModal}
        onOk={onCloseDetailModal}
      />
      <div className={styles.box}>
        <div
          style={{
            background: token.colorBgContainer,
            borderRadius: token.borderRadius
          }}
        >
          <SearchBox ref={searchRef} formList={formList} onSearch={onSearch} onReset={onReset} />
        </div>
        <div
          className={styles.main}
          style={{
            background: token.colorBgContainer,
            borderRadius: token.borderRadius
          }}
        >
          <div className={styles.main_toolbar}>
            <div className={styles.main_toolbar_left} style={{ fontSize: '16px' }}>
              告警Hook
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
          <div style={{ marginTop: '20px' }} ref={ADivRef}>
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
              rowSelection={{
                onChange: handlerBatchData
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
