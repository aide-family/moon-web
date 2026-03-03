/**
 * 成员相关 API
 * Member_ListMember、Member_SelectMember、Member_GetMember、
 * Member_UpdateMemberStatus、Member_DismissMember、Member_InviteMember
 * Header：Authorization、X-Namespace 由 request 拦截器统一处理
 */

import { http } from '../index'
import type {
  MemberItem,
  ListMembersParams,
  ListMembersResponse,
  SelectMembersParams,
  SelectMembersResponse,
  UpdateMemberStatusBody,
  InviteMemberBody,
} from './types'

/**
 * Member_ListMember
 * GET /members
 * Query: page, pageSize, keyword, status, userUID, email, phone, uids
 */
export function listMembers(
  params?: ListMembersParams
): Promise<ListMembersResponse> {
  return http.get<ListMembersResponse>(
    '/members',
    params as unknown as Record<string, unknown>
  )
}

/**
 * Member_SelectMember
 * GET /members/select
 * Query: keyword, limit, lastUID, status, uids
 */
export function selectMembers(
  params?: SelectMembersParams
): Promise<SelectMembersResponse> {
  return http.get<SelectMembersResponse>(
    '/members/select',
    params as unknown as Record<string, unknown>
  )
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
 * Body(application/json): uid?, status (integer)
 */
export function updateMemberStatus(
  uid: string,
  body: UpdateMemberStatusBody
): Promise<unknown> {
  return http.put<unknown>(`/member/${uid}/status`, body as Record<string, unknown>)
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
 * POST /member/invite
 * Body(application/json): email, roleUID
 */
export function inviteMember(body: InviteMemberBody): Promise<unknown> {
  return http.post<unknown>('/member/invite', body as Record<string, unknown>)
}

export type {
  MemberItem,
  SelectMemberItem,
  ListMembersParams,
  ListMembersResponse,
  SelectMembersParams,
  SelectMembersResponse,
  UpdateMemberStatusBody,
  InviteMemberBody,
} from './types'
export {
  MemberStatus,
  memberStatusFromNumber,
  MEMBER_STATUS_FROM_NUMBER,
  MEMBER_STATUS_TO_NUMBER,
} from './types'
