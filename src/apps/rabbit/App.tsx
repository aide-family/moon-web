import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { OAuthTokenHandler } from '@/components/OAuthTokenHandler'
import { AuthGuard } from '@/components/AuthGuard'
import { TokenRefreshHandler } from '@/components/TokenRefreshHandler'
import { FileTextOutlined, ApiOutlined, MessageOutlined, SendOutlined } from '@ant-design/icons'
import TemplateManagement from '@/pages/rabbit/templates'
import EmailManagement from '@/pages/rabbit/emails'
import WebhookManagement from '@/pages/rabbit/webhooks'
import MessageManagement from '@/pages/rabbit/messages'
import SenderManagement from '@/pages/rabbit/sender'
import LayoutComponent, { type MenuItem } from '@/components/layout/Layout'
import LoginPage from '@/pages/main/login'
import { isInMicroApp } from '@/utils'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { LocaleProvider, useLocale } from '@/contexts/LocaleContext'
import { NamespaceProvider, NoopNamespaceProvider } from '@/contexts/NamespaceContext'

function AppContent() {
  const { themeConfig } = useTheme();
  const { antdLocale, t } = useLocale();
  // 检测是否在微服务环境中
  const inMicroApp = isInMicroApp()
  
  // 菜单配置（支持多级菜单）
  const menuItems: MenuItem[] = [
    {
      key: '1',
      icon: <FileTextOutlined />,
      label: t('rabbit.templates.title'),
      path: '/templates',
    },
    {
      key: '2',
      icon: <ApiOutlined />,
      label: t('rabbit.webhooks.title'),
      path: '/webhooks',
    },
    {
      key: '3',
      icon: <MessageOutlined />,
      label: t('rabbit.messages.title'),
      path: '/messages',
    },
    {
      key: '4',
      icon: <SendOutlined />,
      label: t('rabbit.sender.title'),
      path: '/sender',
    },
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
                <Route index element={<Navigate to="/templates" replace />} />
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
