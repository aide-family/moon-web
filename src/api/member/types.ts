/**
 * 成员相关类型定义
 * 依据接口：Member_ListMember、Member_SelectMember、Member_GetMember、
 * Member_UpdateMemberStatus、Member_DismissMember、Member_InviteMember
 */

/** 成员状态枚举（与 proto MemberStatus 一致，接口为 integer） */
export enum MemberStatus {
  MemberStatus_UNKNOWN = 0,
  JOINED = 1,
  INVITED = 2,
  EXPIRED = 3,
}

/** 后端状态码与 MemberStatus 对应 */
export const MEMBER_STATUS_FROM_NUMBER: Record<number, MemberStatus> = {
  0: MemberStatus.MemberStatus_UNKNOWN,
  1: MemberStatus.JOINED,
  2: MemberStatus.INVITED,
  3: MemberStatus.EXPIRED,
}

export const MEMBER_STATUS_TO_NUMBER: Record<MemberStatus, number> = {
  [MemberStatus.MemberStatus_UNKNOWN]: 0,
  [MemberStatus.JOINED]: 1,
  [MemberStatus.INVITED]: 2,
  [MemberStatus.EXPIRED]: 3,
}

export function memberStatusFromNumber(n?: number | null): MemberStatus {
  if (n === undefined || n === null) return MemberStatus.MemberStatus_UNKNOWN
  return MEMBER_STATUS_FROM_NUMBER[n] ?? MemberStatus.MemberStatus_UNKNOWN
}

/** 成员列表项（Member_ListMember / Member_GetMember 返回，status 为 integer） */
export interface MemberItem {
  uid?: string
  email?: string
  phone?: string
  status?: number
  createdAt?: string
  updatedAt?: string
  userUID?: string
  name?: string
  nickname?: string
  avatar?: string
  remark?: string
  namespaceUID?: string
}

/** 下拉选择成员项（Member_SelectMember 返回） */
export interface SelectMemberItem {
  value?: string
  label?: string
  disabled?: boolean
  tooltip?: string
}

/** Member_ListMember 查询参数（status 为 integer） */
export interface ListMembersParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: number
  userUID?: string
  email?: string
  phone?: string
  uids?: string[]
}

/** Member_ListMember 响应 */
export interface ListMembersResponse {
  items?: MemberItem[]
  total?: string
  page?: number
  pageSize?: number
}

/** Member_SelectMember 查询参数 */
export interface SelectMembersParams {
  keyword?: string
  limit?: number
  lastUID?: string
  status?: number
  uids?: string[]
}

/** Member_SelectMember 响应 */
export interface SelectMembersResponse {
  items?: SelectMemberItem[]
  total?: string
  lastUID?: string
  hasMore?: boolean
}

/** Member_UpdateMemberStatus 请求体 */
export interface UpdateMemberStatusBody {
  uid?: string
  status?: number
}

/** Member_InviteMember 请求体 */
export interface InviteMemberBody {
  email: string
  roleUID: number
}
