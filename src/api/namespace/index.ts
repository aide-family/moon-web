/**
 * 命名空间相关 API
 * 数据来源：后端 API
 */

import { http } from '../index'
import type { NamespaceSelectResponse, NamespaceSelectParams, NamespaceListResponse, NamespaceListParams } from './types'

/**
 * 获取命名空间选择列表（用于下拉选择）
 * @param params 查询参数
 * @returns 命名空间选择列表
 */
export const getNamespaceList = (params?: NamespaceSelectParams): Promise<NamespaceSelectResponse> => {
  return http.get<NamespaceSelectResponse>('/namespaces/select', params as unknown as Record<string, unknown>)
}

/**
 * 获取命名空间列表（用于表格展示）
 * @param params 查询参数
 * @returns 命名空间列表
 */
export const getNamespaceTableList = (params?: NamespaceListParams): Promise<NamespaceListResponse> => {
  return http.get<NamespaceListResponse>('/namespaces', params as unknown as Record<string, unknown>)
}

// 导出类型
export type { 
  NamespaceItemSelect, 
  NamespaceSelectResponse, 
  NamespaceSelectParams,
  NamespaceItem,
  NamespaceListResponse,
  NamespaceListParams
} from './types'
