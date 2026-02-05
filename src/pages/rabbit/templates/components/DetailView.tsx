import React from 'react'
import { Modal, Descriptions, Tag, Button, Space } from 'antd'
import type { TemplateItem } from '@/api/template/index'
import { GlobalStatus } from '@/api/template/index'
import dayjs from 'dayjs'
import { useLocale } from '@/contexts/LocaleContext'
import { getMessageTypeLabel } from '../constants'

interface DetailViewProps {
  open: boolean
  data?: TemplateItem | null
  onCancel: () => void
  onEdit?: (data: TemplateItem) => void
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
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      [GlobalStatus.UNKNOWN]: { text: t('table.unknown'), color: 'default' },
      [GlobalStatus.ENABLED]: { text: t('table.enable'), color: 'success' },
      [GlobalStatus.DISABLED]: { text: t('table.disable'), color: 'error' },
    }
    return statusMap[status] || statusMap[GlobalStatus.UNKNOWN]
  }

  // 解析并格式化 jsonData
  const formatJsonData = (jsonData?: string) => {
    if (!jsonData) return '-'
    try {
      const parsed = JSON.parse(jsonData)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return jsonData
    }
  }

  return (
    <Modal
      title={t('template.modal.detail.title')}
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
      destroyOnClose
    >
      {data ? (
        <Descriptions column={1} bordered>
          <Descriptions.Item label={t('template.detail.uid')}>{data.uid}</Descriptions.Item>
          <Descriptions.Item label={t('template.detail.name')}>{data.name || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('template.detail.app')}>{getMessageTypeLabel(data.messageType, t)}</Descriptions.Item>
          <Descriptions.Item label={t('table.status')}>
            <Tag color={getStatusInfo(data.status).color}>
              {getStatusInfo(data.status).text}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('template.detail.createdAt')}>
            {data.createdAt ? dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('template.detail.updatedAt')}>
            {data.updatedAt ? dayjs(data.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          {data.jsonData && (
            <Descriptions.Item label={t('template.detail.jsonData')}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '400px', overflow: 'auto' }}>
                {formatJsonData(data.jsonData)}
              </pre>
            </Descriptions.Item>
          )}
        </Descriptions>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>{t('common.noData')}</div>
      )}
    </Modal>
  )
}

export default DetailView
