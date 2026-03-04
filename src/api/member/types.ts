/**
 * 成员相关类型定义
 * 依据接口：Member_ListMember、Member_SelectMember、Member_GetMember、
 * Member_UpdateMemberStatus、Member_DismissMember、Member_InviteMember
 */

/** 成员状态枚举（与后端一致，接口为字符串） */
export enum MemberStatus {
  MemberStatus_UNKNOWN = 'MemberStatus_UNKNOWN',
  JOINED = 'JOINED',
  INVITED = 'INVITED',
  EXPIRED = 'EXPIRED',
}

const MEMBER_STATUS_VALUES: Set<string> = new Set(Object.values(MemberStatus))

/** 将后端返回的 status 字符串规范为 MemberStatus */
export function normalizeMemberStatus(status?: string): MemberStatus {
  if (status != null && MEMBER_STATUS_VALUES.has(status)) {
    return status as MemberStatus
  }
  return MemberStatus.MemberStatus_UNKNOWN
}

/** 成员列表项（Member_ListMember / Member_GetMember 返回，status 为字符串） */
export interface MemberItem {
  uid?: string
  email?: string
  phone?: string
  status?: string
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

/** Member_ListMember 查询参数（status 为字符串枚举） */
export interface ListMembersParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
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
  status?: string
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
  status?: string
}

/** Member_InviteMember 请求体 */
export interface InviteMemberBody {
  email: string
  roleUID: number
}
