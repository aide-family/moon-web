import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { OAuthTokenHandler } from '@/components/OAuthTokenHandler'
import { AuthGuard } from '@/components/AuthGuard'
import { TokenRefreshHandler } from '@/components/TokenRefreshHandler'
import { FileTextOutlined, ApiOutlined, MessageOutlined, SendOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import TemplateManagement from '@/pages/rabbit/templates'
import EmailManagement from '@/pages/rabbit/emails'
import WebhookManagement from '@/pages/rabbit/webhooks'
import MessageManagement from '@/pages/rabbit/messages'
import SenderManagement from '@/pages/rabbit/sender'
import NamespaceList from '@/pages/goddess/namespaces'
import UsersList from '@/pages/goddess/users'
import MembersList from '@/pages/goddess/members'
import ProfilePage from '@/pages/main/profile'
import LayoutComponent, { type MenuItem } from '@/components/layout/Layout'
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
  // 每个系统都包含系统管理菜单 + 本系统业务菜单
  const menuItems: MenuItem[] = [
    {
      key: 'rabbit-templates',
      icon: <FileTextOutlined />,
      label: t('rabbit.templates.title'),
      path: '/templates',
    },
    {
      key: 'rabbit-emails',
      icon: <MailOutlined />,
      label: t('menu.rabbitEmails'),
      path: '/emails',
    },
    {
      key: 'rabbit-webhooks',
      icon: <ApiOutlined />,
      label: t('rabbit.webhooks.title'),
      path: '/webhooks',
    },
    {
      key: 'rabbit-messages',
      icon: <MessageOutlined />,
      label: t('rabbit.messages.title'),
      path: '/messages',
    },
    {
      key: 'rabbit-sender',
      icon: <SendOutlined />,
      label: t('rabbit.sender.title'),
      path: '/sender',
    },
    {
      key: 'rabbit-goddess',
      icon: <UserOutlined />,
      label: t('menu.goddess'),
      path: '/rabbit/goddess',
      children: [...getSystemManagementMenuItems(t),
      ],
    }
  ]
  

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
                <Route path="/templates" element={<TemplateManagement />} />
                <Route path="/emails" element={<EmailManagement />} />
                <Route path="/webhooks" element={<WebhookManagement />} />
                <Route path="/messages" element={<MessageManagement />} />
                <Route path="/sender" element={<SenderManagement />} />
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
