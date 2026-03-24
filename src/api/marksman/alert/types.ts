/**
 * 告警页与实时告警相关类型（Alert API）
 * 接口文档：Alert_ListAlertPage、Alert_CreateAlertPage、Alert_GetAlertPage、Alert_UpdateAlertPage、
 * Alert_DeleteAlertPage、Alert_ListRealtimeAlert、Alert_InterveneAlert、Alert_RecoverAlert、Alert_SuppressAlert
 * Alert_GetAlertStatistics、Alert_ListUserAlertPages、Alert_SaveUserAlertPages
 */

import type { AlertStatus } from '@/api/common/types'

/** 告警页筛选条件（哪些告警属于该页，任意匹配） */
export interface AlertPageFilter {
  strategyGroupUids?: string[]
  levelUids?: string[]
  strategyUids?: string[]
}

/** 告警页单项（视图/分类） */
export interface AlertPageItem {
  uid?: string
  name?: string
  color?: string
  sortOrder?: number
  filter?: AlertPageFilter
  createdAt?: string
  updatedAt?: string
}

/** 告警页列表请求参数 GET /v1/alert-pages */
export interface AlertPageListParams {
  page?: number
  pageSize?: number
  keyword?: string
}

/** 告警页列表响应 */
export interface AlertPageListResponse {
  items?: AlertPageItem[]
  total?: string
  page?: number
  pageSize?: number
}

/** 创建告警页请求体 POST /v1/alert-pages */
export interface CreateAlertPageParams {
  name?: string
  color?: string
  sortOrder?: number
  filter?: AlertPageFilter
}

/** 创建告警页响应 */
export interface CreateAlertPageResponse {
  uid?: string
}

/** 更新告警页请求体 PUT /v1/alert-pages/{uid} */
export interface UpdateAlertPageParams {
  uid?: string
  name?: string
  color?: string
  sortOrder?: number
  filter?: AlertPageFilter
}

/** 实时告警事件单项 */
export interface AlertEventItem {
  uid?: string
  strategyUid?: string
  namespaceUid?: string
  levelUid?: string
  levelName?: string
  summary?: string
  description?: string
  expr?: string
  firedAt?: string
  value?: number
  labels?: Record<string, string>
  datasourceUid?: string
  status?: AlertStatus
  intervenedAt?: string
  intervenedBy?: string
  suppressUntilAt?: string
  suppressedBy?: string
  suppressedReason?: string
  recoveredAt?: string
  recoveredBy?: string
  recoveredReason?: string
  /** 实时告警列表行背景色（与等级 bgColor 等来源一致，由后端聚合返回） */
  bgColor?: string
  createdAt?: string
  updatedAt?: string
}

/** 实时告警列表请求参数 GET /v1/alert-pages/{alertPageUid}/realtime-alerts */
export interface ListRealtimeAlertParams {
  page?: number
  pageSize?: number
  status?: number
  startAtUnix?: string
  endAtUnix?: string
}

/** 实时告警列表响应 */
export interface ListRealtimeAlertResponse {
  items?: AlertEventItem[]
  total?: string
  page?: number
  pageSize?: number
}

/** 告警统计（GET /v1/alert/statistics） */
export interface GetAlertStatisticsReply {
  totalActiveCount?: string
  todayRecoveredCount?: string
  countByLevel?: LevelCount[]
  countByAlertPage?: AlertPageCount[]
}

/** 按告警等级统计项 */
export interface LevelCount {
  levelUid?: string
  levelName?: string
  count?: string
}

/** 按告警页统计项 */
export interface AlertPageCount {
  alertPageUid?: string
  alertPageName?: string
  count?: string
}

/** 用户可见告警页列表（GET /v1/alert/user/alert-pages） */
export interface ListUserAlertPagesReply {
  items?: AlertPageItem[]
}

/** 保存用户告警页列表请求体（PUT /v1/alert/user/alert-pages） */
export interface SaveUserAlertPagesRequest {
  alertPageUids?: string[]
}

/** 保存用户告警页列表响应（PUT /v1/alert/user/alert-pages） */
export type SaveUserAlertPagesReply = Record<string, never>

/** 介入告警请求体 POST /v1/realtime-alerts/{uid}/intervene */
export interface InterveneAlertParams {
  uid?: string
}

/** 恢复告警请求体 POST /v1/realtime-alerts/{uid}/recover */
export interface RecoverAlertParams {
  uid?: string
  recoveredReason?: string
}

/** 抑制告警请求体 POST /v1/alert/realtime-alerts/{uid}/suppress，suppressUntilUnix 为 Unix 秒（string） */
export interface SuppressAlertParams {
  uid?: string
  suppressUntilUnix?: string
  suppressedReason?: string
}
