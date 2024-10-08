import { Button, Space, theme } from 'antd'
import React, { useEffect, useRef, useState } from 'react'

import { AlarmNoticeGroupItem } from '@/api/model-types'
import { listAlarmGroup, ListAlarmGroupRequest } from '@/api/notify/alarm-group'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import styles from './index.module.scss'
import { formList, getColumnList } from './options'

export interface GroupProps {}

const { useToken } = theme

let timer: NodeJS.Timeout | null = null
const Group: React.FC<GroupProps> = (props) => {
  const {} = props

  const { token } = useToken()
  const [datasource, setDatasource] = useState<AlarmNoticeGroupItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(true)
  const [searchParams, setSearchParams] = useState<ListAlarmGroupRequest>({
    keyword: '',
    pagination: {
      pageNum: 1,
      pageSize: 10
    }
  })

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource)

  const onSearch = (data: any) => {
    setSearchParams({
      ...searchParams,
      ...data
    })
  }

  const onReset = () => {}

  const handleEditModal = () => {}

  const onRefresh = () => {
    setRefresh(!refresh)
  }

  const onHandleMenuOnClick = () => {}

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

  const columns = getColumnList({
    onHandleMenuOnClick,
    current: searchParams.pagination.pageNum,
    pageSize: searchParams.pagination.pageSize
  })

  const handleGetHookList = () => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      setLoading(true)
      listAlarmGroup(searchParams)
        .then((res) => {
          setDatasource(res?.list || [])
          setTotal(res?.pagination?.total)
        })
        .finally(() => {
          setLoading(false)
        })
    }, 200)
  }

  useEffect(() => {
    handleGetHookList()
  }, [searchParams, refresh])

  return (
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
            告警组
          </div>
          <Space size={8}>
            <Button type='primary' onClick={() => handleEditModal()}>
              添加
            </Button>
            <Button disabled>批量导入</Button>
            <Button type='primary' onClick={onRefresh}>
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
  )
}

export default Group
