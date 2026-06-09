import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom'
import { App as AntdApp, ConfigProvider } from 'antd'
import { useMemo } from 'react'
import { antdModalProviderConfig } from '@/utils/antdModalConfig'
import {
  ApiOutlined,
  AuditOutlined,
  ClusterOutlined,
  UserOutlined,
} from '@ant-design/icons'
import LayoutComponent from '@/components/layout/Layout'
import LoginPage from '@/pages/main/login'
import { OAuthTokenHandler } from '@/components/OAuthTokenHandler'
import { AuthGuard } from '@/components/AuthGuard'
import { TokenRefreshHandler } from '@/components/TokenRefreshHandler'
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
  generateRoutes,
  getAllSubAppConfigs,
  getDefaultPath,
  type AppConfigItem,
} from '../main/config'
import SSHCommandsPage from '@/pages/jade_tree/ssh-commands'
import AuditsPage from '@/pages/jade_tree/audits'
import ProbeTasksPage from '@/pages/jade_tree/probe-tasks'
import MachinesPage from '@/pages/jade_tree/machines'

const getJadeTreeConfig = (t: (key: string) => string): AppConfigItem[] => [
  {
    key: 'jade-tree-ssh-commands',
    icon: <ClusterOutlined />,
    label: t('menu.jadeTreeCommands'),
    path: '/ssh-commands',
    element: <SSHCommandsPage />,
  },
  {
    key: 'jade-tree-audits',
    icon: <AuditOutlined />,
    label: t('menu.jadeTreeAudits'),
    path: '/audits',
    element: <AuditsPage />,
  },
  {
    key: 'jade-tree-probes',
    icon: <ApiOutlined />,
    label: t('menu.jadeTreeProbes'),
    path: '/probe-tasks',
    element: <ProbeTasksPage />,
  },
  {
    key: 'jade-tree-machines',
    icon: <ClusterOutlined />,
    label: t('menu.jadeTreeMachines'),
    path: '/machines',
    element: <MachinesPage />,
  },
  {
    key: 'jade-tree-goddess',
    icon: <UserOutlined />,
    label: t('menu.goddess'),
    path: '/jade-tree/goddess',
    children: [...getSystemManagementMenuItems(t)],
  },
]

function AppContent() {
  const { themeConfig } = useTheme()
  const { antdLocale, t } = useLocale()
  const inMicroApp = isInMicroApp()
  const appConfig = useMemo(() => getJadeTreeConfig(t), [t])
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
      <AntdApp>
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
      </AntdApp>
    </ConfigProvider>
  )
}

export default function JadeTreeApp() {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </LocaleProvider>
  )
}
