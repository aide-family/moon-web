import { getBizName, listMessage, MessageCategory, NoticeUserMessageItem } from '@/api/user/message'
import { BellOutlined, CheckOutlined, XOutlined } from '@ant-design/icons'
import { Badge, Button, Divider, message, Popover, Space, Tag } from 'antd'
import dayjs from 'dayjs'
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useState } from 'react'

export interface HeaderMessageProps {}

export const HeaderMessage: React.FC<HeaderMessageProps> = () => {
  const [msgCnt, setMsgCnt] = useState(0)
  const [data, setData] = useState<NoticeUserMessageItem[]>([])

  const fetchData = useCallback(
    debounce(async (params) => {
      listMessage(params).then(({ list, pagination }) => {
        setData(list || [])
        if (pagination?.total && pagination?.total > msgCnt) {
          message.info('您有新消息')
        }
        setMsgCnt(pagination?.total || 0)
      })
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
        return <BellOutlined className='text-blue-500' />
      case 'success':
        return <CheckOutlined className='text-green-500' />
      case 'warning':
        return <BellOutlined className='text-yellow-500' />
      case 'error':
        return <XOutlined className='text-red-500' />
    }
  }

  const getMessageButtonColor = (category: MessageCategory) => {
    switch (category) {
      case 'info':
        return 'primary'
      case 'error':
        return 'danger'
      default:
        return 'default'
    }
  }

  return (
    <Popover
      placement='bottom'
      className='header-message'
      open={true}
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
          <Space direction='vertical' size={4} className='header-message-popover-content'>
            {data.map((item, index) => {
              const { color, label } = getBizName(item.biz)
              return (
                <Button
                  key={index}
                  color={getMessageButtonColor(item.category)}
                  variant='filled'
                  style={{
                    width: '100%',
                    height: 60,
                    justifyContent: 'flex-start',
                    cursor: 'pointer'
                  }}
                >
                  <Space size={12} style={{ width: '100%' }}>
                    <div style={{ textAlign: 'left' }}>{getMessageIcon(item.category)}</div>
                    <div style={{ fontSize: 12, textAlign: 'left' }}>
                      <Space size={8}>
                        <Tag color={color} bordered={false} style={{ width: '100%', textAlign: 'center' }}>
                          {label}
                        </Tag>
                        <div>
                          <TimeDifference timestamp={+item.timestamp * 1000} />
                        </div>
                      </Space>
                      <div>
                        <p>{item.content}</p>
                      </div>
                    </div>
                  </Space>
                </Button>
              )
            })}
          </Space>
          {msgCnt > 0 && (
            <>
              <Divider />
              <div className='header-message-popover-footer'>
                <Button style={{ width: '100%' }} color='primary' variant='filled'>
                  清空所有
                </Button>
              </div>
            </>
          )}
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

  return <>{timeDiff ? timeDiff + '前' : ''}</>
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
