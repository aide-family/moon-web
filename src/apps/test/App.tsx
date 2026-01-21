import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { UserOutlined, VideoCameraOutlined } from '@ant-design/icons'
import Test1 from '@/pages/test/test1'
import Test2 from '@/pages/test/test2'
import LayoutComponent, { type MenuItem } from '@/components/layout/Layout'

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
]

/**
 * 检测是否在微服务环境中
 */
function isInMicroApp(): boolean {
  // 检查 window.microApp 是否存在（micro-app 注入的全局对象）
  const win = window as Window & { 
    microApp?: unknown
    __MICRO_APP_BASE_ROUTE__?: string
  }
  
  // 方式1：检查 microApp 对象
  if (win.microApp) {
    return true
  }
  
  // 方式2：检查 __MICRO_APP_BASE_ROUTE__（主应用设置的标识）
  if (win.__MICRO_APP_BASE_ROUTE__) {
    return true
  }
  
  // 方式3：检查是否在 iframe 中（micro-app 使用 iframe 模式）
  try {
    if (window.self !== window.top || window.parent !== window) {
      return true
    }
  } catch {
    // 跨域情况下会抛出异常，说明在 iframe 中
    return true
  }
  
  return false
}

function App() {
  // 检测是否在微服务环境中
  const inMicroApp = isInMicroApp()
  
  // 头部组件示例
  const headerContent = (
    <div className='flex items-center justify-between w-full'>
      <h2 className='text-2xl font-bold'>测试应用</h2>
      <div>
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
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={ inMicroApp ? <Outlet /> : <LayoutComponent menuItems={menuItems} header={headerContent} />}
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
