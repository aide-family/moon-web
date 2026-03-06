import React from 'react'
import { Modal, Descriptions, Button, Space, Spin } from 'antd'
import type { DatasourceItem } from '@/api/datasource/index'
import dayjs from 'dayjs'
import { useLocale } from '@/contexts/LocaleContext'

interface DetailViewProps {
  open: boolean
  data?: DatasourceItem | null
  loading?: boolean
  onCancel: () => void
  onEdit?: (data: DatasourceItem) => void
}

function getTypeLabel(value: string | undefined, t: (key: string) => string): string {
  if (value == null || value === '') return '-'
  return t(`datasource.type.${value}`) || value
}

function getDriverLabel(value: string | undefined, t: (key: string) => string): string {
  if (value == null || value === '') return '-'
  return t(`datasource.driver.${value}`) || value
}

const empty = (v: unknown) => (v == null || v === '') ? '-' : String(v)

const DetailView: React.FC<DetailViewProps> = ({ open, data, loading = false, onCancel, onEdit }) => {
  const { t } = useLocale()

  const handleEdit = () => {
    if (data && onEdit) onEdit(data)
  }

  return (
    <Modal
      title={t('datasource.modal.detail.title')}
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
      destroyOnClose
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : data ? (
        <Descriptions column={1} bordered styles={{ label: { width: 120, minWidth: 120 } }}>
          <Descriptions.Item label={t('datasource.detail.uid')}>{empty(data.uid)}</Descriptions.Item>
          <Descriptions.Item label={t('datasource.detail.name')}>{empty(data.name)}</Descriptions.Item>
          <Descriptions.Item label={t('datasource.detail.type')}>{getTypeLabel(data.type, t)}</Descriptions.Item>
          <Descriptions.Item label={t('datasource.detail.driver')}>{getDriverLabel(data.driver, t)}</Descriptions.Item>
          <Descriptions.Item label={t('datasource.detail.status')}>{empty(data.status)}</Descriptions.Item>
          <Descriptions.Item label={t('datasource.detail.url')}>
            <span style={{ wordBreak: 'break-all' }}>{empty(data.url)}</span>
          </Descriptions.Item>
          <Descriptions.Item label={t('datasource.detail.remark')}>{empty(data.remark)}</Descriptions.Item>
          <Descriptions.Item label={t('datasource.detail.createdAt')}>
            {data.createdAt ? dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('datasource.detail.updatedAt')}>
            {data.updatedAt ? dayjs(data.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('datasource.detail.metadata')}>
            {data.metadata && Object.keys(data.metadata).length > 0 ? (
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(data.metadata, null, 2)}
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
