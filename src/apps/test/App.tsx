import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { UserOutlined, VideoCameraOutlined } from '@ant-design/icons'
import Test1 from '@/pages/test/test1'
import Test2 from '@/pages/test/test2'
import LayoutComponent, { type MenuItem } from '@/components/layout/Layout'
import LoginPage from '@/pages/main/login'
import { isInMicroApp } from '@/utils'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { LocaleProvider, useLocale } from '@/contexts/LocaleContext'

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

function AppContent() {
  const { themeConfig } = useTheme();
  const { antdLocale } = useLocale();
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
      locale={antdLocale}
      theme={themeConfig}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
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

function App() {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </LocaleProvider>
  )
}

export default App
