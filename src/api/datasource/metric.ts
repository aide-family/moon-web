import request from '@/api/request'
import { PaginationResponse } from '../global'
import { MetricItemType, MetricListRequest } from './types'

/**
 * 获取元数据列表
 * POST /v1/datasource/metric/list
 */
export const getMetricList = (params: MetricListRequest) => {
  return request.POST<PaginationResponse<MetricItemType>>('/v1/datasource/metric/list', params)
}

/**
 * 同步数据源元数据
 * POST /v1/datasource/{id}/sync
 */
export const syncMetric = (datasourceId: number) => {
  return request.POST(`/v1/datasource/${datasourceId}/sync`, {})
}

/**
 * 获取元数据详情
 * GET /v1/datasource/metric/{id}
 */
export const getMetricDetail = (id: number, withRelation: boolean = false) => {
  return request.GET<{ data: MetricItemType }>(`/v1/datasource/metric/${id}`, {
    withRelation
  })
}
