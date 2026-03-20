import { GlobalStatus } from '../../common/types'

/**
 * 邮件相关类型定义
 */

/**
 * 邮件配置项
 */
export interface EmailItem {
  uid: string
  name: string
  host: string
  port: number
  username: string
  password: string
  createdAt: string
  updatedAt: string
  status: GlobalStatus
}

/**
 * 邮件列表响应
 */
export interface EmailListResponse {
  total: string
  page: number
  pageSize: number
  items: EmailItem[]
}

/**
 * 邮件列表请求参数
 */
export interface EmailListParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: GlobalStatus
}

/**
 * 创建邮件配置请求参数
 */
export interface CreateEmailParams {
  name?: string
  host?: string
  port?: number
  username?: string
  password?: string
}

/**
 * 更新邮件配置请求参数
 */
export interface UpdateEmailParams {
  name?: string
  host?: string
  port?: number
  username?: string
  password?: string
}

/**
 * 更新邮件状态请求参数
 */
export interface UpdateEmailStatusParams {
  uid: string
  status: GlobalStatus
}

/**
 * 邮件配置下拉项（Email_SelectEmailConfig 返回项）
 */
export interface EmailItemSelect {
  value?: string
  label?: string
  disabled?: boolean
  tooltip?: string
  total?: string
  lastUID?: string
  hasMore?: boolean
}

/**
 * 邮件配置下拉查询参数（GET /email/configs/select）
 */
export interface EmailConfigSelectParams {
  keyword?: string
  limit?: number
  lastUID?: string
  status?: GlobalStatus
}

/**
 * 邮件配置下拉响应
 */
export interface EmailConfigSelectResponse {
  items?: EmailItemSelect[]
}
