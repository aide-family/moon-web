/* eslint-disable @typescript-eslint/no-explicit-any */
import { message, notification } from 'antd'
import axios, { AxiosError } from 'axios'

const host = window.location.origin

const localhost = 'http://localhost:5173'
const local127 = 'http://127.0.0.1:5173'
const local5174 = 'http://127.0.0.1:5174'
const local192 = 'http://192.168.10.68:5174'

export const hostMap: { [key: string]: string } = {
  // [localhost]: 'http://dev-palace.aide-cloud.cn',
  [local5174]: 'http://192.168.10.2:8000',
  [local192]: 'http://192.168.10.2:8000',
  [localhost]: 'http://localhost:8000',
  [local127]: 'http://localhost:8000'
}

export const baseURL = hostMap[host] || host + '/api'

const request = axios.create({
  baseURL: baseURL,
  timeout: 10000
})

export type ErrorResponse = {
  code: number
  message: string
  metadata: Record<string, string>
  reason: string
}

let timer: NodeJS.Timeout | null = null

request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: AxiosError<ErrorResponse>) => {
    let resp: any = error.response
    if (!resp || !resp?.data) {
      resp = {}
      resp.data = {
        code: 500,
        message: '网络错误',
        metadata: {},
        reason: 'NET_ERROR'
      }
    }
    const respData = resp.data
    errorHandle(respData)
    return Promise.reject(respData)
  }
)

request.interceptors.request.use(
  (config) => {
    const token = getToken()
    config.headers['Authorization'] = `Bearer ${token}`
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const setToken = (token: string) => {
  sessionStorage.setItem('token', token)
}

export const removeToken = () => {
  sessionStorage.removeItem('token')
  window.location.href = '/#/login'
}

export const getToken = () => {
  return sessionStorage.getItem('token') || ''
}

export const isLogin = () => {
  return !!getToken()
}

export type NullObject = Record<string, never>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GET = async <T>(url: string, params?: any) => {
  return request.get<NullObject, T>(url, { params })
}

const POST = async <T>(url: string, data?: any) => {
  return request.post<NullObject, T>(url, data)
}

const PUT = async <T>(url: string, data?: any) => {
  return request.put<NullObject, T>(url, data)
}

const DELETE = async <T>(url: string, data?: any) => {
  return request.delete<NullObject, T>(url, { data })
}

export default {
  GET,
  POST,
  PUT,
  DELETE
}

export interface HealthReply {
  healthy: boolean
  version: string
}

export const healthApi = (): Promise<HealthReply> => {
  return GET('/health')
}

const errorHandle = (err: ErrorResponse) => {
  if (!err) return

  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => {
    let msg = err.message
    switch (err.code) {
      case 400:
        // 表单告警
        break
      case 401:
        if (msg === 'JWT token is missing') {
          msg = '登录已过期，请重新登录'
        }
        message.error(msg || '登录失效').then(() => removeToken())
        removeToken()
        break
      case 403:
        message.error(err?.message || '没有权限')
        break
      case 429:
        message.error(err?.message || '请求太频繁')
        break
      case 405:
        // 需要有确定或者取消的弹窗， 不操作则一直存在顶层， 底层内容不允许操作
        message.error(err?.message || '请求方式错误')
        break
      default:
        notification.warning({
          message: err?.message || '请求失败'
        })
        break
    }
  }, 500)
}
