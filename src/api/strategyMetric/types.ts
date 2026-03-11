/**
 * 策略指标相关类型（StrategyMetric API）
 * 接口文档：GET /v1/metric/strategy/{strategyUID}、POST /v1/metric/strategy/{strategyUID}
 */

/** 等级项内层（LevelItem） */
export interface StrategyMetricLevelItemLevel {
  uid?: string
  strategyUID?: string
  mode?: number
  condition?: number
  /** 格式如 -?(\d+)(\.\d{1,9})?s */
  duration?: string
  status?: number
  values?: number[]
}

/** 策略指标等级项 */
export interface StrategyMetricLevelItem {
  level?: StrategyMetricLevelItemLevel
}

/** 获取策略指标响应（StrategyMetric_GetStrategyMetric 200） */
export interface StrategyMetricItem {
  strategyUID?: string
  expr?: string
  summary?: string
  description?: string
  status?: number
  levels?: StrategyMetricLevelItem[]
  createdAt?: string
  updatedAt?: string
  labels?: Record<string, string>
  datasourceUIDs?: string[]
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
