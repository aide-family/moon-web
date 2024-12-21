import { GlobalContext } from '@/utils/context'
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { Chart } from '@antv/g2'
import { Card, Col, List, Row, theme as antTheme } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // 导入中文语言包
import relativeTime from 'dayjs/plugin/relativeTime'
import type React from 'react'
import { useContext, useEffect, useRef, useState } from 'react'
import data from './data.json'
// 设置 dayjs 的语言为中文
dayjs.locale('zh-cn')
// 使用插件
dayjs.extend(relativeTime)

export interface AlarmData {
  summary: string
  level: string
  time: string
}

const { useToken } = antTheme

const Dashboard: React.FC = () => {
  const { token } = useToken()

  const { theme } = useContext(GlobalContext)

  const alarmChartRef = useRef<HTMLDivElement | null>(null)
  const notifyChartRef = useRef<HTMLDivElement | null>(null)
  const todayChartRef = useRef<HTMLDivElement | null>(null)
  const top10ChartRef = useRef<HTMLDivElement | null>(null)
  const [dataSource, setDataSource] = useState<AlarmData[]>([])

  const fetchAlarmData = async () => {
    setDataSource(data)
  }

  useEffect(() => {
    fetchAlarmData()
  })

  useEffect(() => {
    if (!alarmChartRef.current) {
      return
    }
    const alarmChart = new Chart({
      container: alarmChartRef.current,
      autoFit: true,
      height: 50
    })
    alarmChart.data([
      264, 417, 438, 887, 309, 397, 550, 575, 563, 430, 525, 592, 492, 467, 513, 546, 983, 340, 539, 243, 226, 192
    ])
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
  }, [theme])

  useEffect(() => {
    if (!notifyChartRef.current) {
      return
    }
    const data = [235, 213, 222, 411, 235, 213, 222, 411, 235, 213, 222, 411, 235, 213, 222, 411]
    const notifyChart = new Chart({
      container: notifyChartRef.current,
      autoFit: true,
      height: 50
    })
    if (theme === 'dark') {
      notifyChart.theme({ type: 'classicDark' })
    }
    notifyChart.data(data)
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
  }, [theme])

  useEffect(() => {
    if (!todayChartRef.current) {
      return
    }
    const data = [
      264, 417, 438, 887, 309, 397, 550, 575, 563, 430, 525, 592, 492, 467, 513, 546, 983, 340, 539, 243, 226, 192
    ]
    const todayChart = new Chart({
      container: todayChartRef.current,
      autoFit: true,
      height: 50
    })
    if (theme === 'dark') {
      todayChart.theme({ type: 'classicDark' })
    }

    todayChart.data(data)

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
  }, [theme])

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
    top5Chart.data([
      { strategy: '1', name: '策略1', count: 60 },
      { strategy: '2', name: '策略2', count: 50 },
      { strategy: '3', name: '策略3', count: 40 },
      { strategy: '4', name: '策略4', count: 30 },
      { strategy: '5', name: '策略5', count: 20 },
      { strategy: '6', name: '策略6', count: 10 },
      { strategy: '7', name: '策略7', count: 9 },
      { strategy: '8', name: '策略8', count: 8 },
      { strategy: '9', name: '策略9', count: 7 },
      { strategy: '10', name: '策略10', count: 6 }
    ])
    top5Chart
      .interval()
      .coordinate({ transform: [{ type: 'transpose' }] })
      .encode('x', 'name')
      .encode('y', 'count')
      .encode('color', 'name')
      // 重命名y轴
      .axis('y', { labelFormatter: (d: number) => `${d} 次` })
    top5Chart.render()

    return () => {
      top5Chart.destroy()
    }
  }, [theme])

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
                    <div style={{ fontSize: 28, fontWeight: 'bold' }}>2,1123</div>
                    <div className='text-red-400'>
                      <ArrowUpOutlined /> +25% 比前日
                    </div>
                  </Col>
                </Row>
              </div>
              <div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 16, color: token.colorTextLabel }}> 一级告警总数 </span>
                </div>
                <Row align='middle' gutter={16}>
                  <Col span={24}>
                    <div style={{ fontSize: 28, fontWeight: 'bold' }}>1123</div>
                    <div className='text-green-400'>
                      <ArrowDownOutlined /> -11% 比前日
                    </div>
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
                    <div style={{ fontSize: 28, fontWeight: 'bold' }}>32</div>
                    <div className='text-green-400'>
                      <ArrowDownOutlined /> -25% 比前日
                    </div>
                  </Col>
                </Row>
              </div>
              <div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 16, color: token.colorTextLabel }}> 告警失败总数 </span>
                </div>
                <Row align='middle' gutter={16}>
                  <Col span={24}>
                    <div style={{ fontSize: 28, fontWeight: 'bold' }}>12</div>
                    <div className='text-red-400'>
                      <ArrowUpOutlined /> +5% 比前日
                    </div>
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
                      <div style={{ fontSize: 28, fontWeight: 'bold' }}>32</div>
                      <div className='text-red-400'>
                        <ArrowUpOutlined /> +25% 比前日
                      </div>
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
                      <div style={{ fontSize: 28, fontWeight: 'bold' }}>0</div>
                      <div className='text-green-400'>
                        <ArrowDownOutlined /> -100% 比前日
                      </div>
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
        <Col span={12} className='max-h-[500px]'>
          <Card title='告警列表' bordered={false} className='max-h-[500px]'>
            <List
              className='h-[400px] overflow-auto'
              dataSource={dataSource}
              renderItem={(item) => (
                <List.Item className='flex justify-between'>
                  <div className='flex flex-col gap-1'>
                    <div className='text-sm font-bold' style={{ color: token.colorText }}>
                      {item.summary}
                    </div>
                    <div className='text-xs text-gray-500'>{dayjs(item.time).fromNow()}</div>
                  </div>
                  <div>{item.level}</div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title='策略告警数量Top10'
            bordered={false}
            className='h-full'
            extra={<span style={{ color: token.colorTextDescription }}>每周</span>}
          >
            <div ref={top10ChartRef} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
