/**
 * 策略指标相关类型（StrategyMetric API）
 * 接口文档：GET /v1/metric/strategy/{strategyUID}、POST /v1/metric/strategy/{strategyUID}
 * mode/condition 使用 SampleMode、ConditionMetric 枚举；后端接受字符串，由 API 层统一处理。
 */

import type { SampleMode, ConditionMetric } from '../../common/types'
import type { LevelItem } from '../level'
import type { StrategyItem } from '../strategy/types'

/** 等级项内层（LevelItem）；mode/condition 为策略指标枚举 */
export interface StrategyMetricLevelItemLevel {
  uid?: string
  strategyUID?: string
  mode?: SampleMode
  condition?: ConditionMetric
  /** 格式如 -?(\d+)(\.\d{1,9})?s */
  duration?: string
  status?: number
  values?: number[]
  level?: LevelItem
  levelUID?: string
}

/** 策略指标等级项（表格行）；与 StrategyMetricLevelItemLevel 同构，接口返回的 status 在当层 */
export type StrategyMetricLevelItem = StrategyMetricLevelItemLevel

/** 获取策略指标响应（StrategyMetric_GetStrategyMetric 200） */
export interface StrategyMetricItem {
  strategyUID?: string
  expr?: string
  summary?: string
  description?: string
  status?: number
  levels?: StrategyMetricLevelItemLevel[]
  createdAt?: string
  updatedAt?: string
  labels?: Record<string, string>
  datasourceUIDs?: string[]
  strategy: StrategyItem
}

/** 保存策略指标请求体（StrategyMetric_SaveStrategyMetric Body） */
export interface SaveStrategyMetricParams {
  strategyUID?: string
  expr?: string
  summary?: string
  description?: string
  status?: number
  labels?: Record<string, string>
  datasourceUIDs?: string[]
}

/** 保存策略指标等级请求体（StrategyMetric_SaveStrategyMetricLevel Body） POST /v1/metric/strategy/{strategyUID}/level；mode/condition 使用枚举 */
export interface SaveStrategyMetricLevelParams {
  strategyUID?: string
  levelUID?: string
  mode?: SampleMode
  condition?: ConditionMetric
  /** 格式如 1s、0.5s，正则：^-?(?:0|[1-9][0-9]{0,11})(?:\.[0-9]{1,9})?s$ */
  duration?: string
  status?: number
  values?: number[]
}

/** 策略指标绑定接收人请求体 POST /v1/metric/strategy/{strategyUID}/receivers */
export interface StrategyMetricBindReceiversParams {
  strategyUID?: string
  receiverUIDs?: string[]
  levelUID?: string
}
