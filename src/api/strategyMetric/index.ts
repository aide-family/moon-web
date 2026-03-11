/**
 * 策略指标相关 API（StrategyMetric）
 * 请求需带 Header：Authorization、X-Namespace（由 request 拦截器处理）
 */

import { http } from '../index'
import type { StrategyMetricItem, SaveStrategyMetricParams } from './types'
export type { StrategyMetricItem, SaveStrategyMetricParams } from './types'

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
