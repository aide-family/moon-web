/**
 * 策略相关 API（策略管理服务）
 * 请求需带 Header：Authorization、X-Namespace（由 request 拦截器处理）
 * 状态更新接口在 API 层将 GlobalStatus 转为后端要求的 integer，调用方仅传枚举。
 */

import { http } from '../../index'
import type {
  StrategyItem,
  StrategyListParams,
  StrategyListResponse,
  StrategySelectParams,
  StrategySelectResponse,
  CreateStrategyParams,
  CreateStrategyReply,
  UpdateStrategyParams,
  UpdateStrategyStatusParams,
} from './types'
export type {
  StrategyItem,
  StrategyListParams,
  StrategyListResponse,
  StrategyItemSelect,
  StrategySelectParams,
  StrategySelectResponse,
  CreateStrategyParams,
  CreateStrategyReply,
  UpdateStrategyParams,
  UpdateStrategyStatusParams,
} from './types'

/** 获取策略列表 GET /v1/strategies */
export const getStrategyList = (
  params?: StrategyListParams,
): Promise<StrategyListResponse> => {
  return http.get<StrategyListResponse>('/strategies', { ...params })
}

/** 获取策略详情 GET /v1/strategy/{uid} */
export const getStrategyDetail = (uid: string): Promise<StrategyItem> => {
  return http.get<StrategyItem>(`/strategy/${uid}`)
}

/** 创建策略 POST /v1/strategy */
export const createStrategy = (
  params?: CreateStrategyParams,
): Promise<CreateStrategyReply> => {
  return http.post<CreateStrategyReply>('/strategy', { ...params })
}

/** 更新策略 PUT /v1/strategy/{uid} */
export const updateStrategy = (
  uid: string,
  params?: UpdateStrategyParams,
): Promise<Record<string, never>> => {
  return http.put<Record<string, never>>(`/strategy/${uid}`, { ...params })
}

/** 删除策略 DELETE /v1/strategy/{uid} */
export const deleteStrategy = (uid: string): Promise<Record<string, never>> => {
  return http.delete<Record<string, never>>(`/strategy/${uid}`)
}

/** 更新策略状态 PUT /v1/strategy/{uid}/status，传入 GlobalStatus，内部转为后端 integer */
export const updateStrategyStatus = (
  params: UpdateStrategyStatusParams,
): Promise<Record<string, never>> => {
  return http.put<Record<string, never>>(`/strategy/${params.uid}/status`, {
    ...params,
  })
}

/** 策略选择列表（下拉等）GET /v1/strategies/select */
export const getStrategySelectList = (
  params?: StrategySelectParams,
): Promise<StrategySelectResponse> => {
  return http.get<StrategySelectResponse>('/strategies/select', { ...params })
}
