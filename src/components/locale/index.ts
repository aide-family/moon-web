import { useContext } from 'react'
import enUSI18n from './en-US'
import { LocaleProviderContext } from './locale-provider'
import zhCNI18n from './zh-CN'

export type I18nLocaleType = typeof zhCNI18n

const i18nConfig = {
  'zh-CN': zhCNI18n,
  'en-US': enUSI18n
}
export const useI18nConfig = (): I18nLocaleType => {
  const locale = useContext(LocaleProviderContext)
  return i18nConfig[locale.locale] || i18nConfig['zh-CN']
}
