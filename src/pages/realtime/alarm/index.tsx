import { ActionKey } from '@/api/global'
import { RealtimeAlarmItem, SelfAlarmPageItem } from '@/api/model-types'
import { listAlarm, ListAlarmRequest } from '@/api/realtime/alarm'
import { listAlarmPage } from '@/api/realtime/alarm_page_self'
import { ListStrategyGroupRequest } from '@/api/strategy'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table/index'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { GlobalContext } from '@/utils/context'
import { PlusOutlined } from '@ant-design/icons'
import { Badge, Button, Radio, Space, Switch, theme } from 'antd'
import { debounce } from 'lodash'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import styles from './index.module.scss'
import { ModalAddPages } from './modal-add-pages'
import { ModalDetail } from './modal-detail'
import { formList, getColumnList } from './options'

const { useToken } = theme

const defaultSearchParams: ListAlarmRequest = {
  pagination: {
    pageNum: 1,
    pageSize: 10
  },
  keyword: '',
  myAlarm: true
}

const Group: React.FC = () => {
  const { token } = useToken()
  const { isFullscreen, teamInfo, showLevelColor, setShowLevelColor } = useContext(GlobalContext)

  const [datasource, setDatasource] = useState<RealtimeAlarmItem[]>([])
  const [searchParams, setSearchParams] = useState<ListAlarmRequest>(defaultSearchParams)
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [total, setTotal] = useState(0)
  const [myPages, setMyPages] = useState<SelfAlarmPageItem[]>([])
  const [refreshPages, setRefreshPages] = useState(false)
  const [openAddPages, setOpenAddPages] = useState(false)
  const [alertCounts, setAlertCounts] = useState<{ [key: number]: number }>({})
  const [realtimeId, setRealtimeId] = useState<number | undefined>()
  const [openDetail, setOpenDetail] = useState(false)
  const [alarmPageID, setAlarmPageID] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource, isFullscreen)

  const onRefresh = () => {
    setRefresh(!refresh)
  }

  const onRefreshPages = () => {
    setRefreshPages(!refreshPages)
  }

  const onSubmitPages = () => {
    setOpenAddPages(false)
    onRefreshPages()
  }

  const handleOpenDetail = (id: number) => {
    setRealtimeId(id)
    setOpenDetail(true)
  }

  const handleCloseDetail = () => {
    setOpenDetail(false)
    setRealtimeId(undefined)
  }

  const fetchMypageData = useCallback(
    debounce(async () => {
      if (!teamInfo || !teamInfo.id) return
      listAlarmPage({})
        .then(({ list, alertCounts }) => {
          setMyPages(list || [])
          setAlertCounts(alertCounts || {})
        })
        .finally(() => setLoading(false))
    }, 500),
    []
  )

  const fetchData = useCallback(
    debounce(async (params) => {
      if (!teamInfo || !teamInfo.id) return
      setLoading(true)
      listAlarm(params)
        .then(({ list, pagination }) => {
          setDatasource(list || [])
          setTotal(pagination?.total || 0)
        })
        .finally(() => setLoading(false))
    }, 500),
    []
  )

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
    setSearchParams({
      ...defaultSearchParams,
      alarmPage: alarmPageID > 0 ? alarmPageID : 0,
      myAlarm: alarmPageID === -1
    })
  }

  const onHandleMenuOnClick = (item: RealtimeAlarmItem, key: ActionKey) => {
    switch (key) {
      case ActionKey.ENABLE:
        break
      case ActionKey.DISABLE:
        break
      case ActionKey.OPERATION_LOG:
        break
      case ActionKey.DETAIL:
        handleOpenDetail(item.id)
        break
      case ActionKey.EDIT:
        break
      case ActionKey.DELETE:
        break
    }
  }

  const columns = getColumnList({
    onHandleMenuOnClick,
    current: searchParams.pagination.pageNum,
    pageSize: searchParams.pagination.pageSize
  })

  const alarmPageChange = (value: number) => {
    setAlarmPageID(value)
    setSearchParams({
      ...searchParams,
      alarmPage: value > 0 ? value : 0,
      myAlarm: value === -1,
      pagination: {
        pageNum: 1,
        pageSize: 10
      }
    })
  }

  useEffect(() => {
    fetchMypageData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshPages])

  useEffect(() => {
    fetchData(searchParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, searchParams])

  useEffect(() => {
    const interval = setInterval(() => {
      onRefreshPages()
      onRefresh()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.box}>
      <ModalAddPages open={openAddPages} onClose={() => setOpenAddPages(false)} onSubmit={onSubmitPages} />
      <ModalDetail open={openDetail} onCancel={handleCloseDetail} realtimeId={realtimeId} width='50%' />
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
            实时告警列表
          </div>
          <Space size={8}>
            <Radio.Group buttonStyle='solid' onChange={(e) => alarmPageChange(e.target.value)} value={alarmPageID}>
              <Radio.Button value={-1}>
                我的告警
                <Badge count={alertCounts[-1]} style={{ display: '' }} />
              </Radio.Button>
              {myPages.map((item) => (
                <Radio.Button key={item.id} value={item.id}>
                  {item.name}
                  <Badge count={alertCounts[item.id] || 0} style={{ display: '' }} />
                </Radio.Button>
              ))}
            </Radio.Group>
            <Button color='default' variant='filled' onClick={() => setOpenAddPages(true)}>
              <PlusOutlined />
            </Button>
            <Switch
              checkedChildren='开启'
              unCheckedChildren='关闭'
              checked={showLevelColor}
              onChange={setShowLevelColor}
            />
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
            scroll={{
              y: `calc(100vh - 165px  - ${AutoTableHeight}px)`,
              x: 1000
            }}
            size='middle'
            onRow={(record) => {
              const { metricLevel: level } = record as RealtimeAlarmItem
              return {
                style: {
                  background: showLevelColor ? level.level.extend?.color : ''
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Group
