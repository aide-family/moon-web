import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { useEffect, useRef, useMemo } from 'react'
import React from 'react'
import { OAuthTokenHandler } from '@/components/OAuthTokenHandler'
import { AuthGuard } from '@/components/AuthGuard'
import LayoutComponent from '@/components/layout/Layout'
import LoginPage from '@/pages/main/login'
import microApp from '@micro-zoe/micro-app'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { LocaleProvider, useLocale } from '@/contexts/LocaleContext'
import { NamespaceProvider } from '@/contexts/NamespaceContext'
import { 
  getAppConfig, 
  convertToMenuItems, 
  getAllSubAppConfigs, 
  getDefaultPath
} from './config'

// 子应用容器组件
function SubAppContainer({ 
  appName, 
  subAppConfigMap 
}: { 
  appName: string
  subAppConfigMap: Record<string, { name: string; devUrl: string; prodUrl: string; path: string }>
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const microAppRef = useRef<HTMLElement>(null)
  const { locale } = useLocale()
  const { themeMode } = useTheme()

  // 从配置中获取子应用配置
  const config = subAppConfigMap[appName]
  
  // 根据环境获取 URL
  const url = config ? (import.meta.env.DEV ? config.devUrl : config.prodUrl) : ''

  useEffect(() => {
    // 如果配置不存在，直接返回
    if (!config) {
      return
    }
    // 监听子应用发送的数据
    const handleData = (data: { type?: string; data?: { app?: string; path?: string }; pathname?: string; [key: string]: unknown }) => {
      if (data.type === 'navigate' && data.data) {
        // 处理子应用之间的跳转
        const targetApp = data.data.app
        const targetPath = data.data.path || '/'
        if (targetApp) {
          navigate(`/${targetApp}${targetPath}`)
        }
      } else if (data.type === 'route-change') {
        // 处理子应用内部路由变化
        const subPath = data.pathname || '/'
        const currentSubPath = location.pathname.replace(config.path, '') || '/'
        if (subPath !== currentSubPath) {
          navigate(`${config.path}${subPath}`)
        }
      }
    }

    // 使用 micro-app 的数据通信（包含初始语言、主题）
    microApp.setData(config.name, {
      basePath: config.path,
      currentPath: location.pathname.replace(config.path, '') || '/',
      locale,
      theme: themeMode,
    })

    // 监听数据变化
    const dataListener = (data: { type?: string; data?: { app?: string; path?: string }; pathname?: string; [key: string]: unknown }) => {
      handleData(data)
    }

    microApp.addDataListener(config.name, dataListener)

    return () => {
      if (config) {
        microApp.removeDataListener(config.name, dataListener)
      }
    }
  }, [config, navigate, location.pathname, locale, themeMode])

  // 向子应用传递当前路由和 baseroute
  useEffect(() => {
    if (!config) {
      return
    }
    
    const subPath = location.pathname.replace(config.path, '') || '/'
    
    // 设置 baseroute 到 window，以便子应用可以获取
    if (typeof window !== 'undefined') {
      const win = window as Window & { __MICRO_APP_BASE_ROUTE__?: string }
      win.__MICRO_APP_BASE_ROUTE__ = config.path
    }
    
    microApp.setData(config.name, {
      basePath: config.path,
      baseroute: config.path,
      currentPath: subPath,
      locale,
      theme: themeMode,
    })
  }, [location.pathname, config, locale, themeMode])

  // 向子应用传递语言、主题（变化时立即更新，子应用无需刷新）
  useEffect(() => {
    if (!config) {
      return
    }
    microApp.setData(config.name, {
      locale,
      theme: themeMode,
    })
  }, [locale, themeMode, config])

  // 如果配置不存在，返回错误提示
  if (!config) {
    return <div>子应用配置不存在: {appName}</div>
  }

  return (
    <div className="h-full w-full">
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore - micro-app 是自定义元素 */}
      <micro-app
        ref={microAppRef}
        name={config.name}
        url={url}
        iframe
      />
    </div>
  )
}

/**
 * 占位页面组件（用于没有子应用的菜单项）
 */
function PlaceholderPage({ label, path }: { label: string; path: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">{label}</h2>
        <p className="text-gray-500">路径: {path}</p>
        <p className="text-gray-400 mt-2">该菜单项暂未配置子应用</p>
      </div>
    </div>
  )
}

/**
 * 递归生成路由
 */
function generateRoutes(
  config: Array<{
    key: string
    label: string
    path?: string
    subApp?: { name: string; devUrl: string; prodUrl: string; path: string }
    element?: React.ReactNode
    children?: Array<any>
  }>,
  subAppConfigMap: Record<string, { name: string; devUrl: string; prodUrl: string; path: string }>
): React.ReactNode[] {
  const routes: React.ReactNode[] = []
  
  function traverse(items: typeof config) {
    for (const item of items) {
      // 如果有路径，生成路由
      if (item.path) {
        if (item.subApp) {
          // 有子应用配置，使用 SubAppContainer
          routes.push(
            <Route 
              key={item.subApp.name} 
              path={item.path} 
              element={<SubAppContainer appName={item.subApp.name} subAppConfigMap={subAppConfigMap} />} 
            />
          )
        } else if (item.element) {
          // 直接指定了 element，使用指定的组件
          routes.push(
            <Route 
              key={item.key} 
              path={item.path} 
              element={item.element} 
            />
          )
        } else if (!item.children) {
          // 没有子应用配置、没有 element 且没有子菜单，使用占位页面
          routes.push(
            <Route 
              key={item.key} 
              path={item.path} 
              element={<PlaceholderPage label={item.label} path={item.path} />} 
            />
          )
        }
      }
      // 递归处理子菜单
      if (item.children) {
        traverse(item.children)
      }
    }
  }
  
  traverse(config)
  return routes
}

function AppContent() {
  const { themeConfig } = useTheme();
  const { antdLocale, t } = useLocale();

  // 获取应用配置（支持国际化）
  const appConfig = useMemo(() => getAppConfig(t), [t]);
  
  // 从配置生成菜单项
  const menuItems = useMemo(() => convertToMenuItems(appConfig), [appConfig]);

  // 获取所有子应用配置
  const subAppConfigMap = useMemo(() => getAllSubAppConfigs(appConfig), [appConfig]);

  // 获取默认路径
  const defaultPath = useMemo(() => getDefaultPath(appConfig), [appConfig]);

  // 动态生成路由
  const routes = useMemo(() => generateRoutes(appConfig, subAppConfigMap), [appConfig, subAppConfigMap])

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={themeConfig}
    >
      <BrowserRouter>
        <NamespaceProvider>
          <OAuthTokenHandler>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <AuthGuard>
                    <LayoutComponent menuItems={menuItems} />
                  </AuthGuard>
                }
              >
                <Route index element={<Navigate to={defaultPath} replace />} />
                {routes}
              </Route>
            </Routes>
          </OAuthTokenHandler>
        </NamespaceProvider>
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

