/**
 * 模板相关类型定义
 */

import { GlobalStatus, MessageType } from '../../common/types'

/**
 * 模板项
 */
export interface TemplateItem {
  uid: string
  name: string
  messageType: MessageType
  jsonData: string
  createdAt: string
  updatedAt: string
  status: GlobalStatus
}

/**
 * 模板列表响应
 */
export interface TemplateListResponse {
  total: string
  page: number
  pageSize: number
  items: TemplateItem[]
}

/**
 * 模板列表请求参数
 */
export interface TemplateListParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: GlobalStatus
  messageType?: MessageType
}

/**
 * 创建模板请求参数
 */
export interface CreateTemplateParams {
  name?: string
  messageType?: MessageType
  jsonData?: string
}

/**
 * 更新模板请求参数
 */
export interface UpdateTemplateParams {
  uid?: string
  name?: string
  messageType?: MessageType
  jsonData?: string
}

/**
 * 更新模板状态请求参数
 */
export interface UpdateTemplateStatusParams {
  uid: string
  status: GlobalStatus
}

/**
 * 模板下拉项（Template_SelectTemplate 返回项）
 */
export interface TemplateItemSelect {
  value?: string
  label?: string
  disabled?: boolean
  tooltip?: string
  total?: string
  lastUID?: string
  hasMore?: boolean
}

/**
 * 模板下拉查询参数
 */
export interface TemplateSelectParams {
  messageType?: MessageType | string
  keyword?: string
  limit?: number
  lastUID?: string
  status?: GlobalStatus
}

/**
 * 模板下拉响应
 */
export interface TemplateSelectResponse {
  items?: TemplateItemSelect[]
}
