import { MessageStatus, MessageType } from '@/api/common/types'

/** MessageStatus -> i18n key 后缀（messageLog.status.xxx） */
const STATUS_TO_I18N_SUFFIX: Record<MessageStatus, string> = {
  [MessageStatus.MessageStatus_UNKNOWN]: 'MessageStatus_UNKNOWN',
  [MessageStatus.PENDING]: 'pending',
  [MessageStatus.SENDING]: 'sending',
  [MessageStatus.SENT]: 'sent',
  [MessageStatus.FAILED]: 'failed',
  [MessageStatus.CANCELLED]: 'cancelled',
}

/** MessageStatus -> Tag color */
const STATUS_TO_COLOR: Record<MessageStatus, string> = {
  [MessageStatus.MessageStatus_UNKNOWN]: 'default',
  [MessageStatus.PENDING]: 'processing',
  [MessageStatus.SENDING]: 'processing',
  [MessageStatus.SENT]: 'success',
  [MessageStatus.FAILED]: 'error',
  [MessageStatus.CANCELLED]: 'default',
}

/** MessageType -> i18n key（messageType.xxx） */
const TYPE_TO_I18N_KEY: Record<MessageType, string> = {
  [MessageType.MessageType_UNKNOWN]: 'UNKNOWN',
  [MessageType.EMAIL]: 'EMAIL',
  [MessageType.SMS_ALICLOUD]: 'SMS_ALICLOUD',
  [MessageType.WEBHOOK_OTHER]: 'WEBHOOK_OTHER',
  [MessageType.WEBHOOK_DINGTALK]: 'WEBHOOK_DINGTALK',
  [MessageType.WEBHOOK_WECHAT]: 'WEBHOOK_WECHAT',
  [MessageType.WEBHOOK_FEISHU]: 'WEBHOOK_FEISHU',
}

export function getStatusLabel(
  status: MessageStatus | string | undefined,
  t: (key: string) => string,
): string {
  if (status === undefined) return t('messageLog.status.unknown')
  const suffix = STATUS_TO_I18N_SUFFIX[status as MessageStatus]
  return suffix
    ? t(`messageLog.status.${suffix}`)
    : t('messageLog.status.unknown')
}

export function getStatusColor(
  status: MessageStatus | string | undefined,
): string {
  if (status === undefined) return 'default'
  return STATUS_TO_COLOR[status as MessageStatus] ?? 'default'
}

export function getTypeLabel(
  type: MessageType | string | undefined,
  t: (key: string) => string,
): string {
  if (type === undefined) return t('messageType.UNKNOWN')
  const i18nKey = TYPE_TO_I18N_KEY[type as MessageType]
  return i18nKey ? t(`messageType.${i18nKey}`) : String(type)
}
