import type { SubAppConfig } from '@/types/subApp'

/** all-in-one 部署时子应用在 nginx 下的路径前缀 */
export const SUB_APP_BASE = {
  goddess: '/sub/goddess',
  rabbit: '/sub/rabbit',
  marksman: '/sub/marksman',
  jade_tree: '/sub/jade_tree',
} as const

/**
 * 生产环境子应用地址：配置为同源路径（如 /sub/rabbit/emails），运行时拼接当前 origin，
 * 与部署端口、域名无关；若配置为完整 URL 则原样返回（独立部署子应用时使用）。
 */
export function resolveSubAppUrl(config: SubAppConfig): string {
  if (import.meta.env.DEV) {
    return config.devUrl
  }

  const prodUrl = config.prodUrl
  if (/^https?:\/\//i.test(prodUrl)) {
    return prodUrl
  }

  if (prodUrl.startsWith('/')) {
    return `${window.location.origin}${prodUrl}`
  }

  return prodUrl
}

/** 子应用 BrowserRouter basename（与 Vite base 一致） */
export function getRouterBasename(): string | undefined {
  const base = import.meta.env.BASE_URL
  if (!base || base === '/') return undefined
  return base.replace(/\/$/, '')
}
