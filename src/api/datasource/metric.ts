import { MetricType, Pagination, PaginationResponse } from '../global'
import request from '../request'

export interface MetricItemType {
  name: string
  help?: string
  type: MetricType
  labels?: MetricLabelType[]
  unit?: string
  labelCount?: number
  id: number
}

export interface MetricLabelType {
  name: string
  values?: MetricLabelValueType[]
  id: number
}

export interface MetricLabelValueType {
  id: number
  value: string
}

export interface MetricListRequest {
  pagination: Pagination
  keyword?: string
  metricType?: MetricType
  datasourceId?: number
}

/**
 * 获取元数据列表
 * POST /v1/datasource/metric/list
 */
const getMetricList = (params: MetricListRequest) => {
  return request.POST<PaginationResponse<MetricItemType>>('/v1/datasource/metric/list', params)
}

/**
 * 同步数据源元数据
 * POST /v1/datasource/{id}/sync
 */
const syncMetric = (datasourceId: number) => {
  return request.POST(`/v1/datasource/${datasourceId}/sync`, {})
}

/**
 * 获取元数据详情
 * GET /v1/datasource/metric/{id}
 */
const getMetricDetail = (id: number, withRelation: boolean = false) => {
  return request.GET<{ data: MetricItemType }>(`/v1/datasource/metric/${id}`, {
    withRelation
  })
}

export default {
  getMetricList,
  syncMetric,
  getMetricDetail
}
