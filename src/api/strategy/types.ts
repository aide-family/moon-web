import { Pagination, PaginationResponse, Status, SustainType, SelectType, Condition, SelectExtendType } from '../global'
import { UserItem } from '../authorization/user'

/**策略组空响应参数 */
export interface StrategyGroupNullResponse { }

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
  categoriesIds: number[]
}

/**策略组列表响应参数 */
export interface GetStrategyGroupListResponse extends PaginationResponse<StrategyGroupItemType> { }

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
  categoriesIds?: number[]
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
export interface GetStrategyListResponse extends PaginationResponse<StrategyItemType> { }

/** 告警页面 */
export interface AlarmPageType {
  // 数据值
  value: number
  // 数据labe
  label: string
  // 子级数据, 针对级联选择
  children: number
  // 是否禁用
  disabled: boolean
  // 图标类型
  extend?: SelectExtendType
}

/** 子级数据, 针对级联选择 */
export interface LevelChildrenType {
  //
  value: number
  // 数据labe
  label: string
  // 是否禁用
  disabled: boolean
  children: number
  extend?: SelectExtendType
}

/** 数据源 */
export interface DataSourceType {
  // 数据源ID
  id: number
  // 数据源名称
  name: string
  // 数据源类型
  type: number
  // 数据源状态
  status: number
  // 数据源地址
  endpoint: string
  // 创建时间
  createdAt: string
  // 更新时间
  updatedAt: string
  // 描述
  remark: string
  // 存储器类型
  storageType: number
  // creator
  creator: UserItem
}

/** 策略等级模板详情 */
export interface StrategyLevelItemType {
  // 策略等级数据ID
  id: number
  // 策略持续时间
  duration: string
  // 持续次数
  count: number
  // 持续的类型
  sustainType: SustainType
  // 执行频率
  interval: string
  // 状态
  status: Status
  // 策略等级
  levelId: number
  // 策略等级明细
  level?: SelectType
  // 阈值
  threshold: number
  // 条件
  condition: Condition
  // 策略模板ID
  strategyId: number
  // 告警页面
  alarmPages: AlarmPageType
  // 子级数据, 针对级联选择
  children: LevelChildrenType
}

/** 策略 */
export interface StrategyItemType {
  // 策略ID
  id: number
  // 策略名称
  name: string
  // 策略语句
  expr: string
  // 根据策略等级配置的详细策略， key为策略等级ID
  levels: StrategyLevelItemType[]
  // labels
  labels: Record<string, string>
  // 策略注解
  annotations: Record<string, string>
  // 数据源
  datasource: DataSourceType[]
  // 策略状态
  status: number
  // 所属策略组
  groupId: number
  // 策略组信息
  group: string
  // 告警页面
  alarmPages: AlarmPageType
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

/** 创建策略请求体 */
export interface CreateStrategyRequest {
  // 策略名称
  alert: string
  // 策略表达式
  expr: string
  // 策略说明信息
  remark: string
  // 标签字典
  labels: Record<string, string>
  // 注解
  annotations: Record<string, string>
  // 策略等级明细
  level: any
  // 策略模板类型
  categoriesIds: number[]
}
