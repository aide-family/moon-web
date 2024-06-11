// POST /v1/authorization/login
import { Gender, Pagination, Status, SystemRole } from '../global'
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
