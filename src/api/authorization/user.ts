// POST /v1/authorization/login

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

export const login = (params: LoginRequest) => {
  return request.POST<LoginResponse>('/v1/authorization/login', params)
}
