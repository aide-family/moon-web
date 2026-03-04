import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { OAuthTokenHandler } from '@/components/OAuthTokenHandler'
import { AuthGuard } from '@/components/AuthGuard'
import { TokenRefreshHandler } from '@/components/TokenRefreshHandler'
import { UserOutlined,  DatabaseOutlined, UsergroupAddOutlined } from '@ant-design/icons'
import NamespaceList from '@/pages/goddess/namespaces'
import UsersList from '@/pages/goddess/users'
import MembersList from '@/pages/goddess/members'
import LayoutComponent, { type MenuItem } from '@/components/layout/Layout'
import LoginPage from '@/pages/main/login'
import { isInMicroApp } from '@/utils'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { LocaleProvider, useLocale } from '@/contexts/LocaleContext'
import { NamespaceProvider, NoopNamespaceProvider } from '@/contexts/NamespaceContext'

// 菜单配置（支持多级菜单）：命名空间 + 原 test 子页
const menuItems: MenuItem[] = [
  {
    key: 'namespaces',
    icon: <DatabaseOutlined />,
    label: '命名空间',
    path: '/namespaces',
  },
  {
    key: 'users',
    icon: <UserOutlined />,
    label: '用户管理',
    path: '/users',
  },
  {
    key: 'members',
    icon: <UsergroupAddOutlined />,
    label: '成员管理',
    path: '/members',
  },
]

function AppContent() {
  const { themeConfig } = useTheme();
  const { antdLocale } = useLocale();
  // 检测是否在微服务环境中
  const inMicroApp = isInMicroApp()


  const NamespaceWrapper = inMicroApp ? NoopNamespaceProvider : NamespaceProvider
  return (
    <ConfigProvider locale={antdLocale} theme={themeConfig}>
      <BrowserRouter>
        <OAuthTokenHandler>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <NamespaceWrapper>
                  <AuthGuard>
                    <TokenRefreshHandler>
                      {inMicroApp ? <Outlet /> : <LayoutComponent menuItems={menuItems} />}
                    </TokenRefreshHandler>
                  </AuthGuard>
                </NamespaceWrapper>
              }
            >
                <Route index element={<Navigate to="/namespaces" replace />} />
                <Route path="/namespaces" element={<NamespaceList />} />
                <Route path="/users" element={<UsersList />} />
                <Route path="/members" element={<MembersList />} />
              </Route>
            </Routes>
          </OAuthTokenHandler>
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
