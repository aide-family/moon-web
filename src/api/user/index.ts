import type { Role } from '../enum'
import type { PaginationReply, PaginationReq } from '../global'
import type { SelectItem, UserItem } from '../model-types'
import request from '../request'

/**
 * 创建用户
 * @method: post /v1/user
 * @param {CreateUserRequest} params
 * @returns {CreateUserReply}
 */
export function createUser(params: CreateUserRequest): Promise<null> {
  return request.POST<null>('/v1/user', params)
}

/**
 * 更新用户
 * @method: put /v1/user/update/{id}
 * @param {UpdateUserRequest} params
 * @returns {UpdateUserReply}
 */
export function updateUser(params: UpdateUserRequest): Promise<null> {
  return request.PUT<null>(`/v1/user/update/${params.id}`, params.data)
}

/**
 * 删除用户
 * @method: delete /v1/user/{id}
 * @param {DeleteUserRequest} params
 * @returns {DeleteUserReply}
 */
export function deleteUser(params: DeleteUserRequest): Promise<null> {
  return request.DELETE<null>(`/v1/user/${params.id}`)
}

/**
 * 获取用户
 * @method: get /v1/user/{id}
 * @param {GetUserRequest} params
 * @returns {GetUserReply}
 */
export function getUser(params: GetUserRequest): Promise<GetUserReply> {
  return request.GET<GetUserReply>(`/v1/user/${params.id}`)
}

/**
 * 获取用户
 * @method: get /v1/user/{id}
 * @param {GetUserRequest} params
 * @returns {GetUserReply}
 */
export function getUserBasic(): Promise<GetUserReply> {
  return request.GET<GetUserReply>('/v1/user/self/basic')
}

/**
 * 列表用户
 * @method: post /v1/user/list
 * @param {ListUserRequest} params
 * @returns {ListUserReply}
 */
export function listUser(params: ListUserRequest): Promise<ListUserReply> {
  return request.POST<ListUserReply>('/v1/user/list', params)
}

/**
 * 批量修改用户状态
 * @method: put /v1/user/status
 * @param {BatchUpdateUserStatusRequest} params
 * @returns {BatchUpdateUserStatusReply}
 */
export function batchUpdateUserStatus(params: BatchUpdateUserStatusRequest): Promise<null> {
  return request.PUT<null>('/v1/user/status', params)
}

/**
 * 重置用户密码
 * @method: put /v1/user/password
 * @param {ResetUserPasswordRequest} params
 * @returns {ResetUserPasswordReply}
 */
export function resetUserPassword(params: ResetUserPasswordRequest): Promise<null> {
  return request.PUT<null>('/v1/user/password', params)
}

/**
 * 用户修改密码
 * @method: put /v1/user/password/self
 * @param {ResetUserPasswordBySelfRequest} params
 * @returns {ResetUserPasswordBySelfReply}
 */
export function resetUserPasswordBySelf(params: ResetUserPasswordBySelfRequest): Promise<null> {
  return request.PUT<null>('/v1/user/password/self', params)
}

/**
 * 获取用户下拉列表
 * @method: post /v1/user/select
 * @param {ListUserRequest} params
 * @returns {GetUserSelectListReply}
 */
export function getUserSelectList(params: ListUserRequest): Promise<GetUserSelectListReply> {
  return request.POST<GetUserSelectListReply>('/v1/user/select', params)
}

/**
 * 修改电话号码
 * @method: put /v1/user/phone
 * @param {UpdateUserPhoneRequest} params
 * @returns {UpdateUserPhoneReply}
 */
export function updateUserPhone(params: UpdateUserPhoneRequest): Promise<null> {
  return request.PUT<null>('/v1/user/phone', params)
}

/**
 * 修改邮箱
 * @method: put /v1/user/email
 * @param {UpdateUserEmailRequest} params
 * @returns {UpdateUserEmailReply}
 */
export function updateUserEmail(params: UpdateUserEmailRequest): Promise<null> {
  return request.PUT<null>('/v1/user/email', params)
}

/**
 * 修改用户头像
 * @method: put /v1/user/avatar
 * @param {UpdateUserAvatarRequest} params
 * @returns {UpdateUserAvatarReply}
 */
export function updateUserAvatar(params: UpdateUserAvatarRequest): Promise<null> {
  return request.PUT<null>('/v1/user/avatar', params)
}

/**
 * 修改个人基础信息
 * @method: put /v1/user/self/base
 * @param {UpdateUserBaseInfoRequest} params
 * @returns {UpdateUserBaseInfoReply}
 */
export function updateUserBaseInfo(params: UpdateUserBaseInfoRequest): Promise<null> {
  return request.PUT<null>('/v1/user/self/base', params)
}

/**
 * 设置用户角色
 * @method: put /v1/user/role
 * @param {UpdateUserRoleRequest} params
 * @returns {UpdateUserRoleReply}
 */
export function updateUserRole(params: UpdateUserRoleRequest): Promise<null> {
  return request.PUT<null>('/v1/user/role', params)
}

export interface CreateUserRequest {
  name: string
  nickname: string
  email: string
  phone: string
  password: string
  remark: string
  avatar: string
  status: number
  gender: number
  role: number
}

export interface UpdateUserRequest {
  id: number
  data: CreateUserRequest
}

export interface DeleteUserRequest {
  id: number
}

export interface GetUserRequest {
  id: number
}

export interface GetUserReply {
  detail: UserItem
}

export interface ListUserRequest {
  pagination: PaginationReq
  keyword?: string
  status?: number
  gender?: number
  role?: number
  ids?: number[]
}

export interface ListUserReply {
  list: UserItem[]
  pagination: PaginationReply
}

export interface BatchUpdateUserStatusRequest {
  ids: number[]
  status: number
}

export interface ResetUserPasswordRequest {
  id: number
}

export interface ResetUserPasswordBySelfRequest {
  oldPassword: string
  newPassword: string
}

export interface GetUserSelectListReply {
  list: SelectItem[]
  pagination: PaginationReply
}

export interface UpdateUserPhoneRequest {
  phone: string
}

export interface UpdateUserEmailRequest {
  email: string
}

export interface UpdateUserAvatarRequest {
  avatar: string
}

export interface UpdateUserBaseInfoRequest {
  nickname: string
  gender: number
  remark: string
}

export interface UpdateUserRoleRequest {
  id: number
  role: Role
}
