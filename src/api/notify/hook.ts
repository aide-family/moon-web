import { HookApp, Status } from '../enum'
import { PaginationReply, PaginationReq } from '../global'
import { AlarmHookItem, SelectItem } from '../model-types'
import request from '../request'

/**
 * 创建hook
 * @param params 创建hook请求参数
 * @returns 创建hook响应
 */
export function createHook(params: CreateHookRequest): Promise<CreateHookReply> {
  return request.POST<CreateHookReply>('/v1/hook/create', params)
}

/**
 * 更新hook
 * @param params 更新hook请求参数
 * @returns 更新hook响应
 */
export function updateHook(params: UpdateHookRequest): Promise<UpdateHookReply> {
  return request.PUT<UpdateHookReply>(`/v1/hook/${params.id}`, params)
}

/**
 * 更新hook状态
 * @param params 更新hook状态请求参数
 * @returns 更新hook状态响应
 */
export function updateHookStatus(params: UpdateHookStatusRequest): Promise<UpdateHookStatusReply> {
  return request.PUT<UpdateHookStatusReply>('/v1/hook/update/status', params)
}

/**
 * 删除hook
 * @param params 删除hook请求参数
 * @returns 删除hook响应
 */
export function deleteHook(params: DeleteHookRequest): Promise<DeleteHookReply> {
  return request.DELETE<DeleteHookReply>(`/v1/hook/delete/${params.id}`)
}

/**
 * 获取hook详情
 * @param params 获取hook详情请求参数
 * @returns 获取hook详情响应
 */
export function getHook(params: GetHookRequest): Promise<GetHookReply> {
  return request.GET<GetHookReply>(`/v1/hook/detail/${params.id}`)
}

/**
 * 获取hook列表
 * @param params 获取hook列表请求参数
 * @returns 获取hook列表响应
 */
export function listHook(params: ListHookRequest): Promise<ListHookReply> {
  return request.POST<ListHookReply>('/v1/hook/list', params)
}

/**
 * 获取hook下拉列表
 * @param params 获取hook下拉列表请求参数
 * @returns 获取hook下拉列表响应
 */
export function listHookSelectList(params: ListHookRequest): Promise<ListHookSelectListReply> {
  return request.POST<ListHookSelectListReply>('/v1/hook/select/list', params)
}

// 以下类型定义应基于实际的 proto 文件生成，此处仅为示例
export interface CreateHookRequest {
  name: string
  remark: string
  url: string
  secret: string
  hookApp: HookApp
  status: Status
}

export interface CreateHookReply {}

export interface UpdateHookRequest {
  id: number
  update: CreateHookRequest
}

export interface UpdateHookReply {}

export interface DeleteHookRequest {
  id: number
}

export interface DeleteHookReply {}

export interface GetHookRequest {
  id: number
}

export interface GetHookReply {
  detail: AlarmHookItem
}

export interface ListHookRequest {
  pagination: PaginationReq
  keyword: string
  status?: Status
  hookApp?: HookApp[]
  name?: string
}

export interface ListHookReply {
  list: AlarmHookItem[]
  pagination: PaginationReply
}

export interface UpdateHookStatusRequest {
  ids: number[]
  status: Status
}

export interface UpdateHookStatusReply {}

export interface ListHookSelectListReply {
  list: SelectItem[]
}
