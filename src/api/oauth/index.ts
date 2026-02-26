/**
 * OAuth2 相关接口（登录页第三方登录等）
 * 接口路径为 /oauth2，与 /v1 分离，使用 fetch 请求
 */

import type { OAuth2ReportItem } from './types'
// import { http } from '../index'


/**
 * 获取第三方登录列表（用于登录页「其他登录方式」）
 * @returns 返回 { app, loginUrl } 列表
 */
export function getOauth2Reports(): Promise<OAuth2ReportItem[]> {
  // return fetch('/oauth2/reports')
  //   .then((res) => res.json())
  //   .then((data: OAuth2ReportItem[]) => {
  //     if (Array.isArray(data)) return data
  //     return []
  //   })
  //   .catch(() => [])
  // return http.get('/oauth2/reports')
  return new Promise((resolve, reject) => {
    resolve([{ app: 'github', loginUrl: 'https://github.com/login/oauth/authorize' },
      { app: 'gitee', loginUrl: 'https://gitee.com/oauth/authorize' },
      { app: 'feishu', loginUrl: 'https://open.feishu.cn/open-apis/authen/v1/authorize' },
    ])
    reject(new Error('Failed to fetch OAuth2 reports'))
  })
}
// 导出类型
export type { OAuth2ReportItem } from './types'
