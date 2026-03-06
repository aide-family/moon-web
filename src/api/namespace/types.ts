/**
 * 命名空间相关类型定义
 */

import { GlobalStatus } from '../types'

/**
 * 命名空间选择项
 */
export interface NamespaceItemSelect {
  value: string
  label: string
  disabled?: boolean
  tooltip?: string
  /** 命名空间 logo 地址，用于下拉展示 */
  logo?: string
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
 * 当前用户可用的命名空间项（GET /v1/self/namespaces 单条）
 */
export interface SelfNamespaceItem {
  uid: string
  name: string
  remark?: string
  createdAt?: string
  updatedAt?: string
  status?: GlobalStatus
  logo?: string
  secret?: string
  leader?: string
  metadata?: Record<string, unknown>
  banners?: string[]
}

/**
 * 当前用户命名空间列表响应（GET /v1/self/namespaces）
 */
export interface SelfNamespacesResponse {
  namespaces: SelfNamespaceItem[]
}

/**
 * 命名空间选择请求参数
 */
export interface NamespaceSelectParams {
  keyword?: string
  limit?: number
  lastUID?: string
  status?: GlobalStatus
}

/**
 * 命名空间项
 */
export interface NamespaceItem {
  uid: string
  name: string
  remark?: string
  logo?: string
  createdAt: string
  updatedAt: string
  status: GlobalStatus
  metadata?: Record<string, unknown>
  banners?: string[]
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
  status?: GlobalStatus
}

/**
 * 创建命名空间请求参数
 */
export interface CreateNamespaceParams {
  name?: string
  remark?: string
  logo?: string
  metadata?: Record<string, unknown>
  banners?: string[]
}

/**
 * 更新命名空间请求参数
 */
export interface UpdateNamespaceParams {
  uid?: string
  name?: string
  remark?: string
  logo?: string
  metadata?: Record<string, unknown>
  banners?: string[]
}
