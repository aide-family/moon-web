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
import {
  FileTextOutlined,
  ApiOutlined,
  MessageOutlined,
  SendOutlined,
  MailOutlined,
  UserOutlined,
  TeamOutlined,
  BellOutlined,
} from '@ant-design/icons'
import TemplateManagement from '@/pages/rabbit/templates'
import EmailManagement from '@/pages/rabbit/emails'
import WebhookManagement from '@/pages/rabbit/webhooks'
import MessageManagement from '@/pages/rabbit/messages'
import SenderManagement from '@/pages/rabbit/sender'
import RecipientGroupsPage from '@/pages/rabbit/recipient-groups'
import AlertSubscriptionsPage from '@/pages/rabbit/alert-subscriptions'
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
import { getSystemManagementMenuItems } from '@/config/systemManagementMenu'
import {
  type AppConfigItem,
  convertToMenuItems,
  getAllSubAppConfigs,
  generateRoutes,
  getDefaultPath,
} from '../main/config'

function getRabbitAppConfig(t: (key: string) => string): AppConfigItem[] {
  return [
    {
      key: 'rabbit-templates',
      icon: <FileTextOutlined />,
      label: t('rabbit.templates.title'),
      path: '/templates',
      element: <TemplateManagement />,
    },
    {
      key: 'rabbit-emails',
      icon: <MailOutlined />,
      label: t('menu.rabbitEmails'),
      path: '/emails',
      element: <EmailManagement />,
    },
    {
      key: 'rabbit-webhooks',
      icon: <ApiOutlined />,
      label: t('rabbit.webhooks.title'),
      path: '/webhooks',
      element: <WebhookManagement />,
    },
    {
      key: 'rabbit-sender',
      icon: <SendOutlined />,
      label: t('rabbit.sender.title'),
      path: '/sender',
      element: <SenderManagement />,
    },
    {
      key: 'rabbit-recipient-groups',
      icon: <TeamOutlined />,
      label: t('menu.rabbitRecipientGroups'),
      path: '/recipient-groups',
      element: <RecipientGroupsPage />,
    },
    {
      key: 'rabbit-alert-subscriptions',
      icon: <BellOutlined />,
      label: t('menu.rabbitAlertSubscriptions'),
      path: '/alert-subscriptions',
      element: <AlertSubscriptionsPage />,
    },
    {
      key: 'rabbit-messages',
      icon: <MessageOutlined />,
      label: t('rabbit.messages.title'),
      path: '/messages',
      element: <MessageManagement />,
    },
    {
      key: 'rabbit-goddess',
      icon: <UserOutlined />,
      label: t('menu.goddess'),
      path: '/rabbit/goddess',
      children: [...getSystemManagementMenuItems(t)],
    },
  ]
}

function AppContent() {
  const { themeConfig } = useTheme()
  const { antdLocale, t } = useLocale()
  const inMicroApp = isInMicroApp()

  const appConfig = useMemo(() => getRabbitAppConfig(t), [t])
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
