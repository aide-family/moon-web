/**
 * 认证相关接口（AuthService）
 * OpenAPI: /v1/auth/email/login、/v1/auth/email/login/code、/v1/auth/oauth2/login
 */

import { http } from '../../common/request'

/** 邮箱登录验证码请求（SendEmailLoginCodeRequest） */
export interface SendEmailLoginCodeParams {
  email?: string
  captchaId?: string
  captchaAnswer?: string
}

/** 邮箱验证码登录请求（EmailLoginRequest） */
export interface EmailLoginParams {
  email?: string
  code?: string
}

/** 登录成功响应（LoginReply） */
export interface LoginReply {
  token?: string
}

/** OAuth2 登录请求（magicbox.oauth.OAuth2LoginRequest），前端可只传 app、user、portal 等 */
export interface OAuth2LoginParams {
  app?: number
  config?: Record<string, unknown>
  user?: {
    openID?: string
    name?: string
    nickname?: string
    email?: string
    avatar?: string
    app?: number
    remark?: string
  }
  portal?: string
}

/**
 * 发送邮箱登录验证码
 * POST /v1/auth/email/login/code
 */
export function sendEmailLoginCode(
  params: SendEmailLoginCodeParams,
): Promise<{ message?: string }> {
  return http.post<{ message?: string }>(
    '/auth/email/login/code',
    { ...params },
    { skipAuth: true },
  )
}

/**
 * 邮箱验证码登录
 * POST /v1/auth/email/login
 */
export function emailLogin(params: EmailLoginParams): Promise<LoginReply> {
  return http.post<LoginReply>(
    '/auth/email/login',
    { ...params },
    { skipAuth: true },
  )
}

/**
 * OAuth2 登录
 * POST /v1/auth/oauth2/login
 */
export function oauth2Login(params: OAuth2LoginParams): Promise<LoginReply> {
  return http.post<LoginReply>(
    '/auth/oauth2/login',
    { ...params },
    { skipAuth: true },
  )
}
