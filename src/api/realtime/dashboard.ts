import { PaginationReply, PaginationReq, Status } from '../global'
import { ChartItem, DashboardItem, SelectItem } from '../model-types'
import request from '../request'

/**
 * 创建大盘
 * @method post /v1/admin/realtime/dashboard/create
 * @param {CreateDashboardRequest} params
 * @returns {CreateDashboardReply}
 */
export function createDashboard(params: CreateDashboardRequest): Promise<CreateDashboardReply> {
  return request.POST<CreateDashboardReply>('/v1/admin/realtime/dashboard/create', params)
}

/**
 * 更新大盘
 * @method put /v1/admin/realtime/dashboard/update/{id}
 * @param {UpdateDashboardRequest} params
 * @returns {UpdateDashboardReply}
 */
export function updateDashboard(params: UpdateDashboardRequest): Promise<UpdateDashboardReply> {
  return request.PUT<UpdateDashboardReply>(`/v1/admin/realtime/dashboard/update/${params.id}`, params)
}

/**
 * 删除大盘
 * @method delete /v1/admin/realtime/dashboard/delete
 * @param {DeleteDashboardRequest} params
 * @returns {DeleteDashboardReply}
 */
export function deleteDashboard(params: DeleteDashboardRequest): Promise<DeleteDashboardReply> {
  return request.DELETE<DeleteDashboardReply>('/v1/admin/realtime/dashboard/delete', params)
}

/**
 * 获取大盘明细
 * @method get /v1/admin/realtime/dashboard/get/{id}
 * @param {GetDashboardRequest} params
 * @returns {GetDashboardReply}
 */
export function getDashboard(params: GetDashboardRequest): Promise<GetDashboardReply> {
  return request.GET<GetDashboardReply>(`/v1/admin/realtime/dashboard/get/${params.id}`)
}

/**
 * 获取大盘列表
 * @method post /v1/admin/realtime/dashboard/list
 * @param {ListDashboardRequest} params
 * @returns {ListDashboardReply}
 */
export function listDashboard(params: ListDashboardRequest): Promise<ListDashboardReply> {
  return request.POST<ListDashboardReply>('/v1/admin/realtime/dashboard/list', params)
}

/**
 * 获取大盘下拉列表
 * @method post /v1/admin/realtime/dashboard/list/select
 * @param {ListDashboardRequest} params
 * @returns {ListDashboardSelectReply}
 */
export function listDashboardSelect(params: ListDashboardRequest): Promise<ListDashboardSelectReply> {
  return request.POST<ListDashboardSelectReply>('/v1/admin/realtime/dashboard/list/select', params)
}

// 类型定义
export interface CreateDashboardRequest {
  title: string
  remark: string
  color: string
  charts: ChartItem[]
  strategyGroups: number[]
}

export interface CreateDashboardReply {}

export interface UpdateDashboardRequest {
  id: number
  title: string
  remark: string
  color: string
  charts: ChartItem[]
  strategyGroups: number[]
}

export interface UpdateDashboardReply {}

export interface DeleteDashboardRequest {
  id: number
}

export interface DeleteDashboardReply {}

export interface GetDashboardRequest {
  id: number
}

export interface GetDashboardReply {
  detail: DashboardItem
}

export interface ListDashboardRequest {
  keyword: string
  status: Status
  pagination: PaginationReq
  myDashboard: boolean
}

export interface ListDashboardReply {
  list: DashboardItem[]
  pagination: PaginationReply
}

export interface ListDashboardSelectReply {
  list: SelectItem[]
  pagination: PaginationReply
}
