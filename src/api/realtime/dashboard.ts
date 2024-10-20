import { Status } from '../enum'
import { PaginationReply, PaginationReq } from '../global'
import { ChartItem, DashboardItem, SelectItem } from '../model-types'
import request from '../request'

/**
 * 创建大盘
 * @param params 创建大盘请求参数
 * @returns 创建大盘响应
 */
export function createDashboard(params: CreateDashboardRequest): Promise<CreateDashboardReply> {
  return request.POST<CreateDashboardReply>('/v1/admin/realtime/dashboard/create', params)
}

/**
 * 更新大盘
 * @param params 更新大盘请求参数
 * @returns 更新大盘响应
 */
export function updateDashboard(params: UpdateDashboardRequest): Promise<UpdateDashboardReply> {
  return request.PUT<UpdateDashboardReply>(`/v1/admin/realtime/dashboard/update/${params.id}`, params)
}

/**
 * 删除大盘
 * @param params 删除大盘请求参数
 * @returns 删除大盘响应
 */
export function deleteDashboard(params: DeleteDashboardRequest): Promise<DeleteDashboardReply> {
  return request.DELETE<DeleteDashboardReply>(`/v1/admin/realtime/dashboard/delete/${params.id}`)
}

/**
 * 获取大盘明细
 * @param params 获取大盘明细请求参数
 * @returns 获取大盘明细响应
 */
export function getDashboard(params: GetDashboardRequest): Promise<GetDashboardReply> {
  return request.GET<GetDashboardReply>(`/v1/admin/realtime/dashboard/get/${params.id}`)
}

/**
 * 获取大盘列表
 * @param params 获取大盘列表请求参数
 * @returns 获取大盘列表响应
 */
export function listDashboard(params: ListDashboardRequest): Promise<ListDashboardReply> {
  return request.POST<ListDashboardReply>('/v1/admin/realtime/dashboard/list', params)
}

/**
 * 获取大盘下拉列表
 * @param params 获取大盘下拉列表请求参数
 * @returns 获取大盘下拉列表响应
 */
export function listDashboardSelect(params: ListDashboardRequest): Promise<ListDashboardSelectReply> {
  return request.POST<ListDashboardSelectReply>('/v1/admin/realtime/dashboard/list/select', params)
}

/**
 * 批量修改仪表板状态
 * @param params 批量修改仪表板状态请求参数
 * @returns 批量修改仪表板状态响应
 */
export function batchUpdateDashboardStatus(
  params: BatchUpdateDashboardStatusRequest
): Promise<BatchUpdateDashboardStatusReply> {
  return request.POST<BatchUpdateDashboardStatusReply>('/v1/admin/realtime/dashboard/batch/update/status', params)
}

export interface BatchUpdateDashboardStatusRequest {
  ids: number[]
  status: Status
}

export interface BatchUpdateDashboardStatusReply {}

// 以下类型定义基于 proto 文件
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
