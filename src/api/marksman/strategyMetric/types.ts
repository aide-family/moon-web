/**
 * 策略指标相关类型（StrategyMetric API）
 * 接口文档：GET /v1/metric/strategy/{strategyUID}、POST /v1/metric/strategy/{strategyUID}
 */

import { LevelItem } from "../level"
import { StrategyItem } from "../strategy/types"

/** 等级项内层（LevelItem）；mode/condition 接口可能返回数字，后端接受字符串枚举 */
export interface StrategyMetricLevelItemLevel {
  uid?: string
  strategyUID?: string
  /** SampleMode 枚举字符串，接口可能返回数字 */
  mode?: number | string
  /** ConditionMetric 枚举字符串，接口可能返回数字 */
  condition?: number | string
  /** 格式如 -?(\d+)(\.\d{1,9})?s */
  duration?: string
  status?: number
  values?: number[]
  level?: LevelItem
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

/** 保存策略指标等级请求体（StrategyMetric_SaveStrategyMetricLevel Body） POST /v1/metric/strategy/{strategyUID}/level；后端接受 mode/condition 为字符串枚举 */
export interface SaveStrategyMetricLevelParams {
  strategyUID?: string
  levelUID?: string
  /** SampleMode 枚举字符串 */
  mode?: string
  /** ConditionMetric 枚举字符串 */
  condition?: string
  /** 格式如 1s、0.5s，正则：^-?(?:0|[1-9][0-9]{0,11})(?:\.[0-9]{1,9})?s$ */
  duration?: string
  status?: number
  values?: number[]
}
