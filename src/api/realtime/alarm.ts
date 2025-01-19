import type { AlertStatus } from '../enum'
import type { PaginationReply, PaginationReq } from '../global'
import type { RealtimeAlarmItem } from '../model-types'
import request from '../request'

/**
 * 获取告警详情
 * @param params 获取告警详情请求参数
 * @returns 获取告警详情响应
 */
export function getAlarm(params: GetAlarmRequest): Promise<GetAlarmReply> {
  return request.GET<GetAlarmReply>(`/v1/admin/realtime/alarm/${params.id}`)
}

/**
 * 获取告警列表
 * @param params 获取告警列表请求参数
 * @returns 获取告警列表响应
 */
export function listAlarm(params: ListAlarmRequest): Promise<ListAlarmReply> {
  return request.POST<ListAlarmReply>('/v1/admin/realtime/alarm/list', params)
}

// 以下类型定义基于 proto 文件
export interface GetAlarmRequest {
  id: number
}

export interface GetAlarmReply {
  detail: RealtimeAlarmItem
}

export interface ListAlarmRequest {
  pagination: PaginationReq
  eventAtStart?: string
  eventAtEnd?: string
  recoverAtStart?: string
  recoverAtEnd?: string
  alarmLevels?: number[]
  alarmStatuses?: AlertStatus[]
  keyword?: string
  alarmPage?: number
  myAlarm?: boolean
}

export interface ListAlarmReply {
  list: RealtimeAlarmItem[]
  pagination: PaginationReply
}
