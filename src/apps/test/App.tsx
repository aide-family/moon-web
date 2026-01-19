import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { ConfigProvider, Button } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { UserOutlined, VideoCameraOutlined, UploadOutlined } from '@ant-design/icons'
import { useEffect } from 'react'
import Test1 from '@/pages/test/test1'
import Test2 from '@/pages/test/test2'
import LayoutComponent, { type MenuItem } from '@/components/layout/Layout'
import { navigateToSubApp, listenToMainApp, removeMainAppListener, getBaseRoute } from '@/utils/microApp'

// 菜单配置（支持多级菜单）
const menuItems: MenuItem[] = [
  {
    key: '1',
    icon: <UserOutlined />,
    label: 'Test1',
    path: '/test1',
  },
  {
    key: '2',
    icon: <VideoCameraOutlined />,
    label: 'Test2',
    path: '/test2',
  },
  {
    key: '3',
    icon: <UploadOutlined />,
    label: '跳转到模板应用',
    children: [
      {
        key: '3-1',
        label: 'Template1',
        path: '/template1',
      },
      {
        key: '3-2',
        label: 'Template2',
        path: '/template2',
      },
    ],
  },
]

// 路由同步组件
function RouteSync() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // 监听主应用的路由变化
    const handleData = (data: { currentPath?: string; [key: string]: unknown }) => {
      if (data.currentPath && data.currentPath !== location.pathname) {
        navigate(data.currentPath)
      }
    }

    listenToMainApp(handleData)

    // 通知主应用路由变化
    const win = window as Window & { microApp?: { dispatch: (data: { type: string; pathname: string }) => void } }
    if (win.microApp) {
      win.microApp.dispatch({
        type: 'route-change',
        pathname: location.pathname,
      })
    }

    return () => {
      removeMainAppListener(handleData)
    }
  }, [navigate, location.pathname])

  return null
}

function App() {
  // 获取 baseroute，如果没有则使用空字符串（独立运行）
  const baseRoute = getBaseRoute() || ''
  
  // 调试：输出 baseroute
  useEffect(() => {
    console.log('Test App - baseRoute:', baseRoute)
    console.log('Test App - location.pathname:', window.location.pathname)
    console.log('Test App - window.__MICRO_APP_BASE_ROUTE__:', (window as Window & { __MICRO_APP_BASE_ROUTE__?: string }).__MICRO_APP_BASE_ROUTE__)
  }, [baseRoute])
  
  // 头部组件示例
  const headerContent = (
    <div className='flex items-center justify-between w-full'>
      <h2 className='text-2xl font-bold'>测试应用</h2>
      <div>
        <Button 
          type="link" 
          onClick={() => navigateToSubApp('template', '/template1')}
          style={{ marginRight: '10px' }}
        >
          跳转到模板应用 - Template1
        </Button>
        <Button 
          type="link" 
          onClick={() => navigateToSubApp('template', '/template2')}
        >
          跳转到模板应用 - Template2
        </Button>
      </div>
    </div>
  )

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: { colorPrimary: '#6c34e6' },
      }}
    >
      <BrowserRouter basename={baseRoute}>
        <RouteSync />
        <Routes>
          <Route
            path="/"
            element={<LayoutComponent menuItems={menuItems} header={headerContent} />}
          >
            <Route index element={<Navigate to="/test1" replace />} />
            <Route path="/test1" element={<Test1 />} />
            <Route path="/test2" element={<Test2 />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
