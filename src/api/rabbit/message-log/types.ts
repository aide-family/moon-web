import type { MessageStatus, MessageType } from '@/api/common/types'

/**
 * 消息日志相关类型定义
 * 依据接口：MessageLog_ListMessageLog、MessageLog_GetMessageLog、
 * MessageLog_CancelMessage、MessageLog_RetryMessage
 * status/messageType 与后端约定为字符串枚举值（MessageStatus、MessageType）
 */

/** 单条消息日志（接口返回项） */
export interface MessageLogItem {
  uid?: string
  messageType?: MessageType | string
  status?: MessageStatus | string
  sendAt?: string
  message?: string
  config?: string
  retryTotal?: number
  lastError?: string
  createdAt?: string
  updatedAt?: string
}

/** 列表查询参数 */
export interface ListMessageLogsParams {
  page?: number
  pageSize?: number
  status?: MessageStatus | string
  messageType?: MessageType | string
  startAtUnix?: string
  endAtUnix?: string
}

/** 列表响应 */
export interface ListMessageLogsResponse {
  items?: MessageLogItem[]
  total?: string
  page?: number
  pageSize?: number
}
