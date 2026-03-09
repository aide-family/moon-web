/**
 * 策略相关 API（策略管理服务）
 * 请求需带 Header：Authorization、X-Namespace（由 request 拦截器处理）
 */

import { http } from '../index'
import type {
  StrategyItem,
  StrategyListParams,
  StrategyListResponse,
  CreateStrategyParams,
  UpdateStrategyParams,
} from './types'
export type { StrategyItem, StrategyListParams, CreateStrategyParams, UpdateStrategyParams } from './types'

/** 获取策略列表 GET /v1/strategies */
export const getStrategyList = (params?: StrategyListParams): Promise<StrategyListResponse> => {
  return http.get<StrategyListResponse>('/strategies', params as unknown as Record<string, unknown>)
}

/** 获取策略详情 GET /v1/strategy/{uid} */
export const getStrategyDetail = (uid: string): Promise<StrategyItem> => {
  return http.get<StrategyItem>(`/strategy/${uid}`)
}

/** 创建策略 POST /v1/strategy */
export const createStrategy = (params?: CreateStrategyParams): Promise<StrategyItem> => {
  return http.post<StrategyItem>('/strategy', params as Record<string, unknown>)
}

/** 更新策略 PUT /v1/strategy/{uid} */
export const updateStrategy = (uid: string, params?: UpdateStrategyParams): Promise<StrategyItem> => {
  return http.put<StrategyItem>(`/strategy/${uid}`, params as Record<string, unknown>)
}

/** 删除策略 DELETE /v1/strategy/{uid} */
export const deleteStrategy = (uid: string): Promise<Record<string, never>> => {
  return http.delete<Record<string, never>>(`/strategy/${uid}`)
}

/** 更新策略状态 PUT /v1/strategy/{uid}/status，body 中 status 为 integer */
export const updateStrategyStatus = (
  uid: string,
  status: number
): Promise<Record<string, never>> => {
  return http.put<Record<string, never>>(`/strategy/${uid}/status`, { uid, status })
}
