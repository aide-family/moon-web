import type { AlertStatus } from '../enum'
import type { PaginationReply, PaginationReq } from '../global'
import type {
  DatasourceItem,
  StrategyDomainLevelItem,
  StrategyEventLevelItem,
  StrategyHTTPLevelItem,
  StrategyItem,
  StrategyMetricLevelItem,
  StrategyPortLevelItem
} from '../model-types'
import request from '../request'

/**
 * 获取告警历史记录
 * @param params 获取告警历史记录请求参数
 * @returns 获取告警历史记录响应
 */
export function getHistory(params: GetHistoryRequest): Promise<GetHistoryReply> {
  return request.GET<GetHistoryReply>(`/v1/admin/history/alarm/${params.id}`)
}

/**
 * 获取告警历史记录列表
 * @param params 获取告警历史记录列表请求参数
 * @returns 获取告警历史记录列表响应
 */
export function listHistory(params: ListHistoryRequest): Promise<ListHistoryReply> {
  return request.POST<ListHistoryReply>('/v1/admin/history/alarm/list', params)
}

// 以下类型定义基于 proto 文件
export interface GetHistoryRequest {
  id: number
}

export interface GetHistoryReply {
  alarmHistory: AlarmHistoryItem
}

export interface ListHistoryRequest {
  pagination: PaginationReq
  keyword: string
  alarmStatuses: AlertStatus[]
}

export interface ListHistoryReply {
  list: AlarmHistoryItem[]
  pagination: PaginationReply
}

export interface AlarmHistoryItem {
  id: number
  startsAt: string
  endsAt: string
  alertStatus: AlertStatus
  metricLevel?: StrategyMetricLevelItem
  portLevel?: StrategyPortLevelItem
  domainLevel?: StrategyDomainLevelItem
  httpLevel?: StrategyHTTPLevelItem
  eventLevel?: StrategyEventLevelItem
  strategy?: StrategyItem
  description: string
  expr: string
  datasource: DatasourceItem
  fingerprint: string
  rawInfo: string
  labels: Record<string, string>
  annotations: Record<string, string>
  summary: string
  duration: string
}
