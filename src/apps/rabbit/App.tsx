import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { UserOutlined, VideoCameraOutlined } from '@ant-design/icons'
import Rabbit1 from '@/pages/rabbit/rabbit1'
import LayoutComponent, { type MenuItem } from '@/components/layout/Layout'
import { isInMicroApp } from '@/utils'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { LocaleProvider, useLocale } from '@/contexts/LocaleContext'

// 菜单配置（支持多级菜单）
const menuItems: MenuItem[] = [
  {
    key: '1',
    icon: <UserOutlined />,
    label: 'Rabbit1',
    path: '/rabbit1',
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
      <h2 className='text-2xl font-bold'>Rabbit应用</h2>
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
          <Route
            path="/"
            element={ inMicroApp ? <Outlet /> : <LayoutComponent menuItems={menuItems} header={headerContent} />}
          >
            <Route index element={<Navigate to="/rabbit1" replace />} />
            <Route path="/rabbit1" element={<Rabbit1 />} />
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
