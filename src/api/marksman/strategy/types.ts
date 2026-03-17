/**
 * 策略相关类型定义（Strategy API）
 * 接口文档：GET/POST /v1/strategy(s)、GET /v1/strategies/select
 * 状态与全局 GlobalStatus 一致（接口可能返回数字，前端统一按全局状态展示与筛选）
 */

/** 策略组单项（嵌套引用，避免循环可放同目录或 strategyGroup） */
export interface StrategyGroupItemRef {
  uid?: string
  name?: string
  remark?: string
  status?: number | string
  metadata?: Record<string, string>
  createdAt?: string
  updatedAt?: string
}

/** 策略单项（列表/详情），type/driver 与数据源一致；status 与全局状态一致（后端可能返回数字） */
export interface StrategyItem {
  uid?: string
  name?: string
  remark?: string
  type?: number | string
  driver?: number | string
  status?: number | string
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
  status?: number | string
  strategyGroupUID?: string
  type?: number | string
  driver?: number | string
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
  status?: number | string
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
  type?: number | string
  driver?: number | string
  strategyGroupUID?: string
  status?: number | string
  metadata?: Record<string, string>
}

/** 更新策略请求参数 PUT /v1/strategy/{uid} */
export interface UpdateStrategyParams {
  uid?: string
  name?: string
  remark?: string
  strategyGroupUID?: string
  type?: number | string
  driver?: number | string
  metadata?: Record<string, string>
}
