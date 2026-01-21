import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useEffect, useRef } from 'react'
import LayoutComponent, { type MenuItem } from '@/components/layout/Layout'
import { UserOutlined, AppstoreOutlined } from '@ant-design/icons'
import microApp from '@micro-zoe/micro-app'



// 菜单配置
const menuItems: MenuItem[] = [
  {
    key: 'template',
    icon: <AppstoreOutlined />,
    label: '模板应用',
    path: '/template',
  },
  {
    key: 'test',
    icon: <UserOutlined />,
    label: '测试应用',
    path: '/test',
    children: [
      {
        key: 'test1',
        icon: <UserOutlined />,
        label: '测试应用1',
        path: '/test/test1',
      },
      {
        key: 'test2',
        icon: <UserOutlined />,
        label: '测试应用2',
        path: '/test/test2',
      },
    ],
  },
]

// 子应用配置
const subAppConfig = {
  template: {
    name: 'template',
    url: import.meta.env.DEV 
      ? 'http://localhost:5173/' // 开发环境
      : '/template', // 生产环境
  },
  test2: {
    name: 'test2',
    url: import.meta.env.DEV 
      ? 'http://localhost:5174/test2' // 开发环境
      : '/test/test2', // 生产环境
  },
  test1: {
    name: 'test1',
    url: import.meta.env.DEV 
      ? 'http://localhost:5174/test1' // 开发环境
      : '/test/test1', // 生产环境
  },
}

// 子应用容器组件
function SubAppContainer({ appName }: { appName: string}) {
  const navigate = useNavigate()
  const location = useLocation()
  const microAppRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const config = subAppConfig[appName as keyof typeof subAppConfig]
    
    // 监听子应用发送的数据
    const handleData = (data: { type?: string; data?: { app?: string; path?: string }; pathname?: string; [key: string]: unknown }) => {
      if (data.type === 'navigate' && data.data) {
        // 处理子应用之间的跳转
        const targetApp = data.data.app
        const targetPath = data.data.path || '/'
        if (targetApp) {
          navigate(`/${targetApp}${targetPath}`)
        }
      } else if (data.type === 'route-change') {
        // 处理子应用内部路由变化
        const subPath = data.pathname || '/'
        const currentSubPath = location.pathname.replace(`/${appName}`, '') || '/'
        if (subPath !== currentSubPath) {
          navigate(`/${appName}${subPath}`)
        }
      }
    }

    // 使用 micro-app 的数据通信
    microApp.setData(config.name, {
      basePath: `/${appName}`,
      currentPath: location.pathname.replace(`/${appName}`, '') || '/',
    })

    // 监听数据变化
    const dataListener = (data: { type?: string; data?: { app?: string; path?: string }; pathname?: string; [key: string]: unknown }) => {
      handleData(data)
    }

    microApp.addDataListener(config.name, dataListener)

    return () => {
      microApp.removeDataListener(config.name, dataListener)
    }
  }, [appName, navigate, location.pathname])

  // 向子应用传递当前路由和 baseroute
  useEffect(() => {
    const config = subAppConfig[appName as keyof typeof subAppConfig]
    const subPath = location.pathname.replace(`/${appName}`, '') || '/'
    
    // 设置 baseroute 到 window，以便子应用可以获取
    if (typeof window !== 'undefined') {
      const win = window as Window & { __MICRO_APP_BASE_ROUTE__?: string }
      win.__MICRO_APP_BASE_ROUTE__ = `/${appName}`
    }
    
    microApp.setData(config.name, { 
      basePath: `/${appName}`,
      baseroute: `/${appName}`,
      currentPath: subPath,
    })
  }, [location.pathname, appName])

  const config = subAppConfig[appName as keyof typeof subAppConfig]

  return (
    <div>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore - micro-app 是自定义元素 */}
      <micro-app
        ref={microAppRef}
        name={config.name}
        url={config.url}
        iframe
      />
    </div>
  )
}

function App() {
  const headerContent = (
    <div className='flex items-center'>
      <h2 className='text-2xl font-bold'>主应用</h2>
    </div>
  )

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: { colorPrimary: '#6c34e6' },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<LayoutComponent menuItems={menuItems} header={headerContent} />}
          >
            <Route index element={<Navigate to="/template" replace />} />
            <Route path="/template/*" element={<SubAppContainer appName="template" />} />
            <Route path="/test/test1" element={<SubAppContainer appName="test1" />} />
            <Route path="/test/test2" element={<SubAppContainer appName="test2" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App

