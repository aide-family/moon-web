/**
 * 策略指标相关 API（StrategyMetric）
 * 请求需带 Header：Authorization、X-Namespace（由 request 拦截器处理）
 */

import { http } from '../../index'
import type { GlobalStatus } from '../../common/types'
import type { StrategyMetricItem, StrategyMetricLevelItem, SaveStrategyMetricParams, SaveStrategyMetricLevelParams } from './types'
export type { StrategyMetricItem, StrategyMetricLevelItem, SaveStrategyMetricParams, SaveStrategyMetricLevelParams } from './types'

/** 获取策略指标 GET /v1/metric/strategy/{strategyUID} */
export const getStrategyMetric = (strategyUID: string): Promise<StrategyMetricItem> => {
  return http.get<StrategyMetricItem>(`/metric/strategy/${strategyUID}`)
}

/** 保存策略指标 POST /v1/metric/strategy/{strategyUID} */
export const saveStrategyMetric = (
  strategyUID: string,
  params?: SaveStrategyMetricParams
): Promise<StrategyMetricItem | unknown> => {
  return http.post<StrategyMetricItem | unknown>(`/metric/strategy/${strategyUID}`, params as Record<string, unknown>)
}

/** 保存策略指标等级 POST /v1/metric/strategy/{strategyUID}/level */
export const saveStrategyMetricLevel = (
  strategyUID: string,
  params?: SaveStrategyMetricLevelParams
): Promise<unknown> => {
  return http.post<unknown>(`/metric/strategy/${strategyUID}/level`, params as Record<string, unknown>)
}

/** 修改告警等级状态 PUT /v1/metric/strategy/{strategyUID}/level/{uid}/status，status 传全局状态枚举 */
export const updateStrategyMetricLevelStatus = (
  strategyUID: string,
  uid: string,
  status: GlobalStatus | string
): Promise<unknown> => {
  return http.put<unknown>(`/metric/strategy/${strategyUID}/level/${uid}/status`, { status })
}
