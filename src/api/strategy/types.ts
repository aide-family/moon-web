/**
 * 策略相关类型定义（Strategy API）
 * 接口文档：GET/POST /v1/strategy(s)
 */

/** 策略单项（列表/详情），type/driver 与数据源一致（字符串枚举） */
export interface StrategyItem {
  uid?: string
  name?: string
  remark?: string
  type?: string
  driver?: string
  status?: number
  strategyGroupUID?: string
  createdAt?: string
  updatedAt?: string
  metadata?: Record<string, string>
}

/** 列表请求参数 */
export interface StrategyListParams {
  keyword?: string
  page?: number
  pageSize?: number
  status?: number
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
}

/** 更新策略请求参数 */
export interface UpdateStrategyParams {
  uid?: string
  name?: string
  remark?: string
  strategyGroupUID?: string
  type?: string
  driver?: string
  status?: number
  metadata?: Record<string, string>
}
