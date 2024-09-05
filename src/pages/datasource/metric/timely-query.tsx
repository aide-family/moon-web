import { DatasourceItemType } from '@/api/datasource/types'
import PromQLInput from '@/components/data/child/prom-ql'
import { Alert, Empty, List, Space, Tabs, TabsProps, Typography } from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import ReactJson from 'react-json-view'
import { GraphChart } from './child/graph-chart'

export interface TimelyQueryProps {
  datasource?: DatasourceItemType
  apiPath?: string
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
  const { datasource, apiPath = 'api/v1' } = props
  const [loading, setLoading] = useState(false)
  const [promDetailData, setPromDetailData] = React.useState<DetailValue[]>([])
  const [promRangeData, setPromRangeData] = React.useState<RangeValue[]>([])
  const [expr, setExpr] = useState<string>('')
  const [tabKey, setTabKey] = useState<TableKey>('table')

  const tabsItems: TabsProps['items'] = [
    {
      key: 'table',
      label: `Table`,
      children: (
        <div className='tab-content'>
          <List
            header={
              <div>
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
              </div>
            }
            loading={loading}
            dataSource={tabKey === 'table' ? promDetailData : []}
            renderItem={(item: DetailValue, index: React.Key) => {
              return (
                <List.Item key={index} id={`list-${index}`}>
                  <Space
                    direction='horizontal'
                    style={{
                      width: '100%',
                      gap: 8,
                      justifyContent: 'space-between'
                    }}
                  >
                    <Paragraph copyable>
                      {item?.metric?.__name__
                        ? `${item?.metric?.__name__}{${Object.keys(item?.metric || {})
                            .filter((key) => key !== '__name__' && key !== 'id')
                            .map((key) => `${key}="${item?.metric[key]}"`)
                            .join(', ')}}`
                        : expr}
                    </Paragraph>
                    <div style={{ float: 'right' }}>
                      <b> {tabKey === 'table' && item?.value?.[1]}</b>
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
        <div className='tab-content'>
          {promRangeData && promRangeData?.length && tabKey === 'graph' ? (
            <GraphChart data={promRangeData} />
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
        <div className='tab-content'>
          {promDetailData || promRangeData ? (
            <div
              style={{
                gap: 8,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'auto'
              }}
            >
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
              <ReactJson src={promDetailData || promRangeData || {}} name={false} displayDataTypes={false} />
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
    let path: string = ''
    const params: URLSearchParams = new URLSearchParams({
      query: expr
    })
    path = 'query'
    const abortController = new AbortController()

    switch (tabKey) {
      case 'graph':
        path = 'query_range'
        params.append('start', dayjs().subtract(5, 'minute').unix().toString())
        params.append('end', dayjs().unix().toString())
        params.append('step', '14')
        break
      default:
        path = 'query'
        params.append('time', dayjs().unix().toString())
    }

    fetch(`${datasource?.endpoint}${apiPath}/${path}?${params}`, {
      cache: 'no-store',
      credentials: 'same-origin',
      signal: abortController.signal
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
              setPromRangeData(query.data?.result || [])
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
    setExpr(exp)
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
  }, [expr])

  useEffect(() => {
    onSearch()
  }, [tabKey])

  return (
    <div className='timely-query'>
      <div>
        <PromQLInput pathPrefix={datasource?.endpoint || ''} onChange={(exp) => onChange(exp.target.value || '')} />
      </div>
      <Tabs defaultActiveKey='table' items={tabsItems} onChange={(tab) => tabsOnChange(tab as TableKey)} />
    </div>
  )
}
