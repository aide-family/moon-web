import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import type React from 'react'

/**
 * 从 URL 中读取 OAuth 回调带回的 token 并持久化，
 * 与 api/request 拦截器使用的 key 一致。每个系统（main/rabbit/test）均需在 BrowserRouter 内使用。
 * 若当前在登录页，保存 token 后会自动跳转到系统首页，避免“要点第二次才能进入”的问题。
 */
export function OAuthTokenHandler({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token') ?? params.get('access_token')
    if (token) {
      localStorage.setItem('token', token)
      sessionStorage.setItem('token', token)
      const cleanUrl = location.pathname + (location.hash || '')
      window.history.replaceState({}, '', cleanUrl)
      // 若在登录页，保存 token 后直接进入系统，无需用户再点一次
      const from = (location.state as { from?: string } | null)?.from
      if (location.pathname === '/login') {
        navigate(from || '/', { replace: true })
      }
    }
  }, [location.search, location.pathname, location.hash, location.state, navigate])

  return <>{children}</>
}
