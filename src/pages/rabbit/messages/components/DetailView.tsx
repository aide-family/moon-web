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

function getStatusLabel(status: number | undefined, t: (key: string) => string): string {
  if (status === undefined) return t('messageLog.status.unknown')
  const map: Record<number, string> = {
    0: t('messageLog.status.pending'),
    1: t('messageLog.status.sent'),
    2: t('messageLog.status.failed'),
    3: t('messageLog.status.cancelled'),
  }
  return map[status] ?? t('messageLog.status.unknown')
}

function getStatusColor(status: number | undefined): string {
  if (status === undefined) return 'default'
  const map: Record<number, string> = {
    0: 'processing',
    1: 'success',
    2: 'error',
    3: 'default',
  }
  return map[status] ?? 'default'
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
          <Descriptions.Item label={t('messageLog.detail.type')}>{data.type ?? '-'}</Descriptions.Item>
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
