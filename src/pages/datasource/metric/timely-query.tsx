import { DatasourceItemType } from '@/api/datasource'
import { Input, List, Space, Tabs, TabsProps } from 'antd'
import dayjs from 'dayjs'
import React, { useState } from 'react'

export interface TimelyQueryProps {
  datasource?: DatasourceItemType
  apiPath?: string
}

export interface PromValue {
  metric: {
    __name__: string
    instance: string
    [key: string]: string
  }
  value?: [number, string]
  values?: [number, string][]
}

export const TimelyQuery: React.FC<TimelyQueryProps> = (props) => {
  const { datasource, apiPath = 'api/v1' } = props
  const [loading, setLoading] = useState(false)
  const [promData, setDatasource] = React.useState<PromValue[]>([])
  const [expr, setExpr] = useState<string>('')
  const getValues = (val: PromValue) => {
    if (val.value && !Array.isArray(val.value[1])) {
      return val.value[1]
    }

    if (
      val.values &&
      val.values.length > 0 &&
      Array.isArray(val.values[0]) &&
      val.values[0].length === 2 &&
      !Array.isArray(val.values[0][1])
    ) {
      return val.values[0][1]
    }

    return ''
  }
  const tabsItems: TabsProps['items'] = [
    {
      key: '1',
      label: `Table`,
      children: (
        <div>
          <List
            loading={loading}
            dataSource={promData}
            renderItem={(item: PromValue, index: React.Key) => {
              return (
                <List.Item key={index} id={`list-${index}`}>
                  <Space direction='horizontal' style={{ width: '100%' }}>
                    <span>
                      {item?.metric
                        ? `${item?.metric?.__name__ || ''}{${Object.keys(
                            item.metric
                          )
                            .filter((key) => key !== '__name__' && key !== 'id')
                            .map((key) => `${key}="${item.metric[key]}"`)
                            .join(', ')}}`
                        : expr || ''}
                    </span>
                    <div
                      style={{
                        float: 'right',
                      }}
                    >
                      <b> {getValues(item)}</b>
                    </div>
                  </Space>
                </List.Item>
              )
            }}
          />
        </div>
      ),
    },
    {
      key: '2',
      label: `Graph`,
      children: <div>graph</div>,
    },
  ]
  const tabsOnChange = (key: string) => {
    console.log(key)
  }
  const fetchData = async (exp: string) => {
    setExpr(exp)
    let path: string = ''
    const params: URLSearchParams = new URLSearchParams({
      query: exp,
    })
    path = 'query'
    const abortController = new AbortController()
    params.append('time', dayjs().unix().toString())
    const query = await fetch(
      `${datasource?.endpoint}${apiPath}/${path}?${params}`,
      {
        cache: 'no-store',
        credentials: 'same-origin',
        signal: abortController.signal,
      }
    )
      .then((resp) => resp.json())
      .catch((err) => {
        console.log('err', err)
      })
      .finally(() => setLoading(false))
    if (query.data) {
      const { result } = query.data
      setDatasource([...result])
    }
  }
  return (
    <div>
      <div>
        <Input
          placeholder='PromQL...'
          onChange={(e) => fetchData(e.target.value)}
        />
      </div>
      <Tabs defaultActiveKey='1' items={tabsItems} onChange={tabsOnChange} />
    </div>
  )
}
