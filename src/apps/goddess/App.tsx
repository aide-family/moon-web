import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { useMemo } from 'react'
import { antdModalProviderConfig } from '@/utils/antdModalConfig'
import { OAuthTokenHandler } from '@/components/OAuthTokenHandler'
import { AuthGuard } from '@/components/AuthGuard'
import { TokenRefreshHandler } from '@/components/TokenRefreshHandler'
import LayoutComponent from '@/components/layout/Layout'
import LoginPage from '@/pages/main/login'
import { isInMicroApp } from '@/utils'
import { getRouterBasename } from '@/utils/subAppUrl'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { useTheme } from '@/contexts/useTheme'
import { LocaleProvider, useLocale } from '@/contexts/LocaleContext'
import {
  NamespaceProvider,
  NoopNamespaceProvider,
} from '@/contexts/NamespaceContext'
import { getSystemManagementMenuItems } from '@/config/systemManagementMenu'
import {
  convertToMenuItems,
  getAllSubAppConfigs,
  generateRoutes,
  getDefaultPath,
} from '../main/config'

function AppContent() {
  const { themeConfig } = useTheme()
  const { antdLocale, t } = useLocale()
  const inMicroApp = isInMicroApp()

  const appConfig = useMemo(() => getSystemManagementMenuItems(t), [t])
  const menuItems = useMemo(() => convertToMenuItems(appConfig), [appConfig])
  const subAppConfigMap = useMemo(
    () => getAllSubAppConfigs(appConfig),
    [appConfig],
  )
  const routes = useMemo(
    () => generateRoutes(appConfig, subAppConfigMap),
    [appConfig, subAppConfigMap],
  )
  const defaultPath = useMemo(() => getDefaultPath(appConfig), [appConfig])

  const NamespaceWrapper = inMicroApp
    ? NoopNamespaceProvider
    : NamespaceProvider
  return (
    <ConfigProvider
      locale={antdLocale}
      theme={themeConfig}
      modal={antdModalProviderConfig}
    >
      <BrowserRouter basename={getRouterBasename()}>
        <OAuthTokenHandler>
          <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route
              path='/'
              element={
                <NamespaceWrapper>
                  <AuthGuard>
                    <TokenRefreshHandler>
                      {inMicroApp ? (
                        <Outlet />
                      ) : (
                        <LayoutComponent menuItems={menuItems} />
                      )}
                    </TokenRefreshHandler>
                  </AuthGuard>
                </NamespaceWrapper>
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
