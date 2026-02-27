import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import type React from 'react'

/**
 * 从 URL 中读取 OAuth 回调带回的 token 并持久化，
 * 与 api/request 拦截器使用的 key 一致。每个系统（main/rabbit/test）均需在 BrowserRouter 内使用。
 */
export function OAuthTokenHandler({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token') ?? params.get('access_token')
    if (token) {
      localStorage.setItem('token', token)
      sessionStorage.setItem('token', token)
      const cleanUrl = location.pathname + (location.hash || '')
      window.history.replaceState({}, '', cleanUrl)
    }
  }, [location.search, location.pathname, location.hash])
  return <>{children}</>
}
