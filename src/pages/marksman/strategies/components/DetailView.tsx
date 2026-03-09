import React from 'react'
import { Modal, Descriptions, Button, Space, Spin, Tag } from 'antd'
import type { StrategyItem } from '@/api/strategy/index'
import { GlobalStatus } from '@/api'
import dayjs from 'dayjs'
import { useLocale } from '@/contexts/LocaleContext'

interface DetailViewProps {
  open?: boolean
  data?: StrategyItem | null
  loading?: boolean
  onCancel?: () => void
  onEdit?: (data: StrategyItem) => void
  /** 内嵌模式：在右侧面板展示，不用 Modal */
  embedded?: boolean
}

const empty = (v: unknown) => (v == null || v === '') ? '-' : String(v)

function getTypeLabel(value: string | undefined, t: (key: string) => string): string {
  if (value == null || value === '') return '-'
  return t(`datasource.type.${value}`) || value
}
function getDriverLabel(value: string | undefined, t: (key: string) => string): string {
  if (value == null || value === '') return '-'
  return t(`datasource.driver.${value}`) || value
}

function normalizeStatus(status: string | undefined): GlobalStatus {
  if (status === GlobalStatus.ENABLED) return GlobalStatus.ENABLED
  if (status === GlobalStatus.DISABLED) return GlobalStatus.DISABLED
  return GlobalStatus.UNKNOWN
}

const statusMap: Record<GlobalStatus, { text: string; color: string }> = {
  [GlobalStatus.UNKNOWN]: { text: 'table.unknown', color: 'default' },
  [GlobalStatus.ENABLED]: { text: 'table.enable', color: 'success' },
  [GlobalStatus.DISABLED]: { text: 'table.disable', color: 'error' },
}

const detailContent = (
  data: StrategyItem,
  t: (key: string) => string,
) => {
  const s = normalizeStatus(data.status)
  const info = statusMap[s]
  return (
  <Descriptions column={1} bordered size="small" styles={{ label: { width: 120, minWidth: 120 } }}>
    <Descriptions.Item label={t('strategy.detail.uid')}>{empty(data.uid)}</Descriptions.Item>
    <Descriptions.Item label={t('strategy.detail.name')}>{empty(data.name)}</Descriptions.Item>
    <Descriptions.Item label={t('strategy.detail.remark')}>{empty(data.remark)}</Descriptions.Item>
    <Descriptions.Item label={t('strategy.detail.type')}>{getTypeLabel(data.type, t)}</Descriptions.Item>
    <Descriptions.Item label={t('strategy.detail.driver')}>{getDriverLabel(data.driver, t)}</Descriptions.Item>
    <Descriptions.Item label={t('strategy.detail.status')}>
      <Tag color={info.color}>{t(info.text)}</Tag>
    </Descriptions.Item>
    <Descriptions.Item label={t('strategy.detail.strategyGroupUID')}>{empty(data.strategyGroupUID)}</Descriptions.Item>
    <Descriptions.Item label={t('strategy.detail.createdAt')}>
      {data.createdAt ? dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
    </Descriptions.Item>
    <Descriptions.Item label={t('strategy.detail.updatedAt')}>
      {data.updatedAt ? dayjs(data.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
    </Descriptions.Item>
    <Descriptions.Item label={t('strategy.detail.metadata')}>
      {data.metadata && Object.keys(data.metadata).length > 0 ? (
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {JSON.stringify(data.metadata, null, 2)}
        </pre>
      ) : '-'}
    </Descriptions.Item>
  </Descriptions>
  )
}

const DetailView: React.FC<DetailViewProps> = ({
  open = true,
  data,
  loading = false,
  onCancel,
  onEdit,
  embedded = false,
}) => {
  const { t } = useLocale()

  const handleEdit = () => {
    if (data && onEdit) onEdit(data)
  }

  const body = loading ? (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Spin size="large" />
    </div>
  ) : data ? (
    detailContent(data, t)
  ) : (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>{t('common.noData')}</div>
  )

  if (embedded) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-end shrink-0 mb-2">
          {data && onEdit && (
            <Button type="primary" size="small" onClick={handleEdit}>
              {t('common.edit')}
            </Button>
          )}
        </div>
        <div className="flex-1 min-h-0 overflow-auto">{body}</div>
      </div>
    )
  }

  return (
    <Modal
      title={t('strategy.modal.detail.title')}
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
      {body}
    </Modal>
  )
}

export default DetailView
