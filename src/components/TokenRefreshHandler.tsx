import type React from 'react'
import { useInterval } from 'ahooks'
import { refreshToken } from '@/api/account/self'

const REFRESH_INTERVAL_MS = 3 * 60 * 1000 // 3 分钟

/**
 * 登录后定期调用 GET /v1/self/refresh-token 刷新 token，
 * 需放在 AuthGuard 内部，仅在已登录时挂载。
 */
export function TokenRefreshHandler({
  children,
}: {
  children: React.ReactNode
}) {
  useInterval(() => {
    refreshToken().catch(() => {
      // 失败时 request 拦截器会清 token 并提示，此处不再重复处理
    })
  }, REFRESH_INTERVAL_MS)

  return <>{children}</>
}
