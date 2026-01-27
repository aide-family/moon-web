/**
 * Webhook 管理相关常量
 */

/**
 * HTTP 方法类型
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

/**
 * HTTP 方法值映射（整数到方法名）
 */
export const HTTP_METHOD_MAP: Record<number, HttpMethod> = {
  1: 'GET',
  2: 'POST',
  3: 'PUT',
  4: 'DELETE',
  5: 'PATCH',
  6: 'HEAD',
  7: 'OPTIONS',
}

/**
 * HTTP 方法名到整数的映射
 */
export const HTTP_METHOD_TO_NUMBER: Record<HttpMethod, number> = {
  GET: 1,
  POST: 2,
  PUT: 3,
  DELETE: 4,
  PATCH: 5,
  HEAD: 6,
  OPTIONS: 7,
}

/**
 * HTTP 方法值列表
 */
export const HTTP_METHOD_VALUES: number[] = [1, 2, 3, 4, 5, 6, 7]

/**
 * 应用值类型（整数）
 */
export type AppValue = number

/**
 * 应用值列表（示例，根据实际 API 调整）
 */
export const APP_VALUES: AppValue[] = [1, 2, 3, 4, 5, 6, 7]

/**
 * 获取 HTTP 方法选项列表（支持国际化）
 * @param t 翻译函数
 * @returns HTTP 方法选项列表
 */
export const getMethodOptions = (t: (key: string) => string) => {
  return HTTP_METHOD_VALUES.map(value => ({
    label: t(`webhook.method.${HTTP_METHOD_MAP[value]}`),
    value,
  }))
}

/**
 * 根据 HTTP 方法值获取标签（支持国际化）
 * @param value HTTP 方法值（整数）
 * @param t 翻译函数
 * @returns HTTP 方法标签
 */
export const getMethodLabel = (value: number, t: (key: string) => string): string => {
  const method = HTTP_METHOD_MAP[value]
  if (method) {
    return t(`webhook.method.${method}`)
  }
  return String(value)
}

/**
 * 获取应用选项列表（支持国际化）
 * @param t 翻译函数
 * @returns 应用选项列表
 */
export const getAppOptions = (t: (key: string) => string) => {
  return APP_VALUES.map(value => ({
    label: t(`webhook.app.${value}`),
    value,
  }))
}

/**
 * 根据应用值获取标签（支持国际化）
 * @param value 应用值（整数）
 * @param t 翻译函数
 * @returns 应用标签
 */
export const getAppLabel = (value: number, t: (key: string) => string): string => {
  if (APP_VALUES.includes(value)) {
    return t(`webhook.app.${value}`)
  }
  return String(value)
}
