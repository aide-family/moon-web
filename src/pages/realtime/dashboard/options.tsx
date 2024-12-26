import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import type { InterveneData } from '.'

export const interveneColumns: ColumnsType<InterveneData> = [
  {
    title: '介入时间',
    dataIndex: 'intervene_time',
    key: 'intervene_time',
    width: 120,
    render: (text: string) => {
      return dayjs(text).fromNow()
    }
  },
  {
    title: '处理人',
    dataIndex: 'intervene_user',
    key: 'intervene_user',
    width: 100,
    fixed: 'left'
  },
  {
    title: '告警级别',
    dataIndex: 'level',
    key: 'level',
    align: 'center',
    width: 100
  },
  {
    title: '告警事件',
    dataIndex: 'event',
    key: 'event',
    ellipsis: true
  },
  {
    title: '告警时间',
    dataIndex: 'time',
    key: 'time',
    width: 120
  }
]
