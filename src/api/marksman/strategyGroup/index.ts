/**
 * 策略组（Strategy Group）相关 API
 * 请求需带 Header：Authorization、X-Namespace（由 request 拦截器处理）
 */

import { http } from '../../index'
import type { GlobalStatus } from '../../common/types'
import type {
  StrategyGroupItem,
  StrategyGroupListParams,
  StrategyGroupListResponse,
  CreateStrategyGroupParams,
  UpdateStrategyGroupParams,
  StrategyGroupSelectParams,
  StrategyGroupSelectResponse,
} from './types'

export type {
  StrategyGroupItem,
  StrategyGroupListParams,
  CreateStrategyGroupParams,
  UpdateStrategyGroupParams,
  StrategyGroupItemSelect,
  StrategyGroupSelectParams,
  StrategyGroupSelectResponse,
} from './types'

/** 获取策略组列表 GET /v1/strategy-groups */
export const getStrategyGroupList = (
  params?: StrategyGroupListParams
): Promise<StrategyGroupListResponse> => {
  return http.get<StrategyGroupListResponse>('/strategy-groups', params as unknown as Record<string, unknown>)
}

/** 获取策略组详情 GET /v1/strategy-group/{uid} */
export const getStrategyGroupDetail = (uid: string): Promise<StrategyGroupItem> => {
  return http.get<StrategyGroupItem>(`/strategy-group/${uid}`)
}

/** 创建策略组 POST /v1/strategy-group */
export const createStrategyGroup = (
  params?: CreateStrategyGroupParams
): Promise<StrategyGroupItem> => {
  return http.post<StrategyGroupItem>('/strategy-group', params as Record<string, unknown>)
}

/** 更新策略组 PUT /v1/strategy-group/{uid} */
export const updateStrategyGroup = (
  uid: string,
  params?: UpdateStrategyGroupParams
): Promise<Record<string, never>> => {
  return http.put<Record<string, never>>(`/strategy-group/${uid}`, params as Record<string, unknown>)
}

/** 更新策略组状态 PUT /v1/strategy-group/{uid}/status，传入 GlobalStatus */
export const updateStrategyGroupStatus = (
  uid: string,
  status: GlobalStatus
): Promise<Record<string, never>> => {
  return http.put<Record<string, never>>(`/strategy-group/${uid}/status`, { status })
}

/** 删除策略组 DELETE /v1/strategy-group/{uid} */
export const deleteStrategyGroup = (uid: string): Promise<Record<string, never>> => {
  return http.delete<Record<string, never>>(`/strategy-group/${uid}`)
}

/** 策略组选择列表（下拉等）GET /v1/strategy-groups/select */
export const getStrategyGroupSelectList = (
  params?: StrategyGroupSelectParams
): Promise<StrategyGroupSelectResponse> => {
  return http.get<StrategyGroupSelectResponse>(
    '/strategy-groups/select',
    params as unknown as Record<string, unknown>
  )
}

