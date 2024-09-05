import { Pagination, Status } from '../global'

/** 创建字典空响应体 */
export interface CreateDictNullResponse {}

/** 创建字典请求体 */
export interface CreateDictRequest {
  // 字典名称
  name: string
  // 字典值
  value: string
  // 字典类型
  dictType?: number
  // 颜色类型
  colorType?: string
  // css样式
  cssClass?: string
  // 图标
  icon?: string
  // 图片地址
  imageUrl?: string
  // 状态
  status?: Status
  // 语言编码
  languageCode?: string
  // 备注
  remark?: string
}

/** 字典列表请求参数 */
export interface DictListParams {
  pagination: Pagination
  keyword?: string
  status?: Status
  dictType?: DictType
  languageCode?: 'zh-CN' | 'en-US'
}

/** 字典列表相应参数 */
export interface DictListResponse {
  list: DictItem[]
  pagination: Pagination
}

/** 字典明细 */
export interface DictItem {
  // 字典id
  id: number
  // 字典名称
  name: string
  // 字典值
  value: string
  // 字典类型
  dictType: DictType
  // 颜色类型
  colorType: string
  // css样式
  cssClass: string
  // 图标
  icon: string
  // 图片地址
  imageUrl: string
  // 状态
  status: Status
  // 语言编码
  languageCode: string
  // 备注
  remark: string
}

/** 字典类别 */
export enum DictType {
  // 未知, 用于默认值
  DictTypeUnknown = 0,

  // 标签
  DictTypePromLabel = 1,

  // 注解
  DictTypePromAnnotation = 2,

  // 策略
  DictTypePromStrategy = 3,

  // 策略组
  DictTypePromStrategyGroup = 4,

  // 告警级别
  DictTypeAlarmLevel = 5,

  // 告警状态
  DictTypeAlarmStatus = 6,

  // 通知类型
  DictTypeNotifyType = 7,

  // 告警页面
  DictTypeAlarmPage = 8
}
// 规则标签
