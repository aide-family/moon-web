/**
 * Webhook 相关类型定义
 */

/**
 * Webhook 项
 */
export interface WebhookItem {
  uid: string
  name: string
  app: number
  url: string
  method: number
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
  status?: number
  app?: number
}

/**
 * 创建 Webhook 请求参数
 */
export interface CreateWebhookParams {
  name?: string
  app?: number
  url?: string
  method?: number
  secret?: string
  headers?: Record<string, string>
}

/**
 * 更新 Webhook 请求参数
 */
export interface UpdateWebhookParams {
  uid?: string
  name?: string
  app?: number
  url?: string
  method?: number
  secret?: string
  headers?: Record<string, string>
}

/**
 * 更新 Webhook 状态请求参数
 */
export interface UpdateWebhookStatusParams {
  status: number
}
