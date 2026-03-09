/**
 * 策略相关类型定义（Strategy API）
 * 接口文档：GET/POST /v1/strategy(s)
 * 状态与全局 GlobalStatus 一致（接口可能返回数字，前端统一按全局状态展示与筛选）
 */

/** 策略单项（列表/详情），type/driver 与数据源一致；status 与全局状态一致（后端返回字符串） */
export interface StrategyItem {
  uid?: string
  name?: string
  remark?: string
  type?: string
  driver?: string
  /** 状态（全局 GlobalStatus 字符串，与后端一致） */
  status?: string
  strategyGroupUID?: string
  createdAt?: string
  updatedAt?: string
  metadata?: Record<string, string>
}

/** 列表请求参数，status 使用全局状态筛选 */
export interface StrategyListParams {
  keyword?: string
  page?: number
  pageSize?: number
  status?: string
  strategyGroupUID?: string
  type?: string
  driver?: string
}

/** 列表响应 metadata */
export interface StrategyListMetadata {
  total?: string
  page?: number
  pageSize?: number
}

/** 列表响应 */
export interface StrategyListResponse {
  items?: StrategyItem[]
  metadata?: StrategyListMetadata
}

/** 创建策略请求参数 */
export interface CreateStrategyParams {
  name?: string
  remark?: string
  type?: string
  driver?: string
  strategyGroupUID?: string
  status?: string
}

/** 更新策略请求参数 */
export interface UpdateStrategyParams {
  uid?: string
  name?: string
  remark?: string
  strategyGroupUID?: string
  type?: string
  driver?: string
  status?: string
  metadata?: Record<string, string>
}
