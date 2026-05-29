/**
 * 指标查询相关类型（MetricQuery API）
 * 接口文档：MetricQuery_Proxy、MetricQuery_Query、MetricQuery_QueryRange
 */

/** 代理请求：直接转发到数据源，path 为后缀无前导斜杠，如 api/v1/query */
export interface MetricQueryProxyParams {
  uid?: string
  path?: string
  method?: string
  /** 可选 body，GET/DELETE 时忽略 */
  body?: string
}

/** 代理响应 */
export interface MetricQueryProxyResponse {
  statusCode?: number
  response?: Record<string, unknown>
}

/** 即时查询请求（Prometheus /api/v1/query），time 为评估时间戳 Unix 秒 */
export interface MetricQueryParams {
  uid?: string
  query?: string
  time?: string
}

/** 即时查询响应（Prometheus 结构：status, data.resultType, data.result） */
export interface MetricQueryResponse {
  response?: Record<string, unknown>
}

/** 区间查询请求（Prometheus /api/v1/query_range） */
export interface MetricQueryRangeParams {
  uid?: string
  query?: string
  /** 开始时间 Unix 秒，未设置默认 end-1h 或 now-1h */
  start?: string
  /** 结束时间 Unix 秒，未设置默认 now */
  end?: string
  /** 步长秒数，如 15、60，未设置默认 60，范围 (0, 86400] */
  step?: string
}

/** 区间查询响应 */
export interface MetricQueryRangeResponse {
  response?: Record<string, unknown>
}

/** Prometheus 标签集 */
export type PrometheusLabelSet = Record<string, string>

/** Prometheus 即时查询结果项 */
export interface PrometheusVectorResult {
  metric: PrometheusLabelSet
  value: [number, string]
}

/** Prometheus 区间查询结果项 */
export interface PrometheusMatrixResult {
  metric: PrometheusLabelSet
  values: [number, string][]
}

/** Prometheus API 响应（/api/v1/query、/api/v1/query_range 等） */
export interface PrometheusApiResponse {
  status: 'success' | 'error'
  data?: {
    resultType: 'vector' | 'matrix' | 'scalar' | 'string'
    result:
      | PrometheusVectorResult[]
      | PrometheusMatrixResult[]
      | [number, string]
  }
  error?: string
  errorType?: string
}

/** REST 代理 GET 请求参数 */
export interface MetricProxyGetParams {
  uid: string
  /** 路径后缀，无前导斜杠，如 api/v1/query */
  path: string
  /** 查询参数，会拼接到代理路径后 */
  params?: Record<string, string | number | undefined>
}
