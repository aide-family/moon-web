import { AlarmInterventionAction } from '@/api/enum'
import { ActionKey } from '@/api/global'
import type { RealtimeAlarmItem, SelfAlarmPageItem } from '@/api/model-types'
import { type ListAlarmRequest, alarmIntervention, listAlarm } from '@/api/realtime/alarm'
import { listAlarmPage } from '@/api/realtime/alarm_page_self'
import type { ListStrategyGroupRequest } from '@/api/strategy'
import SearchBox from '@/components/data/search-box'
import AutoTable from '@/components/table/index'
import useStorage from '@/hooks/storage'
import { useContainerHeightTop } from '@/hooks/useContainerHeightTop'
import { GlobalContext } from '@/utils/context'
import { PlusOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { Badge, Button, Radio, Space, Switch, theme } from 'antd'
import type React from 'react'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ModalAddPages } from './modal-add-pages'
import { ModalDetail } from './modal-detail'
import { formList, getColumnList } from './options'
import RealtimeChart from './realtime-chart'

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
  const [total, setTotal] = useState(0)
  const [myPages, setMyPages] = useState<SelfAlarmPageItem[]>([])
  const [openAddPages, setOpenAddPages] = useState(false)
  const [alertCounts, setAlertCounts] = useState<{ [key: number]: number }>({})
  const [realtimeId, setRealtimeId] = useState<number | undefined>()
  const [openDetail, setOpenDetail] = useState(false)
  const [openChart, setOpenChart] = useState(false)
  const [alarmID, setAlarmID] = useState<number | undefined>()
  const [alarmPageID, setAlarmPageID] = useStorage<number>('alarmPageID', -1)
  const [searchParams, setSearchParams] = useState<ListAlarmRequest>({
    ...defaultSearchParams,
    alarmPage: alarmPageID && alarmPageID > 0 ? alarmPageID : 0,
    myAlarm: alarmPageID === -1
  })

  const searchRef = useRef<HTMLDivElement>(null)
  const ADivRef = useRef<HTMLDivElement>(null)
  const AutoTableHeight = useContainerHeightTop(ADivRef, datasource, isFullscreen)

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

  const handleOpenChart = (id: number) => {
    setOpenChart(true)
    setAlarmID(id)
  }

  const handleCloseChart = () => {
    setOpenChart(false)
    setAlarmID(undefined)
  }

  const { run: initMyPage } = useRequest(listAlarmPage, {
    manual: true,
    onSuccess: ({ list, alertCounts }) => {
      if (list.length > 0) {
        setMyPages(list || [])
        const findPageID = list?.find((item) => item.id === alarmPageID)?.id
        if (!findPageID && alarmPageID !== -1) {
          setAlarmPageID(list?.[0]?.id || -1)
        }
      }
      setAlertCounts(alertCounts || {})
    }
  })

  const { run: fetchData, loading: fetchDataLoading } = useRequest(listAlarm, {
    manual: true,
    onSuccess: ({ list, pagination }) => {
      setDatasource(list || [])
      setTotal(pagination?.total || 0)
    }
  })

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
      alarmPage: alarmPageID && alarmPageID > 0 ? alarmPageID : 0,
      myAlarm: alarmPageID === -1
    })
  }

  const { run: runAlarmIntervention } = useRequest(alarmIntervention, {
    manual: true,
    onSuccess: () => {
      onRefresh()
    }
  })

  const onHandleMenuOnClick = (item: RealtimeAlarmItem, key: ActionKey) => {
    switch (key) {
      case ActionKey.OPERATION_LOG:
        break
      case ActionKey.DETAIL:
        handleOpenDetail(item.id)
        break
      case ActionKey.DELETE:
        runAlarmIntervention({
          id: item.id,
          action: AlarmInterventionAction.Delete,
          fingerprint: item.fingerprint
        })
        break
      case ActionKey.ALARM_SILENCE:
        runAlarmIntervention({
          id: item.id,
          action: AlarmInterventionAction.Silence,
          fingerprint: item.fingerprint
        })
        break
      case ActionKey.ALARM_UPGRADE:
        runAlarmIntervention({
          id: item.id,
          action: AlarmInterventionAction.Upgrade,
          fingerprint: item.fingerprint
        })
        break
      case ActionKey.ALARM_INTERVENTION:
        runAlarmIntervention({
          id: item.id,
          action: AlarmInterventionAction.Mark,
          fingerprint: item.fingerprint
        })
        break
      case ActionKey.MEDICAL_PACKAGE:
        break
      case ActionKey.CHART:
        handleOpenChart(item.id)
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

  const onRefresh = useCallback(() => {
    fetchData(searchParams)
  }, [searchParams, fetchData])

  const onRefreshPages = useCallback(() => {
    initMyPage({})
  }, [initMyPage])

  useEffect(() => {
    if (!teamInfo || !teamInfo.id) return
    initMyPage({})
  }, [initMyPage, teamInfo])

  useEffect(() => {
    if (!teamInfo || !teamInfo.id) return
    fetchData(searchParams)
  }, [searchParams, fetchData, teamInfo])

  useEffect(() => {
    const interval = setInterval(() => {
      onRefreshPages()
      onRefresh()
    }, 10000)
    return () => clearInterval(interval)
  }, [onRefreshPages, onRefresh])

  return (
    <div className='flex flex-col gap-3 p-3'>
      <ModalAddPages open={openAddPages} onClose={() => setOpenAddPages(false)} onSubmit={onSubmitPages} />
      <ModalDetail open={openDetail} onCancel={handleCloseDetail} realtimeId={realtimeId} width='50%' />
      <RealtimeChart open={openChart} onCancel={handleCloseChart} alarmID={alarmID} />
      <div
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius
        }}
      >
        <SearchBox ref={searchRef} formList={formList} onSearch={onSearch} onReset={onReset} />
      </div>
      <div className='p-3' style={{ background: token.colorBgContainer, borderRadius: token.borderRadius }}>
        <div className='flex justify-between items-center'>
          <div className='text-lg font-bold'>实时告警列表</div>
          <Space size={8}>
            <Radio.Group buttonStyle='solid' onChange={(e) => alarmPageChange(e.target.value)} value={alarmPageID}>
              <Radio.Button value={-1}>
                <div className='flex items-center gap-2'>
                  <div className='h-1 w-1' style={{ background: token.colorPrimary }} />
                  我的告警
                  <Badge count={alertCounts[-1]} style={{ display: '' }} />
                </div>
              </Radio.Button>
              {myPages.map((item) => (
                <Radio.Button key={item.id} value={item.id}>
                  <div className='flex items-center gap-2'>
                    <div className='h-1 w-1' style={{ background: item.cssClass }} />
                    {item.name}
                    <Badge count={alertCounts[item.id] || 0} style={{ display: '' }} />
                  </div>
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
            <Button
              color='default'
              variant='filled'
              onClick={() => {
                onRefresh()
                onRefreshPages()
              }}
            >
              刷新
            </Button>
          </Space>
        </div>
        <div className='mt-3' ref={ADivRef}>
          <AutoTable
            rowKey={(record) => record.id}
            dataSource={datasource}
            total={total}
            loading={fetchDataLoading}
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
            onRow={(record) => {
              const { metricLevel: level } = record as RealtimeAlarmItem
              return {
                style: { background: showLevelColor ? level?.level?.extend?.color : '' }
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Group
