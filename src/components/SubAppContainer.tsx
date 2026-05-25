import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import microApp from '@micro-zoe/micro-app'
import { useLocale } from '@/contexts/LocaleContext'
import { useTheme } from '@/contexts/useTheme'
import type { SubAppConfig } from '@/types/subApp'

export interface SubAppContainerProps {
  appName: string
  subAppConfigMap: Record<string, SubAppConfig>
}

/**
 * 微前端子应用容器，主应用与子系统（rabbit、goddess）均可使用
 */
export function SubAppContainer({
  appName,
  subAppConfigMap,
}: SubAppContainerProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const microAppRef = useRef<HTMLElement>(null)
  const { locale } = useLocale()
  const { themeMode } = useTheme()

  const config = subAppConfigMap[appName]
  const url = config
    ? import.meta.env.DEV
      ? config.devUrl
      : config.prodUrl
    : ''

  useEffect(() => {
    if (!config) return
    const handleData = (data: {
      type?: string
      data?: { app?: string; path?: string }
      pathname?: string
      [key: string]: unknown
    }) => {
      if (data.type === 'navigate' && data.data) {
        const targetApp = data.data.app
        const targetPath = data.data.path || '/'
        if (targetApp) navigate(`/${targetApp}${targetPath}`)
      } else if (data.type === 'route-change') {
        const subPath = data.pathname || '/'
        const currentSubPath = location.pathname.replace(config.path, '') || '/'
        if (subPath !== currentSubPath) navigate(`${config.path}${subPath}`)
      }
    }
    microApp.setData(config.name, {
      basePath: config.path,
      currentPath: location.pathname.replace(config.path, '') || '/',
      locale,
      theme: themeMode,
    })
    const dataListener = (data: {
      type?: string
      data?: { app?: string; path?: string }
      pathname?: string
      [key: string]: unknown
    }) => {
      handleData(data)
    }
    microApp.addDataListener(config.name, dataListener)
    return () => {
      microApp.removeDataListener(config.name, dataListener)
    }
  }, [config, navigate, location.pathname, locale, themeMode])

  useEffect(() => {
    if (!config) return
    const subPath = location.pathname.replace(config.path, '') || '/'
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

  useEffect(() => {
    if (!config) return
    microApp.setData(config.name, { locale, theme: themeMode })
  }, [locale, themeMode, config])

  if (!config) {
    return <div>子应用配置不存在: {appName}</div>
  }

  return (
    <div className='h-full w-full'>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore - micro-app 是自定义元素 */}
      <micro-app ref={microAppRef} name={config.name} url={url} iframe />
    </div>
  )
}
