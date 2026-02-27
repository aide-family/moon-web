/**
 * 应用类型与 iconfont 图标名映射
 * 用于下拉列表和表格中展示应用图标
 * iconfont: icon-duanxin(短信) icon-youjian(邮件) icon-zidingyi(自定义) icon-qiyeweixin(企业微信) icon-dingding(钉钉) icon-feishu(飞书)
 */

import { WebhookAPP } from '@/api'
import { MessageType } from '@/api/types'

/** Webhook 应用枚举 key -> iconfont 类型名 */
const WEBHOOK_APP_ICON: Record<string, string> = {
  [WebhookAPP.OTHER]: 'icon-zidingyi',
  [WebhookAPP.DINGTALK]: 'icon-dingding',
  [WebhookAPP.WECHAT]: 'icon-qiyeweixin',
  [WebhookAPP.FEISHU]: 'icon-feishu',
  [WebhookAPP.WebhookAPP_UNKNOWN]: 'icon-zidingyi',
}

/** 消息类型枚举 key -> iconfont 类型名 */
const MESSAGE_TYPE_ICON: Record<string, string> = {
  [MessageType.EMAIL]: 'icon-youjian',
  [MessageType.SMS_ALICLOUD]: 'icon-duanxin',
  [MessageType.WEBHOOK_OTHER]: 'icon-zidingyi',
  [MessageType.WEBHOOK_DINGTALK]: 'icon-dingding',
  [MessageType.WEBHOOK_WECHAT]: 'icon-qiyeweixin',
  [MessageType.WEBHOOK_FEISHU]: 'icon-feishu',
  [MessageType.MessageType_UNKNOWN]: 'icon-zidingyi',
}

const DEFAULT_APP_ICON = 'icon-zidingyi'

/**
 * 根据 Webhook 应用 key 获取 iconfont 类型名
 */
export function getWebhookAppIconType(key: string): string {
  return WEBHOOK_APP_ICON[key] ?? DEFAULT_APP_ICON
}

/**
 * 根据消息类型 key 获取 iconfont 类型名
 */
export function getMessageTypeIconType(key: string): string {
  return MESSAGE_TYPE_ICON[key] ?? DEFAULT_APP_ICON
}
