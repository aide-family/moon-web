/**
 * API 模块统一导出（按大类：common / account / marksman / rabbit）
 */
export { default as request, http } from './common/request'
export type {
  ApiResponse,
  PaginatedResponse,
  RequestConfig,
} from './common/types'
export {
  GlobalStatus,
  WebhookAPP,
  HTTPMethod,
  MessageStatus,
  MessageType,
  SampleMode,
  ConditionMetric,
} from './common/types'

// account：认证与用户
export * from './account/auth/index'
export * from './account/captcha/index'
export * from './account/oauth'
export * from './account/self/index'
export * from './account/user/index'
export * from './account/member/index'
export * from './account/namespace/index'

// marksman：策略与数据源
export * from './marksman/alert/index'
export * from './marksman/datasource/index'
export * from './marksman/level/index'
export * from './marksman/metricQuery/index'
export * from './marksman/strategy/index'
export * from './marksman/strategyMetric/index'
export * from './marksman/strategyGroup/index'
export * from './marksman/notificationGroup/index'

// rabbit：消息与发送
export * from './rabbit/sender/index'
export * from './rabbit/email/index'
export * from './rabbit/webhook/index'
export * from './rabbit/template/index'
export * from './rabbit/message-log/index'

// jade_tree：机器信息、探测任务、SSH命令
export * from './jade_tree/machineInfo/index'
export * from './jade_tree/probeTask/index'
export * from './jade_tree/sshCommand/index'
