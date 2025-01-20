import { UserItem } from '@/api/model-types'
import { InterventionEventItem } from '@/api/realtime/statistics'
import { Avatar } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

export const interveneColumns: ColumnsType<InterventionEventItem> = [
  {
    title: '介入时间',
    dataIndex: 'handledAt',
    key: 'handledAt',
    width: 120,
    render: (text: string) => {
      return dayjs(text).fromNow()
    }
  },
  {
    title: '处理人',
    dataIndex: 'handler',
    key: 'handler',
    width: 100,
    fixed: 'left',
    render: (user?: UserItem) => {
      if (!user) return '-'
      return (
        <div className='flex items-center gap-2'>
          <Avatar src={user.avatar} size={20}>
            {(user.name || user.nickname).charAt(0).toUpperCase()}
          </Avatar>
          <div>{user.name || user.nickname}</div>
        </div>
      )
    }
  },
  {
    title: '告警级别',
    dataIndex: 'level',
    key: 'level',
    align: 'center',
    width: 100
  },
  {
    title: '告警摘要',
    dataIndex: 'summary',
    key: 'summary',
    ellipsis: true
  },
  {
    title: '告警时间',
    dataIndex: 'eventTime',
    key: 'eventTime',
    width: 120
  }
]
