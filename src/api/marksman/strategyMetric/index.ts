/**
 * 策略指标相关 API（StrategyMetric）
 * 请求需带 Header：Authorization、X-Namespace（由 request 拦截器处理）
 */

import { http } from '../../index'
import type {
  StrategyMetricItem,
  StrategyMetricLevelItem,
  SaveStrategyMetricParams,
  SaveStrategyMetricLevelParams,
  UpdateStrategyMetricLevelStatusParams,
} from './types'
export type {
  StrategyMetricItem,
  StrategyMetricLevelItem,
  SaveStrategyMetricParams,
  SaveStrategyMetricLevelParams,
  UpdateStrategyMetricLevelStatusParams,
} from './types'

/** 获取策略指标 GET /v1/metric/strategy/{strategyUID} */
export const getStrategyMetric = (
  strategyUID: string,
): Promise<StrategyMetricItem> => {
  return http.get<StrategyMetricItem>(`/metric/strategy/${strategyUID}`)
}

/** 保存策略指标 POST /v1/metric/strategy/{strategyUID} */
export const saveStrategyMetric = (
  strategyUID: string,
  params?: SaveStrategyMetricParams,
): Promise<Record<string, never>> => {
  return http.post<Record<string, never>>(`/metric/strategy/${strategyUID}`, {
    ...params,
  })
}

/** 保存策略指标等级 POST /v1/metric/strategy/{strategyUID}/level */
export const saveStrategyMetricLevel = (
  strategyUID: string,
  params?: SaveStrategyMetricLevelParams,
): Promise<Record<string, never>> => {
  return http.post<Record<string, never>>(
    `/metric/strategy/${strategyUID}/level`,
    { ...params },
  )
}

/** 获取策略指标等级详情 GET /v1/metric/strategy/{strategyUID}/level/{levelUID} */
export const getStrategyMetricLevel = (
  strategyUID: string,
  levelUID: string,
): Promise<StrategyMetricLevelItem> => {
  return http.get<StrategyMetricLevelItem>(
    `/metric/strategy/${strategyUID}/level/${levelUID}`,
  )
}

/** 删除策略指标等级 DELETE /v1/metric/strategy/{strategyUID}/level/{levelUID} */
export const deleteStrategyMetricLevel = (
  strategyUID: string,
  levelUID: string,
): Promise<Record<string, never>> => {
  return http.delete<Record<string, never>>(
    `/metric/strategy/${strategyUID}/level/${levelUID}`,
  )
}

/** 修改告警等级状态 PUT /v1/metric/strategy/{strategyUID}/level/{levelUID}/status，传入 GlobalStatus */
export const updateStrategyMetricLevelStatus = (
  params: UpdateStrategyMetricLevelStatusParams,
): Promise<Record<string, never>> => {
  return http.put<Record<string, never>>(
    `/metric/strategy/${params.strategyUID}/level/${params.uid}/status`,
    {
      strategyUID: params.strategyUID,
      levelUID: params.uid,
      status: params.status,
    },
  )
}
