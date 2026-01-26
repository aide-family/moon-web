/**
 * 命名空间相关 API
 * 数据来源：后端 API
 */

import { http } from '../index'
import type { NamespaceSelectResponse, NamespaceSelectParams } from './types'

/**
 * 获取命名空间列表
 * @param params 查询参数
 * @returns 命名空间列表
 */
export const getNamespaceList = (params?: NamespaceSelectParams): Promise<NamespaceSelectResponse> => {
  return http.get<NamespaceSelectResponse>('/namespaces/select', params)
}

// 导出类型
export type { NamespaceItemSelect, NamespaceSelectResponse, NamespaceSelectParams } from './types'
