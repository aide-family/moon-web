/**
 * 策略组（Strategy Group）相关类型定义
 * 接口文档：Strategy_CreateStrategyGroup、Strategy_GetStrategyGroup、Strategy_UpdateStrategyGroup、
 * Strategy_UpdateStrategyGroupStatus、Strategy_DeleteStrategyGroup、Strategy_SelectStrategyGroup
 * status 统一使用全局状态枚举 GlobalStatus。
 */

import type { GlobalStatus } from '../../common/types'

/** 策略组单项（列表/详情），status 为全局状态枚举 */
export interface StrategyGroupItem {
  uid?: string
  name?: string
  remark?: string
  status?: GlobalStatus
  createdAt?: string
  updatedAt?: string
  metadata?: Record<string, string>
}

/** 列表请求参数 GET /v1/strategy-groups */
export interface StrategyGroupListParams {
  keyword?: string
  page?: number
  pageSize?: number
  status?: GlobalStatus
}

/** 列表响应 */
export interface StrategyGroupListResponse {
  items?: StrategyGroupItem[]
  total?: string
  page?: number
  pageSize?: number
}

/** 创建请求参数 POST /v1/strategy-group */
export interface CreateStrategyGroupParams {
  name?: string
  remark?: string
  metadata?: Record<string, string>
}

/** 创建策略组返回值（CreateStrategyGroupReply：仅 uid） */
export interface CreateStrategyGroupReply {
  uid?: string
}

/** 更新请求参数 PUT /v1/strategy-group/{uid} */
export interface UpdateStrategyGroupParams {
  uid?: string
  name?: string
  remark?: string
  metadata?: Record<string, string>
}

/** 更新状态请求参数 PUT /v1/strategy-group/{uid}/status，使用 GlobalStatus */
export interface UpdateStrategyGroupStatusParams {
  uid: string
  status: GlobalStatus
}

/** 下拉选择项 GET /v1/strategy-groups/select */
export interface StrategyGroupItemSelect {
  value?: string
  label?: string
  disabled?: boolean
  tooltip?: string
}

export interface StrategyGroupSelectParams {
  keyword?: string
  limit?: number
  lastUID?: string
  status?: GlobalStatus
}

/** SelectStrategyGroupReply：nextUID 后端为 uint32，前端按 string 兼容 */
export interface StrategyGroupSelectResponse {
  items?: StrategyGroupItemSelect[]
  total?: string
  hasMore?: boolean
  nextUID?: number | string
}
