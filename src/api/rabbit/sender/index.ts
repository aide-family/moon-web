/**
 * Sender 相关 API
 * 依据接口文档：Sender_SendEmail、Sender_SendEmailWithTemplate、
 * Sender_SendMessage、Sender_SendWebhook、Sender_SendWebhookWithTemplate
 * 请求需带 Header：Authorization (Bearer)、X-Namespace（由 request 拦截器统一处理）
 */

import { http } from '../../index'
import type {
  SendEmailParams,
  SendEmailWithTemplateParams,
  SendWebhookParams,
  SendWebhookWithTemplateParams,
  SendMessageParams,
} from './types'

/**
 * Sender_SendEmail
 * POST /sender/email/{uid}
 * Path: uid (string, 必需)；Body(application/json, 必需): uid, subject, body, contentType?, to?, cc?, headers?
 */
export function sendEmail(uid: string, params: SendEmailParams): Promise<unknown> {
  return http.post<unknown>(`/sender/email/${uid}`, params as unknown as Record<string, unknown>)
}

/**
 * Sender_SendEmailWithTemplate
 * POST /sender/email/{uid}/template
 * Path: uid (string)；Body(application/json): uid?, templateUID?, jsonData?, to?, cc?
 */
export function sendEmailWithTemplate(
  uid: string,
  params?: SendEmailWithTemplateParams
): Promise<unknown> {
  return http.post<unknown>(`/sender/email/${uid}/template`, params as unknown as Record<string, unknown>)
}

/**
 * Sender_SendMessage
 * POST /sender/message
 * Body(application/json, 必需): uid 等
 */
export function sendMessage(params: SendMessageParams): Promise<unknown> {
  return http.post<unknown>('/sender/message', params as unknown as Record<string, unknown>)
}

/**
 * Sender_SendWebhook
 * POST /sender/webhook/{uid}
 * Path: uid (string)；Body(application/json, 必需): uid?, data?
 */
export function sendWebhook(uid: string, params?: SendWebhookParams): Promise<unknown> {
  return http.post<unknown>(`/sender/webhook/${uid}`, params as unknown as Record<string, unknown>)
}

/**
 * Sender_SendWebhookWithTemplate
 * POST /sender/webhook/{uid}/template
 * Path: uid (string)；Body(application/json, 必需): uid?, templateUID?, jsonData?
 */
export function sendWebhookWithTemplate(
  uid: string,
  params?: SendWebhookWithTemplateParams
): Promise<unknown> {
  return http.post<unknown>(`/sender/webhook/${uid}/template`, params as unknown as Record<string, unknown>)
}

export type {
  SendEmailParams,
  SendEmailWithTemplateParams,
  SendWebhookParams,
  SendWebhookWithTemplateParams,
  SendMessageParams,
} from './types'
