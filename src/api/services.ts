import { MessageType } from 'antd/es/message/interface'
import apiClient from './client'
import type {
  NamespaceItem,
  EmailConfigItem,
  WebhookItem,
  TemplateItem,
  MessageLogItem,
  HealthCheckReply,
  PaginatedResponse,
  PaginationParams,
  GlobalStatus,
  TemplateAPP,
  HTTPMethod,
  WebhookAPP,
  MessageStatus,
} from './types'

export const namespaceService = {
  list: (params: PaginationParams) =>
    apiClient.get<PaginatedResponse<NamespaceItem>>('/v1/namespaces', {
      params,
    }),
  get: (name: string) => apiClient.get<NamespaceItem>(`/v1/namespace/${name}`),
  save: (data: { name: string; metadata?: Record<string, string> }) =>
    apiClient.post('/v1/namespace', data),
  updateStatus: (name: string, status: GlobalStatus) =>
    apiClient.put(`/v1/namespace/${name}/status`, { name, status }),
  delete: (name: string) => apiClient.delete(`/v1/namespace/${name}`),
}

export const emailService = {
  list: (params: PaginationParams) =>
    apiClient.get<PaginatedResponse<EmailConfigItem>>('/v1/email/configs', {
      params,
    }),
  get: (uid: string) =>
    apiClient.get<EmailConfigItem>(`/v1/email/config/${uid}`),
  create: (data: {
    name: string
    host: string
    port: number
    username: string
    password: string
  }) => apiClient.post('/v1/email/config', data),
  update: (
    uid: string,
    data: {
      name: string
      host: string
      port: number
      username: string
      password?: string
    }
  ) => apiClient.put(`/v1/email/config/${uid}`, { uid, ...data }),
  updateStatus: (uid: string, status: GlobalStatus) =>
    apiClient.put(`/v1/email/config/${uid}/status`, { uid, status }),
  delete: (uid: string) => apiClient.delete(`/v1/email/config/${uid}`),
}

export const webhookService = {
  list: (params: PaginationParams & { app?: WebhookAPP }) =>
    apiClient.get<PaginatedResponse<WebhookItem>>('/v1/webhook/configs', {
      params,
    }),
  get: (uid: string) => apiClient.get<WebhookItem>(`/v1/webhook/config/${uid}`),
  create: (data: {
    app: WebhookAPP
    name: string
    url: string
    method: HTTPMethod
    headers?: Record<string, string>
    secret?: string
  }) => apiClient.post('/v1/webhook/config', data),
  update: (
    uid: string,
    data: {
      app: WebhookAPP
      name: string
      url: string
      method: HTTPMethod
      headers?: Record<string, string>
      secret?: string
    }
  ) => apiClient.put(`/v1/webhook/config/${uid}`, { uid, ...data }),
  updateStatus: (uid: string, status: GlobalStatus) =>
    apiClient.put(`/v1/webhook/config/${uid}/status`, { uid, status }),
  delete: (uid: string) => apiClient.delete(`/v1/webhook/config/${uid}`),
}

export const templateService = {
  list: (params: PaginationParams & { app?: TemplateAPP }) =>
    apiClient.get<PaginatedResponse<TemplateItem>>('/v1/templates', { params }),
  get: (uid: string) => apiClient.get<TemplateItem>(`/v1/template/${uid}`),
  create: (data: { name: string; app: TemplateAPP; jsonData: string }) =>
    apiClient.post('/v1/template', data),
  update: (
    uid: string,
    data: { name: string; app: TemplateAPP; jsonData: string }
  ) => apiClient.put(`/v1/template/${uid}`, { uid, ...data }),
  updateStatus: (uid: string, status: GlobalStatus) =>
    apiClient.put(`/v1/template/${uid}/status`, { uid, status }),
  delete: (uid: string) => apiClient.delete(`/v1/template/${uid}`),
}

export const senderService = {
  sendEmail: (
    uid: string,
    data: {
      subject: string
      body: string
      to: string[]
      cc?: string[]
      contentType?: string
      headers?: Record<string, string>
    }
  ) => apiClient.post(`/v1/sender/email/${uid}`, { uid, ...data }),
  sendEmailWithTemplate: (
    uid: string,
    data: { templateUID: string; jsonData: string }
  ) => apiClient.post(`/v1/sender/email/${uid}/template`, { uid, ...data }),
  sendWebhook: (uid: string, data: { data: string }) =>
    apiClient.post(`/v1/sender/webhook/${uid}`, { uid, ...data }),
  sendWebhookWithTemplate: (
    uid: string,
    data: { templateUID: string; jsonData: string }
  ) => apiClient.post(`/v1/sender/webhook/${uid}/template`, { uid, ...data }),
}

export interface MessageLogFilter extends PaginationParams {
  type?: MessageType
  app?: TemplateAPP
  status?: MessageStatus
  startAtUnix?: string
  endAtUnix?: string
}

export const messageLogService = {
  list: (params: MessageLogFilter) =>
    apiClient.get<PaginatedResponse<MessageLogItem>>('/v1/message-logs', {
      params,
    }),
  get: (uid: string, sendAtUnix?: string) =>
    apiClient.get<MessageLogItem>(`/v1/message-log/${uid}`, {
      params: { sendAtUnix },
    }),
  retry: (uid: string, sendAtUnix?: string) =>
    apiClient.post(`/v1/message-log/${uid}/retry`, { uid, sendAtUnix }),
  cancel: (uid: string, sendAtUnix?: string) =>
    apiClient.post(`/v1/message-log/${uid}/cancel`, { uid, sendAtUnix }),
}

export const healthService = {
  check: () => apiClient.get<HealthCheckReply>('/health'),
}
