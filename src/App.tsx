import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import Layout from './components/Layout'
import Login from './pages/auth'
import Dashboard from './pages/dashboard'
import Namespaces from './pages/namespaces'
import EmailConfigs from './pages/email/configs'
import WebhookConfigs from './pages/webhook/configs'
import Templates from './pages/templates'
import Sender from './pages/sender'
import MessageLogs from './pages/message-logs'
import Health from './pages/health'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('auth_token')
  return token ? <>{children}</> : <Navigate to='/login' replace />
}

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route
            path='/'
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path='namespaces' element={<Namespaces />} />
            <Route path='email/configs' element={<EmailConfigs />} />
            <Route path='webhook/configs' element={<WebhookConfigs />} />
            <Route path='templates' element={<Templates />} />
            <Route path='sender' element={<Sender />} />
            <Route path='message-logs' element={<MessageLogs />} />
            <Route path='health' element={<Health />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
