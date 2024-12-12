import {
  cancelMessage,
  confirmMessage,
  deleteMessage,
  getBizName,
  listMessage,
  MessageCategory,
  NoticeUserMessageItem
} from '@/api/user/message'
import { BellOutlined, CheckOutlined, XOutlined } from '@ant-design/icons'
import { Badge, Button, Divider, Modal, Popover, Space, Tag } from 'antd'
import dayjs from 'dayjs'
import { debounce } from 'lodash'
import React, { useCallback, useContext, useEffect, useState } from 'react'

export interface HeaderMessageProps {}

const { confirm, info } = Modal

export const HeaderMessage: React.FC<HeaderMessageProps> = () => {
  const { setRefreshMyTeamList } = useContext(GlobalContext)
  const [msgCnt, setMsgCnt] = useState(0)
  const [data, setData] = useState<NoticeUserMessageItem[]>([])
  const [refresh, setRefresh] = useState(false)

  const handleRefresh = () => {
    setRefresh(!refresh)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchData = useCallback(
    debounce(async (params) => {
      listMessage(params).then(({ list, pagination }) => {
        setData(list || [])
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
    }, 60000)
    return () => clearInterval(interval)
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

  const showInvitePromiseConfirm = async (messageItem: NoticeUserMessageItem) => {
    const { detail } = await getInvite({ id: messageItem.bizID })
    confirm({
      title: '团队邀请',
      icon: getMessageIcon(messageItem.category),
      content: (
        <div>
          <div>{messageItem.content}</div>
          <h4>您将加入的团队：</h4>
          <ul>{detail.team && <li>{detail.team.name}</li>}</ul>
          {detail.roles && detail.roles.length > 0 && (
            <>
              <h4>您将被授予以下角色：</h4>
              <ul>
                {detail.roles.map((role) => (
                  <li key={role.id}>{role.name}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      ),
      cancelText: '拒绝',
      okText: '接受',
      async onOk() {
        return confirmMessage(messageItem.id).finally(setRefreshMyTeamList)
      },
      async onCancel() {
        return cancelMessage(messageItem.id).finally(handleRefresh)
      }
    })
  }

  const showMessageRead = async (messageItem: NoticeUserMessageItem) => {
    const { color, label } = getBizName(messageItem.biz)
    info({
      title: <Tag color={color}>{label}</Tag>,
      icon: getMessageIcon(messageItem.category),
      content: (
        <div>
          <div>{messageItem.content}</div>
        </div>
      ),
      async onOk() {
        return deleteMessage({ ids: [messageItem.id] }).finally(handleRefresh)
      }
    })
  }

  const handleMessage = (messageItem: NoticeUserMessageItem) => {
    switch (messageItem.biz) {
      case 'invitation':
        showInvitePromiseConfirm(messageItem)
        break
      default:
        showMessageRead(messageItem)
        break
    }
  }

  return (
    <Popover
      placement='bottomLeft'
      content={
        <div className='w-[320px] h-[400px] flex flex-col'>
          <div className='p-3 pb-2'>
            <div className='text-base font-bold'>通知</div>
            <div className='text-sm text-gray-500'>您有 {msgCnt} 条未读消息</div>
          </div>
          <Divider />
          <Space direction='vertical' size={4} className='text-[#888] text-sm'>
            {data.map((item, index) => {
              const { color, label } = getBizName(item.biz)
              return (
                <Button
                  key={index}
                  color={getMessageButtonColor(item.category)}
                  variant='filled'
                  className='w-full h-[80px] cursor-pointer'
                  onClick={() => handleMessage(item)}
                >
                  <Space size={12} className='w-full'>
                    <div className='text-left'>{getMessageIcon(item.category)}</div>
                    <div className='text-sm text-left'>
                      <Space size={8}>
                        <Tag color={color} bordered={false} className='w-full text-center'>
                          {label}
                        </Tag>
                        <div>
                          <TimeDifference timestamp={+item.timestamp * 1000} subfix='前' />
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
              <div className='flex-1 overflow-auto overflow-x-hidden py-3'>
                <Button className='w-full' type='primary'>
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
  subfix?: string
  startAt?: dayjs.Dayjs
}
const TimeDifference: React.FC<TimeDifferenceProps> = ({ timestamp, subfix = '', startAt = dayjs() }) => {
  const [timeDiff, setTimeDiff] = useState('')

  useEffect(() => {
    // 每秒钟更新一次时间差
    const interval = setInterval(() => {
      setTimeDiff(formatTimeDiff(startAt, timestamp))
    }, 1000)

    // 清除 interval
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timestamp])

  return <>{timeDiff ? timeDiff + subfix : ''}</>
}

export default TimeDifference

import { getInvite } from '@/api/user/invite'
import { GlobalContext } from '@/utils/context'
import duration from 'dayjs/plugin/duration'

// 扩展 dayjs 以使用 duration 插件
dayjs.extend(duration)

const formatTimeDiff = (startAt: dayjs.Dayjs, timestamp: number) => {
  const targetTime = dayjs(timestamp)

  // 计算时间差
  const diff = startAt.diff(targetTime)

  // 转换成 duration 对象
  const diffDuration = dayjs.duration(diff)

  // 根据时间差的长度选择显示格式
  if (diffDuration.asSeconds() < 60) {
    return `${diffDuration.seconds()}s`
  } else if (diffDuration.asMinutes() < 60) {
    return `${diffDuration.minutes()}m${diffDuration.seconds()}s`
  } else if (diffDuration.asHours() < 24) {
    return `${Math.floor(diffDuration.asHours())}h${diffDuration.minutes()}m${diffDuration.seconds()}s`
  } else {
    return `${Math.floor(diffDuration.asDays())}d${Math.floor(diffDuration.asHours() % 24)}h${diffDuration.minutes()}m${diffDuration.seconds()}s`
  }
}
