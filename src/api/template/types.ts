/**
 * 模板相关类型定义
 */

import { GlobalStatus } from '../types'

/**
 * 模板项
 */
export interface TemplateItem {
  uid: string
  name: string
  app: string
  jsonData: string
  createdAt: string
  updatedAt: string
  status: GlobalStatus | string
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
  status?: GlobalStatus | string
  app?: string
}

/**
 * 创建模板请求参数
 */
export interface CreateTemplateParams {
  name?: string
  app?: string
  jsonData?: string
}

/**
 * 更新模板请求参数
 */
export interface UpdateTemplateParams {
  uid?: string
  name?: string
  app?: string
  jsonData?: string
}

/**
 * 更新模板状态请求参数
 */
export interface UpdateTemplateStatusParams {
  status: GlobalStatus | string
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
  app?: number
  keyword?: string
  limit?: number
  lastUID?: string
  status?: GlobalStatus | string
}

/**
 * 模板下拉响应
 */
export interface TemplateSelectResponse {
  items?: TemplateItemSelect[]
}
