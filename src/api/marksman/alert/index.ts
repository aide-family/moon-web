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
  GetAlertStatisticsReply,
  ListUserAlertPagesReply,
  SaveUserAlertPagesRequest,
  SaveUserAlertPagesReply,
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
  GetAlertStatisticsReply,
  ListUserAlertPagesReply,
  SaveUserAlertPagesRequest,
  SaveUserAlertPagesReply,
} from './types'

/** 告警页列表 GET /v1/alert/alert-pages */
export const getAlertPageList = (
  params?: AlertPageListParams
): Promise<AlertPageListResponse> => {
  return http.get<AlertPageListResponse>(
    '/alert/alert-pages',
    params as unknown as Record<string, unknown>
  )
}

/** 创建告警页 POST /v1/alert/alert-pages */
export const createAlertPage = (
  params?: CreateAlertPageParams
): Promise<CreateAlertPageResponse> => {
  return http.post<CreateAlertPageResponse>(
    '/alert/alert-pages',
    params as Record<string, unknown>
  )
}

/** 告警页详情 GET /v1/alert/alert-pages/{uid} */
export const getAlertPage = (uid: string): Promise<AlertPageItem> => {
  return http.get<AlertPageItem>(`/alert/alert-pages/${uid}`)
}

/** 更新告警页 PUT /v1/alert/alert-pages/{uid} */
export const updateAlertPage = (
  uid: string,
  params?: UpdateAlertPageParams
): Promise<Record<string, never>> => {
  return http.put<Record<string, never>>(
    `/alert/alert-pages/${uid}`,
    params as Record<string, unknown>
  )
}

/** 删除告警页 DELETE /v1/alert/alert-pages/{uid} */
export const deleteAlertPage = (uid: string): Promise<Record<string, never>> => {
  return http.delete<Record<string, never>>(`/alert/alert-pages/${uid}`)
}

/** 实时告警列表 GET /v1/alert/alert-pages/{alertPageUid}/realtime-alerts */
export const getRealtimeAlertList = (
  alertPageUid: string,
  params?: ListRealtimeAlertParams
): Promise<ListRealtimeAlertResponse> => {
  return http.get<ListRealtimeAlertResponse>(
    `/alert/alert-pages/${alertPageUid}/realtime-alerts`,
    params as unknown as Record<string, unknown>
  )
}

/** 介入告警 POST /v1/alert/realtime-alerts/{uid}/intervene */
export const interveneAlert = (
  uid: string,
  params?: InterveneAlertParams
): Promise<Record<string, never>> => {
  return http.post<Record<string, never>>(
    `/alert/realtime-alerts/${uid}/intervene`,
    params as Record<string, unknown>
  )
}

/** 恢复告警 POST /v1/alert/realtime-alerts/{uid}/recover */
export const recoverAlert = (
  uid: string,
  params?: RecoverAlertParams
): Promise<Record<string, never>> => {
  return http.post<Record<string, never>>(
    `/alert/realtime-alerts/${uid}/recover`,
    params as Record<string, unknown>
  )
}

/** 抑制告警 POST /v1/alert/realtime-alerts/{uid}/suppress */
export const suppressAlert = (
  uid: string,
  params?: SuppressAlertParams
): Promise<Record<string, never>> => {
  return http.post<Record<string, never>>(
    `/alert/realtime-alerts/${uid}/suppress`,
    params as Record<string, unknown>
  )
}

/** 获取告警统计 GET /v1/alert/statistics */
export const getAlertStatistics = (): Promise<GetAlertStatisticsReply> => {
  return http.get<GetAlertStatisticsReply>('/alert/statistics')
}

/** 获取用户告警页列表 GET /v1/alert/user/alert-pages */
export const listUserAlertPages = (): Promise<ListUserAlertPagesReply> => {
  return http.get<ListUserAlertPagesReply>('/alert/user/alert-pages')
}

/** 保存用户告警页列表 PUT /v1/alert/user/alert-pages */
export const saveUserAlertPages = (
  params?: SaveUserAlertPagesRequest
): Promise<SaveUserAlertPagesReply> => {
  return http.put<SaveUserAlertPagesReply>('/alert/user/alert-pages', params as Record<string, unknown>)
}
