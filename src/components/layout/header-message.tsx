import { getInvite } from '@/api/user/invite'
import {
  type MessageCategory,
  type NoticeUserMessageItem,
  cancelMessage,
  confirmMessage,
  deleteMessage,
  getBizName,
  listMessage
} from '@/api/user/message'
import { GlobalContext } from '@/utils/context'
import { BellOutlined, CheckOutlined, XOutlined } from '@ant-design/icons'
import { Badge, Button, Divider, Modal, Popover, Space, Tag, theme as antTheme } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // 导入中文语言包
import relativeTime from 'dayjs/plugin/relativeTime'
import { debounce } from 'lodash'
import type React from 'react'
import { useCallback, useContext, useEffect, useState } from 'react'
// 设置 dayjs 的语言为中文
dayjs.locale('zh-cn')
// 使用插件
dayjs.extend(relativeTime)

const { confirm, info } = Modal

const { useToken } = antTheme
export const HeaderMessage: React.FC = () => {
  const { token } = useToken()
  const { setRefreshMyTeamList } = useContext(GlobalContext)
  const [msgCnt, setMsgCnt] = useState(0)
  const [data, setData] = useState<NoticeUserMessageItem[]>([])
  const [refresh, setRefresh] = useState(false)

  const handleRefresh = () => {
    setRefresh(!refresh)
  }

  const handleOnOk = () => {
    handleRefresh()
    setRefreshMyTeamList?.()
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
  }, [fetchData])

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
        <div className='flex flex-col gap-2'>
          <div className='text-lg'>{messageItem.content}</div>
          <h4 className='text-base'>您将加入的团队：</h4>
          <ul className='text-base font-bold list-disc'>{detail.team && <li>{detail.team.name}</li>}</ul>
          {detail.roles && detail.roles.length > 0 && (
            <>
              <h4 className='text-base'>您将被授予以下角色：</h4>
              <ul className='text-base list-disc'>
                {detail.roles.map((role) => (
                  <li key={role.id} className='text-base text-gray-500'>
                    {role.name}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ),
      cancelText: '拒绝',
      okText: '接受',
      async onOk() {
        return confirmMessage(messageItem.id).finally(handleOnOk)
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
        <div className='w-[400px] h-[400px] flex flex-col relative'>
          <div className='p-3 pb-2 flex justify-between'>
            <div className='text-base font-bold'>通知</div>
            <div className='text-sm text-gray-500'>您有 {msgCnt} 条未读消息</div>
          </div>
          <Divider className='m-1 p-0' />
          <Space direction='vertical' size={4} className='text-[#888] text-lg p-1' wrap>
            {data.map((item, index) => {
              const { color, label } = getBizName(item.biz)
              return (
                <div
                  key={`${index}-${item.id}`}
                  style={{
                    background: getMessageButtonColor(item.category),
                    borderRadius: token.borderRadius
                  }}
                  className='w-full cursor-pointer hover:bg-gray-100 p-2'
                  onClick={() => handleMessage(item)}
                  onKeyUp={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleMessage(item)
                    }
                  }}
                >
                  <Space size={12} className='w-full'>
                    <div className='text-left'>{getMessageIcon(item.category)}</div>
                    <div className='text-sm text-left flex flex-col justify-between gap-3'>
                      <Space size={8} className='w-full'>
                        <Tag color={color} bordered={false} className='w-full text-center'>
                          {label}
                        </Tag>
                        <div>{dayjs(item.timestamp * 1000).fromNow()}</div>
                      </Space>
                      <div className='text-sm text-ellipsis'>{item.content}</div>
                    </div>
                  </Space>
                </div>
              )
            })}
          </Space>
          {msgCnt > 0 && (
            <div className='absolute bottom-0 left-0 right-0'>
              <Divider className='m-1 p-0' />
              <div className='flex-1 overflow-auto overflow-x-hidden py-3'>
                <Button className='w-full' type='primary'>
                  清空所有
                </Button>
              </div>
            </div>
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
