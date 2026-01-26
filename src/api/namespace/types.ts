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
