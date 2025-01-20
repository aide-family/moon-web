import request from '@/api/request'
import { UserItem } from '../model-types'

/**
 * 告警统计
 */
export const getAlarmStatistics = (params: AlarmStatisticsRequest) => {
  return request.GET<AlarmStatisticsResponse>('/v1/admin/statistics/alarm/summary', params)
}

/**
 * 通知统计
 */
export const getNotificationStatistics = (params: NotificationStatisticsRequest) => {
  return request.GET<NotificationStatisticsResponse>('/v1/admin/statistics/notice/summary', params)
}

/**
 * 最新告警事件
 */
export const getLatestAlarmEvents = (params: LatestAlarmEventsRequest) => {
  return request.GET<LatestAlarmEventsResponse>('/v1/admin/statistics/alarm/latest/event', params)
}

/**
 * 策略告警数量TopN
 */
export const getStrategyAlarmTopN = (params: StrategyAlarmTopNRequest) => {
  return request.GET<StrategyAlarmTopNResponse>('/v1/admin/statistics/alarm/top/strategy', params)
}

/**
 * 最新介入事件
 */
export const getLatestInterventionEvents = (params: LatestInterventionEventsRequest) => {
  return request.GET<LatestInterventionEventsResponse>('/v1/admin/statistics/alarm/latest/intervention', params)
}

export interface TimeRanges {
  /** 开始时间 */
  start: number
  /** 结束时间 */
  end: number
}

/** 告警统计请求 */
export interface AlarmStatisticsRequest {
  /** 时间范围 */
  timeRange?: TimeRanges
  /** 告警级别 */
  level?: number
  /** 环比 默认1天 */
  inComparison?: number
}

/** 告警统计响应 */
export interface AlarmStatisticsResponse {
  // 告警总数
  total: number
  // 正在告警
  ongoing: number
  // 已恢复
  recovered: number
  // 最高优先级的告警
  highestPriority: number
  /** 图表数据 */
  chartData: number[]
  // 总数环比
  totalComparison: string
  // 正在告警环比
  ongoingComparison: string
  // 已恢复环比
  recoveredComparison: string
  // 最高优先级告警环比
  highestPriorityComparison: string
}

/** 通知统计请求 */
export interface NotificationStatisticsRequest {
  /** 时间范围 */
  timeRange?: TimeRanges
  /** 环比 默认1天 */
  inComparison?: number
  /** 通知类型 */
  notifyTypes?: number[]
}

/** 通知类型 */
export interface NotifyTypeItem {
  /** 通知类型 */
  notifyType: number
  /** 通知名称 */
  notifyName: string
  /** 通知数量 */
  total: number
}

/** 通知统计响应 */
export interface NotificationStatisticsResponse {
  // 通知总数
  total: number
  // 通知失败总数
  failed: number
  // 图表数据
  chartData: number[]
  // 通知类型
  notifyTypes: NotifyTypeItem[]
  // 总数环比
  totalComparison: string
  // 通知失败总数环比
  failedComparison: string
}

/** 最新告警事件请求 */
export interface LatestAlarmEventsRequest {
  /** 时间范围 */
  timeRange?: TimeRanges
  /** 数据量 */
  limit?: number
}

/** 告警事件 */
export interface AlarmEventItem {
  // 告警指纹
  fingerprint: string
  // 告警等级
  level: string
  // 告警时间
  eventTime: string
  // 告警摘要
  summary: string
}

/** 最新告警事件响应 */
export interface LatestAlarmEventsResponse {
  // 告警事件
  events: AlarmEventItem[]
}

/** 策略告警数量TopN请求 */
export interface StrategyAlarmTopNRequest {
  /** 时间范围 */
  timeRange?: TimeRanges
  /** 数据量 */
  limit?: number
}

/** 策略告警数量TopN */
export interface StrategyAlarmTopNItem {
  // 策略ID
  strategyId: string
  // 策略名称
  strategyName: string
  // 告警数量
  total: number
}

/** 策略告警数量TopN响应 */
export interface StrategyAlarmTopNResponse {
  // 策略告警数量TopN
  topN: StrategyAlarmTopNItem[]
}

/** 最新介入事件请求 */
export interface LatestInterventionEventsRequest {
  /** 时间范围 */
  timeRange?: TimeRanges
  /** 数据量 */
  limit?: number
}

/** 介入事件 */
export interface InterventionEventItem {
  // 告警指纹
  fingerprint: string
  // 告警时间
  eventTime: string
  // 告警摘要
  summary: string
  // 告警等级
  level: string
  // 告警状态
  status: string
  // 告警处理人
  handler: UserItem
  // 告警处理时间
  handledAt: string
}

/** 最新介入事件响应 */
export interface LatestInterventionEventsResponse {
  // 介入事件
  events: InterventionEventItem[]
}
