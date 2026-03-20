/**
 * 策略相关类型定义（Strategy API）
 * 接口文档：GET/POST /v1/strategy(s)、GET /v1/strategies/select
 * type/driver 与数据源枚举一致；status 与全局 GlobalStatus 一致。
 * 后端可能返回数字或字符串，由请求/响应处统一转换，类型层面仅使用枚举。
 */

import type { GlobalStatus } from '../../common/types'
import type { DatasourceType, DatasourceDriver } from '../datasource/types'

/** 策略组单项（嵌套引用，避免循环可放同目录或 strategyGroup） */
export interface StrategyGroupItemRef {
  uid?: string
  name?: string
  remark?: string
  status?: GlobalStatus
  metadata?: Record<string, string>
  createdAt?: string
  updatedAt?: string
}

/** 策略单项（列表/详情），type/driver 与数据源枚举一致，status 为全局状态枚举 */
export interface StrategyItem {
  uid?: string
  name?: string
  remark?: string
  type?: DatasourceType
  driver?: DatasourceDriver
  status?: GlobalStatus
  strategyGroupUID?: string
  strategyGroup?: StrategyGroupItemRef
  createdAt?: string
  updatedAt?: string
  metadata?: Record<string, string>
}

/** 列表请求参数 GET /v1/strategies */
export interface StrategyListParams {
  keyword?: string
  page?: number
  pageSize?: number
  status?: GlobalStatus
  strategyGroupUID?: string
  type?: DatasourceType
  driver?: DatasourceDriver
}

/** 列表响应 ListStrategyReply（兼容旧版 metadata 形状） */
export interface StrategyListResponse {
  items?: StrategyItem[]
  total?: string
  page?: number
  pageSize?: number
  /** @deprecated 兼容旧版，优先使用顶层 total */
  metadata?: { total?: string; page?: number; pageSize?: number }
}

/** 策略下拉选择项 */
export interface StrategyItemSelect {
  value?: string
  label?: string
  disabled?: boolean
  tooltip?: string
}

/** 策略选择列表请求参数 GET /v1/strategies/select */
export interface StrategySelectParams {
  keyword?: string
  limit?: number
  lastUid?: string
  status?: GlobalStatus
  strategyGroupUids?: string[]
}

/** 策略选择列表响应 */
export interface StrategySelectResponse {
  items?: StrategyItemSelect[]
  total?: string
  lastUid?: string
  hasMore?: boolean
}

/** 创建策略请求参数 POST /v1/strategy */
export interface CreateStrategyParams {
  name?: string
  remark?: string
  type?: DatasourceType
  driver?: DatasourceDriver
  strategyGroupUID?: string
  status?: GlobalStatus
  metadata?: Record<string, string>
}

/** 创建策略返回值（CreateStrategyReply：仅 uid） */
export interface CreateStrategyReply {
  uid?: string
}

/** 更新策略请求参数 PUT /v1/strategy/{uid} */
export interface UpdateStrategyParams {
  uid?: string
  name?: string
  remark?: string
  strategyGroupUID?: string
  type?: DatasourceType
  driver?: DatasourceDriver
  metadata?: Record<string, string>
}

/** 更新策略状态请求参数 PUT /v1/strategy/{uid}/status */
export interface UpdateStrategyStatusParams {
  uid: string
  status: GlobalStatus
}
