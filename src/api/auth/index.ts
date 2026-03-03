/**
 * 认证相关接口（AuthService）
 */

import { http } from '../request'

/**
 * 发送邮箱登录验证码
 * POST /v1/auth/email/login/code
 * @param params email, captchaId, captchaAnswer
 */
export function sendEmailLoginCode(params: {
  email: string
  captchaId: string
  captchaAnswer: string
}): Promise<void> {
  return http.post<void>('/auth/email/login/code', params as unknown as Record<string, unknown>, {
    skipAuth: true,
  })
}

/**
 * 邮箱验证码登录
 * POST /v1/auth/email/login
 * @param params email, code
 * @returns { token }
 */
export function emailLogin(params: { email: string; code: string }): Promise<{ token: string }> {
  return http.post<{ token: string }>(
    '/auth/email/login',
    params as unknown as Record<string, unknown>,
    { skipAuth: true }
  )
}
