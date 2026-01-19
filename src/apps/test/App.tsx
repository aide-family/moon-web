import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { UserOutlined, VideoCameraOutlined, UploadOutlined } from '@ant-design/icons'
import Test1 from '@/pages/test/test1'
import Test2 from '@/pages/test/test2'
import LayoutComponent, { type MenuItem } from '@/components/layout/Layout'
import Template1 from '@/pages/template/template1'
import Template2 from '@/pages/template/template2'

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
    label: '多级菜单',
    children: [
      {
        key: '3-1',
        label: '子菜单1',
        path: '/template1', // 可以指向已有路由
      },
      {
        key: '3-2',
        label: '子菜单2',
        path: '/template2',
      },
    ],
  },
]

function App() {
  // 头部组件示例
  const headerContent = (
    <div className='flex items-center'>
      <h2 className='text-2xl font-bold'>测试应用</h2>
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
            <Route index element={<Navigate to="/test1" replace />} />
            <Route path="/test1" element={<Test1 />} />
            <Route path="/test2" element={<Test2 />} />
            <Route path="/template1" element={<Template1 />} />
            <Route path="/template2" element={<Template2 />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
