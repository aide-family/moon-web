import { Pagination, PaginationResponse, Status } from '../global'

/**策略组空响应参数 */
export interface StrategyGroupNullResponse {}

/** 策略组 */
export interface StrategyGroupItemType {
  // 策略组ID
  id: number
  // 策略组名称
  name: string
  // 策略组状态
  status: number
  // 创建时间
  createdAt: string
  // 更新时间
  updatedAt: string
  // 策略组说明信息
  remark: string
  // 策略组创建人
  creator: string
  // 创建人的id
  creatorId: number
  // 策略总数
  strategyCount: string
  // 策略开启总数
  enableStrategyCount: string
}

/**策略组列表响应参数 */
export interface GetStrategyGroupListResponse extends PaginationResponse<StrategyGroupItemType> {}

/** 策略组列表请求参数 */
export interface GetStrategyGroupListRequest {
  // 分页参数
  pagination: Pagination
  // 搜索关键字
  keyword?: string
  // 规则组状态
  status?: Status
  // 规则分类
  teamId?: number
}

/** 创建策略组请求参数 */
export interface CreateStrategyGroupRequest {
  // 策略组名称
  name: string
  // 策略组说明信息
  remark: string
  // 策略组状态
  status?: number
  // 策略分组类型
  categoriesIds: number[]
  // 策略分组类型
  teamId?: number
}

/** 更新策略组请求参数 */
export interface UpdateStrategyGroupRequest {
  update: CreateStrategyGroupRequest
}

/** 获取策略组详情相应参数 */
export interface GetStrategyGroupResponse {
  // 策略模板详情
  detail: StrategyGroupItemType
}

/** 策略列表请求参数 */
export interface GetStrategyListRequest {
  // 分页参数
  pagination: Pagination
  // 搜索关键字
  keyword?: string
  // 规则组状态
  status?: Status
  datasourceType?: number
}

/**策略列表响应参数 */
export interface GetStrategyListResponse extends PaginationResponse<StrategyItemType> {}

/** 策略 */
export interface StrategyItemType {
  // 策略ID
  id: number
  // 策略名称
  name: string
  // 策略语句
  expr: string
  // 根据策略等级配置的详细策略， key为策略等级ID
  levels: unknown[]
  // labels
  labels: unknown[]
  // 策略注解
  annotations: unknown[]
  // 数据源
  datasource: unknown[]
  // 策略状态
  status: number
  // 所属策略组
  groupId: number
  // 策略组信息
  group: string
  // 告警页面
  alarmPages: unknown[]
  // 阈值
  threshold: number
  // 条件
  condition: number
  // 模板id
  strategyTemplateId: number
  // 持续时间
  duration: string
  // step
  step: number
  //模板来源
  sourceType: number
  // 创建时间
  createdAt: string
  // 更新时间
  updatedAt: string
  // 策略说明信息
  remark: string
  // 策略创建人
  creator: string
  // 创建人的id
  creatorId: number
}
