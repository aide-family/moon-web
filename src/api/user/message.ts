import type { PaginationReply, PaginationReq } from '../global'
import request from '../request'

/**
 * api.admin.user.ListMessageRequest
 */
export interface ListMessageRequest {
  keyword?: string
  pagination: PaginationReq
}

/**
 * api.admin.user.ListMessageReply
 */
export interface ListMessageReply {
  list?: NoticeUserMessageItem[]
  pagination?: PaginationReply
  [property: string]: unknown
}

export type MessageCategory = 'info' | 'success' | 'warning' | 'error'
export type MessageBiz = 'invitation' | 'invitation_rejected' | 'invitation_accepted' | 'notice'
/**
 * api.admin.NoticeUserMessage
 */
export interface NoticeUserMessageItem {
  /**
   * 业务类型 'invitation' | 'notice'
   */
  biz: MessageBiz
  bizID: number
  /**
   * 消息类型 'info' | 'success' | 'warning' | 'error'
   */
  category: MessageCategory
  content: string
  id: number
  timestamp: number
}

export type MessageBizItem = {
  label: string
  color: string
}

export function getBizName(biz: MessageBiz): MessageBizItem {
  switch (biz) {
    case 'invitation':
      return {
        label: '邀请',
        color: '#409EFF'
      }
    case 'invitation_accepted':
      return {
        label: '邀请已接受',
        color: '#67C23A'
      }
    case 'invitation_rejected':
      return {
        label: '邀请被拒绝',
        color: '#F56C6C'
      }
    case 'notice':
      return {
        label: '通知',
        color: '#409EFF'
      }
    default:
      return {
        label: '未知',
        color: '#909399'
      }
  }
}

export interface DeleteMessageRepquest {
  ids?: number[]
  all?: boolean
}

/**
 * 删除消息， 用于清除所有通知
 * /v1/user/messages
 * @method DELETE /v1/user/messages
 * @description 接口ID：221535243
 * @description 接口地址：https://app.apifox.com/link/project/5266863/apis/api-221535243
 */
export function deleteMessage(params: DeleteMessageRepquest): Promise<unknown> {
  return request.POST('/v1/user/messages/read', params)
}

/**
 * 获取消息列表， 用于获取我的未读消息
 * /v1/user/messages
 *@method  POST /v1/user/messages
 * @description  接口ID：221535242
 * @description  接口地址：https://app.apifox.com/link/project/5266863/apis/api-221535242
 */
export function listMessage(params: ListMessageRequest): Promise<ListMessageReply> {
  return request.POST<ListMessageReply>('/v1/user/messages', params)
}

export function confirmMessage(id: number): Promise<unknown> {
  return request.POST('/v1/user/messages/confirm', { id })
}

export function cancelMessage(id: number): Promise<unknown> {
  return request.POST('/v1/user/messages/cancel', { id })
}
