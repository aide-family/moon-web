/**
 * Sender 相关 API
 * 依据接口文档：Sender_SendEmail、Sender_SendEmailWithTemplate、
 * Sender_SendMessage、Sender_SendWebhook、Sender_SendWebhookWithTemplate
 * 请求需带 Header：Authorization (Bearer)、X-Namespace（由 request 拦截器统一处理）
 */

import { http } from '../index'
import type {
  SendEmailParams,
  SendEmailWithTemplateParams,
  SendWebhookParams,
  SendWebhookWithTemplateParams,
  SendMessageParams,
} from './types'

/**
 * Sender_SendEmail
 * POST /v1/sender/email/{uid}
 * Path: uid (string, 必需)；Body(application/json, 必需): uid, subject, body, contentType?, to?, cc?, headers?
 */
export function sendEmail(uid: string, params: SendEmailParams): Promise<unknown> {
  return http.post<unknown>(`/v1/sender/email/${uid}`, params as Record<string, unknown>)
}

/**
 * Sender_SendEmailWithTemplate
 * POST /v1/sender/email/{uid}/template
 * Path: uid (string)；Body(application/json): uid?, templateUID?, jsonData?, to?, cc?
 */
export function sendEmailWithTemplate(
  uid: string,
  params?: SendEmailWithTemplateParams
): Promise<unknown> {
  return http.post<unknown>(`/v1/sender/email/${uid}/template`, params as Record<string, unknown>)
}

/**
 * Sender_SendMessage
 * POST /v1/sender/message
 * Body(application/json, 必需): uid 等
 */
export function sendMessage(params: SendMessageParams): Promise<unknown> {
  return http.post<unknown>('/v1/sender/message', params as Record<string, unknown>)
}

/**
 * Sender_SendWebhook
 * POST /v1/sender/webhook/{uid}
 * Path: uid (string)；Body(application/json, 必需): uid?, data?
 */
export function sendWebhook(uid: string, params?: SendWebhookParams): Promise<unknown> {
  return http.post<unknown>(`/v1/sender/webhook/${uid}`, params as Record<string, unknown>)
}

/**
 * Sender_SendWebhookWithTemplate
 * POST /v1/sender/webhook/{uid}/template
 * Path: uid (string)；Body(application/json, 必需): uid?, templateUID?, jsonData?
 */
export function sendWebhookWithTemplate(
  uid: string,
  params?: SendWebhookWithTemplateParams
): Promise<unknown> {
  return http.post<unknown>(`/v1/sender/webhook/${uid}/template`, params as Record<string, unknown>)
}

export type {
  SendEmailParams,
  SendEmailWithTemplateParams,
  SendWebhookParams,
  SendWebhookWithTemplateParams,
  SendMessageParams,
} from './types'
