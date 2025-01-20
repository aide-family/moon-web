import {
  AlarmStatisticsResponse,
  getAlarmStatistics,
  getLatestAlarmEvents,
  getLatestInterventionEvents,
  getNotificationStatistics,
  getStrategyAlarmTopN,
  LatestAlarmEventsResponse,
  LatestInterventionEventsResponse,
  NotificationStatisticsResponse,
  StrategyAlarmTopNResponse
} from '@/api/realtime/statistics'
import { GlobalContext } from '@/utils/context'
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { Chart } from '@antv/g2'
import { useRequest } from 'ahooks'
import { theme as antTheme, Card, Col, List, Row, Table } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // 导入中文语言包
import relativeTime from 'dayjs/plugin/relativeTime'
import type React from 'react'
import { useContext, useEffect, useRef, useState } from 'react'
import { interveneColumns } from './options'
// 设置 dayjs 的语言为中文
dayjs.locale('zh-cn')
// 使用插件
dayjs.extend(relativeTime)

export interface AlarmData {
  summary: string
  level: string
  time: string
}

export interface InterveneData {
  intervene_user: string
  level: string
  event: string
  time: string
  intervene_time: string
}

const { useToken } = antTheme

const gap = 10000

const ComparisonIcon = ({ value = '0', title = '比前日' }: { value?: string; title?: string }) => {
  if (+value > 0)
    return (
      <div className='text-red-400'>
        <ArrowUpOutlined /> {value} {title}
      </div>
    )
  return (
    <div className='text-green-400'>
      <ArrowDownOutlined /> {value} {title}
    </div>
  )
}

const Dashboard: React.FC = () => {
  const { token } = useToken()

  const { theme } = useContext(GlobalContext)

  const alarmChartRef = useRef<HTMLDivElement | null>(null)
  const notifyChartRef = useRef<HTMLDivElement | null>(null)
  const todayChartRef = useRef<HTMLDivElement | null>(null)
  const top10ChartRef = useRef<HTMLDivElement | null>(null)

  const [nowTime, setNowTime] = useState<string>(dayjs().format('YYYY-MM-DD HH:mm:ss'))

  const [alarmStatistics, setAlarmStatistics] = useState<AlarmStatisticsResponse>()
  const [notificationStatistics, setNotificationStatistics] = useState<NotificationStatisticsResponse>()
  const [todayStatistics, setTodayStatistics] = useState<NotificationStatisticsResponse>()
  const [latestAlarmEvents, setLatestAlarmEvents] = useState<LatestAlarmEventsResponse>()
  const [strategyAlarmTopN, setStrategyAlarmTopN] = useState<StrategyAlarmTopNResponse>()
  const [latestInterventionEvents, setLatestInterventionEvents] = useState<LatestInterventionEventsResponse>()

  const { run: fetchGetAlarmStatistics } = useRequest(getAlarmStatistics, {
    manual: true,
    onSuccess: (res) => {
      setAlarmStatistics(res)
    }
  })

  const { run: fetchGetNotificationStatistics } = useRequest(getNotificationStatistics, {
    manual: true,
    onSuccess: (res) => {
      setNotificationStatistics(res)
    }
  })

  const { run: fetchGetTodayStatistics } = useRequest(getNotificationStatistics, {
    manual: true,
    onSuccess: (res) => {
      setTodayStatistics(res)
    }
  })

  const { run: fetchGetLatestAlarmEvents } = useRequest(getLatestAlarmEvents, {
    manual: true,
    onSuccess: (res) => {
      setLatestAlarmEvents(res)
    }
  })

  const { run: fetchGetStrategyAlarmTopN } = useRequest(getStrategyAlarmTopN, {
    manual: true,
    onSuccess: (res) => {
      setStrategyAlarmTopN(res)
    }
  })

  const { run: fetchGetLatestInterventionEvents } = useRequest(getLatestInterventionEvents, {
    manual: true,
    onSuccess: (res) => {
      setLatestInterventionEvents(res)
    }
  })

  useEffect(() => {
    fetchGetAlarmStatistics({})
    const interval = setInterval(() => {
      fetchGetAlarmStatistics({})
    }, gap)
    return () => {
      clearInterval(interval)
    }
  }, [fetchGetAlarmStatistics])

  useEffect(() => {
    fetchGetNotificationStatistics({})
    fetchGetTodayStatistics({})
    const interval = setInterval(() => {
      fetchGetNotificationStatistics({})
      fetchGetTodayStatistics({})
    }, gap)
    return () => {
      clearInterval(interval)
    }
  }, [fetchGetNotificationStatistics, fetchGetTodayStatistics])

  useEffect(() => {
    fetchGetLatestAlarmEvents({ limit: 50 })
    const interval = setInterval(() => {
      fetchGetLatestAlarmEvents({ limit: 50 })
    }, gap)
    return () => {
      clearInterval(interval)
    }
  }, [fetchGetLatestAlarmEvents])

  useEffect(() => {
    fetchGetStrategyAlarmTopN({ limit: 10 })
    const interval = setInterval(() => {
      fetchGetStrategyAlarmTopN({ limit: 10 })
    }, gap)
    return () => {
      clearInterval(interval)
    }
  }, [fetchGetStrategyAlarmTopN])

  useEffect(() => {
    fetchGetLatestInterventionEvents({ limit: 50 })
    const interval = setInterval(() => {
      fetchGetLatestInterventionEvents({ limit: 50 })
    }, gap)
    return () => {
      clearInterval(interval)
    }
  }, [fetchGetLatestInterventionEvents])

  useEffect(() => {
    const interval = setInterval(() => {
      setNowTime(dayjs().format('YYYY-MM-DD HH:mm:ss'))
    }, gap)
    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!alarmChartRef.current) {
      return
    }
    const alarmChart = new Chart({
      container: alarmChartRef.current,
      autoFit: true,
      height: 50
    })
    alarmChart.data(alarmStatistics?.chartData || [])
    if (theme === 'dark') {
      alarmChart.theme({ type: 'classicDark' })
    }
    alarmChart
      .area()
      .encode('x', (_: unknown, idx: number) => idx)
      .encode('y', (d: number) => d)
      .encode('shape', 'smooth')
      .scale('y', { zero: true })
      .style('fill', 'linear-gradient(-90deg, #d3adf7 0%, #6c34e6 100%)')
      .style('fillOpacity', 0.6)
      .animate('enter', { type: 'fadeIn' })
      .axis(false)

    alarmChart.render()
    return () => {
      alarmChart.destroy()
    }
  }, [theme, alarmStatistics])

  useEffect(() => {
    if (!notifyChartRef.current) {
      return
    }

    const notifyChart = new Chart({
      container: notifyChartRef.current,
      autoFit: true,
      height: 50
    })
    if (theme === 'dark') {
      notifyChart.theme({ type: 'classicDark' })
    }
    notifyChart.data(notificationStatistics?.chartData || [])
    notifyChart
      .area()
      .encode('x', (_: unknown, idx: number) => idx)
      .encode('y', (d: number) => d)
      .encode('shape', 'smooth')
      .scale('y', { zero: true })
      .style('fill', 'linear-gradient(-90deg, #ffadd2 0%, #780650 100%)')
      .style('fillOpacity', 0.6)
      .animate('enter', { type: 'fadeIn' })
      .axis(false)

    notifyChart.render()
    return () => {
      notifyChart.destroy()
    }
  }, [theme, notificationStatistics])

  useEffect(() => {
    if (!todayChartRef.current) {
      return
    }

    const todayChart = new Chart({
      container: todayChartRef.current,
      autoFit: true,
      height: 50
    })
    if (theme === 'dark') {
      todayChart.theme({ type: 'classicDark' })
    }

    todayChart.data(latestAlarmEvents?.events || [])

    todayChart
      .interval()
      .encode('x', (_: unknown, idx: number) => idx)
      .encode('y', (d: unknown) => d)
      // .encode('shape', 'smooth')
      .scale('y', { zero: true })
      .style('fill', 'linear-gradient(-90deg, #87e8de 0%, #006d75 100%)')
      .style('fillOpacity', 0.6)
      .animate('enter', { type: 'fadeIn' })
      .axis(false)

    todayChart.render()
    return () => {
      todayChart.destroy()
    }
  }, [theme, latestAlarmEvents])

  useEffect(() => {
    if (!top10ChartRef.current) {
      return
    }

    const top5Chart = new Chart({
      container: top10ChartRef.current,
      autoFit: true,
      height: 420
    })
    if (theme === 'dark') {
      top5Chart.theme({ type: 'classicDark' })
    }
    top5Chart.data(strategyAlarmTopN?.topN || [])
    top5Chart
      .interval()
      .coordinate({ transform: [{ type: 'transpose' }] })
      .encode('x', 'strategyName')
      .encode('y', 'total')
      .encode('color', 'strategyName')
      // 重命名y轴
      .axis('y', { labelFormatter: (d: number) => `${d} 次` })
    top5Chart.render()

    return () => {
      top5Chart.destroy()
    }
  }, [theme, strategyAlarmTopN])

  return (
    <div className='flex flex-col gap-3 p-3 overflow-y-auto'>
      <Row gutter={16}>
        <Col span={8}>
          <Card bordered={false}>
            <div className='flex justify-between'>
              <div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 16, color: token.colorTextLabel }}> 告警总数 </span>
                </div>
                <Row align='middle' gutter={16}>
                  <Col span={24}>
                    <div style={{ fontSize: 28, fontWeight: 'bold' }}>{alarmStatistics?.total}</div>
                    <ComparisonIcon value={alarmStatistics?.totalComparison} />
                  </Col>
                </Row>
              </div>
              <div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 16, color: token.colorTextLabel }}> 正在告警总数 </span>
                </div>
                <Row align='middle' gutter={16}>
                  <Col span={24}>
                    <div style={{ fontSize: 28, fontWeight: 'bold' }}>{alarmStatistics?.ongoing}</div>
                    <ComparisonIcon value={alarmStatistics?.ongoingComparison} />
                  </Col>
                </Row>
              </div>
              <div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 16, color: token.colorTextLabel }}> 一级告警总数 </span>
                </div>
                <Row align='middle' gutter={16}>
                  <Col span={24}>
                    <div style={{ fontSize: 28, fontWeight: 'bold' }}>{alarmStatistics?.highestPriority}</div>
                    <ComparisonIcon value={alarmStatistics?.highestPriorityComparison} />
                  </Col>
                </Row>
              </div>
            </div>
            <div ref={alarmChartRef} style={{ height: 50 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <div className='flex justify-between'>
              <div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 16, color: token.colorTextLabel }}> 告警通知总数 </span>
                </div>
                <Row align='middle' gutter={16}>
                  <Col span={24}>
                    <div style={{ fontSize: 28, fontWeight: 'bold' }}>{notificationStatistics?.total}</div>
                    <ComparisonIcon value={notificationStatistics?.totalComparison} />
                  </Col>
                </Row>
              </div>
              <div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 16, color: token.colorTextLabel }}> 告警失败总数 </span>
                </div>
                <Row align='middle' gutter={16}>
                  <Col span={24}>
                    <div style={{ fontSize: 28, fontWeight: 'bold' }}>{notificationStatistics?.failed}</div>
                    <ComparisonIcon value={notificationStatistics?.failedComparison} />
                  </Col>
                </Row>
              </div>
            </div>
            <div ref={notifyChartRef} style={{ height: 50 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className='h-full'>
            <div className='flex justify-between'>
              <div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 16, color: token.colorTextLabel }}>今日告警总数</span>
                </div>
                <Row align='middle' gutter={16}>
                  <Col span={24} className='flex flex-col justify-between'>
                    <div>
                      <div style={{ fontSize: 28, fontWeight: 'bold' }}>{todayStatistics?.total}</div>
                      <ComparisonIcon value={todayStatistics?.totalComparison} />
                    </div>
                  </Col>
                </Row>
              </div>
              <div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 16, color: token.colorTextLabel }}>今日告警失败总数</span>
                </div>
                <Row align='middle' gutter={16}>
                  <Col span={24} className='flex flex-col justify-between'>
                    <div>
                      <div style={{ fontSize: 28, fontWeight: 'bold' }}>{todayStatistics?.failed}</div>
                      <ComparisonIcon value={todayStatistics?.failedComparison} />
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
            <div ref={todayChartRef} style={{ height: 50 }} />
          </Card>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Card
            title='策略告警数量Top10'
            bordered={false}
            className='h-full'
            extra={<span style={{ color: token.colorTextDescription }}>{dayjs().format('dddd')}</span>}
          >
            <div ref={top10ChartRef} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={12} className='max-h-[500px]'>
          <Card
            title='告警事件'
            bordered={false}
            className='h-full max-h-[500px]'
            extra={<span style={{ color: token.colorTextDescription }}>{nowTime}</span>}
          >
            <List
              className='h-[400px] overflow-auto'
              dataSource={latestAlarmEvents?.events || []}
              renderItem={(item) => (
                <List.Item className='flex justify-between'>
                  <div className='flex flex-col gap-1'>
                    <div className='text-sm font-bold text-ellipsis' style={{ color: token.colorText }}>
                      {item.summary}
                    </div>
                    <div className='text-xs text-gray-500'>{dayjs(item.eventTime).fromNow()}</div>
                  </div>
                  <div>{item.level}</div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Card title='告警介入列表' bordered={false} className='h-full'>
            <Table
              dataSource={latestInterventionEvents?.events || []}
              size='small'
              columns={interveneColumns}
              scroll={{ y: 400 }}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
