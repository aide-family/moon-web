import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { ConfigProvider, Button } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useEffect } from 'react'
import Template1 from '@/pages/template/template1'
import Template2 from '@/pages/template/template2'
import { navigateToSubApp, listenToMainApp, removeMainAppListener, getBaseRoute } from '@/utils/microApp'

// 路由同步组件
function RouteSync() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // 监听主应用的路由变化
    const handleData = (data: any) => {
      if (data.currentPath && data.currentPath !== location.pathname) {
        navigate(data.currentPath)
      }
    }

    listenToMainApp(handleData)

    // 通知主应用路由变化
    if (window.microApp) {
      window.microApp.dispatch({
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
  const baseRoute = getBaseRoute()

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: { colorPrimary: '#6c34e6' },
      }}
    >
      <BrowserRouter basename={baseRoute}>
        <RouteSync />
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <Link to='/template1' style={{ marginRight: '10px' }}>Template1</Link>
            <Link to='/template2' style={{ marginRight: '10px' }}>Template2</Link>
            <Button 
              type="link" 
              onClick={() => navigateToSubApp('test', '/test1')}
              style={{ marginRight: '10px' }}
            >
              跳转到测试应用 - Test1
            </Button>
            <Button 
              type="link" 
              onClick={() => navigateToSubApp('test', '/test2')}
            >
              跳转到测试应用 - Test2
            </Button>
          </div>
          <Routes>
            <Route index element={<Navigate to='/template1' replace />} />
            <Route path='/template1' element={<Template1 />} />
            <Route path='/template2' element={<Template2 />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
