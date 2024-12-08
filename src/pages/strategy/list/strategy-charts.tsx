import { StrategyItem } from '@/api/model-types'
import { getStrategy } from '@/api/strategy'
import { MetricsChart, Threshold } from '@/components/chart/metrics-charts'
import { metricQueryRange } from '@/components/chart/query-range'
import { DataFrom } from '@/components/data/form'
import { MetricsResponse } from '@/types/metrics'
import { GlobalContext } from '@/utils/context'
import { transformMetricsData } from '@/utils/metricsTransform'
import { AreaChartOutlined, LineChartOutlined } from '@ant-design/icons'
import { Button, Empty, Form, InputNumber, message, Modal, ModalProps, Tabs, TabsProps } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { debounce } from 'lodash'
import React, { useCallback, useContext, useEffect, useState } from 'react'

export interface StrategyChartsProps extends ModalProps {
  strategyID?: number
}
const StrategyCharts: React.FC<StrategyChartsProps> = ({ strategyID, ...rest }) => {
  const { teamInfo } = useContext(GlobalContext)
  const [detail, setDetail] = useState<StrategyItem>()
  const [loading, setLoading] = useState(false)
  const [activeKey, setActiveKey] = useState(0)
  const [items, setItems] = useState<TabsProps['items']>([])
  const [metricsData, setMetricsData] = React.useState<MetricsResponse>()
  const [timeRange, setTimeRange] = useState<Dayjs[]>([dayjs().subtract(5, 'minute'), dayjs()])
  const [showArea, setShowArea] = useState(true)
  const [step, setStep] = useState(14)
  const [refresh, setRefresh] = useState(false)

  const transformedData = React.useMemo(
    () => transformMetricsData(metricsData?.data || { result: [], resultType: '' }),
    [metricsData]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchData = useCallback(
    debounce(async (id: number) => {
      //   if (!realtimeId) return
      setLoading(true)
      getStrategy({ id })
        .then(({ detail }) => {
          setDetail(detail)
          setActiveKey(detail?.datasource?.[0]?.id || 0)
          setItems(
            detail?.datasource?.map((item) => ({
              label: item.name,
              key: `${item.id}`
            }))
          )
        })
        .finally(() => setLoading(false))
    }, 500),
    []
  )

  const onChange = (key: string) => {
    setActiveKey(Number(key))
    metricQueryRange(detail?.expr || '', {
      teamID: teamInfo?.id || 0,
      datasourceID: Number(key),
      start: timeRange[0],
      end: timeRange[1],
      step
    })
      .then((res) => {
        setMetricsData(res)
      })
      .catch((err) => {
        message.error(err?.message || '获取数据失败')
      })
  }

  const refreshData = () => {
    setRefresh(!refresh)
  }

  useEffect(() => {
    onChange(activeKey.toString())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, refresh, strategyID, timeRange, step])

  useEffect(() => {
    if (!strategyID) return
    fetchData(strategyID)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategyID])

  return (
    <Modal {...rest} loading={loading}>
      <DataFrom
        items={[
          {
            type: 'time-range',
            name: 'time',
            label: '时间',
            formProps: {
              initialValue: timeRange
            },
            props: {
              format: 'YYYY-MM-DD HH:mm:ss',
              showTime: true,
              // 预置时间选项
              presets: [
                { label: '最近5分钟', value: [dayjs().subtract(5, 'minute'), dayjs()] },
                { label: '最近1小时', value: [dayjs().subtract(1, 'hour'), dayjs()] },
                { label: '最近3小时', value: [dayjs().subtract(3, 'hour'), dayjs()] },
                { label: '最近6小时', value: [dayjs().subtract(6, 'hour'), dayjs()] },
                { label: '最近12小时', value: [dayjs().subtract(12, 'hour'), dayjs()] },
                { label: '最近1天', value: [dayjs().subtract(1, 'day'), dayjs()] },
                { label: '最近2天', value: [dayjs().subtract(2, 'day'), dayjs()] },
                { label: '最近7天', value: [dayjs().subtract(7, 'day'), dayjs()] }
              ]
            }
          }
        ]}
        props={{
          layout: 'inline',
          onValuesChange: (_, values) => {
            setStep(values.step)
            const ts: Dayjs[] = []
            values.time.forEach((t: string) => {
              ts.push(dayjs(t))
            })
            setTimeRange(ts)
          }
        }}
      >
        <Form.Item name='step' initialValue={step}>
          <InputNumber min={1} max={60} placeholder='步长' />
        </Form.Item>
        <Form.Item>
          <Button type='default' onClick={() => setShowArea(!showArea)}>
            {showArea ? <AreaChartOutlined /> : <LineChartOutlined />}
          </Button>
        </Form.Item>
        <Form.Item>
          <Button type='default' onClick={refreshData}>
            刷新
          </Button>
        </Form.Item>
      </DataFrom>
      <Tabs activeKey={`${activeKey}`} items={items} onChange={onChange} />
      <div className='tab-content'>
        {transformedData && transformedData?.length > 0 ? (
          <MetricsChart
            data={transformedData}
            showArea={showArea}
            thresholds={
              detail?.metricLevels.map(
                (item): Threshold => ({
                  value: item.threshold,
                  label: { text: item?.level?.label },
                  color: item?.level?.extend?.color || ''
                })
              ) || []
            }
          />
        ) : (
          <Empty />
        )}
      </div>
    </Modal>
  )
}

export default StrategyCharts
