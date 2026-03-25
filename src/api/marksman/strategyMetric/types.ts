/**
 * 策略指标相关类型（StrategyMetric API）
 * 接口文档：GET/POST /v1/metric/strategy/{strategyUID}、POST .../level 等
 * mode/condition 使用 SampleMode、ConditionMetric 枚举；后端接受字符串，由请求/响应处统一处理。
 */

import type {
  GlobalStatus,
  SampleMode,
  ConditionMetric,
} from '../../common/types'
import type { LevelItem } from '../level'
import type { StrategyItem } from '../strategy/types'

/** 策略指标等级项（GET 列表元素 / GET 单条等级） */
export interface StrategyMetricLevelItem {
  levelUID?: string
  strategyUID?: string
  level?: LevelItem
  mode?: SampleMode
  condition?: ConditionMetric
  /** 格式如 -?(\d+)(\.\d{1,9})?s */
  duration?: string
  status?: number
  values?: number[]
}

/** 获取策略指标响应 GET /v1/metric/strategy/{strategyUID} */
export interface StrategyMetricItem {
  strategyUID?: string
  expr?: string
  summary?: string
  description?: string
  levels?: StrategyMetricLevelItem[]
  createdAt?: string
  updatedAt?: string
  labels?: Record<string, string>
  datasourceUIDs?: string[]
  strategy?: StrategyItem
}

/** 保存策略指标请求体 POST /v1/metric/strategy/{strategyUID} */
export interface SaveStrategyMetricParams {
  strategyUID?: string
  expr?: string
  summary?: string
  description?: string
  labels?: Record<string, string>
  datasourceUIDs?: string[]
}

/** 保存策略指标等级请求体 POST /v1/metric/strategy/{strategyUID}/level */
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

/** 修改策略指标等级状态请求参数 PUT /v1/metric/strategy/{strategyUID}/level/{levelUID}/status */
export interface UpdateStrategyMetricLevelStatusParams {
  strategyUID: string
  uid: string
  status: GlobalStatus
}
