/**
 * 告警等级（Level）相关 API（策略管理服务，后端端口 8003）
 * 请求需带 Header：Authorization、X-Namespace（由 request 拦截器处理）
 */

import { http } from '../index'
import type {
  LevelItem,
  LevelListParams,
  LevelListResponse,
  CreateLevelParams,
  UpdateLevelParams,
  LevelSelectParams,
  LevelSelectResponse,
} from './types'
import { GlobalStatus } from '../types'

/** 获取告警等级列表 GET /v1/levels */
export const getLevelList = (params?: LevelListParams): Promise<LevelListResponse> => {
  return http.get<LevelListResponse>('/levels', params as unknown as Record<string, unknown>)
}

/** 获取告警等级详情 GET /v1/level/{uid} */
export const getLevelDetail = (uid: string): Promise<LevelItem> => {
  return http.get<LevelItem>(`/level/${uid}`)
}

/** 创建告警等级 POST /v1/level */
export const createLevel = (params?: CreateLevelParams): Promise<LevelItem> => {
  return http.post<LevelItem>('/level', params as Record<string, unknown>)
}

/** 更新告警等级 PUT /v1/level/{uid} */
export const updateLevel = (uid: string, params?: UpdateLevelParams): Promise<LevelItem> => {
  return http.put<LevelItem>(`/level/${uid}`, params as Record<string, unknown>)
}

/** 删除告警等级 DELETE /v1/level/{uid} */
export const deleteLevel = (uid: string): Promise<Record<string, never>> => {
  return http.delete<Record<string, never>>(`/level/${uid}`)
}

/** 更新告警等级状态 PUT /v1/level/{uid}/status */
export const updateLevelStatus = (uid: string, status: GlobalStatus | string): Promise<LevelItem> => {
  return http.put<LevelItem>(`/level/${uid}/status`, { status } as Record<string, unknown>)
}

/** 告警等级选择列表（下拉等）GET /v1/levels/select */
export const getLevelSelectList = (params?: LevelSelectParams): Promise<LevelSelectResponse> => {
  return http.get<LevelSelectResponse>('/levels/select', params as unknown as Record<string, unknown>)
}

export type {
  LevelItem,
  LevelListParams,
  LevelListResponse,
  CreateLevelParams,
  UpdateLevelParams,
  UpdateLevelStatusParams,
  LevelItemSelect,
  LevelSelectParams,
  LevelSelectResponse,
} from './types'

export { GlobalStatus } from '../types'

