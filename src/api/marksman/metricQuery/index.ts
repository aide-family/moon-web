/**
 * 指标查询 API（策略管理服务 MetricQuery：query、query_range、proxy）
 * 请求需带 Header：Authorization、X-Namespace（由 request 拦截器处理）
 */

import { http } from '../../index'
import type {
  MetricQueryProxyParams,
  MetricQueryProxyResponse,
  MetricQueryParams,
  MetricQueryResponse,
  MetricQueryRangeParams,
  MetricQueryRangeResponse,
} from './types'

export type {
  MetricQueryProxyParams,
  MetricQueryProxyResponse,
  MetricQueryParams,
  MetricQueryResponse,
  MetricQueryRangeParams,
  MetricQueryRangeResponse,
} from './types'

/** 代理请求到数据源 POST /v1/metric-query/proxy */
export const metricQueryProxy = (
  params?: MetricQueryProxyParams
): Promise<MetricQueryProxyResponse> => {
  return http.post<MetricQueryProxyResponse>('/metric-query/proxy', params as Record<string, unknown>)
}

/** 即时查询 POST /v1/metric-query/query */
export const metricQuery = (params?: MetricQueryParams): Promise<MetricQueryResponse> => {
  return http.post<MetricQueryResponse>('/metric-query/query', params as Record<string, unknown>)
}

/** 区间查询 POST /v1/metric-query/query-range */
export const metricQueryRange = (
  params?: MetricQueryRangeParams
): Promise<MetricQueryRangeResponse> => {
  return http.post<MetricQueryRangeResponse>('/metric-query/query-range', params as Record<string, unknown>)
}
