/**
 * 策略组（Strategy Group）相关类型定义
 * 接口文档：Strategy_CreateStrategyGroup、Strategy_GetStrategyGroup、Strategy_UpdateStrategyGroup、
 * Strategy_UpdateStrategyGroupStatus、Strategy_DeleteStrategyGroup、Strategy_SelectStrategyGroup
 */

/** 策略组单项（列表/详情），status 与全局状态一致为字符串 */
export interface StrategyGroupItem {
  uid?: string
  name?: string
  remark?: string
  status?: string
  createdAt?: string
  updatedAt?: string
  metadata?: Record<string, string>
}

/** 列表请求参数 GET /v1/strategy-groups */
export interface StrategyGroupListParams {
  keyword?: string
  page?: number
  pageSize?: number
  status?: string
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

/** 更新请求参数 PUT /v1/strategy-group/{uid} */
export interface UpdateStrategyGroupParams {
  uid?: string
  name?: string
  remark?: string
  metadata?: Record<string, string>
}

/** 更新状态请求参数 PUT /v1/strategy-group/{uid}/status，与全局状态一致为字符串 */
export interface UpdateStrategyGroupStatusParams {
  uid?: string
  status?: string
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
  status?: string
}

export interface StrategyGroupSelectResponse {
  items?: StrategyGroupItemSelect[]
  total?: string
  hasMore?: boolean
  nextUID?: number
}

/** 策略组绑定接收人请求体 POST /v1/strategy-group/{uid}/receivers */
export interface StrategyGroupBindReceiversParams {
  uid?: string
  receiverUIDs?: string[]
}
