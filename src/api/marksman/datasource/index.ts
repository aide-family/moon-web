/**
 * 数据源相关 API（策略管理服务，后端端口 8003）
 * 请求需带 Header：Authorization、X-Namespace（由 request 拦截器处理）
 */

import { http } from '../../index'
import type {
  DatasourceItem,
  DatasourceListParams,
  DatasourceListResponse,
  DatasourceSelectParams,
  DatasourceSelectResponse,
  CreateDatasourceParams,
  CreateDatasourceReply,
  UpdateDatasourceParams,
  DatasourceMetricsResponse,
  MetricDetailItem,
  GetDatasourceStatusParams,
  GetDatasourceStatusResponse,
  UpdateDatasourceStatusParams,
  UpdateDatasourceStatusReply,
} from './types'
export type {
  DatasourceItem,
  DatasourceListParams,
  CreateDatasourceParams,
  CreateDatasourceReply,
  UpdateDatasourceParams,
  MetricSummaryItem,
  MetricDetailItem,
  MetricLabelItem,
  GetDatasourceStatusParams,
  GetDatasourceStatusResponse,
  UpdateDatasourceStatusParams,
  UpdateDatasourceStatusReply,
} from './types'
export { DatasourceType, DatasourceDriver } from './types'

/** 获取数据源列表 GET /v1/datasources */
export const getDatasourceList = (params?: DatasourceListParams): Promise<DatasourceListResponse> => {
  return http.get<DatasourceListResponse>(
    '/datasources',
    { ...params }
  )
}

/** 获取数据源详情 GET /v1/datasource/{uid} */
export const getDatasourceDetail = (uid: string): Promise<DatasourceItem> => {
  return http.get<DatasourceItem>(`/datasource/${uid}`)
}

/** 创建数据源 POST /v1/datasource */
export const createDatasource = (
  params?: CreateDatasourceParams,
): Promise<CreateDatasourceReply> => {
  return http.post<CreateDatasourceReply>(
    '/datasource',
    { ...params }
  )
}

/** 更新数据源 PUT /v1/datasource/{uid} */
export const updateDatasource = (
  uid: string,
  params?: UpdateDatasourceParams,
): Promise<Record<string, never>> => {
  return http.put<Record<string, never>>(
    `/datasource/${uid}`,
    { ...params }
  )
}

/** 删除数据源 DELETE /v1/datasource/{uid} */
export const deleteDatasource = (uid: string): Promise<Record<string, never>> => {
  return http.delete<Record<string, never>>(`/datasource/${uid}`)
}

/** 数据源选择列表（下拉等）GET /v1/datasources/select */
export const getDatasourceSelectList = (params?: DatasourceSelectParams): Promise<DatasourceSelectResponse> => {
  return http.get<DatasourceSelectResponse>(
    '/datasources/select',
    { ...params }
  )
}

/** 获取数据源指标元数据 GET /v1/datasource/{uid}/metrics */
export const getDatasourceMetrics = (uid: string): Promise<DatasourceMetricsResponse> => {
  return http.get<DatasourceMetricsResponse>(`/datasource/${uid}/metrics`)
}

/** 获取单指标标签详情 GET /v1/datasource/{uid}/metric/{metric} */
export const getDatasourceMetricDetail = (
  uid: string,
  metric: string
): Promise<MetricDetailItem> => {
  return http.get<MetricDetailItem>(`/datasource/${uid}/metric/${encodeURIComponent(metric)}`)
}

/** 获取数据源状态序列 GET /v1/datasource/{uid}/status */
export const getDatasourceStatus = (
  uid: string,
  params?: GetDatasourceStatusParams
): Promise<GetDatasourceStatusResponse> => {
  return http.get<GetDatasourceStatusResponse>(
    `/datasource/${uid}/status`,
    { ...params }
  )
}

/** 更新数据源状态 PUT /v1/datasource/{uid}/status */
export const updateDatasourceStatus = (
  params: UpdateDatasourceStatusParams,
): Promise<UpdateDatasourceStatusReply> => {
  return http.put<UpdateDatasourceStatusReply>(
    `/datasource/${params.uid}/status`,
    { ...params },
  )
}

