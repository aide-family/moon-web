import { BadgeProps } from 'antd'

export interface Pagination {
  pageNum: number
  pageSize: number
}

export interface PaginationReply extends Pagination {
  total: number
}

export interface PaginationResponse<T> {
  pagination: PaginationReply
  list: T[]
}

export interface SelectExtendType {
  icon?: string
  color?: string
  remark?: string
  image?: string
}

export interface SelectType {
  value: number
  label: string
  children?: SelectType[]
  disabled: boolean
  extend?: SelectExtendType
}

export enum Status {
  ALL = 0,
  ENABLE = 1,
  DISABLE = 2
}

export const StatusData: Record<Status, BadgeProps> = {
  [Status.ALL]: {
    color: 'blue',
    text: '全部'
  },
  [Status.ENABLE]: {
    color: 'green',
    text: '启用'
  },
  [Status.DISABLE]: {
    color: 'red',
    text: '禁用'
  }
}

export enum Gender {
  ALL = 0,
  MALE = 1,
  FEMALE = 2
}

export const GenderData: Record<Gender, string> = {
  [Gender.ALL]: '全部',
  [Gender.MALE]: '男',
  [Gender.FEMALE]: '女'
}

export enum SystemRole {
  // 全部 / 未知
  ROLE_ALL = 0,
  // 管理员
  ROLE_SUPPER_ADMIN = 1,
  // 普通管理员
  ROLE_ADMIN = 2,
  // 普通用户
  ROLE_USER = 3
}

export const SystemRoleData: Record<SystemRole, string> = {
  [SystemRole.ROLE_ALL]: '全部',
  [SystemRole.ROLE_SUPPER_ADMIN]: '超级管理员',
  [SystemRole.ROLE_ADMIN]: '管理员',
  [SystemRole.ROLE_USER]: '普通用户'
}

// MetricType 指标类型
export enum MetricType {
  // 未知指标类型
  MetricTypeUnknown = 0,
  // Counter
  MetricTypeCounter = 1,
  // Gauge
  MetricTypeGauge = 2,
  // Histogram
  MetricTypeHistogram = 3,
  // Summary
  MetricTypeSummary = 4
}

export type TagItemType = {
  text: string
  color: string
}

export const MetricTypeData: Record<MetricType, TagItemType> = {
  [MetricType.MetricTypeUnknown]: {
    text: '全部',
    color: ''
  },
  [MetricType.MetricTypeCounter]: {
    text: 'Counter',
    color: 'green'
  },
  [MetricType.MetricTypeGauge]: {
    text: 'Gauge',
    color: 'blue'
  },
  [MetricType.MetricTypeHistogram]: {
    text: 'Histogram',
    color: 'purple'
  },
  [MetricType.MetricTypeSummary]: {
    text: 'Summary',
    color: 'orange'
  }
}

// 数据源类型
export enum DataSourceType {
  // 未知数据源类型
  DataSourceTypeUnknown = 0,

  DataSourceTypeMetric = 1,

  DataSourceTypeLog = 2,

  DataSourceTypeTrace = 3
}

export const DataSourceTypeData: Record<DataSourceType, string> = {
  [DataSourceType.DataSourceTypeUnknown]: '全部',
  [DataSourceType.DataSourceTypeMetric]: 'Metric',
  [DataSourceType.DataSourceTypeLog]: 'Log',
  [DataSourceType.DataSourceTypeTrace]: 'Trace'
}

// 存储器类型
export enum StorageType {
  // 未知存储器类型
  StorageTypeUnknown = 0,
  // Prometheus
  StorageTypePrometheus = 1
  // TODO 待开发
}

export const StorageTypeData: Record<StorageType, string> = {
  [StorageType.StorageTypeUnknown]: '全部',
  [StorageType.StorageTypePrometheus]: 'Prometheus'
}

// 判断条件
export enum Condition {
  // 等于
  ConditionEQ = 1,

  // 不等于
  ConditionNE = 2,

  // 大于
  ConditionGT = 3,

  // 大于等于
  ConditionGTE = 4,

  // 小于
  ConditionLT = 5,

  // 小于等于
  ConditionLTE = 6
}

export const ConditionData: Record<Condition, string> = {
  [Condition.ConditionEQ]: '等于(==)',
  [Condition.ConditionNE]: '不等于(!=)',
  [Condition.ConditionGT]: '大于(>)',
  [Condition.ConditionGTE]: '大于等于(>=)',
  [Condition.ConditionLT]: '小于(<)',
  [Condition.ConditionLTE]: '小于等于(<=)'
}

// 持续类型
export enum SustainType {
  // m时间内出现n次
  SustainTypeFor = 1,

  // m时间内最多出现n次
  SustainTypeMax = 2,

  // m时间内最少出现n次
  SustainTypeMin = 3
}

export const SustainTypeData: Record<SustainType, string> = {
  [SustainType.SustainTypeFor]: 'm时间内出现n次',
  [SustainType.SustainTypeMax]: 'm时间内最多出现n次',
  [SustainType.SustainTypeMin]: 'm时间内最少出现n次'
}

// 操作
export enum ActionKey {
  /** 详情 */
  DETAIL = '__detail__',
  /** 编辑 */
  EDIT = '__edit__',
  /** 删除 */
  DELETE = '__delete__',
  /** 启用 */
  ENABLE = '__enable__',
  /** 禁用 */
  DISABLE = '__disable__',
  /** 操作日志 */
  OPERATION_LOG = '__operation_log__'
}
