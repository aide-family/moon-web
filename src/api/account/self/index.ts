import { http } from '../../common/request'
import type { RefreshTokenResponse, SelfInfo } from './types'

const TOKEN_KEY = 'token'

/** 进行中的刷新 Promise，用于微前端/多应用场景下的单飞，避免主服务与子服务同时触发多次请求 */
let refreshPromise: Promise<void> | null = null

/**
 * 刷新当前用户 token（GET /v1/self/refresh-token）
 * 成功后将新 token 写入 localStorage / sessionStorage，与 AuthGuard、request 拦截器一致。
 * 同一时刻仅会发起一次请求，多应用同时调用会复用同一 Promise，避免无效多次调用。
 */
export function refreshToken(): Promise<void> {
  if (refreshPromise !== null) {
    return refreshPromise
  }
  refreshPromise = http
    .get<RefreshTokenResponse>('/self/refresh-token', undefined, {
      showError: false, // 刷新失败由 401 拦截器统一提示，避免重复
    })
    .then((data) => {
      const newToken = data?.token ?? data?.access_token
      if (newToken) {
        localStorage.setItem(TOKEN_KEY, newToken)
        sessionStorage.setItem(TOKEN_KEY, newToken)
      }
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

/**
 * Self_Info
 * GET /v1/self/info
 */
export function getSelfInfo(): Promise<SelfInfo> {
  return http.get<SelfInfo>('/self/info')
}

/**
 * Self_ChangeEmail
 * PUT /v1/self/change-email
 * Body(application/json): email
 */
export function changeEmail(body: { email: string }): Promise<unknown> {
  return http.put('/self/change-email', body as Record<string, unknown>)
}

/**
 * Self_ChangeAvatar
 * PUT /v1/self/change-avatar
 * Body(application/json): avatar
 */
export function changeAvatar(body: { avatar: string }): Promise<unknown> {
  return http.put('/self/change-avatar', body as Record<string, unknown>)
}

/**
 * Self_ChangePhone
 * PUT /v1/self/change-phone
 * Body(application/json): phone
 */
export function changePhone(body: { phone: string }): Promise<unknown> {
  return http.put('/self/change-phone', body as Record<string, unknown>)
}
