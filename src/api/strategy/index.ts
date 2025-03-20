/* eslint-disable prettier/prettier */
import {
  type Condition,
  type DatasourceType,
  type EventDataType,
  type HTTPMethod,
  type MQCondition,
  type Status,
  type StatusCodeCondition,
  StrategyType,
  type SustainType,
  type TemplateSourceType
} from '../enum'
import type { PaginationReply, PaginationReq } from '../global'
import type { StrategyGroupItem, StrategyItem } from '../model-types'
import request from '../request'

// 策略组相关类型定义
export interface CreateStrategyGroupRequest {
  name: string
  remark?: string
  status?: Status
  categoriesIds: number[]
}

export interface DeleteStrategyGroupRequest {
  id: number
}

export interface ListStrategyGroupRequest {
  pagination: PaginationReq
  keyword?: string
  status?: Status
  categoriesIds?: number[]
}

export interface ListStrategyGroupReply {
  list: StrategyGroupItem[]
  pagination: PaginationReply
}

export interface GetStrategyGroupRequest {
  id: number
}

export interface GetStrategyGroupReply {
  detail: StrategyGroupItem
}

export interface UpdateStrategyGroupRequest {
  id: number
  update: CreateStrategyGroupRequest
}

export interface UpdateStrategyGroupStatusRequest {
  ids: number[]
  status: Status
}

/** 创建策略事件项请求 */
export interface CreateStrategyEventLevelRequest {
  /** 值 */
  threshold: string
  /** 条件 */
  condition: MQCondition
  /** 数据类型 */
  dataType: EventDataType
  /** 告警等级ID */
  levelId: number
  /** 告警页面 */
  alarmPageIds: number[]
  /** 告警分组 */
  alarmGroupIds: number[]
  /** 策略标签 */
  labelNotices: CreateStrategyLabelNoticeRequest[]
  /** 对象状态下的数据KEY */
  pathKey: string
}

/** 创建策略基础请求参数 */
export type CreateStrategyBaseRequest<T = { [key: string]: string }> = {
  /** 策略组ID */
  groupId: number
  /** 模板ID */
  templateId: number
  /** 备注 */
  remark: string
  /** 状态 */
  status: Status
  /** 数据源ID */
  datasourceIds: number[]
  /** 模板来源 */
  sourceType: TemplateSourceType
  /** 策略名称 */
  name: string
  /** 策略标签 */
  labels: T
  /** 策略注解 */
  annotations: { [key: string]: string }
  /** 策略语句 */
  expr: string
  /** 策略分类 */
  categoriesIds: number[]
  /** 告警分组 */
  alarmGroupIds: number[]
}

/** 创建策略请求 */
export type CreateStrategyRequest<T = { [key: string]: string }> = CreateStrategyBaseRequest<T> &
  (
    | {
        strategyType: StrategyType.StrategyTypeMetric
        strategyMetricLevels: CreateStrategyMetricLevelRequest[]
      }
    | {
        strategyType: StrategyType.StrategyTypeEvent
        strategyEventLevels: CreateStrategyEventLevelRequest[]
      }
    | {
        strategyType: StrategyType.StrategyTypeDomainCertificate
        strategyDomainLevels: CreateStrategyDomainLevelRequest[]
      }
    | {
        strategyType: StrategyType.StrategyTypeDomainPort
        strategyPortLevels: CreateStrategyPortLevelRequest[]
      }
    | {
        strategyType: StrategyType.StrategyTypeHTTP
        strategyHTTPLevels: CreateStrategyHTTPLevelRequest[]
      }
    | {
        strategyType: StrategyType.StrategyTypeLog
        strategyLogLevels: CreateStrategyLogLevelRequest[]
      }
  )

/** 创建策略表单数据 */
export type CreateStrategyRequestFormData = CreateStrategyRequest<KV[]>

export interface UpdateStrategyRequest {
  id: number
  data: CreateStrategyRequest
}

export interface DeleteStrategyRequest {
  id: number
}

export interface GetStrategyRequest {
  id: number
}

export interface GetStrategyReply {
  detail: StrategyItem
}

export interface ListStrategyRequest {
  pagination: PaginationReq
  keyword?: string
  status?: Status
  datasourceType?: DatasourceType
  groupIds?: number[]
}

export interface ListStrategyReply {
  pagination: PaginationReply
  list: StrategyItem[]
}

export interface UpdateStrategyStatusRequest {
  ids: number[]
  status: Status
}

export interface CreateStrategyMetricLevelRequest {
  /** 策略等级ID */
  levelId: number
  /** 告警页面ID */
  alarmPageIds: number[]
  /** 告警组ID */
  alarmGroupIds: number[]
  /** 策略标签 */
  labelNotices: CreateStrategyLabelNoticeRequest[]
  /** 持续时间 */
  duration: number
  /** 计数 */
  count: number
  /** 持续类型 */
  sustainType: SustainType
  /** 阈值 */
  threshold: number
  /** 判断条件 */
  condition: Condition
}

/** 创建策略HTTP等级请求 */
export interface CreateStrategyHTTPLevelRequest {
  /** 策略等级ID */
  levelId: number
  /** 告警页面ID */
  alarmPageIds: number[]
  /** 告警组ID */
  alarmGroupIds: number[]
  /** 策略标签 */
  labelNotices: CreateStrategyLabelNoticeRequest[]
  /** 响应时间 */
  responseTime: number
  /** 状态码 */
  statusCode: number
  /** 请求头 */
  headers: KV[]
  /** 请求体 */
  body: string
  /** 查询参数 */
  queryParams: string
  /** 请求方式 */
  method: HTTPMethod
  /** 状态码判断条件 */
  statusCodeCondition: StatusCodeCondition
  /** 响应时间判断条件 */
  responseTimeCondition: Condition
}

/** 创建策略证书等级请求 */
export interface CreateStrategyDomainLevelRequest {
  /** 策略等级ID */
  levelId: number
  /** 告警页面ID */
  alarmPageIds: number[]
  /** 告警组ID */
  alarmGroupIds: number[]
  /** 策略标签 */
  labelNotices: CreateStrategyLabelNoticeRequest[]
  /** 阈值 */
  threshold: number
  /** 判断条件 */
  condition: Condition
}

/** 创建策略端口等级请求 */
export interface CreateStrategyPortLevelRequest {
  /** 策略等级ID */
  levelId: number
  /** 告警页面ID */
  alarmPageIds: number[]
  /** 告警组ID */
  alarmGroupIds: number[]
  /** 策略标签 */
  labelNotices: CreateStrategyLabelNoticeRequest[]
  /** 阈值 */
  threshold: number
  /** 端口 */
  port: number
}
/** 创建策略log等级请求 */
export interface CreateStrategyLogLevelRequest {
  /** 策略等级ID */
  levelId: number
  /** 告警页面ID */
  alarmPageIds: number[]
  /** 告警组ID */
  alarmGroupIds: number[]
  /** 策略标签 */
  labelNotices: CreateStrategyLabelNoticeRequest[]
  /** 日志数量 */
  count: number
}

export interface CopyStrategyRequest {
  strategyId: number
}

export interface CopyStrategyReply {
  id: number
}

export interface CreateStrategyLabelNoticeRequest {
  name: string
  value: string
  alarmGroupIds: number[]
}

// API 请求定义
/**
 * 创建策略组
 * @param params CreateStrategyGroupRequest
 * @returns CreateStrategyGroupReply
 */
export function createStrategyGroup(params: CreateStrategyGroupRequest) {
  return request.POST('/v1/group/strategy/create', params)
}

/**
 * 删除策略组
 * @param params DeleteStrategyGroupRequest
 * @returns DeleteStrategyGroupReply
 */
export function deleteStrategyGroup(params: DeleteStrategyGroupRequest) {
  return request.DELETE(`/v1/group/strategy/${params.id}`)
}

/**
 * 策略组列表
 * @param params ListStrategyGroupRequest
 * @returns ListStrategyGroupReply
 */
export function listStrategyGroup(params: ListStrategyGroupRequest) {
  return request.POST<ListStrategyGroupReply>('/v1/group/strategy/list', params)
}

/**
 * 策略组详情
 * @param params GetStrategyGroupRequest
 * @returns GetStrategyGroupReply
 */
export function getStrategyGroup(params: GetStrategyGroupRequest) {
  return request.GET<GetStrategyGroupReply>(`/v1/group/strategy/${params.id}`)
}

/**
 * 修改策略组
 * @param params UpdateStrategyGroupRequest
 * @returns UpdateStrategyGroupReply
 */
export function updateStrategyGroup(params: UpdateStrategyGroupRequest) {
  return request.PUT(`/v1/group/strategy/${params.id}`, params)
}

/**
 * 修改策略分组状态
 * @param params UpdateStrategyGroupStatusRequest
 * @returns UpdateStrategyGroupStatusReply
 */
export function updateStrategyGroupStatus(params: UpdateStrategyGroupStatusRequest) {
  return request.PUT('/v1/group/strategy/update/status', params)
}

/**
 * 创建策略
 * @param params CreateStrategyRequest
 * @returns CreateStrategyReply
 */
export function createStrategy(params: CreateStrategyRequest) {
  return request.POST('/v1/strategy/create', params)
}

/**
 * 修改策略
 * @param params UpdateStrategyRequest
 * @returns UpdateStrategyReply
 */
export function updateStrategy(params: UpdateStrategyRequest) {
  return request.PUT(`/v1/strategy/update/${params.id}`, params)
}

/**
 * 修改策略状态
 * @param params UpdateStrategyStatusRequest
 * @returns UpdateStrategyStatusReply
 */
export function updateStrategyStatus(params: UpdateStrategyStatusRequest) {
  return request.PUT('/v1/strategy/status', params)
}

/**
 * 删除策略
 * @param params DeleteStrategyRequest
 * @returns DeleteStrategyReply
 */
export function deleteStrategy(params: DeleteStrategyRequest) {
  return request.DELETE(`/v1/strategy/delete/${params.id}`)
}

/**
 * 获取策略
 * @param params GetStrategyRequest
 * @returns GetStrategyReply
 */
export function getStrategy(params: GetStrategyRequest) {
  return request.GET<GetStrategyReply>(`/v1/strategy/get/${params.id}`)
}

/**
 * 策略列表
 * @param params ListStrategyRequest
 * @returns ListStrategyReply
 */
export function listStrategy(params: ListStrategyRequest) {
  return request.POST<ListStrategyReply>('/v1/strategy/list', params)
}

/**
 * 根据策略id生成策略
 * @param params CopyStrategyRequest
 * @returns CopyStrategyReply
 */
export function copyStrategy(params: CopyStrategyRequest) {
  return request.POST<CopyStrategyReply>('/v1/strategy/copy', params)
}

/**
 * 推送策略
 * @param id 策略ID
 * @returns null
 */
export function pushStrategy(id: number) {
  return request.GET<null>(`/v1/strategy/push/${id}`)
}

export type KV = { key: string; value: string }

/**
 * 将策略详情转换为表单数据
 * @param detail 策略详情
 * @returns 表单数据
 */
export const parseStrategyDetailToFormData = (detail: StrategyItem): CreateStrategyBaseRequest => {
  return {
    groupId: detail.groupId,
    datasourceIds: detail.datasource.map((item) => item.id),
    name: detail.name,
    labels: detail.labels,
    annotations: detail.annotations,
    expr: detail.expr,
    categoriesIds: detail.categories.map((item) => item.id),
    alarmGroupIds: detail.alarmNoticeGroups.map((item) => item.id),
    templateId: detail.templateId,
    remark: detail.remark,
    status: detail.status,
    sourceType: detail.sourceType
  }
}

/**
 * 将事件策略详情转换为表单数据
 * @param detail 事件策略详情
 * @returns 表单数据
 */
export const parseEventStrategyDetailToFormData = (detail: StrategyItem): CreateStrategyRequestFormData => ({
  ...parseStrategyDetailToFormData(detail),
  strategyType: StrategyType.StrategyTypeEvent,
  labels: parseStrategyLabelsToFormData(detail.labels),
  strategyEventLevels: detail.eventLevels.map(
    (item): CreateStrategyEventLevelRequest => ({
      alarmPageIds: item.alarmPages.map((item) => item.value),
      alarmGroupIds: item.alarmGroups.map((item) => item.id),
      labelNotices: item.labelNotices.map((item) => ({
        name: item.name,
        value: item.value,
        alarmGroupIds: item.alarmGroups.map((item) => item.id)
      })),
      threshold: item.threshold,
      condition: item.condition,
      dataType: item.dataType,
      levelId: item.level?.value,
      pathKey: item.pathKey
    })
  )
})

/**
 * 将证书策略详情转换为表单数据
 * @param detail 证书策略详情
 * @returns 表单数据
 */
export const parseDomainStrategyDetailToFormData = (detail: StrategyItem): CreateStrategyRequestFormData => ({
  ...parseStrategyDetailToFormData(detail),
  strategyType: StrategyType.StrategyTypeDomainCertificate,
  labels: parseStrategyLabelsToFormData(detail.labels),
  strategyDomainLevels: detail.domainLevels.map(
    (item): CreateStrategyDomainLevelRequest => ({
      levelId: item.level?.value,
      alarmPageIds: item.alarmPages.map((item) => item.value),
      alarmGroupIds: item.alarmGroups.map((item) => item.id),
      labelNotices: item.labelNotices.map((item) => ({
        name: item.name,
        value: item.value,
        alarmGroupIds: item.alarmGroups.map((item) => item.id)
      })),
      threshold: item.threshold,
      condition: item.condition
    })
  )
})

/**
 * 将HTTP策略详情转换为表单数据
 * @param detail 证书策略详情
 * @returns 表单数据
 */
export const parseHTTPStrategyDetailToFormData = (detail: StrategyItem): CreateStrategyRequestFormData => ({
  ...parseStrategyDetailToFormData(detail),
  strategyType: StrategyType.StrategyTypeHTTP,
  labels: parseStrategyLabelsToFormData(detail.labels),
  strategyHTTPLevels: detail.httpLevels.map(
    (item): CreateStrategyHTTPLevelRequest => ({
      levelId: item.level?.value,
      alarmPageIds: item.alarmPages.map((item) => item.value),
      alarmGroupIds: item.alarmGroups.map((item) => item.id),
      labelNotices: item.labelNotices.map((item) => ({
        name: item.name,
        value: item.value,
        alarmGroupIds: item.alarmGroups.map((item) => item.id)
      })),
      responseTime: item.responseTime,
      statusCode: item.statusCode,
      headers: parseStrategyLabelsToFormData(item.headers),
      body: item.body,
      queryParams: item.queryParams,
      method: item.method,
      statusCodeCondition: item.statusCodeCondition,
      responseTimeCondition: item.responseTimeCondition
    })
  )
})

/**
 * 将端口策略详情转换为表单数据
 * @param detail 端口策略详情
 * @returns 表单数据
 */
export const parsePortStrategyDetailToFormData = (detail: StrategyItem): CreateStrategyRequestFormData => ({
  ...parseStrategyDetailToFormData(detail),
  strategyType: StrategyType.StrategyTypeDomainPort,
  labels: parseStrategyLabelsToFormData(detail.labels),
  strategyPortLevels: detail.portLevels.map(
    (item): CreateStrategyPortLevelRequest => ({
      levelId: item.level?.value,
      alarmPageIds: item.alarmPages.map((item) => item.value),
      alarmGroupIds: item.alarmGroups.map((item) => item.id),
      labelNotices: item.labelNotices.map((item) => ({
        name: item.name,
        value: item.value,
        alarmGroupIds: item.alarmGroups.map((item) => item.id)
      })),
      port: item.port,
      threshold: +item.threshold
    })
  )
})

/**
 * 将端口策略详情转换为表单数据
 * @param detail 端口策略详情
 * @returns 表单数据
 */
export const parseLogStrategyDetailToFormData = (detail: StrategyItem): CreateStrategyRequestFormData => ({
  ...parseStrategyDetailToFormData(detail),
  strategyType: StrategyType.StrategyTypeLog,
  labels: parseStrategyLabelsToFormData(detail.labels),
  strategyLogLevels: detail.logLevels.map(
    (item): CreateStrategyLogLevelRequest => ({
      levelId: item.level?.value,
      alarmPageIds: item.alarmPages.map((item) => item.value),
      alarmGroupIds: item.alarmGroups.map((item) => item.id),
      labelNotices: item.labelNotices.map((item) => ({
        name: item.name,
        value: item.value,
        alarmGroupIds: item.alarmGroups.map((item) => item.id)
      })),
      count: item.count
    })
  )
})

/**
 * 将指标策略详情转换为表单数据
 * @param detail 指标策略详情
 * @returns 表单数据
 */
export const parseMetricStrategyDetailToFormData = (detail: StrategyItem): CreateStrategyRequestFormData => ({
  ...parseStrategyDetailToFormData(detail),
  strategyType: StrategyType.StrategyTypeMetric,
  labels: parseStrategyLabelsToFormData(detail.labels),
  strategyMetricLevels: detail.metricLevels.map(
    (item): CreateStrategyMetricLevelRequest => ({
      alarmPageIds: item.alarmPages.map((item) => item.value),
      alarmGroupIds: item.alarmGroups.map((item) => item.id),
      labelNotices: item.labelNotices.map((item) => ({
        name: item.name,
        value: item.value,
        alarmGroupIds: item.alarmGroups.map((item) => item.id)
      })),
      duration: item.duration,
      count: item.count,
      sustainType: item.sustainType,
      threshold: item.threshold,
      condition: item.condition,
      levelId: item.level?.value
    })
  )
})

/**
 * 将策略标签转换为表单数据
 * @param labels 策略标签
 * @returns 表单数据
 */
export const parseStrategyLabelsToFormData = (labels: { [key: string]: string }): KV[] => {
  return Object.entries(labels).map(([key, value]) => ({ key, value }))
}

/**
 * 将表单数据转换为策略标签
 * @param labels 表单数据
 * @returns 策略标签
 */
export const parseFormDataToStrategyLabels = (labels: KV[]): { [key: string]: string } => {
  return labels.reduce((acc: { [key: string]: string }, item) => {
    acc[item.key] = item.value
    return acc
  }, {})
}
