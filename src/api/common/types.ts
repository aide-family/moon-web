/**
 * API 响应基础类型
 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  success?: boolean
}

/**
 * 分页响应类型
 */
export interface PaginatedResponse<T = unknown> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * 请求配置扩展
 */
export interface RequestConfig {
  showError?: boolean // 是否显示错误提示
  showLoading?: boolean // 是否显示加载状态
  skipAuth?: boolean // 是否跳过认证
}

/**
 * 全局状态枚举
 */
export enum GlobalStatus {
  UNKNOWN = 'GlobalStatus_UNKNOWN',
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
}

/**
 * Webhook 应用枚举（与 proto rabbit/enum WebhookAPP 一致，与 GlobalStatus 同风格用字符串）
 * @see rabbit/proto/rabbit/enum/enum.proto
 */
export enum WebhookAPP {
  WebhookAPP_UNKNOWN = 'WebhookAPP_UNKNOWN',
  OTHER = 'OTHER',
  DINGTALK = 'DINGTALK',
  WECHAT = 'WECHAT',
  FEISHU = 'FEISHU',
}

/**
 * HTTP 方法枚举（与 proto rabbit/enum HTTPMethod 一致，与 GlobalStatus 同风格用字符串）
 * @see rabbit/proto/rabbit/enum/enum.proto
 */
export enum HTTPMethod {
  HTTPMethod_UNKNOWN = 'HTTPMethod_UNKNOWN',
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

/**
 * 消息状态枚举（与 proto rabbit/enum MessageStatus 一致）
 * @see rabbit/proto/rabbit/enum/enum.proto
 */
export enum MessageStatus {
  MessageStatus_UNKNOWN = 'MessageStatus_UNKNOWN',
  PENDING = 'PENDING',
  SENDING = 'SENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * 消息类型枚举（与 proto rabbit/enum MessageType 一致）
 * @see rabbit/proto/rabbit/enum/enum.proto
 */
export enum MessageType {
  MessageType_UNKNOWN = 'MessageType_UNKNOWN',
  EMAIL = 'EMAIL',
  SMS_ALICLOUD = 'SMS_ALICLOUD',
  WEBHOOK_OTHER = 'WEBHOOK_OTHER',
  WEBHOOK_DINGTALK = 'WEBHOOK_DINGTALK',
  WEBHOOK_WECHAT = 'WEBHOOK_WECHAT',
  WEBHOOK_FEISHU = 'WEBHOOK_FEISHU',
}

/** 等级采样模式（策略指标等级，后端接受字符串） */
export enum SampleMode {
  SAMPLE_MODE_UNKNOWN = 'SAMPLE_MODE_UNKNOWN',
  SAMPLE_MODE_FOR = 'SAMPLE_MODE_FOR',
  SAMPLE_MODE_MAX = 'SAMPLE_MODE_MAX',
  SAMPLE_MODE_MIN = 'SAMPLE_MODE_MIN',
}

/** 条件指标（策略指标等级，后端接受字符串；范围为两阈值） */
export enum ConditionMetric {
  CONDITION_METRIC_UNKNOWN = 'CONDITION_METRIC_UNKNOWN',
  CONDITION_METRIC_EQ = 'CONDITION_METRIC_EQ',
  CONDITION_METRIC_NE = 'CONDITION_METRIC_NE',
  CONDITION_METRIC_GT = 'CONDITION_METRIC_GT',
  CONDITION_METRIC_GTE = 'CONDITION_METRIC_GTE',
  CONDITION_METRIC_LT = 'CONDITION_METRIC_LT',
  CONDITION_METRIC_LTE = 'CONDITION_METRIC_LTE',
  CONDITION_METRIC_IN = 'CONDITION_METRIC_IN',
  CONDITION_METRIC_NOT_IN = 'CONDITION_METRIC_NOT_IN',
  /** 范围（两阈值：下限、上限） */
  CONDITION_METRIC_BETWEEN = 'CONDITION_METRIC_BETWEEN',
}
