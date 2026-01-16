export enum WebhookAPP {
  WebhookAPP_UNKNOWN = 0,
  OTHER = 1,
  DINGTALK = 2,
  WECHAT = 3,
  FEISHU = 4,
}

export enum HTTPMethod {
  HTTPMethod_UNKNOWN = 0,
  GET = 1,
  POST = 2,
  PUT = 3,
  DELETE = 4,
  PATCH = 5,
}

export enum GlobalStatus {
  GlobalStatus_UNKNOWN = 0,
  ENABLED = 1,
  DISABLED = 2,
}

export enum MessageStatus {
  MessageStatus_UNKNOWN = 0,
  Pending = 1,
  Sending = 2,
  Sent = 3,
  Failed = 4,
  Cancelled = 5,
}

export enum MessageType {
  MessageType_UNKNOWN = 0,
  Email = 1,
  Webhook = 2,
  SMS = 3,
}

export enum TemplateAPP {
  TemplateAPP_UNKNOWN = 0,
  TEMPLATE_APP_EMAIL = 1,
  TEMPLATE_APP_SMS = 2,
  TEMPLATE_APP_WEBHOOK_OTHER = 3,
  TEMPLATE_APP_WEBHOOK_DINGTALK = 4,
  TEMPLATE_APP_WEBHOOK_WECHAT = 5,
  TEMPLATE_APP_WEBHOOK_FEISHU = 6,
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  keyword?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface NamespaceItem {
  name: string
  metadata?: Record<string, string>
  createdAt: string
  updatedAt: string
  status: GlobalStatus
}

export interface EmailConfigItem {
  uid: string
  name: string
  host: string
  port: number
  username: string
  password?: string
  createdAt: string
  updatedAt: string
  status: GlobalStatus
}

export interface WebhookItem {
  uid: string
  app: WebhookAPP
  name: string
  url: string
  method: HTTPMethod
  headers?: Record<string, string>
  secret?: string
  createdAt: string
  updatedAt: string
  status: GlobalStatus
}

export interface TemplateItem {
  uid: string
  name: string
  app: TemplateAPP
  jsonData: string
  createdAt: string
  updatedAt: string
  status: GlobalStatus
}

export interface MessageLogItem {
  uid: string
  type: MessageType
  status: MessageStatus
  sendAt: string
  message: string
  createdAt: string
  updatedAt: string
}

export interface HealthCheckReply {
  status: string
  message: string
  timestamp: string
}
