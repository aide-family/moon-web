import { message } from 'antd'
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { ApiResponse, RequestConfig } from './types'

// 扩展 AxiosRequestConfig，添加自定义配置
declare module 'axios' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface AxiosRequestConfig extends RequestConfig {}
}

/**
 * 创建 axios 实例
 */
const request: AxiosInstance = axios.create({
  baseURL: '/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 请求拦截器
 */
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加 token（如果存在）
    const token =
      localStorage.getItem('token') ||
      sessionStorage.getItem('token') ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMDA4ODk1ODE3OTAzMjc2MDMyIiwidXNlcm5hbWUiOiJsaWVyLmxvY2FsIiwiaXNzIjoicmFiYml0LXRlc3QiLCJleHAiOjE3OTkzMjkwNjF9.ZGm8W3DWSQAIcWHXaE32GQjaTA0vO8w18LOPxP1uxXQ'
    const namespace = localStorage.getItem('namespace') || 'test'
    if (token && !config.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`
      config.headers['X-Namespace'] = namespace
    }

    // 可以在这里添加其他请求头或处理逻辑
    return config
  },
  (error: AxiosError) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 */
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response
    const config = response.config as AxiosRequestConfig & RequestConfig

    // 如果后端返回的数据结构是 { code, message, data }
    if (data.code !== undefined) {
      // 根据业务状态码处理
      if (data.code === 200 || data.code === 0) {
        // 响应拦截器返回的数据会被 axios 包装，我们需要返回完整的响应对象
        // 但实际数据会被提取，所以这里返回 data.data
        return data.data as unknown as AxiosResponse<ApiResponse>
      } else {
        // 业务错误
        const errorMessage = data.message || '请求失败'
        if (config.showError !== false) {
          message.error(errorMessage)
        }
        return Promise.reject(new Error(errorMessage))
      }
    }

    // 如果后端直接返回数据，则直接返回
    return data as unknown as AxiosResponse<ApiResponse>
  },
  (error: AxiosError<ApiResponse>) => {
    const config = error.config as
      | (AxiosRequestConfig & RequestConfig)
      | undefined

    // 处理 HTTP 错误
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // 未授权，清除 token 并跳转到登录页
          localStorage.removeItem('token')
          sessionStorage.removeItem('token')
          if (config?.showError !== false) {
            message.error('登录已过期，请重新登录')
          }
          // 可以在这里添加路由跳转到登录页
          // window.location.href = '/login'
          break
        case 403:
          if (config?.showError !== false) {
            message.error('没有权限访问该资源')
          }
          break
        case 404:
          if (config?.showError !== false) {
            message.error('请求的资源不存在')
          }
          break
        case 500:
        case 502:
        case 503:
          if (config?.showError !== false) {
            message.error('服务器错误，请稍后重试')
          }
          break
        default: {
          const errorMessage = data?.message || error.message || '请求失败'
          if (config?.showError !== false) {
            message.error(errorMessage)
          }
        }
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      if (config?.showError !== false) {
        message.error('网络错误，请检查网络连接')
      }
    } else {
      // 其他错误
      if (config?.showError !== false) {
        message.error(error.message || '请求失败')
      }
    }

    return Promise.reject(error)
  }
)

/**
 * 封装请求方法
 * 注意：响应拦截器已经处理了数据，返回的是 data.data 或 data，而不是完整的 AxiosResponse
 */
export const http = {
  /**
   * GET 请求
   */
  get<T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<T> {
    // 响应拦截器已经处理了数据，所以这里需要类型断言
    return request.get<ApiResponse<T>>(url, { ...config, params }) as Promise<T>
  },

  /**
   * POST 请求
   */
  post<T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<T> {
    // 响应拦截器已经处理了数据，所以这里需要类型断言
    return request.post<ApiResponse<T>>(url, data, config) as Promise<T>
  },

  /**
   * PUT 请求
   */
  put<T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<T> {
    // 响应拦截器已经处理了数据，所以这里需要类型断言
    return request.put<ApiResponse<T>>(url, data, config) as Promise<T>
  },

  /**
   * DELETE 请求
   */
  delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<T> {
    // 响应拦截器已经处理了数据，所以这里需要类型断言
    return request.delete<ApiResponse<T>>(url, config) as Promise<T>
  },

  /**
   * PATCH 请求
   */
  patch<T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<T> {
    // 响应拦截器已经处理了数据，所以这里需要类型断言
    return request.patch<ApiResponse<T>>(url, data, config) as Promise<T>
  },
}

export default request
