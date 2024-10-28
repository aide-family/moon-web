import { SelfAlarmPageItem } from '../model-types'
import request from '../request'

/**
 * 维护个人告警页面信息
 * @method put /v1/admin/realtime/self/alarm/page/update
 * @param {UpdateAlarmPageRequest} params
 * @returns {UpdateAlarmPageReply}
 */
export function updateAlarmPage(params: UpdateAlarmPageRequest): Promise<UpdateAlarmPageReply> {
  return request.PUT<UpdateAlarmPageReply>('/v1/admin/realtime/self/alarm/page/update', params)
}

/**
 * 获取个人告警页面列表
 * @method get /v1/admin/realtime/self/alarm/page/list
 * @param {ListAlarmPageRequest} params
 * @returns {ListAlarmPageReply}
 */
export function listAlarmPage(params: ListAlarmPageRequest): Promise<ListAlarmPageReply> {
  return request.GET<ListAlarmPageReply>('/v1/admin/realtime/self/alarm/page/list', params)
}

// 类型定义
export interface UpdateAlarmPageRequest {
  alarmPageIds: number[]
}

export interface UpdateAlarmPageReply {}

export interface ListAlarmPageRequest {}

export interface ListAlarmPageReply {
  list: SelfAlarmPageItem[]
  alertCounts: { [key: number]: number }
}
