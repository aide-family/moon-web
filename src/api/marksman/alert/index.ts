/**
 * 告警页与实时告警 API（策略管理服务 Alert）
 * 请求需带 Header：Authorization、X-Namespace（由 request 拦截器处理）
 */

import { http } from '../../index'
import type {
  AlertPageItem,
  AlertPageListParams,
  AlertPageListResponse,
  CreateAlertPageParams,
  CreateAlertPageResponse,
  UpdateAlertPageParams,
  ListRealtimeAlertParams,
  ListRealtimeAlertResponse,
  InterveneAlertParams,
  RecoverAlertParams,
  SuppressAlertParams,
} from './types'

export type {
  AlertPageItem,
  AlertPageFilter,
  AlertPageListParams,
  AlertPageListResponse,
  CreateAlertPageParams,
  CreateAlertPageResponse,
  UpdateAlertPageParams,
  AlertEventItem,
  ListRealtimeAlertParams,
  ListRealtimeAlertResponse,
  InterveneAlertParams,
  RecoverAlertParams,
  SuppressAlertParams,
} from './types'

/** 告警页列表 GET /v1/alert-pages */
export const getAlertPageList = (
  params?: AlertPageListParams
): Promise<AlertPageListResponse> => {
  return http.get<AlertPageListResponse>('/alert-pages', params as unknown as Record<string, unknown>)
}

/** 创建告警页 POST /v1/alert-pages */
export const createAlertPage = (
  params?: CreateAlertPageParams
): Promise<CreateAlertPageResponse> => {
  return http.post<CreateAlertPageResponse>('/alert-pages', params as Record<string, unknown>)
}

/** 告警页详情 GET /v1/alert-pages/{uid} */
export const getAlertPage = (uid: string): Promise<AlertPageItem> => {
  return http.get<AlertPageItem>(`/alert-pages/${uid}`)
}

/** 更新告警页 PUT /v1/alert-pages/{uid} */
export const updateAlertPage = (
  uid: string,
  params?: UpdateAlertPageParams
): Promise<Record<string, never>> => {
  return http.put<Record<string, never>>(`/alert-pages/${uid}`, params as Record<string, unknown>)
}

/** 删除告警页 DELETE /v1/alert-pages/{uid} */
export const deleteAlertPage = (uid: string): Promise<Record<string, never>> => {
  return http.delete<Record<string, never>>(`/alert-pages/${uid}`)
}

/** 实时告警列表 GET /v1/alert-pages/{alertPageUid}/realtime-alerts */
export const getRealtimeAlertList = (
  alertPageUid: string,
  params?: ListRealtimeAlertParams
): Promise<ListRealtimeAlertResponse> => {
  return http.get<ListRealtimeAlertResponse>(
    `/alert-pages/${alertPageUid}/realtime-alerts`,
    params as unknown as Record<string, unknown>
  )
}

/** 介入告警 POST /v1/realtime-alerts/{uid}/intervene */
export const interveneAlert = (
  uid: string,
  params?: InterveneAlertParams
): Promise<Record<string, never>> => {
  return http.post<Record<string, never>>(`/realtime-alerts/${uid}/intervene`, params as Record<string, unknown>)
}

/** 恢复告警 POST /v1/realtime-alerts/{uid}/recover */
export const recoverAlert = (
  uid: string,
  params?: RecoverAlertParams
): Promise<Record<string, never>> => {
  return http.post<Record<string, never>>(`/realtime-alerts/${uid}/recover`, params as Record<string, unknown>)
}

/** 抑制告警 POST /v1/realtime-alerts/{uid}/suppress */
export const suppressAlert = (
  uid: string,
  params?: SuppressAlertParams
): Promise<Record<string, never>> => {
  return http.post<Record<string, never>>(`/realtime-alerts/${uid}/suppress`, params as Record<string, unknown>)
}
