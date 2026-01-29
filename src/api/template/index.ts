/**
 * 模板相关 API
 * 数据来源：后端 API
 */

import { http } from '../index'
import type { 
  TemplateListResponse, 
  TemplateListParams,
  TemplateItem,
  CreateTemplateParams,
  UpdateTemplateParams,
  UpdateTemplateStatusParams,
  TemplateSelectParams,
  TemplateSelectResponse,
} from './types'

/**
 * 获取模板列表（用于表格展示）
 * @param params 查询参数
 * @returns 模板列表
 */
export const getTemplateTableList = (params?: TemplateListParams): Promise<TemplateListResponse> => {
  return http.get<TemplateListResponse>('/v1/templates', params as unknown as Record<string, unknown>)
}

/**
 * 获取模板详情
 * @param uid 模板 UID
 * @returns 模板详情
 */
export const getTemplateDetail = (uid: string): Promise<TemplateItem> => {
  return http.get<TemplateItem>(`/v1/template/${uid}`)
}

/**
 * 创建模板
 * @param params 创建参数
 * @returns 创建的模板
 */
export const createTemplate = (params?: CreateTemplateParams): Promise<TemplateItem> => {
  return http.post<TemplateItem>('/v1/template', params as Record<string, unknown>)
}

/**
 * 更新模板
 * @param uid 模板 UID
 * @param params 更新参数
 * @returns 更新后的模板
 */
export const updateTemplate = (uid: string, params?: UpdateTemplateParams): Promise<TemplateItem> => {
  return http.put<TemplateItem>(`/v1/template/${uid}`, params as Record<string, unknown>)
}

/**
 * 删除模板
 * @param uid 模板 UID
 * @returns 删除结果
 */
export const deleteTemplate = (uid: string): Promise<void> => {
  return http.delete<void>(`/v1/template/${uid}`)
}

/**
 * 更新模板状态
 * @param uid 模板 UID
 * @param status 状态值
 * @returns 更新后的模板
 */
export const updateTemplateStatus = (uid: string, status: number): Promise<TemplateItem> => {
  return http.put<TemplateItem>(`/v1/template/${uid}/status`, { status } as Record<string, unknown>)
}

/**
 * 模板下拉列表（Template_SelectTemplate）
 * GET /v1/templates/select，用于下拉选择
 */
export const getTemplateSelectList = (
  params?: TemplateSelectParams
): Promise<TemplateSelectResponse> => {
  return http.get<TemplateSelectResponse>(
    '/v1/templates/select',
    params as unknown as Record<string, unknown>
  )
}

// 导出类型
export type { 
  TemplateItem,
  TemplateListResponse,
  TemplateListParams,
  CreateTemplateParams,
  UpdateTemplateParams,
  UpdateTemplateStatusParams,
  TemplateItemSelect,
  TemplateSelectParams,
  TemplateSelectResponse,
} from './types'
