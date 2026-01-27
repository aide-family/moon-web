/**
 * 模板相关类型定义
 */

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
  status: number
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
  status?: number
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
  status: number
}
