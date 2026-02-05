import React from 'react'
import { Modal, Descriptions, Tag, Button, Spin } from 'antd'
import type { MessageLogItem } from '@/api/message-log'
import dayjs from 'dayjs'
import { useLocale } from '@/contexts/LocaleContext'

interface DetailViewProps {
  open: boolean
  data?: MessageLogItem | null
  loading?: boolean
  onCancel: () => void
}

/** proto MessageStatus 数字 -> i18n key 后缀 */
const STATUS_NUMBER_TO_KEY: Record<number, string> = {
  0: 'MessageStatus_UNKNOWN',
  1: 'pending',
  2: 'sending',
  3: 'sent',
  4: 'failed',
  5: 'cancelled',
}

/** proto MessageType 数字 -> i18n key 后缀 */
const TYPE_NUMBER_TO_KEY: Record<number, string> = {
  0: 'MessageType_UNKNOWN',
  1: 'EMAIL',
  1000: 'SMS_ALICLOUD',
  2000: 'WEBHOOK_OTHER',
  2001: 'WEBHOOK_DINGTALK',
  2002: 'WEBHOOK_WECHAT',
  2003: 'WEBHOOK_FEISHU',
}

function getStatusLabel(status: number | undefined, t: (key: string) => string): string {
  if (status === undefined) return t('messageLog.status.unknown')
  const key = STATUS_NUMBER_TO_KEY[status]
  return key ? t(`messageLog.status.${key}`) : t('messageLog.status.unknown')
}

function getStatusColor(status: number | undefined): string {
  if (status === undefined) return 'default'
  const map: Record<number, string> = {
    0: 'default',
    1: 'processing',
    2: 'processing',
    3: 'success',
    4: 'error',
    5: 'default',
  }
  return map[status] ?? 'default'
}

function getTypeLabel(type: number | undefined, t: (key: string) => string): string {
  if (type === undefined) return t('messageLog.type.MessageType_UNKNOWN')
  const key = TYPE_NUMBER_TO_KEY[type]
  return key ? t(`messageLog.type.${key}`) : String(type)
}

const DetailView: React.FC<DetailViewProps> = ({ open, data, loading, onCancel }) => {
  const { t } = useLocale()

  return (
    <Modal
      title={t('messageLog.detail.title')}
      open={open}
      onCancel={onCancel}
      footer={<Button onClick={onCancel}>{t('common.close')}</Button>}
      width={700}
      destroyOnClose
    >
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin />
        </div>
      ) : data ? (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label={t('messageLog.detail.uid')}>{data.uid ?? '-'}</Descriptions.Item>
          <Descriptions.Item label={t('messageLog.detail.type')}>{getTypeLabel(data.type, t)}</Descriptions.Item>
          <Descriptions.Item label={t('messageLog.detail.status')}>
            <Tag color={getStatusColor(data.status)}>
              {getStatusLabel(data.status, t)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('messageLog.detail.sendAt')}>
            {data.sendAt ? dayjs(data.sendAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('messageLog.detail.message')}>
            {data.message ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('messageLog.detail.config')}>
            {data.config ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('messageLog.detail.retryTotal')}>
            {data.retryTotal ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('messageLog.detail.lastError')}>
            {data.lastError ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('messageLog.detail.updatedAt')}>
            {data.updatedAt ? dayjs(data.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>{t('common.noData')}</div>
      )}
    </Modal>
  )
}

export default DetailView
