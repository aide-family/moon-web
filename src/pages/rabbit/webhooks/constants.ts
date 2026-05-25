/**
 * Webhook 管理相关常量
 */

import { WebhookAPP, HTTPMethod } from '@/api'
import { getWebhookAppIconType } from '@/pages/rabbit/constants/appIcons'

/** 接口返回的数字 method 与 HTTPMethod 字符串的映射（proto: 0, 1, 2, 3, 4, 5） */
const METHOD_NUMBER_TO_KEY: Record<number, string> = {
  0: HTTPMethod.HTTPMethod_UNKNOWN,
  1: HTTPMethod.GET,
  2: HTTPMethod.POST,
  3: HTTPMethod.PUT,
  4: HTTPMethod.DELETE,
  5: HTTPMethod.PATCH,
}

/**
 * HTTP 方法可选值列表（不含 UNKNOWN，用于表单），与 proto HTTPMethod 一致
 */
export const HTTP_METHOD_VALUES: string[] = [
  HTTPMethod.GET,
  HTTPMethod.POST,
  HTTPMethod.PUT,
  HTTPMethod.DELETE,
  HTTPMethod.PATCH,
]

/**
 * 应用可选值列表（不含 UNKNOWN，用于筛选/表单），与全局 WebhookAPP 一致
 */
export const APP_VALUES: string[] = [
  WebhookAPP.OTHER,
  WebhookAPP.DINGTALK,
  WebhookAPP.WECHAT,
  WebhookAPP.FEISHU,
]

/** 接口返回的数字 app 与 WebhookAPP 字符串的映射（proto: 0, 2000, 2001, 2002, 2003） */
const APP_NUMBER_TO_KEY: Record<number, string> = {
  0: WebhookAPP.WebhookAPP_UNKNOWN,
  2000: WebhookAPP.OTHER,
  2001: WebhookAPP.DINGTALK,
  2002: WebhookAPP.WECHAT,
  2003: WebhookAPP.FEISHU,
}

/**
 * 获取 HTTP 方法选项列表（支持国际化）
 * @param t 翻译函数
 * @returns HTTP 方法选项列表
 */
export const getMethodOptions = (t: (key: string) => string) => {
  return HTTP_METHOD_VALUES.map((value) => ({
    label: getMethodLabel(value, t),
    value,
  }))
}

/**
 * 根据 HTTP 方法值获取标签（支持国际化）
 * @param value 方法值（全局 HTTPMethod 字符串或接口返回的数字）
 * @param t 翻译函数
 * @returns 方法标签
 */
export const getMethodLabel = (
  value: number | string,
  t: (key: string) => string,
): string => {
  const key = typeof value === 'string' ? value : METHOD_NUMBER_TO_KEY[value]
  if (key) {
    return t(`webhook.method.${key}`)
  }
  return String(value)
}

/**
 * 获取应用选项列表（支持国际化）
 * @param t 翻译函数
 * @returns 应用选项列表
 */
export const getAppOptions = (t: (key: string) => string) => {
  return APP_VALUES.map((value) => ({
    label: getAppLabel(value, t),
    value,
  }))
}

/**
 * 根据应用值获取标签（支持国际化）
 * @param value 应用值（全局 WebhookAPP 字符串或接口返回的数字）
 * @param t 翻译函数
 * @returns 应用标签
 */
export const getAppLabel = (
  value: number | string,
  t: (key: string) => string,
): string => {
  const key = typeof value === 'string' ? value : APP_NUMBER_TO_KEY[value]
  if (key) {
    return t(`webhook.app.${key}`)
  }
  return String(value)
}

/**
 * 根据应用值获取 iconfont 类型名（用于下拉和表格图标）
 */
export const getAppIconType = (value: number | string): string => {
  const key = typeof value === 'string' ? value : APP_NUMBER_TO_KEY[value]
  return getWebhookAppIconType(key || WebhookAPP.OTHER)
}
