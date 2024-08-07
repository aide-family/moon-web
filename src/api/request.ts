/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'
import { notification } from 'antd'

const host = window.location.origin

const localhost = 'http://localhost:5173'
const local127 = 'http://127.0.0.1:5173'

export const hostMap: { [key: string]: string } = {
  [localhost]: 'http://localhost:8000',
  [local127]: 'http://dev-palace.aide-cloud.cn'
}

const request = axios.create({
  baseURL: hostMap[host] || host,
  timeout: 10000
})

export type ErrorResponse = {
  code: number
  message: string
  metadata: Record<string, string>
  reason: string
}

request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const resp = error.response
    const respData = resp.data as ErrorResponse
    switch (respData.code) {
      case 500:
        notification.error({
          message: respData?.message || '请求失败'
        })
        break
      case 401:
        notification.error({
          message: respData?.message || '登录失效'
        })
        removeToken()
        break
      default:
        notification.warning({
          message: respData?.message || '请求失败'
        })
    }

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

const DELTED = async <T>(url: string, data?: any) => {
  return request.delete<NullObject, T>(url, { data })
}

export default {
  GET,
  POST,
  PUT,
  DELTED
}
