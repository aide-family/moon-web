import { DatasourceItem } from '@/api/model-types'
import { baseURL } from '@/api/request'
import { MetricsChart } from '@/components/chart/metrics-charts'
import PromQLInput from '@/components/data/child/prom-ql'
import { DataFrom } from '@/components/data/form'
import useStorage from '@/hooks/storage'
import { MetricsResponse } from '@/types/metrics'
import { GlobalContext } from '@/utils/context'
import { transformMetricsData } from '@/utils/metricsTransform'
import { AreaChartOutlined, LineChartOutlined, ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, Empty, Form, InputNumber, List, Space, Tabs, TabsProps, Typography } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import React, { useContext, useEffect, useState } from 'react'
import ReactJson from 'react-json-view'

export interface TimelyQueryProps {
  datasource?: DatasourceItem
  apiPath?: string
  expr?: string
  setExpr?: (expr: string) => void
}

export interface PromValue {
  metric: Record<string, string>
}

export interface DetailValue extends PromValue {
  value: [number, string]
}

export interface RangeValue extends PromValue {
  values?: [number, string][]
}

type TableKey = 'table' | 'graph' | 'json'

const { Paragraph } = Typography

let searchTimeout: NodeJS.Timeout | null = null
export const TimelyQuery: React.FC<TimelyQueryProps> = (props) => {
  const { teamInfo, theme } = useContext(GlobalContext)
  const { datasource, apiPath = 'api/v1', expr, setExpr } = props
  const [loading, setLoading] = useState(false)
  const [promDetailData, setPromDetailData] = React.useState<DetailValue[]>([])
  const [metricsData, setMetricsData] = React.useState<MetricsResponse>()
  const [promRangeData, setPromRangeData] = React.useState<RangeValue[]>([])
  const [tabKey, setTabKey] = useStorage<TableKey>('timelyQueryTab', 'table')
  const [timeRange, setTimeRange] = useState<Dayjs[]>([dayjs().subtract(5, 'minute'), dayjs()])
  const [showArea, setShowArea] = useState(true)
  const [step, setStep] = useState(14)
  const pathPrefix = `${baseURL}/metric/${teamInfo?.id || 0}/${datasource?.id}`

  const transformedData = React.useMemo(
    () => transformMetricsData(metricsData?.data || { result: [], resultType: '' }),
    [metricsData]
  )

  const tabsItems: TabsProps['items'] = [
    {
      key: 'table',
      label: `Table`,
      children: (
        <div className='overflow-auto h-[calc(100vh-340px)]'>
          <List
            header={
              <div>
                <Alert
                  message={
                    <div>
                      共查询到 <b className='text-violet-500'>{promDetailData?.length || 0}</b> 条数据
                    </div>
                  }
                  // description='Prometheus'
                  type='info'
                  showIcon
                />
              </div>
            }
            loading={loading}
            dataSource={tabKey === 'table' ? promDetailData : []}
            renderItem={(item: DetailValue, index: React.Key) => {
              const metricExpr = item?.metric?.__name__
                ? `${item?.metric?.__name__}{${Object.keys(item?.metric || {})
                    .filter((key) => key !== '__name__' && key !== 'id')
                    .map((key) => `${key}="${item?.metric[key]}"`)
                    .join(', ')}}`
                : expr || ''
              return (
                <List.Item key={index} id={`list-${index}`}>
                  <Space direction='horizontal' className='w-full gap-2 justify-between'>
                    <Paragraph
                      copyable={{ text: metricExpr }}
                      className='text-violet-500 hover:text-violet-600 cursor-pointer text-ellipsis'
                      onClick={() => setExpr?.(metricExpr)}
                    >
                      {metricExpr}
                    </Paragraph>
                    <div className='float-right'>
                      <b>{item?.value?.[1]}</b>
                    </div>
                  </Space>
                </List.Item>
              )
            }}
          />
        </div>
      )
    },
    {
      key: 'graph',
      label: `Graph`,
      children: (
        <div className='overflow-auto h-[calc(100vh-340px)]'>
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
              <InputNumber min={1} placeholder='步长' />
            </Form.Item>
            <Form.Item name='time'>
              <Button type='default' onClick={() => setShowArea(!showArea)}>
                {showArea ? <AreaChartOutlined /> : <LineChartOutlined />}
              </Button>
            </Form.Item>
          </DataFrom>
          {transformedData && transformedData?.length && tabKey === 'graph' ? (
            <MetricsChart data={transformedData} showArea={showArea} />
          ) : (
            <Empty />
          )}
        </div>
      )
    },
    {
      key: 'json',
      label: `Json`,
      children: (
        <div className='overflow-auto h-[calc(100vh-340px)]'>
          {promDetailData || promRangeData ? (
            <div className='gap-2 flex flex-col h-full overflow-auto'>
              <Alert
                message={
                  <div>
                    共查询到 <b style={{ color: 'violet' }}>{promDetailData?.length || 0}</b> 条数据
                  </div>
                }
                // description='Prometheus'
                type='info'
                showIcon
              />
              <ReactJson
                src={promDetailData || promRangeData || {}}
                name={false}
                displayDataTypes={false}
                theme={theme === 'dark' ? 'railscasts' : 'bright:inverted'}
              />
            </div>
          ) : (
            <Empty />
          )}
        </div>
      )
    }
  ]
  const tabsOnChange = (key: TableKey) => {
    setTabKey(key)
  }

  const featchData = async () => {
    if (!expr) {
      return
    }
    let path: string = 'query'
    const params: URLSearchParams = new URLSearchParams({
      query: expr
    })

    const abortController = new AbortController()

    const start = timeRange?.[0]?.unix() || dayjs().subtract(5, 'minute').unix()
    const end = timeRange?.[1]?.unix() || dayjs().unix()

    switch (tabKey) {
      case 'graph':
        path = 'query_range'
        params.append('start', start.toString())
        params.append('end', end.toString())
        params.append('step', `${step}`)
        break
      default:
        path = 'query'
        params.append('time', dayjs().unix().toString())
    }

    fetch(`${pathPrefix}/${apiPath}/${path}?${params}`, {
      cache: 'no-store',
      credentials: 'same-origin',
      signal: abortController.signal,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((resp) => resp?.json() || {})
      .catch((err) => {
        console.log('err', err)
        return {}
      })
      .then((query) => {
        if (query.data) {
          switch (query.data?.resultType) {
            case 'matrix':
              setMetricsData(query)
              break
            case 'vector':
              setPromDetailData(query.data?.result || [])
              break
            default:
              setPromDetailData([])
              setPromRangeData([])
          }
        }
      })
  }

  const onChange = (exp: string) => {
    setExpr?.(exp)
  }

  const onSearch = (t: number = 200) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    searchTimeout = setTimeout(() => {
      setLoading(true)
      setPromDetailData([])
      setPromRangeData([])
      featchData().finally(() => {
        setLoading(false)
      })
    }, t)
  }

  useEffect(() => {
    onSearch(800)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expr, timeRange])

  useEffect(() => {
    onSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabKey, datasource])

  return (
    <div>
      <div>
        <PromQLInput
          pathPrefix={pathPrefix}
          onChange={(exp) => onChange(`${exp || ''}`)}
          value={expr}
          subfix={
            <Button
              size='large'
              style={{
                borderRadius: '0 6px 6px 0'
              }}
              type='primary'
              onClick={() => onSearch()}
              icon={<ReloadOutlined />}
            />
          }
        />
      </div>
      <Tabs
        defaultActiveKey='table'
        activeKey={tabKey}
        items={tabsItems}
        onChange={(tab) => tabsOnChange(tab as TableKey)}
      />
    </div>
  )
}
