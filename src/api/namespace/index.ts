/**
 * 命名空间相关 API
 * 数据来源：后端 API
 */

import { http } from '../index'
import type { 
  NamespaceSelectResponse, 
  NamespaceSelectParams, 
  NamespaceListResponse, 
  NamespaceListParams,
  NamespaceItem,
  CreateNamespaceParams,
  UpdateNamespaceParams,
  GlobalStatus
} from './types'

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

/**
 * 获取命名空间详情
 * @param uid 命名空间 UID
 * @returns 命名空间详情
 */
export const getNamespaceDetail = (uid: string): Promise<NamespaceItem> => {
  return http.get<NamespaceItem>(`/namespace/${uid}`)
}

/**
 * 创建命名空间
 * @param params 创建参数
 * @returns 创建的命名空间
 */
export const createNamespace = (params?: CreateNamespaceParams): Promise<NamespaceItem> => {
  return http.post<NamespaceItem>('/namespace', params as Record<string, unknown>)
}

/**
 * 更新命名空间
 * @param uid 命名空间 UID
 * @param params 更新参数
 * @returns 更新后的命名空间
 */
export const updateNamespace = (uid: string, params?: UpdateNamespaceParams): Promise<NamespaceItem> => {
  return http.put<NamespaceItem>(`/namespace/${uid}`, params as Record<string, unknown>)
}

/**
 * 删除命名空间
 * @param uid 命名空间 UID
 * @returns 删除结果
 */
export const deleteNamespace = (uid: string): Promise<void> => {
  return http.delete<void>(`/namespace/${uid}`)
}

/**
 * 更新命名空间状态
 * @param uid 命名空间 UID
 * @param status 状态值
 * @returns 更新后的命名空间
 */
export const updateNamespaceStatus = (uid: string, status: GlobalStatus | string): Promise<NamespaceItem> => {
  return http.put<NamespaceItem>(`/namespace/${uid}/status`, { status } as Record<string, unknown>)
}

// 导出类型和枚举
export type { 
  NamespaceItemSelect, 
  NamespaceSelectResponse, 
  NamespaceSelectParams,
  NamespaceItem,
  NamespaceListResponse,
  NamespaceListParams,
  CreateNamespaceParams,
  UpdateNamespaceParams
} from './types'

export { GlobalStatus } from './types'
