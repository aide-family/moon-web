import { GlobalStatus } from '@/api/common/types'

export interface PrometheusAlertItem {
  status?: string
  labels?: Record<string, string>
  annotations?: Record<string, string>
  startsAt?: string
  endsAt?: string
  generatorURL?: string
  fingerprint?: string
}

export interface ReceivePrometheusWebhookRequest {
  version?: string
  groupKey?: string
  status?: string
  receiver?: string
  externalURL?: string
  groupLabels?: Record<string, string>
  commonLabels?: Record<string, string>
  commonAnnotations?: Record<string, string>
  alerts?: PrometheusAlertItem[]
  truncatedAlerts?: number
  source?: string
}

export interface ReceivePrometheusWebhookReply {
  total?: string
  uids?: string[]
}

export interface AlertRecordItem {
  uid: string
  source?: string
  receiver?: string
  status?: string
  fingerprint?: string
  groupKey?: string
  startsAt?: string
  endsAt?: string
  generatorURL?: string
  labels?: Record<string, string>
  annotations?: Record<string, string>
  createdAt?: string
  updatedAt?: string
  raw?: string
}

export interface ListAlertRecordsParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
  fingerprint?: string
}

export interface ListAlertRecordsResponse {
  items?: AlertRecordItem[]
  total?: string
  page?: number
  pageSize?: number
}

export interface AlertSubscriptionMemberRequest {
  memberUid?: string
  isEmail?: boolean
  isSms?: boolean
  isPhone?: boolean
}

export interface AlertSubscriptionMemberItem extends AlertSubscriptionMemberRequest {
  memberName?: string
  memberAvatar?: string
  memberEmail?: string
  memberPhone?: string
}

export interface AlertSubscriptionItem {
  uid: string
  name?: string
  remark?: string
  labels?: Record<string, string>
  excludeLabels?: Record<string, string>
  recipientGroupUids?: string[]
  members?: AlertSubscriptionMemberItem[]
  directMemberEmailConfigUid?: string
  directMemberTemplateUid?: string
  status?: GlobalStatus
  createdAt?: string
  updatedAt?: string
}

export interface CreateAlertSubscriptionParams {
  name?: string
  remark?: string
  labels?: Record<string, string>
  excludeLabels?: Record<string, string>
  recipientGroupUids?: string[]
  members?: AlertSubscriptionMemberRequest[]
  directMemberEmailConfigUid?: string
  directMemberTemplateUid?: string
}

export interface CreateAlertSubscriptionReply {
  uid?: string
}

export interface UpdateAlertSubscriptionParams extends CreateAlertSubscriptionParams {
  uid?: string
}

export type UpdateAlertSubscriptionReply = Record<string, never>
export type DeleteAlertSubscriptionReply = Record<string, never>

export interface ListAlertSubscriptionsParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: GlobalStatus
}

export interface ListAlertSubscriptionsResponse {
  items?: AlertSubscriptionItem[]
  total?: string
  page?: number
  pageSize?: number
}

export interface UpdateAlertSubscriptionStatusParams {
  uid: string
  status: GlobalStatus
}

export type UpdateAlertSubscriptionStatusReply = Record<string, never>
