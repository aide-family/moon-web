import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { OAuthTokenHandler } from '@/components/OAuthTokenHandler'
import { AuthGuard } from '@/components/AuthGuard'
import { TokenRefreshHandler } from '@/components/TokenRefreshHandler'
import NamespaceList from '@/pages/goddess/namespaces'
import UsersList from '@/pages/goddess/users'
import MembersList from '@/pages/goddess/members'
import ProfilePage from '@/pages/main/profile'
import LayoutComponent from '@/components/layout/Layout'
import LoginPage from '@/pages/main/login'
import { isInMicroApp } from '@/utils'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { LocaleProvider, useLocale } from '@/contexts/LocaleContext'
import { NamespaceProvider, NoopNamespaceProvider } from '@/contexts/NamespaceContext'
import { getSystemManagementMenuItems } from '@/config/systemManagementMenu'

function AppContent() {
  const { themeConfig } = useTheme();
  const { antdLocale, t } = useLocale();
  const inMicroApp = isInMicroApp()
  const menuItems = getSystemManagementMenuItems(t)


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
                <Route path="/profile" element={<ProfilePage />} />
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
