import { Navigate, useLocation } from 'react-router-dom'
import type React from 'react'

const TOKEN_KEY = 'token'

/** 与 api/request、OAuthTokenHandler 使用的 key 一致 */
function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

/**
 * 路由守卫：未登录时统一跳转登录页。
 * 需在 BrowserRouter 内使用，且与 OAuthTokenHandler 同层级或在其子层级。
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const token = getToken()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return <>{children}</>
}
