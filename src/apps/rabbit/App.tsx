import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { OAuthTokenHandler } from '@/components/OAuthTokenHandler'
import { UserOutlined, FileTextOutlined, ApiOutlined, MessageOutlined, SendOutlined } from '@ant-design/icons'
import Rabbit1 from '@/pages/rabbit/rabbit1'
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

function AppContent() {
  const { themeConfig } = useTheme();
  const { antdLocale, t } = useLocale();
  // 检测是否在微服务环境中
  const inMicroApp = isInMicroApp()
  
  // 菜单配置（支持多级菜单）
  const menuItems: MenuItem[] = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: 'Rabbit1',
      path: '/rabbit1',
    },
    {
      key: '2',
      icon: <FileTextOutlined />,
      label: t('rabbit.templates.title'),
      path: '/templates',
    },
    {
      key: '3',
      icon: <ApiOutlined />,
      label: t('rabbit.webhooks.title'),
      path: '/webhooks',
    },
    {
      key: '4',
      icon: <MessageOutlined />,
      label: t('rabbit.messages.title'),
      path: '/messages',
    },
    {
      key: '5',
      icon: <SendOutlined />,
      label: t('rabbit.sender.title'),
      path: '/sender',
    },
  ]
  
  // 头部组件示例
  const headerContent = (
    <div className='flex items-center justify-between w-full'>
      <h2 className='text-2xl font-bold'>Rabbit应用</h2>
      <div>
      </div>
    </div>
  )

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
            element={ inMicroApp ? <Outlet /> : <LayoutComponent menuItems={menuItems} header={headerContent} />}
          >
            <Route index element={<Navigate to="/rabbit1" replace />} />
            <Route path="/rabbit1" element={<Rabbit1 />} />
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
