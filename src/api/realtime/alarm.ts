import { AlertStatus } from '../enum'
import { PaginationReply, PaginationReq } from '../global'
import { RealtimeAlarmItem } from '../model-types'
import request from '../request'

/**
 * 获取告警详情
 * @param {GetAlarmRequest} params
 * @returns {Promise<GetAlarmReply>}
 */
export function getAlarm(params: GetAlarmRequest): Promise<GetAlarmReply> {
  return request.GET<GetAlarmReply>(`/v1/admin/realtime/alarm/${params.id}`)
}

/**
 * 获取告警列表
 * @param {ListAlarmRequest} params
 * @returns {Promise<ListAlarmReply>}
 */
export function listAlarm(params: ListAlarmRequest): Promise<ListAlarmReply> {
  return request.POST<ListAlarmReply>('/v1/admin/realtime/alarm/list', params)
}

// export interface s for the requests and responses
export interface GetAlarmRequest {
  id: number
}

export interface GetAlarmReply {
  detail: RealtimeAlarmItem
}

export interface ListAlarmRequest {
  pagination: PaginationReq
  eventAtStart?: number
  eventAtEnd?: number
  recoverAtStart?: number
  recoverAtEnd?: number
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
