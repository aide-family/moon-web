import React from 'react'
import { Modal, Descriptions, Tag, Button, Space } from 'antd'
import type { EmailItem } from '@/api/email/index'
import { GlobalStatus } from '@/api/types'
import dayjs from 'dayjs'
import { useLocale } from '@/contexts/LocaleContext'

interface DetailViewProps {
  open: boolean
  data?: EmailItem | null
  onCancel: () => void
  onEdit?: (data: EmailItem) => void
}

const DetailView: React.FC<DetailViewProps> = ({ open, data, onCancel, onEdit }) => {
  const { t } = useLocale()

  // 处理编辑
  const handleEdit = () => {
    if (data && onEdit) {
      onEdit(data)
    }
  }

  // 状态映射
  const getStatusInfo = (status: GlobalStatus | string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      [GlobalStatus.UNKNOWN]: { text: t('table.unknown'), color: 'default' },
      [GlobalStatus.ENABLED]: { text: t('table.enable'), color: 'success' },
      [GlobalStatus.DISABLED]: { text: t('table.disable'), color: 'error' },
    }
    return statusMap[status] || statusMap[GlobalStatus.UNKNOWN]
  }

  return (
    <Modal
      title={t('email.modal.detail.title')}
      open={open}
      onCancel={onCancel}
      footer={
        <Space>
          <Button onClick={onCancel}>{t('common.close')}</Button>
          {data && onEdit && (
            <Button type="primary" onClick={handleEdit}>
              {t('common.edit')}
            </Button>
          )}
        </Space>
      }
      width={800}
      destroyOnHidden
    >
      {data ? (
        <Descriptions column={1} bordered styles={{ label: { width: 120, minWidth: 120 } }}>
          <Descriptions.Item label={t('email.detail.uid')}>{data.uid || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('email.detail.name')}>{data.name || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('email.detail.host')}>{data.host || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('email.detail.port')}>{data.port != null ? data.port : '-'}</Descriptions.Item>
          <Descriptions.Item label={t('email.detail.username')}>{data.username || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('email.detail.password')}>******</Descriptions.Item>
          <Descriptions.Item label={t('table.status')}>
            <Tag color={getStatusInfo(data.status).color}>
              {getStatusInfo(data.status).text}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('email.detail.createdAt')}>
            {data.createdAt ? dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('email.detail.updatedAt')}>
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
