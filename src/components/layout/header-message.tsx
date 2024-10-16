import { getBizName, listMessage, MessageCategory, NoticeUserMessageItem } from '@/api/user/message'
import { BellOutlined, CheckOutlined, XOutlined } from '@ant-design/icons'
import { Badge, Button, Divider, Popover, Space, Tag } from 'antd'
import dayjs from 'dayjs'
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'

export interface HeaderMessageProps {}

export const HeaderMessage: React.FC<HeaderMessageProps> = (props) => {
  const {} = props

  const [msgCnt, setMsgCnt] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<NoticeUserMessageItem[]>([])

  const fetchData = useCallback(
    debounce(async (params) => {
      setLoading(true)
      listMessage(params)
        .then(({ list, pagination }) => {
          setData(list || [])
          setMsgCnt(pagination?.total || 0)
        })
        .finally(() => setLoading(false))
    }, 500),
    []
  )

  useEffect(() => {
    fetchData({
      pagination: {
        pageNum: 1,
        pageSize: 999
      }
    })
    const interval = setInterval(() => {
      fetchData({
        pagination: {
          pageNum: 1,
          pageSize: 999
        }
      })
      return () => clearInterval(interval)
    }, 60000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getMessageIcon = (category: MessageCategory) => {
    switch (category) {
      case 'info':
        return <BellOutlined className='h-4 w-4 text-blue-500' />
      case 'success':
        return <CheckOutlined className='h-4 w-4 text-green-500' />
      case 'warning':
        return <BellOutlined className='h-4 w-4 text-yellow-500' />
      case 'error':
        return <XOutlined className='h-4 w-4 text-red-500' />
    }
  }

  return (
    <Popover
      placement='bottom'
      className='header-message'
      //   open={true}
      content={
        <div className='header-message-popover' style={{ width: 400, height: 400 }}>
          <div className='header-message-popover-header'>
            <div className='header-message-popover-header-title' style={{ fontSize: 16 }}>
              通知
            </div>
            <div className='header-message-popover-header-content' style={{ fontSize: 12 }}>
              您有 {msgCnt} 条未读消息
            </div>
          </div>
          <Divider />
          <Space direction='vertical' className='header-message-popover-content'>
            {data.map((item, index) => {
              const { color, label } = getBizName(item.biz)
              return (
                <Button
                  key={index}
                  type='text'
                  style={{
                    width: '100%',
                    height: 60,
                    justifyContent: 'flex-start',
                    cursor: 'pointer'
                  }}
                >
                  <Space size={20} style={{ padding: 8 }}>
                    <div style={{ width: 80, textAlign: 'left' }}>
                      {getMessageIcon(item.category)}
                      <Tag color={color} style={{ width: '100%', textAlign: 'center' }}>
                        {label}
                      </Tag>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        padding: 8,
                        textAlign: 'left'
                      }}
                    >
                      <div>
                        <p>{item.content}</p>
                      </div>
                      <div>
                        <TimeDifference timestamp={+item.timestamp * 1000} />前
                      </div>
                    </div>
                  </Space>
                </Button>
              )
            })}
          </Space>
          <Divider />
          <div className='header-message-popover-footer'>
            <Button style={{ width: '100%' }} color='primary' variant='filled'>
              清空所有
            </Button>
          </div>
        </div>
      }
    >
      <Badge count={msgCnt} overflowCount={99} size='small'>
        <Button icon={<BellOutlined />} type='text' />
      </Badge>
    </Popover>
  )
}

export interface TimeDifferenceProps {
  timestamp: number
}
const TimeDifference: React.FC<TimeDifferenceProps> = ({ timestamp }) => {
  const [timeDiff, setTimeDiff] = useState('')

  useEffect(() => {
    // 每秒钟更新一次时间差
    const interval = setInterval(() => {
      setTimeDiff(formatTimeDiff(timestamp))
    }, 1000)

    // 清除 interval
    return () => clearInterval(interval)
  }, [timestamp])

  return <>{timeDiff}</>
}

export default TimeDifference

import duration from 'dayjs/plugin/duration'

// 扩展 dayjs 以使用 duration 插件
dayjs.extend(duration)

const formatTimeDiff = (timestamp: number) => {
  const now = dayjs()
  const targetTime = dayjs(timestamp)

  // 计算时间差
  const diff = now.diff(targetTime)

  // 转换成 duration 对象
  const diffDuration = dayjs.duration(diff)

  // 根据时间差的长度选择显示格式
  if (diffDuration.asSeconds() < 60) {
    return `${diffDuration.seconds()} 秒`
  } else if (diffDuration.asMinutes() < 60) {
    return `${diffDuration.minutes()} 分 ${diffDuration.seconds()} 秒`
  } else if (diffDuration.asHours() < 24) {
    return `${Math.floor(diffDuration.asHours())} 小时 ${diffDuration.minutes()} 分 ${diffDuration.seconds()} 秒`
  } else {
    return `${Math.floor(diffDuration.asDays())} 天 ${Math.floor(diffDuration.asHours() % 24)} 小时 ${diffDuration.minutes()} 分 ${diffDuration.seconds()} 秒`
  }
}
