/**
 * 通知组（NotificationGroup）相关类型定义（策略管理服务）
 *
 * 依据接口：
 * - NotificationGroup_ListNotificationGroup
 * - NotificationGroup_CreateNotificationGroup
 * - NotificationGroup_GetNotificationGroup
 * - NotificationGroup_UpdateNotificationGroup
 * - NotificationGroup_DeleteNotificationGroup
 * - NotificationGroup_UpdateNotificationGroupStatus
 */

import type { GlobalStatus } from '../../common/types'

/** 通知组成员项（用于订阅 members） */
export interface NotificationMemberItem {
  memberUid?: string
  isEmail?: boolean
  isPhone?: boolean
}

/** 通知组单项（列表/详情），status 为全局状态枚举 */
export interface NotificationGroupItem {
  uid?: string
  name?: string
  remark?: string
  metadata?: Record<string, string>
  status?: GlobalStatus
  members?: NotificationMemberItem[]
  webhooks?: string[]
  templates?: string[]
  createdAt?: string
  updatedAt?: string
}

/** 通知组列表请求参数 GET /v1/notification-groups */
export interface NotificationGroupListParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: GlobalStatus
}

/** 通知组列表响应 */
export interface NotificationGroupListResponse {
  items?: NotificationGroupItem[]
  total?: string
  page?: number
  pageSize?: number
}

/** 创建通知组请求体 POST /v1/notification-groups */
export interface CreateNotificationGroupParams {
  name?: string
  remark?: string
  metadata?: Record<string, string>
  members?: NotificationMemberItem[]
  webhooks?: string[]
  templates?: string[]
}

/** 创建通知组响应 */
export interface CreateNotificationGroupReply {
  uid?: string
}

/** 更新通知组请求体 PUT /v1/notification-groups/{uid} */
export interface UpdateNotificationGroupParams {
  uid?: string
  name?: string
  remark?: string
  metadata?: Record<string, string>
  members?: NotificationMemberItem[]
  webhooks?: string[]
  templates?: string[]
}

/** 更新通知组响应：成功返回空对象 */
export type UpdateNotificationGroupReply = Record<string, never>

/** 删除通知组响应 */
export type DeleteNotificationGroupReply = Record<string, never>

/** 更新通知组状态请求体 PUT /v1/notification-groups/{uid}/status */
export interface UpdateNotificationGroupStatusParams {
  uid: string
  status: GlobalStatus
}

/** 更新通知组状态响应 */
export type UpdateNotificationGroupStatusReply = Record<string, never>

/** 订阅过滤中的策略-等级对 */
export interface StrategyLevelPair {
  strategyUid?: string
  levelUid?: string
}

/** 通知组订阅过滤条件（多维度 OR 匹配，见 OpenAPI SubscriptionFilter） */
export interface SubscriptionFilter {
  strategyGroupUids?: string[]
  strategyUids?: string[]
  strategyLevels?: StrategyLevelPair[]
  datasourceUids?: string[]
  labels?: Record<string, string>
  excludeLabels?: Record<string, string>
}

/** 获取通知组订阅 GET /v1/notification-groups/{notificationGroupUid}/subscription */
export interface GetNotificationGroupSubscriptionReply {
  filter?: SubscriptionFilter
}

/** 保存通知组订阅请求体 PUT /v1/notification-groups/{notificationGroupUid}/subscription */
export interface SaveNotificationGroupSubscriptionParams {
  notificationGroupUid?: string
  filter?: SubscriptionFilter
}

/** 保存通知组订阅响应 */
export type SaveNotificationGroupSubscriptionReply = Record<string, never>

