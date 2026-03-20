/**
 * 消息日志相关 API
 * MessageLog_GetMessageLog、MessageLog_ListMessageLog、
 * MessageLog_CancelMessage、MessageLog_RetryMessage
 * Header：Authorization、X-Namespace 由 request 拦截器统一处理
 */

import { http } from '../../index'
import type {
  MessageLogItem,
  ListMessageLogsParams,
  ListMessageLogsResponse,
} from './types'

/**
 * MessageLog_GetMessageLog
 * GET /message-log/{uid}
 */
export function getMessageLog(uid: string): Promise<MessageLogItem> {
  return http.get<MessageLogItem>(`/message-log/${uid}`)
}

/**
 * MessageLog_ListMessageLog
 * GET /message-logs
 * Query: page, pageSize, status, messageType, startAtUnix, endAtUnix
 */
export function listMessageLogs(
  params?: ListMessageLogsParams
): Promise<ListMessageLogsResponse> {
  return http.get<ListMessageLogsResponse>(
    '/message-logs',
    { ...params }
  )
}

/**
 * MessageLog_CancelMessage
 * PUT /message-log/{uid}/cancel
 * Body(application/json): uid 可选
 */
export function cancelMessage(
  uid: string,
  body?: { uid?: string }
): Promise<unknown> {
  return http.put<unknown>(`/message-log/${uid}/cancel`, { ...body })
}

/**
 * MessageLog_RetryMessage
 * PUT /message-log/{uid}/retry
 * Body(application/json): uid 可选
 */
export function retryMessage(
  uid: string,
  body?: { uid?: string }
): Promise<unknown> {
  return http.put<unknown>(`/message-log/${uid}/retry`, { ...body })
}

export type { MessageLogItem, ListMessageLogsParams, ListMessageLogsResponse } from './types'
