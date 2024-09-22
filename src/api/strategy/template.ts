import { PaginationReply, PaginationReq } from '../global'
import { StrategyTemplateItem } from '../model-types'
import request from '../request'

/**
 * 策略等级挂钩的告警模板明细
 */
export interface MutationStrategyLevelTemplateItem {
  // 策略持续时间
  duration: string
  // 持续次数
  count: number
  // 持续的类型
  sustainType: number
  // 条件
  condition: number
  // 阈值
  threshold: number
  // ID
  id?: number
  // 策略等级
  levelId: number
}

/**
 * 创建策略模版请求
 */
export interface CreateTemplateStrategyRequest {
  // 策略名称
  alert: string
  // 策略表达式
  expr: string
  // 备注
  remark: string
  // 策略标签
  labels: Record<string, string>
  // 策略注解
  annotations: Record<string, string>
  // 策略等级模板
  levels: MutationStrategyLevelTemplateItem[]
  // 策略模板类型
  categoriesIds: number[]
}

/**
 * 创建策略模版响应
 */
export interface CreateTemplateStrategyReply {}

/**
 * 更新策略模版请求
 */
export interface UpdateTemplateStrategyRequest extends CreateTemplateStrategyRequest {
  // 策略ID
  id: number
}

/**
 * 更新策略模版响应
 */
export interface UpdateTemplateStrategyReply {}

/**
 * 删除策略模版请求
 */
export interface DeleteTemplateStrategyRequest {
  // 策略ID
  id: number
}

/**
 * 删除策略模版响应
 */
export interface DeleteTemplateStrategyReply {}

/**
 * 获取策略模版详情请求
 */
export interface GetTemplateStrategyRequest {
  // 策略ID
  id: number
}

/**
 * 获取策略模版详情响应
 */
export interface GetTemplateStrategyReply {
  detail: StrategyTemplateItem
}

/**
 * 获取策略模版列表请求
 */
export interface ListTemplateStrategyRequest {
  // 分页参数
  pagination: PaginationReq
  // 关键字模糊查询
  keyword?: string
  // 状态查询
  status?: number
  // Alert 名称
  alert?: string
}

/**
 * 获取策略模版列表响应
 */
export interface ListTemplateStrategyReply {
  // 分页信息
  pagination: PaginationReply
  // 策略列表
  list: StrategyTemplateItem[]
}

/**
 * 更新模板启用状态请求
 */
export interface UpdateTemplateStrategyStatusRequest {
  // 策略ID列表
  ids: number[]
  // 启用状态
  status: number
}

/**
 * 更新模板启用状态响应
 */
export interface UpdateTemplateStrategyStatusReply {}

/**
 * 模板校验请求
 */
export interface ValidateAnnotationsTemplateRequest {
  // 策略注解模板
  annotations: string
  // 策略表达式
  expr: string
  // 策略标签自定义标签
  labels: Record<string, string>
  // 策略等级
  level: string
  // 策略名称
  alert: string
  // 策略数据源
  datasource: string
  // 策略数据源ID
  datasourceId: number
  // 策略持续时间
  duration: number
  // 持续次数
  count: number
  // 持续的类型
  sustainType: number
  // 条件
  condition: number
  // 阈值
  threshold: number
}

/**
 * 模板校验响应
 */
export interface ValidateAnnotationsTemplateReply {
  // 策略模板填充后的数据
  annotations: string
  // 错误信息
  errors: string
  // 标签列表
  labels: string[]
}

/**
 * 创建策略模版
 */
export function createTemplateStrategy(params: CreateTemplateStrategyRequest): Promise<CreateTemplateStrategyReply> {
  return request.POST<CreateTemplateStrategyReply>('/v1/template/strategy/create', params)
}

/**
 * 更新策略模版
 */
export function updateTemplateStrategy(params: UpdateTemplateStrategyRequest): Promise<UpdateTemplateStrategyReply> {
  return request.PUT<UpdateTemplateStrategyReply>(`/v1/template/strategy/update/${params.id}`, params)
}

/**
 * 删除策略模版
 */
export function deleteTemplateStrategy(params: DeleteTemplateStrategyRequest): Promise<DeleteTemplateStrategyReply> {
  return request.DELETE<DeleteTemplateStrategyReply>(`/v1/template/strategy/delete/${params.id}`)
}

/**
 * 获取策略模版详情
 */
export function getTemplateStrategy(params: GetTemplateStrategyRequest): Promise<GetTemplateStrategyReply> {
  return request.GET<GetTemplateStrategyReply>(`/v1/template/strategy/get/${params.id}`)
}

/**
 * 获取策略模版列表
 */
export function listTemplateStrategy(params: ListTemplateStrategyRequest): Promise<ListTemplateStrategyReply> {
  return request.POST<ListTemplateStrategyReply>('/v1/template/strategy/list', params)
}

/**
 * 更改模板启用状态
 */
export function updateTemplateStrategyStatus(
  params: UpdateTemplateStrategyStatusRequest
): Promise<UpdateTemplateStrategyStatusReply> {
  return request.PUT<UpdateTemplateStrategyStatusReply>('/v1/template/strategy/status', params)
}

/**
 * 模板校验
 */
export function validateAnnotationsTemplate(
  params: ValidateAnnotationsTemplateRequest
): Promise<ValidateAnnotationsTemplateReply> {
  return request.POST<ValidateAnnotationsTemplateReply>('/v1/template/annotations/validate', params)
}
