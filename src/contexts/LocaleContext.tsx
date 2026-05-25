import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import zhCN from 'antd/locale/zh_CN'
import enUS from 'antd/locale/en_US'
import type { Locale } from 'antd/es/locale'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'
import { resources } from '@/locales'
import { isInMicroApp } from '@/utils'

export type LocaleType = 'zh-CN' | 'en-US'

interface LocaleContextType {
  locale: LocaleType
  antdLocale: Locale
  setLocale: (locale: LocaleType) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

const LOCALE_STORAGE_KEY = 'app-locale'

// 获取默认语言（从localStorage或浏览器偏好）
const getDefaultLocale = (): LocaleType => {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as LocaleType
  if (stored === 'zh-CN' || stored === 'en-US') {
    return stored
  }
  // 检查浏览器语言偏好
  const browserLang =
    navigator.language ||
    (navigator as unknown as { userLanguage?: string }).userLanguage ||
    'en-US'
  if (browserLang.startsWith('zh')) {
    return 'zh-CN'
  }
  return 'en-US'
}

// 从主应用获取语言（微前端环境）
const getLocaleFromMainApp = (): LocaleType | null => {
  if (!isInMicroApp()) {
    return null
  }

  try {
    // 尝试从 microApp 获取数据
    const win = window as Window & {
      microApp?: {
        getData?: () => { locale?: LocaleType; [key: string]: unknown }
      }
    }

    if (win.microApp?.getData) {
      const data = win.microApp.getData()
      if (data && typeof data === 'object' && 'locale' in data) {
        const locale = data.locale
        if (locale === 'zh-CN' || locale === 'en-US') {
          return locale
        }
      }
    }
  } catch (error) {
    console.warn('Failed to get locale from main app:', error)
  }

  return null
}

interface LocaleProviderProps {
  children: ReactNode
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
  // 初始化语言：优先从主应用获取，否则使用默认值
  const initialLocale = getLocaleFromMainApp() || getDefaultLocale()
  dayjs.locale(initialLocale === 'zh-CN' ? 'zh-cn' : 'en')
  const [locale, setLocaleState] = useState<LocaleType>(initialLocale)

  // 语言切换时同步 dayjs（DatePicker 等组件的月份、星期显示依赖 dayjs locale）
  useEffect(() => {
    dayjs.locale(locale === 'zh-CN' ? 'zh-cn' : 'en')
  }, [locale])

  // 在微前端环境中监听主应用的语言变化
  useEffect(() => {
    if (!isInMicroApp()) {
      return
    }

    try {
      const win = window as Window & {
        microApp?: {
          addDataListener?: (
            callback: (data: {
              locale?: LocaleType
              [key: string]: unknown
            }) => void,
          ) => void
        }
      }

      if (win.microApp?.addDataListener) {
        const dataListener = (data: {
          locale?: LocaleType
          [key: string]: unknown
        }) => {
          if (data && typeof data === 'object' && 'locale' in data) {
            const newLocale = data.locale
            if (newLocale === 'zh-CN' || newLocale === 'en-US') {
              setLocaleState(newLocale)
              // 同步到 localStorage
              localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
            }
          }
        }

        win.microApp.addDataListener(dataListener)

        // 清理函数
        return () => {
          // micro-app 可能没有 removeDataListener，这里先不处理
        }
      }
    } catch (error) {
      console.warn('Failed to setup locale listener from main app:', error)
    }
  }, [])

  // 设置语言
  const setLocale = (newLocale: LocaleType) => {
    setLocaleState(newLocale)
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
  }

  // 获取 Ant Design 的 locale
  const antdLocale = locale === 'zh-CN' ? zhCN : enUS

  // 翻译函数（支持参数替换）
  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = resources[locale][key] || key
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(
          new RegExp(`\\{${paramKey}\\}`, 'g'),
          String(params[paramKey]),
        )
      })
    }
    return text
  }

  return (
    <LocaleContext.Provider value={{ locale, antdLocale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
