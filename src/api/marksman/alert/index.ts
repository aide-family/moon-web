/**
 * 告警页与实时告警 API（策略管理服务 Alert）
 * 请求需带 Header：Authorization、X-Namespace（由 request 拦截器处理）
 */

import { http } from '../../index'
import type {
  AlertPageItem,
  AlertEventItem,
  AlertPageListParams,
  AlertPageListResponse,
  CreateAlertPageParams,
  CreateAlertPageResponse,
  UpdateAlertPageParams,
  ListRealtimeAlertParams,
  ListRealtimeAlertResponse,
  ListHistoryAlertParams,
  ListHistoryAlertResponse,
  CreateHistoryAlertExportTaskParams,
  CreateHistoryAlertExportTaskReply,
  ListHistoryAlertExportTaskParams,
  ListHistoryAlertExportTaskResponse,
  InterveneAlertParams,
  BatchInterveneAlertParams,
  RecoverAlertParams,
  BatchRecoverAlertParams,
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
  ListHistoryAlertParams,
  ListHistoryAlertResponse,
  HistoryAlertExportFilter,
  CreateHistoryAlertExportTaskParams,
  CreateHistoryAlertExportTaskReply,
  HistoryAlertExportTaskItem,
  ListHistoryAlertExportTaskParams,
  ListHistoryAlertExportTaskResponse,
  HistoryAlertExportTaskEvent,
  HistoryAlertExportTaskStatus,
  InterveneAlertParams,
  BatchInterveneAlertParams,
  RecoverAlertParams,
  BatchRecoverAlertParams,
  SuppressAlertParams,
  GetAlertStatisticsReply,
  ListUserAlertPagesReply,
  SaveUserAlertPagesRequest,
  SaveUserAlertPagesReply,
} from './types'

/** 告警页列表 GET /v1/alert/alert-pages */
export const getAlertPageList = (
  params?: AlertPageListParams,
): Promise<AlertPageListResponse> => {
  return http.get<AlertPageListResponse>('/alert/alert-pages', { ...params })
}

/** 创建告警页 POST /v1/alert/alert-pages */
export const createAlertPage = (
  params?: CreateAlertPageParams,
): Promise<CreateAlertPageResponse> => {
  return http.post<CreateAlertPageResponse>('/alert/alert-pages', { ...params })
}

/** 告警页详情 GET /v1/alert/alert-pages/{uid} */
export const getAlertPage = (uid: string): Promise<AlertPageItem> => {
  return http.get<AlertPageItem>(`/alert/alert-pages/${uid}`)
}

/** 更新告警页 PUT /v1/alert/alert-pages/{uid} */
export const updateAlertPage = (
  uid: string,
  params?: UpdateAlertPageParams,
): Promise<Record<string, never>> => {
  return http.put<Record<string, never>>(`/alert/alert-pages/${uid}`, {
    ...params,
  })
}

/** 删除告警页 DELETE /v1/alert/alert-pages/{uid} */
export const deleteAlertPage = (
  uid: string,
): Promise<Record<string, never>> => {
  return http.delete<Record<string, never>>(`/alert/alert-pages/${uid}`)
}

/** 实时告警列表 GET /v1/alert/alert-pages/{alertPageUid}/realtime-alerts */
export const getRealtimeAlertList = (
  alertPageUid: string,
  params?: ListRealtimeAlertParams,
): Promise<ListRealtimeAlertResponse> => {
  return http.get<ListRealtimeAlertResponse>(
    `/alert/alert-pages/${alertPageUid}/realtime-alerts`,
    { ...params },
  )
}

/** 获取实时告警事件详情 GET /v1/alert/realtime-alerts/{uid} */
export const getRealtimeAlertDetail = (
  uid: string,
): Promise<AlertEventItem> => {
  return http.get<AlertEventItem>(`/alert/realtime-alerts/${uid}`)
}

/** 历史告警列表 GET /v1/alert/history-alerts */
export const getHistoryAlertList = (
  params?: ListHistoryAlertParams,
): Promise<ListHistoryAlertResponse> => {
  return http.get<ListHistoryAlertResponse>('/alert/history-alerts', {
    ...params,
  })
}

/** 创建历史告警导出任务 POST /v1/alert/history-alerts/export-tasks */
export const createHistoryAlertExportTask = (
  params: CreateHistoryAlertExportTaskParams,
): Promise<CreateHistoryAlertExportTaskReply> => {
  return http.post<CreateHistoryAlertExportTaskReply>(
    '/alert/history-alerts/export-tasks',
    params as unknown as Record<string, unknown>,
  )
}

/** 历史告警导出任务列表 GET /v1/alert/history-alerts/export-tasks */
export const listHistoryAlertExportTasks = (
  params?: ListHistoryAlertExportTaskParams,
): Promise<ListHistoryAlertExportTaskResponse> => {
  return http.get<ListHistoryAlertExportTaskResponse>(
    '/alert/history-alerts/export-tasks',
    { ...params },
  )
}

/** 取消历史告警导出任务 POST /v1/alert/history-alerts/export-tasks/{uid}/cancel */
export const cancelHistoryAlertExportTask = (
  uid: string,
): Promise<Record<string, never>> => {
  return http.post<Record<string, never>>(
    `/alert/history-alerts/export-tasks/${uid}/cancel`,
    {},
  )
}

/** 下载历史告警导出文件 GET /v1/alert/history-alerts/export-tasks/{uid}/download */
export const downloadHistoryAlertExportTask = async (
  uid: string,
  fileName: string,
): Promise<void> => {
  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token') || ''
  const namespace = localStorage.getItem('namespace') || ''
  const response = await fetch(`/v1/alert/history-alerts/export-tasks/${uid}/download`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'X-Namespace': namespace,
    },
  })
  if (!response.ok) {
    throw new Error(`download failed: ${response.status}`)
  }
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName || `history-alerts-${uid}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

/** 介入告警 POST /v1/alert/realtime-alerts/{uid}/intervene */
export const interveneAlert = (
  uid: string,
  params?: InterveneAlertParams,
): Promise<Record<string, never>> => {
  return http.post<Record<string, never>>(
    `/alert/realtime-alerts/${uid}/intervene`,
    { ...params },
  )
}

/** 批量介入告警 POST /v1/alert/realtime-alerts/batch-intervene */
export const batchInterveneAlert = (
  params: BatchInterveneAlertParams,
): Promise<Record<string, never>> => {
  return http.post<Record<string, never>>(
    `/alert/realtime-alerts/batch-intervene`,
    { ...params },
  )
}

/** 恢复告警 POST /v1/alert/realtime-alerts/{uid}/recover */
export const recoverAlert = (
  uid: string,
  params?: RecoverAlertParams,
): Promise<Record<string, never>> => {
  return http.post<Record<string, never>>(
    `/alert/realtime-alerts/${uid}/recover`,
    { ...params },
  )
}

/** 批量恢复告警 POST /v1/alert/realtime-alerts/batch-recover */
export const batchRecoverAlert = (
  params: BatchRecoverAlertParams,
): Promise<Record<string, never>> => {
  return http.post<Record<string, never>>(
    `/alert/realtime-alerts/batch-recover`,
    { ...params },
  )
}

/** 抑制告警 POST /v1/alert/realtime-alerts/{uid}/suppress */
export const suppressAlert = (
  uid: string,
  params?: SuppressAlertParams,
): Promise<Record<string, never>> => {
  return http.post<Record<string, never>>(
    `/alert/realtime-alerts/${uid}/suppress`,
    { ...params },
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
  params?: SaveUserAlertPagesRequest,
): Promise<SaveUserAlertPagesReply> => {
  return http.put<SaveUserAlertPagesReply>('/alert/user/alert-pages', {
    ...params,
  })
}
