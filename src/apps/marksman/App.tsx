import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { useMemo } from 'react'
import { OAuthTokenHandler } from '@/components/OAuthTokenHandler'
import { AuthGuard } from '@/components/AuthGuard'
import { TokenRefreshHandler } from '@/components/TokenRefreshHandler'
import LayoutComponent from '@/components/layout/Layout'
import LoginPage from '@/pages/main/login'
import { isInMicroApp } from '@/utils'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { useTheme } from '@/contexts/useTheme'
import { LocaleProvider, useLocale } from '@/contexts/LocaleContext'
import {
  NamespaceProvider,
  NoopNamespaceProvider,
} from '@/contexts/NamespaceContext'
import {
  HddOutlined,
  BellOutlined,
  ThunderboltOutlined,
  AlertOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { getSystemManagementMenuItems } from '@/config/systemManagementMenu'
import {
  convertToMenuItems,
  getAllSubAppConfigs,
  generateRoutes,
  getDefaultPath,
} from '../main/config'
import type { AppConfigItem } from '../main/config'
import DatasourceListWrapper from '@/pages/marksman/datasources'
import StrategyListWrapper from '@/pages/marksman/strategies'
import StrategyDetailPage from '@/pages/marksman/strategies/detail'
import LevelListWrapper from '@/pages/marksman/levels'
import RealtimeAlertListWrapper from '@/pages/marksman/realtime-alerts'
import NotificationGroupListWrapper from '@/pages/marksman/notification-groups'

function AppContent() {
  const { themeConfig } = useTheme()
  const { antdLocale, t } = useLocale()
  const inMicroApp = isInMicroApp()

  const appConfig = useMemo(
    (): AppConfigItem[] => [
      {
        key: 'realtime-alerts',
        icon: <AlertOutlined />,
        label: t('menu.realtimeAlerts'),
        path: '/realtime-alerts',
        element: <RealtimeAlertListWrapper />,
      },
      {
        key: 'datasources',
        icon: <HddOutlined />,
        label: t('menu.datasources'),
        path: '/datasources',
        element: <DatasourceListWrapper />,
      },
      {
        key: 'strategies',
        icon: <ThunderboltOutlined />,
        label: t('menu.strategies'),
        path: '/strategies',
        element: <StrategyListWrapper />,
      },
      {
        key: 'levels',
        icon: <BellOutlined />,
        label: t('menu.levels'),
        path: '/levels',
        element: <LevelListWrapper />,
      },
      {
        key: 'notification-groups',
        icon: <BellOutlined />,
        label: t('menu.notificationGroups'),
        path: '/notification-groups',
        element: <NotificationGroupListWrapper />,
      },
      {
        key: 'marksman-goddess',
        icon: <UserOutlined />,
        label: t('menu.goddess'),
        path: '/marksman/goddess',
        children: [...getSystemManagementMenuItems(t)],
      },
    ],
    [t],
  )
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
    <ConfigProvider locale={antdLocale} theme={themeConfig}>
      <BrowserRouter>
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
              <Route path='/strategies/:uid' element={<StrategyDetailPage />} />
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
