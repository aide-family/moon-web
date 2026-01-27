/**
 * 模板管理相关常量
 */

/**
 * 应用值类型
 */
export type AppValue = 'qq' | 'feishu' | 'wechat' | 'dingtalk' | 'email' | 'sms' | 'webhook'

/**
 * 应用值列表
 */
export const APP_VALUES: AppValue[] = ['qq', 'feishu', 'wechat', 'dingtalk', 'email', 'sms', 'webhook']

/**
 * 获取应用选项列表（支持国际化）
 * @param t 翻译函数
 * @returns 应用选项列表
 */
export const getAppOptions = (t: (key: string) => string) => {
  return APP_VALUES.map(value => ({
    label: t(`template.app.${value}`),
    value,
  }))
}

/**
 * 根据应用值获取标签（支持国际化）
 * @param value 应用值
 * @param t 翻译函数
 * @returns 应用标签
 */
export const getAppLabel = (value: string, t: (key: string) => string): string => {
  if (APP_VALUES.includes(value as AppValue)) {
    return t(`template.app.${value}`)
  }
  return value
}
