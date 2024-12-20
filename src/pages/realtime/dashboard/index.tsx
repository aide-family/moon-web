import { Chart } from '@antv/g2'
import { Card, Col, Row } from 'antd'
import React, { useEffect, useRef } from 'react'

const Dashboard: React.FC = () => {
  const alarmChartRef = useRef<HTMLDivElement | null>(null)
  const notifyChartRef = useRef<HTMLDivElement | null>(null)
  const todayChartRef = useRef<HTMLDivElement | null>(null)
  const top5ChartRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // 告警总览图表
    if (alarmChartRef.current) {
      const chart = new Chart({
        container: alarmChartRef.current,
        autoFit: true,
        height: 200
      })
      chart.data([
        { time: '00:00', count: 35 },
        { time: '04:00', count: 70 },
        { time: '08:00', count: 90 },
        { time: '12:00', count: 100 },
        { time: '16:00', count: 120 },
        { time: '20:00', count: 140 }
      ])
      chart.line().encode('x', 'time').encode('y', 'count').style('stroke', '#6c34e6')
      chart.interaction('element-active')
      chart.render()
    }

    // 通知统计图表
    if (notifyChartRef.current) {
      const chart = new Chart({
        container: notifyChartRef.current,
        autoFit: true,
        height: 200
      })
      chart.data([
        { time: '00:00', success: 300, fail: 20 },
        { time: '04:00', success: 600, fail: 40 },
        { time: '08:00', success: 900, fail: 60 },
        { time: '12:00', success: 1200, fail: 80 }
      ])
      chart.area().encode('x', 'time').encode('y', 'success').style('fill', '#6c34e6')
      chart.line().encode('x', 'time').encode('y', 'fail').style('stroke', '#6c34e6')
      chart.interaction('element-active')
      chart.render()
    }

    // 今日告警统计图表
    if (todayChartRef.current) {
      const chart = new Chart({
        container: todayChartRef.current,
        autoFit: true,
        height: 200
      })
      chart.data([
        { time: '00:00', new: 5, resolved: 2 },
        { time: '04:00', new: 10, resolved: 5 },
        { time: '08:00', new: 15, resolved: 8 },
        { time: '12:00', new: 20, resolved: 12 }
      ])
      chart.interval().encode('x', 'time').encode('y', 'new').style('fill', '#6c34e6')
      chart.interval().encode('x', 'time').encode('y', 'resolved').style('fill', '#6c34e6')
      chart.interaction('element-active')
      chart.render()
    }

    // 策略告警数量Top5图表
    if (top5ChartRef.current) {
      const chart = new Chart({
        container: top5ChartRef.current,
        autoFit: true,
        height: 200
      })
      chart.data([
        { strategy: 'CPU使用率超过90%', count: 60 },
        { strategy: '存储使用率超过85%', count: 50 },
        { strategy: '磁盘空间不足10%', count: 40 },
        { strategy: '网络延迟超过200ms', count: 30 },
        { strategy: '连接数超过1000', count: 20 }
      ])
      chart.interval().encode('x', 'strategy').encode('y', 'count').style('fill', '#6c34e6')
      chart.interaction('element-active')
      chart.render()
    }
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h1>监控大盘</h1>
      <Row gutter={16}>
        <Col span={8}>
          <Card title='告警总览' bordered={false}>
            <div ref={alarmChartRef}></div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title='告警通知统计' bordered={false}>
            <div ref={notifyChartRef}></div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title='今日告警统计' bordered={false}>
            <div ref={todayChartRef}></div>
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title='实时告警事件消息' bordered={false}>
            <ul>
              <li>服务器CPU使用率超过90% - 严重</li>
              <li>数据库连接数接近上限 - 警告</li>
              <li>网络延迟超过200ms - 注意</li>
              <li>磁盘空间使用��过85% - 警告</li>
              <li>应用程序响应时间超过3秒 - 严重</li>
            </ul>
          </Card>
        </Col>
        <Col span={12}>
          <Card title='策略告警数量Top5' bordered={false}>
            <div ref={top5ChartRef}></div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
