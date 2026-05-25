/**
 * 用户相关 API
 * User_ListUser、User_SelectUser、User_GetUser、User_PermitUser、User_BanUser
 * Header：Authorization、X-Namespace 由 request 拦截器统一处理
 */

import { http } from '../../index'
import type {
  UserItem,
  ListUsersParams,
  ListUsersResponse,
  SelectUsersParams,
  SelectUsersResponse,
  UserPermitOrBanBody,
} from './types'

/**
 * User_ListUser
 * GET /users
 * Query: page, pageSize, email, keyword, status
 */
export function listUsers(
  params?: ListUsersParams,
): Promise<ListUsersResponse> {
  return http.get<ListUsersResponse>('/users', { ...params })
}

/**
 * User_SelectUser
 * GET /users/select
 * Query: keyword, limit, lastUID, status
 */
export function selectUsers(
  params?: SelectUsersParams,
): Promise<SelectUsersResponse> {
  return http.get<SelectUsersResponse>('/users/select', { ...params })
}

/**
 * User_GetUser
 * GET /user/{uid}
 */
export function getUser(uid: string): Promise<UserItem> {
  return http.get<UserItem>(`/user/${uid}`)
}

/**
 * User_PermitUser
 * PUT /user/permit/{uid}
 * Body(application/json): uid?, reason?
 */
export function permitUser(
  uid: string,
  body?: UserPermitOrBanBody,
): Promise<{ message?: string }> {
  return http.put<{ message?: string }>(`/user/permit/${uid}`, { ...body })
}

/**
 * User_BanUser
 * PUT /user/ban/{uid}
 * Body(application/json): uid?, reason?
 */
export function banUser(
  uid: string,
  body?: UserPermitOrBanBody,
): Promise<{ message?: string }> {
  return http.put<{ message?: string }>(`/user/ban/${uid}`, { ...body })
}

export type {
  UserItem,
  SelectUserItem,
  ListUsersParams,
  ListUsersResponse,
  SelectUsersParams,
  SelectUsersResponse,
  UserPermitOrBanBody,
} from './types'
export { UserStatus, parseUserStatus } from './types'
