import {
  Condition,
  DatasourceType,
  EventDataType,
  HTTPMethod,
  MQCondition,
  Status,
  StatusCodeCondition,
  StrategyType,
  SustainType,
  TemplateSourceType
} from '../enum'
import { PaginationReply, PaginationReq } from '../global'
import { StrategyGroupItem, StrategyItem } from '../model-types'
import request from '../request'

export interface SubscriberStrategyRequest {
  // 订阅策略请求参数
}

export interface SubscriberStrategyReply {
  // 订阅策略响应
}

// 策略组相关类型定义
export interface CreateStrategyGroupRequest {
  name: string
  remark?: string
  status?: Status
  categoriesIds: number[]
}

export interface CreateStrategyGroupReply {}

export interface DeleteStrategyGroupRequest {
  id: number
}

export interface DeleteStrategyGroupReply {}

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

export interface UpdateStrategyGroupReply {}

export interface UpdateStrategyGroupStatusRequest {
  ids: number[]
  status: Status
}

export interface UpdateStrategyGroupStatusReply {}

/** 创建策略事件项请求 */
export interface CreateStrategyMQLevelRequest {
  /** 值 */
  value: string
  /** 状态 */
  status: Status
  /** 条件 */
  condition: MQCondition
  /** 数据类型 */
  dataType: EventDataType
  /** 告警等级ID */
  alarmLevelId: number
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
export type CreateStrategyBaseRequest = {
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
  labels: { [key: string]: string }
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
export type CreateStrategyRequest = CreateStrategyBaseRequest &
  (
    | {
        strategyType: StrategyType.StrategyTypeMetric
        strategyMetricLevels: CreateStrategyLevelRequest[]
      }
    | {
        strategyType: StrategyType.StrategyTypeMQ
        strategyMqLevels: CreateStrategyMQLevelRequest[]
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
  )

export interface CreateStrategyReply {}

export interface UpdateStrategyRequest {
  id: number
  data: CreateStrategyRequest
}

export interface UpdateStrategyReply {}

export interface DeleteStrategyRequest {
  id: number
}

export interface DeleteStrategyReply {}

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
}

export interface ListStrategyReply {
  pagination: PaginationReply
  list: StrategyItem[]
}

export interface UpdateStrategyStatusRequest {
  ids: number[]
  status: Status
}

export interface UpdateStrategyStatusReply {}

export interface CreateStrategyLevelRequest {
  duration: number
  count: number
  sustainType: SustainType
  interval: number
  status?: Status
  levelId: number
  threshold: number
  condition: Condition
  alarmPageIds: number[]
  alarmGroupIds: number[]
  labelNotices: CreateStrategyLabelNoticeRequest[]
}

/** 创建策略HTTP等级请求 */
export interface CreateStrategyHTTPLevelRequest {
  /** 策略等级ID */
  levelId: number
  /** 状态 */
  status: Status
  /** 告警页面ID */
  alarmPageIds: number[]
  /** 告警组ID */
  alarmGroupIds: number[]
  /** 策略标签 */
  labelNotices: CreateStrategyLabelNoticeRequest[]
  /** 响应时间 */
  responseTime: number
  /** 状态码 */
  statusCodes: number
  /** 请求头 */
  headers: { [key: string]: string }
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
  /** 状态 */
  status: Status
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
  /** 状态 */
  status: Status
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
  return request.POST<CreateStrategyGroupReply>('/v1/group/strategy/create', params)
}

/**
 * 删除策略组
 * @param params DeleteStrategyGroupRequest
 * @returns DeleteStrategyGroupReply
 */
export function deleteStrategyGroup(params: DeleteStrategyGroupRequest) {
  return request.DELETE<DeleteStrategyGroupReply>(`/v1/group/strategy/${params.id}`)
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
  return request.PUT<UpdateStrategyGroupReply>(`/v1/group/strategy/${params.id}`, params.update)
}

/**
 * 修改策略分组状态
 * @param params UpdateStrategyGroupStatusRequest
 * @returns UpdateStrategyGroupStatusReply
 */
export function updateStrategyGroupStatus(params: UpdateStrategyGroupStatusRequest) {
  return request.PUT<UpdateStrategyGroupStatusReply>('/v1/group/strategy/update/status', params)
}

/**
 * 创建策略
 * @param params CreateStrategyRequest
 * @returns CreateStrategyReply
 */
export function createStrategy(params: CreateStrategyRequest) {
  return request.POST<CreateStrategyReply>('/v1/strategy/create', params)
}

/**
 * 修改策略
 * @param params UpdateStrategyRequest
 * @returns UpdateStrategyReply
 */
export function updateStrategy(params: UpdateStrategyRequest) {
  return request.PUT<UpdateStrategyReply>(`/v1/strategy/update/${params.id}`, params)
}

/**
 * 修改策略状态
 * @param params UpdateStrategyStatusRequest
 * @returns UpdateStrategyStatusReply
 */
export function updateStrategyStatus(params: UpdateStrategyStatusRequest) {
  return request.PUT<UpdateStrategyStatusReply>('/v1/strategy/status', params)
}

/**
 * 删除策略
 * @param params DeleteStrategyRequest
 * @returns DeleteStrategyReply
 */
export function deleteStrategy(params: DeleteStrategyRequest) {
  return request.DELETE<DeleteStrategyReply>(`/v1/strategy/delete/${params.id}`)
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
export const parseEventStrategyDetailToFormData = (detail: StrategyItem): CreateStrategyRequest => ({
  ...parseStrategyDetailToFormData(detail),
  strategyType: StrategyType.StrategyTypeMQ,
  strategyMqLevels: detail.eventLevels.map(
    (item): CreateStrategyMQLevelRequest => ({
      status: item.status,
      alarmPageIds: item.alarmPages.map((item) => item.value),
      alarmGroupIds: item.alarmGroups.map((item) => item.id),
      labelNotices: item.labelNotices.map((item) => ({
        name: item.name,
        value: item.value,
        alarmGroupIds: item.alarmGroups.map((item) => item.id)
      })),
      value: item.value,
      condition: item.condition,
      dataType: item.dataType,
      alarmLevelId: item.alarmLevelId,
      pathKey: item.pathKey
    })
  )
})

/**
 * 将证书策略详情转换为表单数据
 * @param detail 证书策略详情
 * @returns 表单数据
 */
export const parseDomainStrategyDetailToFormData = (detail: StrategyItem): CreateStrategyRequest => ({
  ...parseStrategyDetailToFormData(detail),
  strategyType: StrategyType.StrategyTypeDomainCertificate,
  strategyDomainLevels: detail.domainLevels.map(
    (item): CreateStrategyDomainLevelRequest => ({
      levelId: item.id,
      status: Status.StatusEnable,
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
export const parseHTTPStrategyDetailToFormData = (detail: StrategyItem): CreateStrategyRequest => ({
  ...parseStrategyDetailToFormData(detail),
  strategyType: StrategyType.StrategyTypeHTTP,
  strategyHTTPLevels: detail.httpLevels.map(
    (item): CreateStrategyHTTPLevelRequest => ({
      levelId: item.id,
      status: item.status,
      alarmPageIds: item.alarmPages.map((item) => item.value),
      alarmGroupIds: item.alarmGroups.map((item) => item.id),
      labelNotices: item.labelNotices.map((item) => ({
        name: item.name,
        value: item.value,
        alarmGroupIds: item.alarmGroups.map((item) => item.id)
      })),
      responseTime: item.responseTime,
      statusCodes: item.statusCodes,
      headers: item.headers,
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
export const parsePortStrategyDetailToFormData = (detail: StrategyItem): CreateStrategyRequest => ({
  ...parseStrategyDetailToFormData(detail),
  strategyType: StrategyType.StrategyTypeDomainPort,
  strategyPortLevels: detail.portLevels.map(
    (item): CreateStrategyPortLevelRequest => ({
      levelId: item.id,
      status: item.status,
      alarmPageIds: item.alarmPages.map((item) => item.value),
      alarmGroupIds: item.alarmGroups.map((item) => item.id),
      labelNotices: item.labelNotices.map((item) => ({
        name: item.name,
        value: item.value,
        alarmGroupIds: item.alarmGroups.map((item) => item.id)
      })),
      port: item.port,
      threshold: item.threshold
    })
  )
})

/**
 * 将指标策略详情转换为表单数据
 * @param detail 指标策略详情
 * @returns 表单数据
 */
export const parseMetricStrategyDetailToFormData = (detail: StrategyItem): CreateStrategyRequest => ({
  ...parseStrategyDetailToFormData(detail),
  strategyType: StrategyType.StrategyTypeMetric,
  strategyMetricLevels: detail.metricLevels.map(
    (item): CreateStrategyLevelRequest => ({
      status: item.status,
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
      interval: item.interval,
      threshold: item.threshold,
      condition: item.condition,
      levelId: item.id
    })
  )
})
