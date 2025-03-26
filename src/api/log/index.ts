import { LogActionType, LogModuleType } from '../enum'
import { UserItem } from '../model-types'

export interface LogItem {
  id: number
  /* 模块 */
  module: LogModuleType
  /* 数据ID */
  dataID: number
  /* 操作人 */
  operator: UserItem
  /* 操作时间 */
  operateTime: string
  /* 动作 */
  action: LogActionType
  /* 操作内容 */
  remark: string
  /* 变化前 json */
  before: string
  /* 变化后 json */
  after: string
}
