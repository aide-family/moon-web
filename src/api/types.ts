/**
 * API 响应基础类型
 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  success?: boolean
}

/**
 * 分页响应类型
 */
export interface PaginatedResponse<T = unknown> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * 请求配置扩展
 */
export interface RequestConfig {
  showError?: boolean // 是否显示错误提示
  showLoading?: boolean // 是否显示加载状态
  skipAuth?: boolean // 是否跳过认证
}
