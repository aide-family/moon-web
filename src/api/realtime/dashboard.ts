import type { Status } from '../enum'
import type { PaginationReply, PaginationReq } from '../global'
import type { ChartItem, DashboardItem, SelectItem } from '../model-types'
import request from '../request'

/**
 * 创建大盘
 * @param params 创建大盘请求参数
 * @returns 创建大盘响应
 */
export function createDashboard(params: CreateDashboardRequest): Promise<null> {
  return request.POST<null>('/v1/admin/realtime/dashboard/create', params)
}

/**
 * 更新大盘
 * @param params 更新大盘请求参数
 * @returns 更新大盘响应
 */
export function updateDashboard(params: UpdateDashboardRequest): Promise<null> {
  return request.PUT<null>(`/v1/admin/realtime/dashboard/update/${params.id}`, params)
}

/**
 * 删除大盘
 * @param params 删除大盘请求参数
 * @returns 删除大盘响应
 */
export function deleteDashboard(params: DeleteDashboardRequest): Promise<null> {
  return request.DELETE<null>(`/v1/admin/realtime/dashboard/delete/${params.id}`)
}

/**
 * 获取大盘明细
 * @param params 获取大盘明细请求参数
 * @returns 获取大盘明细响应
 */
export function getDashboard(params: GetDashboardRequest): Promise<GetDashboardReply> {
  return request.GET<GetDashboardReply>(`/v1/admin/realtime/dashboard/get/${params.id}`, params)
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
 * 创建图表
 * @param params 创建图表请求参数
 * @returns 创建图表响应
 */
export function createChart(params: CreateChartRequest): Promise<null> {
  return request.POST<null>(`/v1/admin/realtime/dashboard/${params.dashboardId}/chart/add`, params)
}

/**
 * 更新图表
 * @param params 更新图表请求参数
 * @returns 更新图表响应
 */
export function updateChart(params: UpdateChartRequest): Promise<null> {
  return request.PUT<null>(`/v1/admin/realtime/dashboard/${params.dashboardId}/chart/update/${params.id}`, params)
}

/**
 * 删除图表
 * @param params 删除图表请求参数
 * @returns 删除图表响应
 */
export function deleteChart(params: DeleteChartRequest): Promise<null> {
  return request.DELETE<null>(`/v1/admin/realtime/dashboard/${params.dashboardId}/chart/delete/${params.id}`)
}

/**
 * 获取图表明细
 * @param params 获取图表明细请求参数
 * @returns 获取图表明细响应
 */
export function getChart(params: GetChartRequest): Promise<GetChartReply> {
  return request.GET<GetChartReply>(`/v1/admin/realtime/dashboard/${params.dashboardId}/chart/get/${params.id}`)
}

/**
 * 获取图表列表
 * @param params 获取图表列表请求参数
 * @returns 获取图表列表响应
 */
export function listChart(params: ListChartRequest): Promise<ListChartReply> {
  return request.POST<ListChartReply>(`/v1/admin/realtime/dashboard/${params.dashboardId}/chart/list`, params)
}

/**
 * 批量修改仪表板状态
 * @param params 批量修改仪表板状态请求参数
 * @returns 批量修改仪表板状态响应
 */
export function batchUpdateDashboardStatus(params: BatchUpdateDashboardStatusRequest): Promise<null> {
  return request.POST<null>('/v1/admin/realtime/dashboard/batch/update/status', params)
}

/**
 * 批量修改图表状态
 * @param params 批量修改图表状态请求参数
 * @returns 批量修改图表状态响应
 */
export function batchUpdateChartStatus(params: BatchUpdateChartStatusRequest): Promise<null> {
  return request.PUT<null>(`/v1/admin/realtime/dashboard/${params.dashboardId}/chart/batch/update/status`, params)
}

/** 批量更新图表排序
 * @param params 批量更新图表排序请求参数
 * @returns 批量更新图表排序响应
 */
export function batchUpdateChartSort(params: BatchUpdateChartSortRequest): Promise<null> {
  return request.PUT<null>(`/v1/admin/realtime/dashboard/${params.dashboardId}/chart/batch/update/sort`, params)
}

/**
 * 获取个人仪表板列表
 * @returns 获取个人仪表板列表响应
 */
export function listMyDashboard(): Promise<ListMyDashboardReply> {
  return request.GET<ListMyDashboardReply>('/v1/admin/realtime/self/dashboard/list')
}

/**
 * 更新个人仪表板
 * @param params 更新个人仪表板请求参数
 * @returns 更新个人仪表板响应
 */
export function updateMyDashboard(params: UpdateMyDashboardRequest): Promise<null> {
  return request.PUT<null>('/v1/admin/realtime/self/dashboard/update', params)
}

/** 批量修改仪表板状态请求参数 */
export interface BatchUpdateDashboardStatusRequest {
  /** 仪表板 ID 列表 */
  ids: number[]
  /** 状态 */
  status: Status
}

/** 创建仪表板请求参数 */
export interface CreateDashboardRequest {
  /** 标题 */
  title: string
  /** 备注 */
  remark: string
  /** 颜色 */
  color: string
  /** 状态 */
  status: Status
  /** 策略组 ID 列表 */
  strategyGroups: number[]
}

/** 更新仪表板请求参数 */
export interface UpdateDashboardRequest {
  /** 仪表板 ID */
  id: number
  /** 仪表板请求参数 */
  dashboard: CreateDashboardRequest
}

/** 删除仪表板请求参数 */
export interface DeleteDashboardRequest {
  /** 仪表板 ID */
  id: number
}

/** 获取仪表板请求参数 */
export interface GetDashboardRequest {
  /** 仪表板 ID */
  id: number
  /** 是否获取图表 */
  charts?: boolean
  /** 是否获取我的仪表板 */
  myDashboard?: boolean
}

/** 获取仪表板响应 */
export interface GetDashboardReply {
  /** 仪表板明细 */
  detail: DashboardItem
}

/** 获取仪表板列表请求参数 */
export interface ListDashboardRequest {
  /** 关键字 */
  keyword?: string
  /** 状态 */
  status?: Status
  /** 分页请求参数 */
  pagination: PaginationReq
  /** 是否只获取我的仪表板 */
  myDashboard?: boolean
}

/** 获取仪表板列表响应 */
export interface ListDashboardReply {
  /** 仪表板列表 */
  list: DashboardItem[]
  /** 分页响应 */
  pagination: PaginationReply
}

/** 获取仪表板下拉列表响应 */
export interface ListDashboardSelectReply {
  /** 仪表板列表 */
  list: SelectItem[]
  /** 分页响应 */
  pagination: PaginationReply
}

/** 创建图表请求参数 */
export interface CreateChartRequest {
  /** 仪表板 ID */
  dashboardId: number
  /** 标题 */
  title: string
  /** 备注 */
  remark: string
  /** 图表 URL */
  url: string
  /** 状态 */
  status: Status
  /** 宽度 */
  width: string
  /** 高度 */
  height: string
}

/** 更新图表请求参数 */
export interface UpdateChartRequest {
  /** 图表 ID */
  id: number
  /** 仪表板 ID */
  dashboardId: number
  /** 图表请求参数 */
  chart: CreateChartRequest
}

/** 删除图表请求参数 */
export interface DeleteChartRequest {
  /** 图表 ID */
  id: number
  /** 仪表板 ID */
  dashboardId: number
}

/** 获取图表请求参数 */
export interface GetChartRequest {
  /** 图表 ID */
  id: number
  /** 仪表板 ID */
  dashboardId: number
}

/** 获取图表响应 */
export interface GetChartReply {
  /** 图表明细 */
  detail: ChartItem
}

/** 获取图表列表请求参数 */
export interface ListChartRequest {
  /** 仪表板 ID */
  dashboardId: number
  /** 分页请求参数 */
  pagination: PaginationReq
  /** 关键字 */
  keyword?: string
  /** 状态 */
  status?: Status
}

/** 获取图表列表响应 */
export interface ListChartReply {
  /** 图表列表 */
  list: ChartItem[]
  /** 分页响应 */
  pagination: PaginationReply
}

/** 批量修改图表状态请求参数 */
export interface BatchUpdateChartStatusRequest {
  /** 仪表板 ID */
  dashboardId: number
  /** 图表 ID 列表 */
  ids: number[]
  /** 状态 */
  status: Status
}

/** 批量更新图表排序请求参数 */
export interface BatchUpdateChartSortRequest {
  /** 仪表板 ID */
  dashboardId: number
  /** 图表 ID 列表 */
  ids: number[]
}

/** 获取个人仪表板列表响应 */
export interface ListMyDashboardReply {
  /** 仪表板列表 */
  list: DashboardItem[]
}

/** 更新个人仪表板请求参数 */
export interface UpdateMyDashboardRequest {
  /** 仪表板 ID 列表 */
  ids: number[]
}
