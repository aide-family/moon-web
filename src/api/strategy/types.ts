import { Pagination, PaginationResponse, Status } from '../global'

/**策略组空响应参数 */
export interface StrategyGroupNullResponse {}

/** 策略组创建人 */
export interface StrategyGroupCreatorType {
  // 用户id
  id: number
  // 用户名
  name: string
  // 昵称
  nickname: string
  // 邮箱
  email: string
  // 手机
  phone: string
  // 状态
  status: number
  // 角色
  role: number
  // 头像
  avatar: string
  // 个人说明
  remark: string
  // 创建时间
  createdAt: string
  // 更新时间
  updatedAt: string
}

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
  creator: StrategyGroupCreatorType
  // 创建人的id
  creatorId: string
  categoriesIds: number[]
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
