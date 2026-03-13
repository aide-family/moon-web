/**
 * 模板管理相关常量
 * 应用对应 messageType，使用 api/types 的 MessageType 枚举
 */

import { MessageType } from '@/api/common/types'

/** 用于列表筛选/表单的 messageType 可选值（排除 UNKNOWN） */
export const MESSAGE_TYPE_OPTIONS: MessageType[] = [
  MessageType.EMAIL,
  MessageType.SMS_ALICLOUD,
  MessageType.WEBHOOK_OTHER,
  MessageType.WEBHOOK_DINGTALK,
  MessageType.WEBHOOK_WECHAT,
  MessageType.WEBHOOK_FEISHU,
]

/**
 * 获取消息类型选项列表（支持国际化）
 * @param t 翻译函数
 * @returns 消息类型选项列表
 */
export const getMessageTypeOptions = (t: (key: string) => string) => {
  return MESSAGE_TYPE_OPTIONS.map(value => ({
    label: t(`messageType.${getMessageTypeI18nKey(value)}`),
    value,
  }))
}

/** 枚举值 -> i18n key（messageType.xxx，与 common 文案统一） */
function getMessageTypeI18nKey(value: string): string {
  return value === MessageType.MessageType_UNKNOWN ? 'UNKNOWN' : value
}

/**
 * 根据 messageType 获取标签（支持国际化）
 * @param value messageType 枚举值（MessageType 字符串）
 * @param t 翻译函数
 * @returns 显示标签
 */
export const getMessageTypeLabel = (value: MessageType | string | undefined, t: (key: string) => string): string => {
  if (value === undefined || value === null || value === '') return '-'
  return t(`messageType.${getMessageTypeI18nKey(value)}`)
}
