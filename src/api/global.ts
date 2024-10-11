import { BadgeProps } from 'antd'
import {
  Condition,
  DatasourceType,
  DictType,
  Gender,
  HookApp,
  MetricType,
  Role,
  Status,
  StorageType,
  SustainType
} from './enum'

export interface PaginationReq {
  pageNum: number
  pageSize: number
}

export interface PaginationReply extends PaginationReq {
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

// 枚举类型
export interface EnumItem {
  // 枚举值
  value: number
  // 枚举描述
  label: string
}

export const StatusData: Record<Status, BadgeProps> = {
  [Status.StatusAll]: {
    color: 'blue',
    text: '全部'
  },
  [Status.StatusEnable]: {
    color: 'green',
    text: '启用'
  },
  [Status.StatusDisable]: {
    color: 'red',
    text: '禁用'
  }
}

export const GenderData: Record<Gender, string> = {
  [Gender.GenderAll]: '全部',
  [Gender.GenderMale]: '男',
  [Gender.GenderFemale]: '女'
}

export const RoleData: Record<Role, string> = {
  [Role.RoleAll]: '全部',
  [Role.RoleSupperAdmin]: '超级管理员',
  [Role.RoleAdmin]: '管理员',
  [Role.RoleUser]: '普通用户'
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

export const DataSourceTypeData: Record<DatasourceType, string> = {
  [DatasourceType.DatasourceTypeUnknown]: '全部',
  [DatasourceType.DatasourceTypeMetric]: 'Metric',
  [DatasourceType.DatasourceTypeLog]: 'Log',
  [DatasourceType.DatasourceTypeTrace]: 'Trace'
}

export const StorageTypeData: Record<StorageType, string> = {
  [StorageType.StorageTypeUnknown]: '全部',
  [StorageType.StorageTypePrometheus]: 'Prometheus',
  [StorageType.StorageTypeVictoriaMetrics]: 'VictoriaMetrics'
}

export const ConditionData: Record<Condition, string> = {
  [Condition.ConditionUnknown]: '全部',
  [Condition.ConditionEQ]: '等于(==)',
  [Condition.ConditionNE]: '不等于(!=)',
  [Condition.ConditionGT]: '大于(>)',
  [Condition.ConditionGTE]: '大于等于(>=)',
  [Condition.ConditionLT]: '小于(<)',
  [Condition.ConditionLTE]: '小于等于(<=)'
}

export const SustainTypeData: Record<SustainType, string> = {
  [SustainType.SustainTypeUnknown]: 'm时间内出现n次',
  [SustainType.SustainTypeFor]: 'm时间内出现n次',
  [SustainType.SustainTypeMax]: 'm时间内最多出现n次',
  [SustainType.SustainTypeMin]: 'm时间内最少出现n次'
}

export const HookAppData: Record<HookApp, string> = {
  [HookApp.HOOK_APP_UNKNOWN]: '全部',
  [HookApp.HOOK_APP_DING_TALK]: '钉钉',
  [HookApp.HOOK_APP_FEI_SHU]: '飞书',
  [HookApp.HOOK_APP_WEB_HOOK]: 'Webhook',
  [HookApp.HOOK_APP_WE_CHAT]: '企业微信'
}

export const DictTypeData: Record<DictType, string> = {
  [DictType.DictTypeUnknown]: '全部',
  [DictType.DictTypeAlarmLevel]: '告警级别',
  [DictType.DictTypeAlarmPage]: '告警页面',
  [DictType.DictTypeStrategyCategory]: '策略分类',
  [DictType.DictTypeStrategyGroupCategory]: '策略组分类'
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
