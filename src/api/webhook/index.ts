/**
 * Webhook 相关 API
 * 数据来源：后端 API
 */

import { http } from '../index'
import type { 
  WebhookListResponse, 
  WebhookListParams,
  WebhookItem,
  CreateWebhookParams,
  UpdateWebhookParams
} from './types'

/**
 * 获取 Webhook 列表（用于表格展示）
 * @param params 查询参数
 * @returns Webhook 列表
 */
export const getWebhookTableList = (params?: WebhookListParams): Promise<WebhookListResponse> => {
  return http.get<WebhookListResponse>('/webhook/configs', params as unknown as Record<string, unknown>)
}

/**
 * 获取 Webhook 详情
 * @param uid Webhook UID
 * @returns Webhook 详情
 */
export const getWebhookDetail = (uid: string): Promise<WebhookItem> => {
  return http.get<WebhookItem>(`/webhook/config/${uid}`)
}

/**
 * 创建 Webhook
 * @param params 创建参数
 * @returns 创建的 Webhook
 */
export const createWebhook = (params?: CreateWebhookParams): Promise<WebhookItem> => {
  return http.post<WebhookItem>('/webhook/config', params as Record<string, unknown>)
}

/**
 * 更新 Webhook
 * @param uid Webhook UID
 * @param params 更新参数
 * @returns 更新后的 Webhook
 */
export const updateWebhook = (uid: string, params?: UpdateWebhookParams): Promise<WebhookItem> => {
  return http.put<WebhookItem>(`/webhook/config/${uid}`, params as Record<string, unknown>)
}

/**
 * 删除 Webhook
 * @param uid Webhook UID
 * @returns 删除结果
 */
export const deleteWebhook = (uid: string): Promise<void> => {
  return http.delete<void>(`/webhook/config/${uid}`)
}

/**
 * 更新 Webhook 状态
 * @param uid Webhook UID
 * @param status 状态值（全局状态 GlobalStatus.ENABLED/DISABLED 或数字 1/2）
 * @returns 更新后的 Webhook
 */
export const updateWebhookStatus = (uid: string, status: number | string): Promise<WebhookItem> => {
  return http.put<WebhookItem>(`/webhook/config/${uid}/status`, { status } as Record<string, unknown>)
}

// 导出类型
export type { 
  WebhookItem,
  WebhookListResponse,
  WebhookListParams,
  CreateWebhookParams,
  UpdateWebhookParams,
  UpdateWebhookStatusParams
} from './types'
