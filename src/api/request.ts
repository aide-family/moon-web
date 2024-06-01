/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'
import { notification } from 'antd'

const host = window.location.origin

const localhost = 'http://localhost:5173'
const local127 = 'http://127.0.0.1:5173'

export const hostMap: { [key: string]: string } = {
  [localhost]: 'http://localhost:8000',
  [local127]: 'http://localhost:8000',
}

const request = axios.create({
  baseURL: hostMap[host] || host,
  timeout: 10000,
})

type ErrorResponse = {
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
    notification.warning({
      message: respData?.message || '请求失败',
    })

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
  localStorage.setItem('token', token)
}

export const removeToken = () => {
  localStorage.removeItem('token')
}

export const getToken = () => {
  return localStorage.getItem('token') || ''
}

export const isLogin = () => {
  return !!getToken()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GET = async <T>(url: string, params?: any) => {
  return request.get<unknown, T>(url, { params })
}

const POST = async <T>(url: string, data?: any) => {
  return request.post<unknown, T>(url, data)
}

export default {
  GET,
  POST,
}
