import { Condition, DatasourceType, Status, SustainType, TemplateSourceType } from '../enum'
import { PaginationReply, PaginationReq } from '../global'
import { StrategyGroupItem, StrategyItem } from '../model-types'
import request from '../request'

export interface SubscriberStrategyRequest {
  // 订阅策略请求参数
}

export interface SubscriberStrategyReply {
  // 订阅策略响应
}

// 策略组相关类型定义
export interface CreateStrategyGroupRequest {
  name: string
  remark?: string
  status?: Status
  categoriesIds: number[]
}

export interface CreateStrategyGroupReply {}

export interface DeleteStrategyGroupRequest {
  id: number
}

export interface DeleteStrategyGroupReply {}

export interface ListStrategyGroupRequest {
  pagination: PaginationReq
  keyword?: string
  status?: Status
  categoriesIds?: number[]
}

export interface ListStrategyGroupReply {
  list: StrategyGroupItem[]
  pagination: PaginationReply
}

export interface GetStrategyGroupRequest {
  id: number
}

export interface GetStrategyGroupReply {
  detail: StrategyGroupItem
}

export interface UpdateStrategyGroupRequest {
  id: number
  update: CreateStrategyGroupRequest
}

export interface UpdateStrategyGroupReply {}

export interface UpdateStrategyGroupStatusRequest {
  ids: number[]
  status: Status
}

export interface UpdateStrategyGroupStatusReply {}

export interface CreateStrategyRequest {
  groupId: number
  templateId?: number
  remark?: string
  status?: Status
  step: number
  datasourceIds: number[]
  sourceType?: TemplateSourceType
  name: string
  strategyLevel: CreateStrategyLevelRequest[]
  labels: { [key: string]: string }
  annotations: { [key: string]: string }
  expr: string
  categoriesIds: number[]
  alarmGroupIds: number[]
}

export interface CreateStrategyReply {}

export interface UpdateStrategyRequest {
  id: number
  data: CreateStrategyRequest
}

export interface UpdateStrategyReply {}

export interface DeleteStrategyRequest {
  id: number
}

export interface DeleteStrategyReply {}

export interface GetStrategyRequest {
  id: number
}

export interface GetStrategyReply {
  detail: StrategyItem
}

export interface ListStrategyRequest {
  pagination: PaginationReq
  keyword?: string
  status?: Status
  datasourceType?: DatasourceType
}

export interface ListStrategyReply {
  pagination: PaginationReply
  list: StrategyItem[]
}

export interface UpdateStrategyStatusRequest {
  ids: number[]
  status: Status
}

export interface UpdateStrategyStatusReply {}

export interface CreateStrategyLevelRequest {
  duration: number
  count: number
  sustainType: SustainType
  interval: number
  status?: Status
  levelId: number
  threshold: number
  condition: Condition
  alarmPageIds: number[]
  alarmGroupIds: number[]
  labelNotices: CreateStrategyLabelNoticeRequest[]
}

export interface CopyStrategyRequest {
  strategyId: number
}

export interface CopyStrategyReply {
  id: number
}

export interface CreateStrategyLabelNoticeRequest {
  name: string
  value: string
  alarmGroupIds: number[]
}

// API 请求定义
/**
 * 创建策略组
 * @param params CreateStrategyGroupRequest
 * @returns CreateStrategyGroupReply
 */
export function createStrategyGroup(params: CreateStrategyGroupRequest) {
  return request.POST<CreateStrategyGroupReply>('/v1/group/strategy/create', params)
}

/**
 * 删除策略组
 * @param params DeleteStrategyGroupRequest
 * @returns DeleteStrategyGroupReply
 */
export function deleteStrategyGroup(params: DeleteStrategyGroupRequest) {
  return request.DELETE<DeleteStrategyGroupReply>(`/v1/group/strategy/${params.id}`)
}

/**
 * 策略组列表
 * @param params ListStrategyGroupRequest
 * @returns ListStrategyGroupReply
 */
export function listStrategyGroup(params: ListStrategyGroupRequest) {
  return request.POST<ListStrategyGroupReply>('/v1/group/strategy/list', params)
}

/**
 * 策略组详情
 * @param params GetStrategyGroupRequest
 * @returns GetStrategyGroupReply
 */
export function getStrategyGroup(params: GetStrategyGroupRequest) {
  return request.GET<GetStrategyGroupReply>(`/v1/group/strategy/${params.id}`)
}

/**
 * 修改策略组
 * @param params UpdateStrategyGroupRequest
 * @returns UpdateStrategyGroupReply
 */
export function updateStrategyGroup(params: UpdateStrategyGroupRequest) {
  return request.PUT<UpdateStrategyGroupReply>(`/v1/group/strategy/${params.id}`, params.update)
}

/**
 * 修改策略分组状态
 * @param params UpdateStrategyGroupStatusRequest
 * @returns UpdateStrategyGroupStatusReply
 */
export function updateStrategyGroupStatus(params: UpdateStrategyGroupStatusRequest) {
  return request.PUT<UpdateStrategyGroupStatusReply>('/v1/group/strategy/update/status', params)
}

/**
 * 创建策略
 * @param params CreateStrategyRequest
 * @returns CreateStrategyReply
 */
export function createStrategy(params: CreateStrategyRequest) {
  return request.POST<CreateStrategyReply>('/v1/strategy/create', params)
}

/**
 * 修改策略
 * @param params UpdateStrategyRequest
 * @returns UpdateStrategyReply
 */
export function updateStrategy(params: UpdateStrategyRequest) {
  return request.PUT<UpdateStrategyReply>(`/v1/strategy/update/${params.id}`, params)
}

/**
 * 修改策略状态
 * @param params UpdateStrategyStatusRequest
 * @returns UpdateStrategyStatusReply
 */
export function updateStrategyStatus(params: UpdateStrategyStatusRequest) {
  return request.PUT<UpdateStrategyStatusReply>('/v1/strategy/status', params)
}

/**
 * 删除策略
 * @param params DeleteStrategyRequest
 * @returns DeleteStrategyReply
 */
export function deleteStrategy(params: DeleteStrategyRequest) {
  return request.DELETE<DeleteStrategyReply>(`/v1/strategy/delete/${params.id}`)
}

/**
 * 获取策略
 * @param params GetStrategyRequest
 * @returns GetStrategyReply
 */
export function getStrategy(params: GetStrategyRequest) {
  return request.GET<GetStrategyReply>(`/v1/strategy/get/${params.id}`)
}

/**
 * 策略列表
 * @param params ListStrategyRequest
 * @returns ListStrategyReply
 */
export function listStrategy(params: ListStrategyRequest) {
  return request.POST<ListStrategyReply>('/v1/strategy/list', params)
}

/**
 * 根据策略id生成策略
 * @param params CopyStrategyRequest
 * @returns CopyStrategyReply
 */
export function copyStrategy(params: CopyStrategyRequest) {
  return request.POST<CopyStrategyReply>('/v1/strategy/copy', params)
}
