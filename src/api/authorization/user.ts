// POST /v1/authorization/login
import { Gender, Pagination, PaginationResponse, Status, SystemRole } from '../global'
import request from '../request'

export interface LoginCaptcha {
  code: string
  id: string
}

export interface LoginRequest {
  username: string
  password: string
  captcha: LoginCaptcha
  redirect?: string
  teamId?: number
  teamRoleId?: number
}

export interface UserItem {
  id: number
  name: string
  nickname: string
  email: string
  phone: string
  status: number
  gender: number
  role: number
  avatar: string
  remark: string
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  user: UserItem
  token: string
  redirect?: string
}

export interface SearchUsersParams {
  pagination: Pagination
  keyword: string
  status: Status
  gender: Gender
  role: SystemRole
}

export interface UpDateUserSelfBaseParams {
  nickname: string
  gender: number
  remark: string
}

export interface UpDateUserPasswordParams {
  oldPassword: string
  newPassword: string
}

export const login = (params: LoginRequest) => {
  return request.POST<LoginResponse>('/v1/authorization/login', params)
}

/**
 * 登出
 * POST /v1/authorization/logout
 */
export const logout = () => {
  return request.POST<{ redirect: string }>('/v1/authorization/logout', {})
}

/**
 * 刷新token
 * POST /v1/authorization/refresh
 */
export const refreshToken = (teamId: number) => {
  return request.POST<LoginResponse>('/v1/authorization/refresh', { teamId })
}

/**
 * 列表用户
 * POST /v1/user/list
 */
export const searchUsers = (params: SearchUsersParams) => {
  return request.POST<PaginationResponse<UserItem>>('/v1/user/list', params)
}

/**
 * 获取用户
 * GET /v1/user/{id}
 */
export const getUser = (id: number) => {
  return request.GET<{ user: UserItem }>(`/v1/user/${id}`)
}

/**
 * 修改电话号码
 * PUT /v1/user/phone
 */
export const updateUserPhone = (phone: string) => {
  return request.PUT('/v1/user/phone', phone)
}

/**
 * 修改邮箱
 * PUT /v1/user/email
 */
export const updateUserEmail = (email: string) => {
  return request.PUT('/v1/user/email', email)
}

/**
 * 修改个人基础信息
 * PUT /v1/user/self/base
 */
export const updateUserSelfBase = (params: UpDateUserSelfBaseParams) => {
  return request.PUT('/v1/user/self/base', params)
}

/**
 * 用户修改密码
 * PUT /v1/user/password/self
 */
export const updateUserPassword = (params: UpDateUserPasswordParams) => {
  return request.PUT('/v1/user/password/self', params)
}

/**
 * 修改用户头像
 * PUT /v1/user/avatar
 */
export const updateUserAvatar = (avatar: string) => {
  return request.PUT('/v1/user/avatar', avatar)
}
