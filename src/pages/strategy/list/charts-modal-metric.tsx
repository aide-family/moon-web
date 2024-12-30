import type { StrategyItem } from '@/api/model-types'
import { getStrategy } from '@/api/strategy'
import { MetricsChart, type Threshold } from '@/components/chart/metrics-charts'
import { metricQueryRange } from '@/components/chart/query-range'
import { DataFrom } from '@/components/data/form'
import type { MetricsResponse } from '@/types/metrics'
import { GlobalContext } from '@/utils/context'
import { transformMetricsData } from '@/utils/metricsTransform'
import { AreaChartOutlined, LineChartOutlined } from '@ant-design/icons'
import { Button, Empty, Form, InputNumber, Modal, type ModalProps, Tabs, type TabsProps, message } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { debounce } from 'lodash'
import React, { useCallback, useContext, useEffect, useState } from 'react'

export interface StrategyChartsProps extends ModalProps {
  strategyID?: number
}
const StrategyCharts: React.FC<StrategyChartsProps> = ({ strategyID, open, ...rest }) => {
  const { teamInfo } = useContext(GlobalContext)
  const [strategyDetail, setStrategyDetail] = useState<StrategyItem>()
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
          setStrategyDetail(detail)
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

  const onChange = (expr: string, key: string) => {
    setActiveKey(Number(key))
    metricQueryRange(expr, {
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!strategyDetail) return
    onChange(strategyDetail?.expr || '', activeKey.toString())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategyDetail, activeKey, refresh, timeRange, step])

  useEffect(() => {
    if (!strategyID || !open) return
    fetchData(strategyID)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategyID, open, fetchData])

  return (
    <Modal {...rest} open={open} loading={loading} footer={null}>
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
                {
                  label: '最近5分钟',
                  value: [dayjs().subtract(5, 'minute'), dayjs()]
                },
                {
                  label: '最近1小时',
                  value: [dayjs().subtract(1, 'hour'), dayjs()]
                },
                {
                  label: '最近3小时',
                  value: [dayjs().subtract(3, 'hour'), dayjs()]
                },
                {
                  label: '最近6小时',
                  value: [dayjs().subtract(6, 'hour'), dayjs()]
                },
                {
                  label: '最近12小时',
                  value: [dayjs().subtract(12, 'hour'), dayjs()]
                },
                {
                  label: '最近1天',
                  value: [dayjs().subtract(1, 'day'), dayjs()]
                },
                {
                  label: '最近2天',
                  value: [dayjs().subtract(2, 'day'), dayjs()]
                },
                {
                  label: '最近7天',
                  value: [dayjs().subtract(7, 'day'), dayjs()]
                }
              ]
            }
          }
        ]}
        props={{
          layout: 'inline',
          onValuesChange: (_, values) => {
            setStep(values.step)
            const ts: Dayjs[] = []
            for (const t of values.time) {
              ts.push(dayjs(t))
            }
            setTimeRange(ts)
          }
        }}
      >
        <Form.Item name='step' initialValue={step}>
          <InputNumber min={1} placeholder='步长' />
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
      <Tabs activeKey={`${activeKey}`} items={items} onChange={(key) => setActiveKey(Number(key))} />
      <div className='tab-content'>
        {transformedData && transformedData?.length > 0 ? (
          <MetricsChart
            data={transformedData}
            showArea={showArea}
            thresholds={
              strategyDetail?.metricLevels.map(
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
