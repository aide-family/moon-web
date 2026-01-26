/**
 * 命名空间相关类型定义
 */

/**
 * 命名空间选择项
 */
export interface NamespaceItemSelect {
  value: string
  label: string
  disabled?: boolean
  tooltip?: string
}

/**
 * 命名空间选择响应
 */
export interface NamespaceSelectResponse {
  items: NamespaceItemSelect[]
  total?: string
  lastUID?: string
  hasMore?: boolean
}

/**
 * 命名空间选择请求参数
 */
export interface NamespaceSelectParams {
  keyword?: string
  limit?: number
  lastUID?: string
  status?: number
}

/**
 * 命名空间项
 */
export interface NamespaceItem {
  uid: string
  name: string
  createdAt: string
  updatedAt: string
  status: number
  metadata?: Record<string, unknown>
}

/**
 * 命名空间列表响应
 */
export interface NamespaceListResponse {
  total: string
  page: number
  pageSize: number
  items: NamespaceItem[]
}

/**
 * 命名空间列表请求参数
 */
export interface NamespaceListParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: number
}

/**
 * 创建命名空间请求参数
 */
export interface CreateNamespaceParams {
  name?: string
  metadata?: Record<string, unknown>
}

/**
 * 更新命名空间请求参数
 */
export interface UpdateNamespaceParams {
  uid?: string
  name?: string
  metadata?: Record<string, unknown>
}
