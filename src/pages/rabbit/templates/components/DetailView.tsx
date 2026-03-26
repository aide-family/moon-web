import React from 'react'
import { Modal, Descriptions, Tag, Button, Space } from 'antd'
import type { TemplateItem } from '@/api/rabbit/template/index'
import { GlobalStatus } from '@/api/rabbit/template/index'
import dayjs from 'dayjs'
import { useLocale } from '@/contexts/LocaleContext'
import { getMessageTypeLabel } from '../constants'
import { getMessageTypeIconType } from '@/pages/rabbit/constants/appIcons'
import { IconFont } from '@/components/Icon/IconFont'
import { renderStatusTag } from '@/utils/marksman'

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
      destroyOnHidden
    >
      {data ? (
        <Descriptions column={1} bordered styles={{ label: { width: 120, minWidth: 120 } }}>
          <Descriptions.Item label={t('template.detail.uid')}>{data.uid || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('template.detail.name')}>{data.name || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('template.detail.app')}>
            {data.messageType != null ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <IconFont type={getMessageTypeIconType(data.messageType)} />
                {getMessageTypeLabel(data.messageType, t)}
              </span>
            ) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('table.status')}>
            {renderStatusTag(data.status, t)}
          </Descriptions.Item>
          <Descriptions.Item label={t('template.detail.createdAt')}>
            {data.createdAt ? dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('template.detail.updatedAt')}>
            {data.updatedAt ? dayjs(data.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('template.detail.jsonData')}>
            {data.jsonData ? (
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '400px', overflow: 'auto' }}>
                {formatJsonData(data.jsonData)}
              </pre>
            ) : '-'}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>{t('common.noData')}</div>
      )}
    </Modal>
  )
}

export default DetailView
