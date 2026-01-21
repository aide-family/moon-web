import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { UserOutlined, VideoCameraOutlined } from '@ant-design/icons'
import Template1 from '@/pages/template/template1'
import Template2 from '@/pages/template/template2'
import LayoutComponent, { type MenuItem } from '@/components/layout/Layout'
import { isInMicroApp } from '@/utils'

// 菜单配置（支持多级菜单）
const menuItems: MenuItem[] = [
  {
    key: '1',
    icon: <UserOutlined />,
    label: 'Template1',
    path: '/template1',
  },
  {
    key: '2',
    icon: <VideoCameraOutlined />,
    label: 'Template2',
    path: '/template2',
  },
]



function App() {
  // 检测是否在微服务环境中
  const inMicroApp = isInMicroApp()
  
  // 头部组件示例
  const headerContent = (
    <div className='flex items-center justify-between w-full'>
      <h2 className='text-2xl font-bold'>模板应用</h2>
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
            <Route index element={<Navigate to="/template1" replace />} />
            <Route path="/template1" element={<Template1 />} />
            <Route path="/template2" element={<Template2 />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
