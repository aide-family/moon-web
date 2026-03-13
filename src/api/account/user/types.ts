/**
 * 用户相关类型定义
 * 依据接口：User_ListUser、User_SelectUser、User_GetUser、User_PermitUser、User_BanUser
 */

/** 用户状态枚举（与 proto UserStatus 一致，接口为枚举字符串） */
export enum UserStatus {
  UserStatus_UNKNOWN = 'UserStatus_UNKNOWN',
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
}

const USER_STATUS_VALUES = Object.values(UserStatus) as string[]

/** 将接口返回的 status 规范为 UserStatus */
export function parseUserStatus(s?: UserStatus | string | null): UserStatus {
  if (s === undefined || s === null || s === '') return UserStatus.UserStatus_UNKNOWN
  return USER_STATUS_VALUES.includes(s) ? (s as UserStatus) : UserStatus.UserStatus_UNKNOWN
}

/** 用户列表项（User_ListUser / User_GetUser 返回，status 为枚举字符串） */
export interface UserItem {
  uid?: string
  email?: string
  phone?: string
  status?: UserStatus | string
  createdAt?: string
  updatedAt?: string
  name?: string
  nickname?: string
  avatar?: string
  remark?: string
}

/** 下拉选择用户项（User_SelectUser 返回） */
export interface SelectUserItem {
  value?: string
  label?: string
  disabled?: boolean
  tooltip?: string
}

/** User_ListUser 查询参数（status 为枚举字符串） */
export interface ListUsersParams {
  page?: number
  pageSize?: number
  email?: string
  keyword?: string
  status?: UserStatus
}

/** User_ListUser 响应 */
export interface ListUsersResponse {
  items?: UserItem[]
  total?: string
  page?: number
  pageSize?: number
}

/** User_SelectUser 查询参数（status 为枚举字符串） */
export interface SelectUsersParams {
  keyword?: string
  limit?: number
  lastUID?: string
  status?: UserStatus
}

/** User_SelectUser 响应 */
export interface SelectUsersResponse {
  items?: SelectUserItem[]
  total?: string
  lastUID?: string
  hasMore?: boolean
}

/** User_PermitUser / User_BanUser 请求体 */
export interface UserPermitOrBanBody {
  uid?: string
  reason?: string
}
