/**
 * 数据源相关类型定义（策略管理服务 Datasource API）
 */

/**
 * 数据源类型枚举（与后端 DatasourceType 一致，传字符串给后端）
 */
export enum DatasourceType {
  DatasourceType_UNKNOWN = 'DatasourceType_UNKNOWN',
  METRICS = 'METRICS',
  LOGS = 'LOGS',
  TRACE = 'TRACE',
}

/**
 * 数据源驱动枚举（与后端 DatasourceDriver 一致，传字符串给后端）
 */
export enum DatasourceDriver {
  DatasourceDriver_UNKNOWN = 'DatasourceDriver_UNKNOWN',
  METRICS_PROMETHEUS = 'METRICS_PROMETHEUS',
  METRICS_VICTORIA_METRICS = 'METRICS_VICTORIA_METRICS',
  LOGS_ELASTICSEARCH = 'LOGS_ELASTICSEARCH',
  TRACE_JAEGER = 'TRACE_JAEGER',
}

/** 数据源单项（列表/详情） */
export interface DatasourceItem {
  uid?: string
  name?: string
  type?: string
  driver?: string
  status?: number
  createdAt?: string
  updatedAt?: string
  url?: string
  remark?: string
  metadata?: Record<string, string>
}

/** 列表请求参数 */
export interface DatasourceListParams {
  keyword?: string
  page?: number
  pageSize?: number
  type?: string
  driver?: string
  status?: number
}

/** 列表响应 */
export interface DatasourceListResponse {
  items?: DatasourceItem[]
  total?: string
  page?: number
  pageSize?: number
}

/** 选择项（下拉等） */
export interface SelectDatasourceItem {
  value?: string
  label?: string
  disabled?: boolean
  tooltip?: string
  type?: string
  driver?: string
  url?: string
}

/** 选择接口请求参数 */
export interface DatasourceSelectParams {
  keyword?: string
  limit?: number
  lastUID?: string
  type?: string
  driver?: string
  status?: number
  uids?: string[]
}

/** 选择接口响应 */
export interface DatasourceSelectResponse {
  items?: SelectDatasourceItem[]
  total?: string
  lastUID?: string
  hasMore?: boolean
}

/** 创建数据源请求参数 */
export interface CreateDatasourceParams {
  name?: string
  type?: string
  driver?: string
  url?: string
  remark?: string
  metadata?: Record<string, string>
}

/** 更新数据源请求参数 */
export interface UpdateDatasourceParams {
  uid?: string
  name?: string
  type?: string
  driver?: string
  url?: string
  remark?: string
  metadata?: Record<string, string>
}

/** 指标元数据项（ListMetrics 接口返回，与后端 help 对齐） */
export interface MetricSummaryItem {
  name?: string
  help?: string
  unit?: string
  type?: string
}

/** 数据源指标列表响应 GET /v1/datasource/{uid}/metrics */
export interface DatasourceMetricsResponse {
  metrics?: MetricSummaryItem[]
}

/** 指标标签项（GetMetricDetail 返回的 labels 元素） */
export interface MetricLabelItem {
  name?: string
  values?: string[]
}

/** 单指标详情（GetMetricDetail 返回）GET /v1/datasource/{uid}/metric/{metric} */
export interface MetricDetailItem {
  name?: string
  help?: string
  unit?: string
  type?: string
  labels?: MetricLabelItem[]
}

/** 数据源状态数据点 */
export interface DatasourceStatusPoint {
  timestamp?: string
  value?: number
}

/** 数据源状态序列 */
export interface DatasourceStatusSeries {
  uid?: string
  name?: string
  points?: DatasourceStatusPoint[]
}

/** 获取数据源状态查询参数 GET /v1/datasource/{uid}/status */
export interface GetDatasourceStatusParams {
  startTime?: number
  endTime?: number
  stepSeconds?: number
}

/** 获取数据源状态响应 */
export interface GetDatasourceStatusResponse {
  series?: DatasourceStatusSeries[]
}
