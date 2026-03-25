/**
 * 通知组（NotificationGroup）相关 API
 *
 * 请求需带 Header：Authorization、X-Namespace（由 request 拦截器处理）
 */

import { http } from '../../index'
import type {
  NotificationGroupItem,
  NotificationGroupListParams,
  NotificationGroupListResponse,
  CreateNotificationGroupParams,
  CreateNotificationGroupReply,
  UpdateNotificationGroupParams,
  UpdateNotificationGroupReply,
  DeleteNotificationGroupReply,
  UpdateNotificationGroupStatusParams,
  UpdateNotificationGroupStatusReply,
  GetNotificationGroupSubscriptionReply,
  SaveNotificationGroupSubscriptionParams,
  SaveNotificationGroupSubscriptionReply,
} from './types'

export type {
  NotificationGroupItem,
  NotificationGroupListParams,
  NotificationGroupListResponse,
  CreateNotificationGroupParams,
  CreateNotificationGroupReply,
  UpdateNotificationGroupParams,
  UpdateNotificationGroupReply,
  DeleteNotificationGroupReply,
  UpdateNotificationGroupStatusParams,
  UpdateNotificationGroupStatusReply,
  NotificationMemberItem,
  SubscriptionFilter,
  StrategyLevelPair,
  GetNotificationGroupSubscriptionReply,
  SaveNotificationGroupSubscriptionParams,
  SaveNotificationGroupSubscriptionReply,
} from './types'

/** 获取通知组列表 GET /v1/notification-groups */
export const getNotificationGroupList = (
  params?: NotificationGroupListParams,
): Promise<NotificationGroupListResponse> => {
  return http.get<NotificationGroupListResponse>(
    '/notification-groups',
    { ...params },
  )
}

/** 获取通知组详情 GET /v1/notification-groups/{uid} */
export const getNotificationGroupDetail = (
  uid: string,
): Promise<NotificationGroupItem> => {
  return http.get<NotificationGroupItem>(`/notification-groups/${uid}`)
}

/** 创建通知组 POST /v1/notification-groups */
export const createNotificationGroup = (
  params?: CreateNotificationGroupParams,
): Promise<CreateNotificationGroupReply> => {
  return http.post<CreateNotificationGroupReply>(
    '/notification-groups',
    { ...params },
  )
}

/** 更新通知组 PUT /v1/notification-groups/{uid} */
export const updateNotificationGroup = (
  uid: string,
  params?: UpdateNotificationGroupParams,
): Promise<UpdateNotificationGroupReply> => {
  return http.put<UpdateNotificationGroupReply>(
    `/notification-groups/${uid}`,
    { ...params },
  )
}

/** 删除通知组 DELETE /v1/notification-groups/{uid} */
export const deleteNotificationGroup = (
  uid: string,
): Promise<DeleteNotificationGroupReply> => {
  return http.delete<DeleteNotificationGroupReply>(`/notification-groups/${uid}`)
}

/** 更新通知组状态 PUT /v1/notification-groups/{uid}/status */
export const updateNotificationGroupStatus = (
  params: UpdateNotificationGroupStatusParams,
): Promise<UpdateNotificationGroupStatusReply> => {
  return http.put<UpdateNotificationGroupStatusReply>(
    `/notification-groups/${params.uid}/status`,
    { ...params },
  )
}

/** 获取通知组订阅过滤 GET /v1/notification-groups/{notificationGroupUid}/subscription */
export const getNotificationGroupSubscription = (
  notificationGroupUid: string,
): Promise<GetNotificationGroupSubscriptionReply> => {
  return http.get<GetNotificationGroupSubscriptionReply>(
    `/notification-groups/${notificationGroupUid}/subscription`,
  )
}

/** 保存通知组订阅过滤 PUT /v1/notification-groups/{notificationGroupUid}/subscription */
export const saveNotificationGroupSubscription = (
  notificationGroupUid: string,
  params?: SaveNotificationGroupSubscriptionParams,
): Promise<SaveNotificationGroupSubscriptionReply> => {
  return http.put<SaveNotificationGroupSubscriptionReply>(
    `/notification-groups/${notificationGroupUid}/subscription`,
    { ...params, notificationGroupUid },
  )
}

