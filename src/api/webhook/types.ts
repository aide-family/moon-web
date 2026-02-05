/**
 * Webhook 相关类型定义
 */

/**
 * Webhook 项
 */
export interface WebhookItem {
  uid: string
  name: string
  /** 应用（全局 WebhookAPP 字符串或接口返回的数字） */
  app: number | string
  url: string
  /** 方法（全局 HTTPMethod 字符串或接口返回的数字） */
  method: number | string
  secret: string
  headers?: Record<string, string>
  createdAt: string
  updatedAt: string
  status: number
}

/**
 * Webhook 列表响应
 */
export interface WebhookListResponse {
  total: string
  page: number
  pageSize: number
  items: WebhookItem[]
}

/**
 * Webhook 列表请求参数
 */
export interface WebhookListParams {
  page?: number
  pageSize?: number
  keyword?: string
  /** 状态筛选，支持全局状态 GlobalStatus（ENABLED/DISABLED）或数字 1/2 */
  status?: number | string
  /** 应用筛选，全局 WebhookAPP 字符串 */
  app?: number | string
}

/**
 * 创建 Webhook 请求参数
 */
export interface CreateWebhookParams {
  name?: string
  /** 应用，全局 WebhookAPP 字符串 */
  app?: number | string
  url?: string
  /** 方法，全局 HTTPMethod 字符串 */
  method?: number | string
  secret?: string
  headers?: Record<string, string>
}

/**
 * 更新 Webhook 请求参数
 */
export interface UpdateWebhookParams {
  uid?: string
  name?: string
  app?: number | string
  url?: string
  method?: number | string
  secret?: string
  headers?: Record<string, string>
}

/**
 * 更新 Webhook 状态请求参数
 */
export interface UpdateWebhookStatusParams {
  status: number
}
