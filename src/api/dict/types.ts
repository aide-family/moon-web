import { Status } from '../global'

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
