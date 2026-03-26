import React from 'react'
import { Modal, Descriptions, Button, Space } from 'antd'
import type { WebhookItem } from '@/api/rabbit/webhook/index'
import { GlobalStatus } from '@/api'
import dayjs from 'dayjs'
import { useLocale } from '@/contexts/LocaleContext'
import { getAppLabel, getAppIconType, getMethodLabel } from '../constants'
import { IconFont } from '@/components/Icon/IconFont'
import { renderStatusTag } from '@/utils/marksman'

interface DetailViewProps {
  open: boolean
  data?: WebhookItem | null
  onCancel: () => void
  onEdit?: (data: WebhookItem) => void
}

const DetailView: React.FC<DetailViewProps> = ({
  open,
  data,
  onCancel,
  onEdit,
}) => {
  const { t } = useLocale()

  // 处理编辑
  const handleEdit = () => {
    if (data && onEdit) {
      onEdit(data)
    }
  }

  // 格式化 headers
  const formatHeaders = (headers?: Record<string, string>) => {
    if (!headers || Object.keys(headers).length === 0) return '-'
    return JSON.stringify(headers, null, 2)
  }

  return (
    <Modal
      title={t('webhook.modal.detail.title')}
      open={open}
      onCancel={onCancel}
      footer={
        <Space>
          <Button onClick={onCancel}>{t('common.close')}</Button>
          {data && onEdit && (
            <Button type='primary' onClick={handleEdit}>
              {t('common.edit')}
            </Button>
          )}
        </Space>
      }
      width={800}
      destroyOnHidden
    >
      {data ? (
        <Descriptions
          column={1}
          bordered
          styles={{ label: { width: 120, minWidth: 120 } }}
        >
          <Descriptions.Item label={t('webhook.detail.uid')}>
            {data.uid || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('webhook.detail.name')}>
            {data.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('webhook.detail.app')}>
            {data.app ? (
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <IconFont type={getAppIconType(data.app)} />
                {getAppLabel(data.app, t)}
              </span>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('webhook.detail.url')}>
            {data.url || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('webhook.detail.method')}>
            {data.method ? getMethodLabel(data.method, t) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('webhook.detail.secret')}>
            ******
          </Descriptions.Item>
          <Descriptions.Item label={t('webhook.table.status')}>
            {renderStatusTag(data.status ?? GlobalStatus.UNKNOWN, t)}
          </Descriptions.Item>
          <Descriptions.Item label={t('webhook.detail.headers')}>
            {data.headers && Object.keys(data.headers).length > 0 ? (
              <pre
                style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: '400px',
                  overflow: 'auto',
                }}
              >
                {formatHeaders(data.headers)}
              </pre>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('webhook.detail.createdAt')}>
            {data.createdAt
              ? dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss')
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('webhook.detail.updatedAt')}>
            {data.updatedAt
              ? dayjs(data.updatedAt).format('YYYY-MM-DD HH:mm:ss')
              : '-'}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          {t('common.noData')}
        </div>
      )}
    </Modal>
  )
}

export default DetailView
