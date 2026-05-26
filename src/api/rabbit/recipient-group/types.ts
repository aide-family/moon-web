import { GlobalStatus } from '@/api/common/types'
import type { MemberItem } from '@/api/account/member'
import type { EmailItem } from '@/api/rabbit/email'
import type { TemplateItem } from '@/api/rabbit/template'
import type { WebhookItem } from '@/api/rabbit/webhook'

export interface RecipientGroupItem {
  uid: string
  name: string
  metadata?: Record<string, string>
  templates?: TemplateItem[]
  emailConfigs?: EmailItem[]
  webhookConfigs?: WebhookItem[]
  members?: MemberItem[]
  status: GlobalStatus
  createdAt?: string
  updatedAt?: string
}

export interface RecipientGroupListParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: GlobalStatus
}

export interface RecipientGroupListResponse {
  items?: RecipientGroupItem[]
  total?: string
  page?: number
  pageSize?: number
}

export interface CreateRecipientGroupParams {
  name?: string
  metadata?: Record<string, string>
  templates?: string[]
  emailConfigs?: string[]
  smsConfigs?: string[]
  webhookConfigs?: string[]
  members?: string[]
}

export interface CreateRecipientGroupReply {
  uid?: string
}

export interface UpdateRecipientGroupParams extends Omit<
  CreateRecipientGroupParams,
  'smsConfigs'
> {
  uid?: string
  smsConfigs?: string[]
}

export type UpdateRecipientGroupReply = Record<string, never>
export type DeleteRecipientGroupReply = Record<string, never>

export interface UpdateRecipientGroupStatusParams {
  uid: string
  status: GlobalStatus
}

export type UpdateRecipientGroupStatusReply = Record<string, never>

export interface SelectRecipientGroupItem {
  value?: string
  label?: string
  disabled?: boolean
  tooltip?: string
}

export interface SelectRecipientGroupParams {
  keyword?: string
  limit?: number
  lastUID?: string
  status?: GlobalStatus
}

export interface SelectRecipientGroupResponse {
  items?: SelectRecipientGroupItem[]
  total?: string
  lastUID?: string
  hasMore?: boolean
}
