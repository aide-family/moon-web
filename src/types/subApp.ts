/**
 * 微前端子应用配置（主应用与子系统共用）
 */
export interface SubAppConfig {
  /** 子应用名称（用于 micro-app 的 name 属性） */
  name: string
  /** 开发环境 URL */
  devUrl: string
  /** 生产环境 URL */
  prodUrl: string
  /** 子应用路径（用于路由） */
  path: string
}
