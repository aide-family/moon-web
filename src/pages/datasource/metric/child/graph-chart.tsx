import React from 'react'
import { RangeValue } from '../timely-query'
import { Line } from '@ant-design/plots'
import dayjs from 'dayjs'
import { JsonStringify } from '@/utils/json'

export interface GraphChartProps {
  data?: RangeValue[]
}

function toData(data?: RangeValue[]) {
  if (!data) {
    return []
  }
  return (
    data?.map((item) => {
      return item?.values?.map((value) => {
        return {
          date: value?.[0],
          value: value?.[1],
          metric: JsonStringify(item?.metric)
        }
      })
    }) || []
  )
}

export const GraphChart: React.FC<GraphChartProps> = (props) => {
  const { data } = props

  const config = {
    data: {
      // 解构成一维数组
      value: toData(data)?.flat() || []
    },
    xField: (d: { date: string | number | Date }) => {
      if (!d || !d?.date) return ''
      return dayjs(+d?.date * 1000).format('HH:mm:ss')
    },
    yField: 'value',
    axis: {
      y: { title: '↑ Change in value' }
    },
    label: {
      text: 'metric',
      selector: 'last',
      style: {
        fontSize: 10
      }
    },
    colorField: 'metric'
    // normalize: { basis: 'first', groupBy: 'color' },
  }
  return <Line {...config} scrollbar={{ type: 'horizontal' }} style={{ width: '100%' }} />
}
