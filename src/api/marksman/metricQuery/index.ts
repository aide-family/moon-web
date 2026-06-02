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
  MetricProxyGetParams,
  PrometheusApiResponse,
} from './types'

export type {
  MetricQueryProxyParams,
  MetricQueryProxyResponse,
  MetricQueryParams,
  MetricQueryResponse,
  MetricQueryRangeParams,
  MetricQueryRangeResponse,
  MetricProxyGetParams,
  PrometheusApiResponse,
  PrometheusLabelSet,
  PrometheusVectorResult,
  PrometheusMatrixResult,
} from './types'

const proxyRequestConfig = {
  /** ProxyHandler 会透传 Prometheus 非 2xx 状态，由调用方解析 body */
  validateStatus: () => true,
  showError: false,
} as const

/** 代理请求到数据源 POST /v1/metric-query/proxy */
export const metricQueryProxy = (
  params?: MetricQueryProxyParams,
): Promise<MetricQueryProxyResponse> => {
  return http.post<MetricQueryProxyResponse>('/metric-query/proxy', {
    ...params,
  })
}

/** 即时查询 POST /v1/metric-query/query */
export const metricQuery = (
  params?: MetricQueryParams,
): Promise<MetricQueryResponse> => {
  return http.post<MetricQueryResponse>('/metric-query/query', { ...params })
}

/** 区间查询 POST /v1/metric-query/query-range */
export const metricQueryRange = (
  params?: MetricQueryRangeParams,
): Promise<MetricQueryRangeResponse> => {
  return http.post<MetricQueryRangeResponse>('/metric-query/query-range', {
    ...params,
  })
}

/**
 * 通过 REST 代理转发 GET 请求到数据源
 * GET /v1/metric/proxy/{uid}/{path}
 * 认证头由 request 拦截器自动注入（Authorization、X-Namespace）
 */
export const metricProxyGet = ({
  uid,
  path,
  params,
}: MetricProxyGetParams): Promise<PrometheusApiResponse> => {
  return http.get<PrometheusApiResponse>(
    `/metric/proxy/${uid}/${path}`,
    params,
    proxyRequestConfig,
  )
}

/** Prometheus 即时查询 GET /v1/metric/proxy/{uid}/api/v1/query */
export const prometheusQuery = (
  uid: string,
  query: string,
  time?: number,
): Promise<PrometheusApiResponse> => {
  return metricProxyGet({
    uid,
    path: 'api/v1/query',
    params: {
      query,
      ...(time != null ? { time: String(time) } : {}),
    },
  })
}

/** Prometheus 区间查询 GET /v1/metric/proxy/{uid}/api/v1/query_range */
export const prometheusQueryRange = (
  uid: string,
  query: string,
  start: number,
  end: number,
  step: number,
): Promise<PrometheusApiResponse> => {
  return metricProxyGet({
    uid,
    path: 'api/v1/query_range',
    params: {
      query,
      start: String(start),
      end: String(end),
      step: String(step),
    },
  })
}

/** Prometheus 指标名列表 GET /api/v1/label/__name__/values */
export const prometheusMetricNames = (
  uid: string,
): Promise<PrometheusApiResponse> => {
  return metricProxyGet({
    uid,
    path: 'api/v1/label/__name__/values',
  })
}

/** Prometheus 标签名列表 GET /api/v1/labels */
export const prometheusLabels = (
  uid: string,
): Promise<PrometheusApiResponse> => {
  return metricProxyGet({ uid, path: 'api/v1/labels' })
}

/** Prometheus 标签值列表 GET /api/v1/label/{label}/values */
export const prometheusLabelValues = (
  uid: string,
  label: string,
): Promise<PrometheusApiResponse> => {
  return metricProxyGet({
    uid,
    path: `api/v1/label/${encodeURIComponent(label)}/values`,
  })
}
