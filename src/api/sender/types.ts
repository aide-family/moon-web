/**
 * Sender 相关类型定义
 * 依据 Sender 接口文档：Sender_SendEmail、Sender_SendEmailWithTemplate、
 * Sender_SendMessage、Sender_SendWebhook、Sender_SendWebhookWithTemplate
 */

/** 发送邮件（模板）Body 参数 */
export interface SendEmailWithTemplateParams {
  uid?: string
  templateUID?: string
  jsonData?: string
  to?: string[]
  cc?: string[]
}

/** 发送 Webhook Body 参数 */
export interface SendWebhookParams {
  uid?: string
  data?: string
}

/** 发送 Webhook（模板）Body 参数 */
export interface SendWebhookWithTemplateParams {
  uid?: string
  templateUID?: string
  jsonData?: string
}

/** 发送消息 Body 参数（文档中可见 uid，其余以可选扩展） */
export interface SendMessageParams {
  uid: string
  [key: string]: unknown
}
