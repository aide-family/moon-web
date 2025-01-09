import type { UserItem } from '@/api/model-types'
import { baseURL, getToken } from '@/api/request'
import logoIcon from '@/assets/images/logo.svg'
import useStorage from '@/hooks/storage'
import { GlobalContext } from '@/utils/context'
import { CloseCircleOutlined, CopyOutlined, LoadingOutlined, OpenAIOutlined, SendOutlined } from '@ant-design/icons'
import { Alert, Avatar, Button, Drawer, Input, Modal, Space, message, theme } from 'antd'
import { ArrowDownToLine, ArrowLeftFromLine, ArrowRightFromLine, ArrowUpToLine, Command } from 'lucide-react'
import { useContext, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
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
  const { userInfo, theme: sysTheme } = useContext(GlobalContext)
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
  // 快捷键配置
  const [shortcutKey, setShortcutKey] = useStorage('shortcutKey', 'm')
  const [shortcutKeyOpen, setShortcutKeyOpen] = useState(false)
  // 抽屉方向
  const [drawerPlacement, setDrawerPlacement] = useStorage<'left' | 'right' | 'top' | 'bottom'>(
    'drawerPlacement',
    'top'
  )

  const handleClose = () => {
    if (!event) {
      return
    }
    event.close()
    setEvent(null)
    setLoading(false)
  }

  async function sendMessage() {
    if (!msg) return

    const message: ChatItem = {
      role: 'user',
      content: msg
    }
    setResponse((prev) => [...prev, message])
    setLoading(true)
    await fetch(`${baseURL}/ollama/push?token=${getToken()}`, {
      method: 'POST',
      body: JSON.stringify(message)
    })
    setMsg('')
    const eventSource = new EventSource(`${baseURL}/ollama/chat?token=${getToken()}`)

    setEvent(eventSource)
    let response = ''
    setResponse((prev) => [...prev, { role: 'assistant', content: response }])
    eventSource.onmessage = (event) => {
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

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error)
      eventSource.close()
      setResponse((prev) => [...prev, { role: 'assistant', content: 'Error: Connection lost with server' }])
      setLoading(false)
    }

    eventSource.onopen = () => {
      console.log('EventSource connection opened')
    }
  }

  const chatContainerRef = useRef<HTMLDivElement>(null)

  // 自动滚动到聊天框底部
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [response, chatContainerRef]) // 每当 response 更新时触发

  // 增加control + m 打开聊天框
  useEffect(() => {
    if (!shortcutKey || shortcutKeyOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === shortcutKey && e.ctrlKey) {
        setOpenChat(!openChat)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openChat, shortcutKey, shortcutKeyOpen])

  // 快捷键配置
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (shortcutKeyOpen) {
      // 监听快捷键， 并转换成输入放入shortcutKey，支持多个按键下的组合输入
      const handleKeyDown = (e: KeyboardEvent) => {
        // 不支持删除键
        if (e.key === 'Delete' || e.key === 'Backspace') {
          setShortcutKey(shortcutKey?.slice(0, shortcutKey.length - 1) || '')
          return
        }
        setShortcutKey(e.key)
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcutKeyOpen])

  return (
    <>
      <Modal title='快捷键设置' open={shortcutKeyOpen} onCancel={() => setShortcutKeyOpen(false)} footer={null}>
        <div className='flex flex-col gap-2'>
          <Alert message='按下快捷键，即可完成聊天框快捷键设置' type='info' showIcon />
          <Input prefix='ctrl+' value={shortcutKey} placeholder='请输入快捷键' />
        </div>
      </Modal>
      <Drawer
        title={
          <div className='flex items-center justify-between gap-2'>
            <div>Moon Chat</div>
            <div>
              <Button color='primary' variant='outlined' size='small' onClick={() => setShortcutKeyOpen(true)}>
                <Command size='16px' /> Ctrl + {shortcutKey}
              </Button>
            </div>
            <div className='flex items-center gap-2'>
              <Button type='text' size='small'>
                <ArrowDownToLine
                  size='16px'
                  onClick={() => setDrawerPlacement('top')}
                  className={`cursor-pointer ${drawerPlacement === 'top' ? 'text-blue-500' : ''}`}
                />
              </Button>
              <Button type='text' size='small'>
                <ArrowUpToLine
                  size='16px'
                  onClick={() => setDrawerPlacement('bottom')}
                  className={`cursor-pointer ${drawerPlacement === 'bottom' ? 'text-blue-500' : ''}`}
                />
              </Button>
              <Button type='text' size='small'>
                <ArrowLeftFromLine
                  size='16px'
                  onClick={() => setDrawerPlacement('right')}
                  className={`cursor-pointer ${drawerPlacement === 'right' ? 'text-blue-500' : ''}`}
                />
              </Button>
              <Button type='text' size='small'>
                <ArrowRightFromLine
                  size='16px'
                  onClick={() => setDrawerPlacement('left')}
                  className={`cursor-pointer ${drawerPlacement === 'left' ? 'text-blue-500' : ''}`}
                />
              </Button>
            </div>
          </div>
        }
        open={openChat}
        onClose={() => setOpenChat(false)}
        width={drawerPlacement === 'left' || drawerPlacement === 'right' ? '80%' : undefined}
        height={drawerPlacement === 'top' || drawerPlacement === 'bottom' ? '80%' : undefined}
        placement={drawerPlacement}
        closeIcon={null}
      >
        <div className='flex flex-col gap-2 overflow-y-auto h-full w-full'>
          <div
            className='flex flex-col gap-2 overflow-y-auto h-[calc(100vh-100px)] border-0 rounded-lg p-3'
            style={{
              borderColor: token.colorBorder,
              backgroundColor: token.colorBgLayout
            }}
            ref={chatContainerRef}
          >
            {response.map((item, index) => (
              <Space
                key={`${item.role}-${index}`}
                className={`flex flex-col gap-2 ${item.role === 'user' ? 'items-end ml-auto' : 'items-start mr-auto'}`}
              >
                <div className='text-sm text-gray-500 font-bold flex items-center gap-2'>
                  {item.role === 'user' ? <UserAvatar user={userInfo} /> : <AIAvatar />}
                  {index === response.length - 1 && item.role !== 'user' && loading && <LoadingOutlined />}
                </div>
                <div
                  className='text-sm p-3 rounded-lg relative'
                  style={
                    item.role === 'user'
                      ? {
                          backgroundColor: token.colorPrimary,
                          color: '#FFFFFFD9'
                        }
                      : {
                          backgroundColor: token.colorBgTextActive,
                          color: token.colorText
                        }
                  }
                >
                  {item.role === 'user' ? (
                    item.content
                  ) : (
                    <ReactMarkdown
                      components={{
                        code({ className, children }) {
                          const match = /language-(\w+)/.exec(className || '')
                          const code = String(children).replace(/\n$/, '')
                          return (
                            <div className='relative w-full'>
                              <SyntaxHighlighter
                                style={sysTheme === 'dark' ? oneDark : oneLight}
                                language={match ? match[1] : 'go'}
                              >
                                {code}
                              </SyntaxHighlighter>
                              <CopyOutlined
                                className='absolute top-2 right-2 cursor-pointer text-blue-500'
                                onClick={() => {
                                  navigator.clipboard.writeText(code).then(() => {
                                    message.success('复制成功')
                                  })
                                }}
                              />
                            </div>
                          )
                        }
                      }}
                    >
                      {item.content.replace(/\\n/g, '\n')}
                    </ReactMarkdown>
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
                <SendOutlined className='cursor-pointer' onClick={sendMessage} />
              )
            }
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onPressEnter={sendMessage}
          />
        </div>
      </Drawer>
      <Button icon={<OpenAIOutlined />} type='text' onClick={() => setOpenChat(true)} />
    </>
  )
}
