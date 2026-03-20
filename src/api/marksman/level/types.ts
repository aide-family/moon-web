/**
 * 告警等级（Level）相关类型定义（策略管理服务 Level API）
 */

import { GlobalStatus } from '../../common/types'

/** 告警等级单项（列表/详情），status 为全局状态枚举 */
export interface LevelItem {
  uid?: string
  name?: string
  remark?: string
  status?: GlobalStatus
  createdAt?: string
  updatedAt?: string
  metadata?: Record<string, string>
}

/** 列表请求参数 GET /v1/levels */
export interface LevelListParams {
  keyword?: string
  page?: number
  pageSize?: number
  status?: GlobalStatus
}

/** 列表响应 */
export interface LevelListResponse {
  total?: string
  page?: number
  pageSize?: number
  items?: LevelItem[]
}

/** 创建请求参数 POST /v1/level */
export interface CreateLevelParams {
  name?: string
  remark?: string
  metadata?: Record<string, string>
}

/** 创建告警等级返回值（CreateLevelReply：仅 uid） */
export interface CreateLevelReply {
  uid?: string
}

/** 更新请求参数 PUT /v1/level/{uid} */
export interface UpdateLevelParams {
  uid?: string
  name?: string
  remark?: string
  metadata?: Record<string, string>
}

/** 更新状态请求参数 PUT /v1/level/{uid}/status */
export interface UpdateLevelStatusParams {
  uid: string
  status: GlobalStatus
}

/** 下拉选择项 GET /v1/levels/select */
export interface LevelItemSelect {
  value?: string
  label?: string
  disabled?: boolean
  tooltip?: string
}

export interface LevelSelectParams {
  keyword?: string
  limit?: number
  lastUID?: string
  status?: GlobalStatus
  uids?: string[]
}

export interface LevelSelectResponse {
  items?: LevelItemSelect[]
  total?: string
  lastUID?: string
  hasMore?: boolean
}

