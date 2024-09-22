import { createContext, useContext, useState } from 'react'

export type Locale = 'zh-CN' | 'en-US'

export type LocaleProviderProps = {
  children: React.ReactNode
  defaultLocale?: Locale
  storageKey?: string
}
export type LocaleProviderState = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const initialState: LocaleProviderState = {
  locale: 'zh-CN',
  setLocale: () => null
}

export const LocaleProviderContext = createContext<LocaleProviderState>(initialState)

export const getLocale = (storageKey: string = 'vite-ui-locale'): Locale => {
  return (localStorage.getItem(storageKey) as Locale) || 'zh-CN'
}
export const LocaleProvider = ({
  children,
  defaultLocale = 'zh-CN',
  storageKey = 'vite-ui-locale',
  ...props
}: LocaleProviderProps) => {
  const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem(storageKey) as Locale) || defaultLocale)

  const value = {
    locale,
    setLocale: (locale: Locale) => {
      setLocale(locale)
      localStorage.setItem(storageKey, locale)
    }
  }

  return (
    <LocaleProviderContext.Provider {...props} value={value}>
      {children}
    </LocaleProviderContext.Provider>
  )
}

export const useLocale = (): LocaleProviderState => {
  const context = useContext(LocaleProviderContext)

  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }

  return context
}
