/**
 * 成员相关 API
 * Member_ListMember、Member_SelectMember、Member_GetMember、
 * Member_UpdateMemberStatus、Member_DismissMember、Member_InviteMember
 * Header：Authorization、X-Namespace 由 request 拦截器统一处理
 */

import { http } from '../../index'
import type {
  MemberItem,
  ListMembersParams,
  ListMembersResponse,
  SelectMembersParams,
  SelectMembersResponse,
  UpdateMemberStatusParams,
  InviteMemberBody,
} from './types'

/**
 * Member_ListMember
 * GET /members
 * Query: page, pageSize, keyword, status, userUID, email, phone, uids
 */
export function listMembers(
  params?: ListMembersParams,
): Promise<ListMembersResponse> {
  return http.get<ListMembersResponse>('/members', { ...params })
}

/**
 * Member_SelectMember
 * GET /members/select
 * Query: keyword, limit, lastUID, status, uids
 */
export function selectMembers(
  params?: SelectMembersParams,
): Promise<SelectMembersResponse> {
  return http.get<SelectMembersResponse>('/members/select', { ...params })
}

/**
 * Member_GetMember
 * GET /member/{uid}
 */
export function getMember(uid: string): Promise<MemberItem> {
  return http.get<MemberItem>(`/member/${uid}`)
}

/**
 * Member_UpdateMemberStatus
 * PUT /member/{uid}/status
 * Body(application/json): uid?, status (string 枚举)
 */
export function updateMemberStatus(
  params: UpdateMemberStatusParams,
): Promise<unknown> {
  return http.put<unknown>(`/member/${params.uid}/status`, { ...params })
}

/**
 * Member_DismissMember
 * DELETE /member/{uid}
 */
export function dismissMember(uid: string): Promise<unknown> {
  return http.delete<unknown>(`/member/${uid}`)
}

/**
 * Member_InviteMember
 * POST /v1/member/invite
 * Body(application/json): email, role（整数枚举）
 */
export function inviteMember(
  body: InviteMemberBody,
): Promise<{ message?: string }> {
  return http.post<{ message?: string }>('/member/invite', { ...body })
}

export type {
  MemberItem,
  SelectMemberItem,
  ListMembersParams,
  ListMembersResponse,
  SelectMembersParams,
  SelectMembersResponse,
  UpdateMemberStatusBody,
  UpdateMemberStatusParams,
  InviteMemberBody,
} from './types'
export { MemberStatus, normalizeMemberStatus } from './types'
