import React from 'react'
import { Badge, Button, Descriptions, Modal, Space, Spin } from 'antd'
import { LevelType, type LevelItem } from '@/api/marksman/level'
import dayjs from 'dayjs'
import { useLocale } from '@/contexts/LocaleContext'
import { emptyPlaceholder, getLevelTypeLabel, renderStatusTag } from '@/utils/marksman'

interface DetailViewProps {
  open: boolean
  data?: LevelItem | null
  loading?: boolean
  onCancel: () => void
  onEdit?: (data: LevelItem) => void
}

const DetailView: React.FC<DetailViewProps> = ({ open, data, loading = false, onCancel, onEdit }) => {
  const { t } = useLocale()

  const handleEdit = () => {
    if (data && onEdit) onEdit(data)
  }

  return (
    <Modal
      title={t('level.modal.detail.title')}
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
      width={700}
      destroyOnHidden
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : data ? (
        <Descriptions column={1} bordered styles={{ label: { width: 120, minWidth: 120 } }}>
          <Descriptions.Item label={t('level.detail.uid')}>{emptyPlaceholder(data.uid)}</Descriptions.Item>
          <Descriptions.Item label={t('level.detail.name')}>{emptyPlaceholder(data.name)}</Descriptions.Item>
          <Descriptions.Item label={t('level.detail.type')}>{getLevelTypeLabel(data.type ?? LevelType.LEVEL_TYPE_UNKNOWN, t)}</Descriptions.Item>
          <Descriptions.Item label={t('level.detail.bgColor')}>
            {data.bgColor?.trim() ? (
              <span className="inline-flex items-center gap-2">
                <Badge color={data.bgColor} size="small" />
                <span>{data.bgColor}</span>
              </span>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('level.detail.status')}>{renderStatusTag(data.status, t)}</Descriptions.Item>
          <Descriptions.Item label={t('level.detail.remark')}>{emptyPlaceholder(data.remark)}</Descriptions.Item>
          <Descriptions.Item label={t('level.detail.createdAt')}>
            {data.createdAt ? dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('level.detail.updatedAt')}>
            {data.updatedAt ? dayjs(data.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('level.detail.metadata')}>
            {data.metadata && Object.keys(data.metadata).length > 0 ? (
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(data.metadata, null, 2)}
              </pre>
            ) : (
              '-'
            )}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>{t('common.noData')}</div>
      )}
    </Modal>
  )
}

export default DetailView

