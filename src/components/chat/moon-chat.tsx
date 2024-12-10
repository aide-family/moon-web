import { UserItem } from '@/api/model-types'
import { baseURL, getToken } from '@/api/request'
import logoIcon from '@/assets/images/logo.svg'
import { GlobalContext } from '@/utils/context'
import {
  CloseCircleOutlined,
  CopyOutlined,
  LoadingOutlined,
  QuestionCircleOutlined,
  SendOutlined
} from '@ant-design/icons'
import { Avatar, Button, Drawer, FloatButton, Input, message, Space, theme } from 'antd'
import { useContext, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'

type ChatItem = {
  role: 'user' | 'assistant'
  content: string
}

const AIAvatar = () => {
  return (
    <Space>
      <Avatar className='bg-transparent'>
        <img src={logoIcon} alt='Moon Chat' style={{ width: '24px', height: '24px' }} />
      </Avatar>
      <div>Moon Chat</div>
    </Space>
  )
}

const UserAvatar = (props: { user?: UserItem }) => {
  const { user } = props
  const { avatar, name } = user || {}
  return (
    <Space>
      <Avatar src={avatar} />
      <div>{name}</div>
    </Space>
  )
}

export default function MoonChat() {
  const { token } = theme.useToken()
  const { userInfo } = useContext(GlobalContext)
  const [msg, setMsg] = useState('')
  const [response, setResponse] = useState<ChatItem[]>([
    {
      role: 'assistant',
      content: '你好，我是Moon Chat，一个基于AI的聊天机器人。'
    }
  ])
  const [loading, setLoading] = useState(false)
  const [event, setEvent] = useState<EventSource | null>(null)
  const [openChat, setOpenChat] = useState(false)

  const handleClose = () => {
    if (!event) {
      return
    }
    event.close()
    setEvent(null)
    setLoading(false)
  }

  function sendMessage() {
    if (!msg) return

    setResponse((prev) => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    setMsg('')
    const eventSource = new EventSource(`${baseURL}/ollama/chat?message=${encodeURIComponent(msg)}&token=${getToken()}`)

    setEvent(eventSource)
    let response = ''
    setResponse((prev) => [...prev, { role: 'assistant', content: response }])
    eventSource.onmessage = function (event) {
      console.log('Received event:', event)
      if (event.data === '[DONE]') {
        eventSource.close()
        setLoading(false)
        return
      }
      response += event.data
      // 更新最后一条消息
      setResponse((prev) => {
        const lastIndex = prev.length - 1
        return [...prev.slice(0, lastIndex), { role: 'assistant', content: response }]
      })
    }

    eventSource.onerror = function (error) {
      console.error('EventSource error:', error)
      eventSource.close()
      setResponse((prev) => [...prev, { role: 'assistant', content: 'Error: Connection lost with server' }])
      setLoading(false)
    }

    eventSource.onopen = function () {
      console.log('EventSource connection opened')
    }
  }

  const chatContainerRef = useRef<HTMLDivElement>(null)

  // 自动滚动到聊天框底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [response]) // 每当 response 更新时触发

  // 监听ctrl+c退出
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'c' && e.ctrlKey) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='w-full h-full'>
      <Drawer
        title='Moon Chat'
        open={openChat}
        onClose={() => setOpenChat(false)}
        width='80%'
        placement='left'
        closeIcon={null}
      >
        <div className='flex flex-col gap-2 overflow-y-auto h-full w-full'>
          <div
            className='flex flex-col gap-2 overflow-y-auto h-[calc(100vh-100px)] border-0 rounded-lg p-3'
            style={{
              borderColor: token.colorBorder,
              backgroundColor: token.colorBgContainer
            }}
            ref={chatContainerRef}
          >
            {response.map((item, index) => (
              <Space
                key={index}
                className={`flex flex-col gap-2 ${item.role === 'user' ? 'items-end ml-auto' : 'items-start mr-auto'}`}
              >
                <div className='text-sm text-gray-500 font-bold flex items-center gap-2'>
                  {item.role === 'user' ? <UserAvatar user={userInfo} /> : <AIAvatar />}
                  {index === response.length - 1 && item.role !== 'user' && loading && <LoadingOutlined />}
                </div>
                <div
                  className={`text-sm p-3 rounded-lg relative ${
                    item.role === 'user' ? 'bg-blue-500 text-white ml-12' : 'bg-gray-100 text-gray-800 mr-12'
                  }`}
                >
                  <div
                    onClick={() => {
                      navigator.clipboard.writeText(item.content).then(() => {
                        message.success('Copied to clipboard')
                      })
                    }}
                    className='absolute top-0 right-0 cursor-pointer'
                  >
                    <CopyOutlined />
                  </div>
                  {item.role === 'user' ? (
                    item.content
                  ) : (
                    <ReactMarkdown>{item.content.replace(/\\n/g, '\n')}</ReactMarkdown>
                  )}
                </div>
              </Space>
            ))}
          </div>
          <Input
            size='large'
            placeholder='Enter your message'
            disabled={loading}
            suffix={
              loading ? (
                <Button type='primary' icon={<CloseCircleOutlined />} onClick={handleClose} />
              ) : (
                <SendOutlined />
              )
            }
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onPressEnter={() => {
              sendMessage()
            }}
          />
        </div>
      </Drawer>
      <FloatButton icon={<QuestionCircleOutlined />} type='primary' onClick={() => setOpenChat(true)} />
    </div>
  )
}
