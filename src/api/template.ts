/**
 * 模版相关 API
 * 数据来源：后端 API (根据 proto/rabbit/api/v1/template.proto 定义)
 */

import { http } from './index'

/**
 * 模版应用类型枚举
 */
export enum TemplateAPP {
  TEMPLATE_APP_UNKNOWN = 0,
  TEMPLATE_APP_EMAIL = 1,
  TEMPLATE_APP_SMS = 2,
  TEMPLATE_APP_WEBHOOK_OTHER = 3,
  TEMPLATE_APP_WEBHOOK_DINGTALK = 4,
  TEMPLATE_APP_WEBHOOK_WECHAT = 5,
  TEMPLATE_APP_WEBHOOK_FEISHU = 6,
}

/**
 * 全局状态枚举
 */
export enum GlobalStatus {
  GLOBAL_STATUS_UNKNOWN = 0,
  ENABLED = 1,
  DISABLED = 2,
}

/**
 * 模版项
 */
export interface TemplateItem {
  uid: number
  name: string
  app: TemplateAPP
  jsonData: string // JSON 字符串，需要根据 app 类型解析
  createdAt: string
  updatedAt: string
  status: GlobalStatus
}

/**
 * 模版选择项
 */
export interface TemplateItemSelect {
  value: number
  label: string
  disabled: boolean
  tooltip: string
}

/**
 * 邮件模版数据结构
 */
export interface EmailTemplateData {
  subject: string
  body: string
  content_type?: string
  headers?: Record<string, string[]>
}

/**
 * SMS 模版数据结构
 */
export interface SMSTemplateData {
  content: string
  params?: Record<string, string>
}

/**
 * Webhook 模版数据结构
 */
export interface WebhookTemplateData {
  [key: string]: unknown
}

/**
 * 创建模版请求
 */
export interface CreateTemplateRequest {
  name: string
  app: TemplateAPP
  jsonData: string // JSON 字符串
}

/**
 * 更新模版请求
 */
export interface UpdateTemplateRequest {
  uid: number
  name: string
  app: TemplateAPP
  jsonData: string // JSON 字符串
}

/**
 * 更新模版状态请求
 */
export interface UpdateTemplateStatusRequest {
  uid: number
  status: GlobalStatus
}

/**
 * 获取模版请求
 */
export interface GetTemplateRequest {
  uid: number
}

/**
 * 列表模版请求
 */
export interface ListTemplateRequest {
  page: number // >= 1
  pageSize: number // >= 1 && <= 200
  keyword?: string // <= 100
  status?: GlobalStatus
  app?: TemplateAPP
}

/**
 * 列表模版响应
 */
export interface ListTemplateReply {
  items: TemplateItem[]
  total: number
  page: number
  pageSize: number
}

/**
 * 选择模版请求
 */
export interface SelectTemplateRequest {
  app?: TemplateAPP
  keyword?: string // <= 100
  limit: number // >= 1 && <= 100
  lastUID?: number
  status?: GlobalStatus
}

/**
 * 选择模版响应
 */
export interface SelectTemplateReply {
  items: TemplateItemSelect[]
  total: number
  lastUID: number
  hasMore: boolean
}

/**
 * 创建模版
 * POST /v1/template
 */
export const createTemplate = async (data: CreateTemplateRequest) => {
  return http.post<void>(
    '/template',
    data as unknown as Record<string, unknown>
  )
}

/**
 * 更新模版
 * PUT /v1/template/{uid}
 */
export const updateTemplate = async (
  uid: number,
  data: Omit<UpdateTemplateRequest, 'uid'>
) => {
  return http.put<void>(`/template/${uid}`, data)
}

/**
 * 更新模版状态
 * PUT /v1/template/{uid}/status
 */
export const updateTemplateStatus = async (
  data: UpdateTemplateStatusRequest
) => {
  return http.put<void>(`/template/${data.uid}/status`, { status: data.status })
}

/**
 * 删除模版
 * DELETE /v1/template/{uid}
 */
export const deleteTemplate = async (uid: number) => {
  return http.delete<void>(`/template/${uid}`)
}

/**
 * 获取单个模版
 * GET /v1/template/{uid}
 */
export const getTemplate = async (uid: number) => {
  return http.get<TemplateItem>(`/template/${uid}`)
}

/**
 * 获取模版列表
 * GET /v1/templates
 */
export const listTemplate = async (params: ListTemplateRequest) => {
  return http.get<ListTemplateReply>(
    '/templates',
    params as unknown as Record<string, unknown>
  )
}

/**
 * 选择模版（用于下拉选择等场景）
 * GET /v1/templates/select
 */
export const selectTemplate = async (params: SelectTemplateRequest) => {
  return http.get<SelectTemplateReply>(
    '/templates/select',
    params as unknown as Record<string, unknown>
  )
}
