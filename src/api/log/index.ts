import { UserItem } from '../model-types'

export enum Module {
  /* 字典 */
  DICT = 0
}
export enum Action {
  /* 新增 */
  ADD = 0,
  /* 修改 */
  MODIFY = 1,
  /* 删除 */
  DELETE = 2,
  /* 修改状态 */
  MODIFY_STATUS = 3
}
export interface LogItem {
  id: number
  /* 模块 */
  module: Module
  /* 数据ID */
  dataID: number
  /* 操作人 */
  operator: UserItem
  /* 操作时间 */
  operateTime: string
  /* 动作 */
  action: Action
  /* 操作内容 */
  remark: string
  /* 变化前 json */
  before: string
  /* 变化后 json */
  after: string
}
