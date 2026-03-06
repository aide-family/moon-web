import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { useMemo } from 'react'
import { OAuthTokenHandler } from '@/components/OAuthTokenHandler'
import { AuthGuard } from '@/components/AuthGuard'
import { TokenRefreshHandler } from '@/components/TokenRefreshHandler'
import LayoutComponent from '@/components/layout/Layout'
import LoginPage from '@/pages/main/login'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { LocaleProvider, useLocale } from '@/contexts/LocaleContext'
import { NamespaceProvider } from '@/contexts/NamespaceContext'
import { getAppConfig, convertToMenuItems, getAllSubAppConfigs, getDefaultPath, generateRoutes } from './config'

function AppContent() {
  const { themeConfig } = useTheme()
  const { antdLocale, t } = useLocale()

  const appConfig = useMemo(() => getAppConfig(t), [t])
  const menuItems = useMemo(() => convertToMenuItems(appConfig), [appConfig])
  const subAppConfigMap = useMemo(() => getAllSubAppConfigs(appConfig), [appConfig])
  const defaultPath = useMemo(() => getDefaultPath(appConfig), [appConfig])
  const routes = useMemo(() => generateRoutes(appConfig, subAppConfigMap), [appConfig, subAppConfigMap])

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={themeConfig}
    >
      <BrowserRouter>
        <OAuthTokenHandler>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <NamespaceProvider>
                  <AuthGuard>
                    <TokenRefreshHandler>
                      <LayoutComponent menuItems={menuItems} />
                    </TokenRefreshHandler>
                  </AuthGuard>
                </NamespaceProvider>
              }
            >
                <Route index element={<Navigate to={defaultPath} replace />} />
                {routes}
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

