/**
 * 消息日志相关 API
 * MessageLog_GetMessageLog、MessageLog_ListMessageLog、
 * MessageLog_CancelMessage、MessageLog_RetryMessage
 * Header：Authorization、X-Namespace 由 request 拦截器统一处理
 */

import { http } from '../index'
import type {
  MessageLogItem,
  ListMessageLogsParams,
  ListMessageLogsResponse,
} from './types'

/**
 * MessageLog_GetMessageLog
 * GET /v1/message-log/{uid}
 */
export function getMessageLog(uid: string): Promise<MessageLogItem> {
  return http.get<MessageLogItem>(`/v1/message-log/${uid}`)
}

/**
 * MessageLog_ListMessageLog
 * GET /v1/message-logs
 * Query: page, pageSize, status, type, startAtUnix, endAtUnix
 */
export function listMessageLogs(
  params?: ListMessageLogsParams
): Promise<ListMessageLogsResponse> {
  return http.get<ListMessageLogsResponse>(
    '/v1/message-logs',
    params as unknown as Record<string, unknown>
  )
}

/**
 * MessageLog_CancelMessage
 * PUT /v1/message-log/{uid}/cancel
 * Body(application/json): uid 可选
 */
export function cancelMessage(
  uid: string,
  body?: { uid?: string }
): Promise<unknown> {
  return http.put<unknown>(`/v1/message-log/${uid}/cancel`, body as Record<string, unknown>)
}

/**
 * MessageLog_RetryMessage
 * PUT /v1/message-log/{uid}/retry
 * Body(application/json): uid 可选
 */
export function retryMessage(
  uid: string,
  body?: { uid?: string }
): Promise<unknown> {
  return http.put<unknown>(`/v1/message-log/${uid}/retry`, body as Record<string, unknown>)
}

export type { MessageLogItem, ListMessageLogsParams, ListMessageLogsResponse } from './types'
