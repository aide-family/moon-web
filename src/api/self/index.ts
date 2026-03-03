import { http } from '../request'
import type { RefreshTokenResponse } from './types'

const TOKEN_KEY = 'token'

/**
 * 刷新当前用户 token（GET /v1/self/refresh-token）
 * 成功后将新 token 写入 localStorage / sessionStorage，与 AuthGuard、request 拦截器一致
 */
export function refreshToken(): Promise<void> {
  return http
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
}
