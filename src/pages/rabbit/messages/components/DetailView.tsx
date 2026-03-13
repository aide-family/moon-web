import React from 'react'
import { Modal, Descriptions, Tag, Button, Spin } from 'antd'
import type { MessageLogItem } from '@/api/rabbit/message-log'
import dayjs from 'dayjs'
import { useLocale } from '@/contexts/LocaleContext'
import { getStatusLabel, getStatusColor, getTypeLabel } from '../constants'
import { getMessageTypeIconType } from '@/pages/rabbit/constants/appIcons'
import { IconFont } from '@/components/Icon/IconFont'

interface DetailViewProps {
  open: boolean
  data?: MessageLogItem | null
  loading?: boolean
  onCancel: () => void
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
      destroyOnHidden
    >
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin />
        </div>
      ) : data ? (
        <Descriptions column={1} bordered size="small" styles={{ label: { width: 120, minWidth: 120 } }}>
          <Descriptions.Item label={t('messageLog.detail.uid')}>{data.uid || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('messageLog.detail.type')}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <IconFont type={getMessageTypeIconType(data.messageType ?? '')} />
              {getTypeLabel(data.messageType, t)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={t('messageLog.detail.status')}>
            <Tag color={getStatusColor(data.status)}>
              {getStatusLabel(data.status, t)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('messageLog.detail.sendAt')}>
            {data.sendAt ? dayjs(data.sendAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('messageLog.detail.message')}>
            {data.message || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('messageLog.detail.config')}>
            {data.config || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('messageLog.detail.retryTotal')}>
            {data.retryTotal || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('messageLog.detail.lastError')}>
            {data.lastError || '-'}
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
