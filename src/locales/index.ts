import { zhCN as commonZh, enUS as commonEn } from './common'
import { zhCN as namespacesZh, enUS as namespacesEn } from './namespaces'
import { zhCN as rabbitZh, enUS as rabbitEn } from './rabbit/template'
import { zhCN as emailZh, enUS as emailEn } from './rabbit/email'
import { zhCN as webhookZh, enUS as webhookEn } from './rabbit/webhook'
import { zhCN as messageZh, enUS as messageEn } from './rabbit/message'
import { zhCN as senderZh, enUS as senderEn } from './rabbit/sender'
import {
  zhCN as recipientGroupZh,
  enUS as recipientGroupEn,
} from './rabbit/recipientGroup'
import { zhCN as rabbitAlertZh, enUS as rabbitAlertEn } from './rabbit/alert'
import { zhCN as userZh, enUS as userEn } from './user'
import { zhCN as memberZh, enUS as memberEn } from './member'
import { zhCN as datasourceZh, enUS as datasourceEn } from './datasource'
import { zhCN as strategyZh, enUS as strategyEn } from './strategy'
import { zhCN as levelZh, enUS as levelEn } from './level'
import {
  zhCN as strategyGroupZh,
  enUS as strategyGroupEn,
} from './strategyGroup'
import {
  zhCN as realtimeAlertZh,
  enUS as realtimeAlertEn,
} from './realtimeAlert'
import {
  zhCN as historyAlertZh,
  enUS as historyAlertEn,
} from './historyAlert'
import { zhCN as jadeTreeZh, enUS as jadeTreeEn } from './jadeTree'
import type { LocaleType } from '@/contexts/LocaleContext'

// 合并所有模块的翻译资源
const mergeResources = (
  ...modules: Array<Record<string, string>>
): Record<string, string> => {
  return Object.assign({}, ...modules)
}

// 中文资源（合并所有模块）
const zhCN = mergeResources(
  commonZh,
  namespacesZh,
  rabbitZh,
  emailZh,
  webhookZh,
  messageZh,
  senderZh,
  recipientGroupZh,
  rabbitAlertZh,
  userZh,
  memberZh,
  datasourceZh,
  strategyZh,
  levelZh,
  strategyGroupZh,
  realtimeAlertZh,
  historyAlertZh,
  jadeTreeZh,
)

// 英文资源（合并所有模块）
const enUS = mergeResources(
  commonEn,
  namespacesEn,
  rabbitEn,
  emailEn,
  webhookEn,
  messageEn,
  senderEn,
  recipientGroupEn,
  rabbitAlertEn,
  userEn,
  memberEn,
  datasourceEn,
  strategyEn,
  levelEn,
  strategyGroupEn,
  realtimeAlertEn,
  historyAlertEn,
  jadeTreeEn,
)

// 语言资源映射
export const resources: Record<LocaleType, Record<string, string>> = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

// 导出所有语言资源（兼容旧版本）
export { default as zhCN } from './zh-CN'
export { default as enUS } from './en-US'
export { zhCN as commonZh, enUS as commonEn } from './common'
export { zhCN as namespacesZh, enUS as namespacesEn } from './namespaces'
export { zhCN as rabbitZh, enUS as rabbitEn } from './rabbit/template'
export { zhCN as emailZh, enUS as emailEn } from './rabbit/email'
export { zhCN as webhookZh, enUS as webhookEn } from './rabbit/webhook'
export { zhCN as messageZh, enUS as messageEn } from './rabbit/message'
export { zhCN as senderZh, enUS as senderEn } from './rabbit/sender'
export {
  zhCN as recipientGroupZh,
  enUS as recipientGroupEn,
} from './rabbit/recipientGroup'
export { zhCN as rabbitAlertZh, enUS as rabbitAlertEn } from './rabbit/alert'
