import { MetricType } from '../enum'
import { PaginationReply, PaginationReq } from '../global'
import { MetricItem, SelectItem } from '../model-types'
import request from '../request'

/**
 * 更新元数据
 * @param {UpdateMetricRequest} params
 * @returns {Promise<UpdateMetricReply>}
 */
export function updateMetric(params: UpdateMetricRequest): Promise<UpdateMetricReply> {
  return request.PUT<UpdateMetricReply>(`/v1/datasource/metric/${params.id}`, params)
}

/**
 * 获取元数据详情
 * @param {GetMetricRequest} params
 * @returns {Promise<GetMetricReply>}
 */
export function getMetric(params: GetMetricRequest): Promise<GetMetricReply> {
  return request.GET<GetMetricReply>(`/v1/datasource/metric/${params.id}`, params)
}

/**
 * 获取元数据列表
 * @param {ListMetricRequest} params
 * @returns {Promise<ListMetricReply>}
 */
export function listMetric(params: ListMetricRequest): Promise<ListMetricReply> {
  return request.POST<ListMetricReply>('/v1/datasource/metric/list', params)
}

/**
 * 获取元数据列表（下拉选择接口）
 * @param {ListMetricRequest} params
 * @returns {Promise<SelectMetricReply>}
 */
export function selectMetric(params: ListMetricRequest): Promise<SelectMetricReply> {
  return request.POST<SelectMetricReply>('/v1/datasource/metric/select', params)
}

/**
 * 删除指标
 * @param {DeleteMetricRequest} params
 * @returns {Promise<DeleteMetricReply>}
 */
export function deleteMetric(params: DeleteMetricRequest): Promise<DeleteMetricReply> {
  return request.DELETE<DeleteMetricReply>(`/v1/datasource/metric/${params.id}`, params)
}

/**
 * 推送元数据信息
 * @param {SyncMetricRequest} params
 * @returns {Promise<SyncMetricReply>}
 */
export function syncMetric(params: SyncMetricRequest): Promise<SyncMetricReply> {
  return request.POST<SyncMetricReply>('/v1/datasource/metric/sync', params)
}

// Types

/**
 * 更新元数据请求
 */
export interface UpdateMetricRequest {
  /**
   * 指标ID
   */
  id: number
  /**
   * 指标单位
   */
  unit?: string
  /**
   * 指标描述
   */
  remark: string
}

/**
 * 更新元数据响应
 */
export interface UpdateMetricReply {}

/**
 * 删除指标请求
 */
export interface DeleteMetricRequest {
  /**
   * 指标ID
   */
  id: number
}

/**
 * 删除指标响应
 */
export interface DeleteMetricReply {}

/**
 * 获取元数据详情请求
 */
export interface GetMetricRequest {
  /**
   * 指标ID
   */
  id: number
  /**
   * 是否加载关联数据
   */
  withRelation?: boolean
}

/**
 * 获取元数据详情响应
 */
export interface GetMetricReply {
  /**
   * 详情
   */
  data: MetricItem
  /**
   * label数量
   */
  labelCount: number
}

/**
 * 获取元数据列表请求
 */
export interface ListMetricRequest {
  /**
   * 分页参数
   */
  pagination: PaginationReq
  /**
   * 模糊查询，不超过20字符搜索
   */
  keyword?: string
  /**
   * 指标类型
   */
  metricType?: MetricType
  /**
   * 数据源ID
   */
  datasourceId?: number
}

/**
 * 获取元数据列表响应
 */
export interface ListMetricReply {
  /**
   * 分页参数
   */
  pagination: PaginationReply
  /**
   * 数据
   */
  list: MetricItem[]
}

/**
 * 获取元数据列表（下拉选择接口）响应
 */
export interface SelectMetricReply {
  /**
   * 数据
   */
  list: SelectItem[]
  /**
   * 分页参数
   */
  pagination: PaginationReply
}

/**
 * 推送元数据信息请求
 */
export interface SyncMetricRequest {
  /**
   * 推送一个指标数据
   */
  metrics: MetricItem
  /**
   * 是否推送完毕
   */
  done: boolean
  /**
   * 数据源ID
   */
  datasourceId: number
  /**
   * 团队ID
   */
  teamId: number
}

/**
 * 推送元数据信息响应
 */
export interface SyncMetricReply {}
