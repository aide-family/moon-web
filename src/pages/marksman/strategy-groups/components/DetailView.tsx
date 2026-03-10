import React from 'react'
import { Modal, Descriptions, Button, Space, Spin, Tag } from 'antd'
import type { StrategyGroupItem } from '@/api/strategyGroup'
import { GlobalStatus } from '@/api/types'
import dayjs from 'dayjs'
import { useLocale } from '@/contexts/LocaleContext'

interface DetailViewProps {
  open?: boolean
  data?: StrategyGroupItem | null
  loading?: boolean
  onCancel?: () => void
  onEdit?: (data: StrategyGroupItem) => void
  /** 内嵌模式：在右侧面板展示，不用 Modal */
  embedded?: boolean
}

const empty = (v: unknown) => (v == null || v === '' ? '-' : String(v))

/** 状态与全局一致为字符串 */
function renderStatus(status: string | undefined, t: (key: string) => string) {
  const statusMap: Record<string, { text: string; color: string }> = {
    [GlobalStatus.UNKNOWN]: { text: t('table.unknown'), color: 'default' },
    [GlobalStatus.ENABLED]: { text: t('table.enable'), color: 'success' },
    [GlobalStatus.DISABLED]: { text: t('table.disable'), color: 'error' },
  }
  const info = (status && statusMap[status]) || statusMap[GlobalStatus.UNKNOWN]
  return <Tag color={info.color}>{info.text}</Tag>
}

const detailContent = (
  data: StrategyGroupItem,
  t: (key: string) => string
) => (
  <Descriptions
    column={1}
    bordered
    size="small"
    styles={{ label: { width: 120, minWidth: 120 } }}
  >
    <Descriptions.Item label={t('strategyGroup.detail.uid')}>
      {empty(data.uid)}
    </Descriptions.Item>
    <Descriptions.Item label={t('strategyGroup.detail.name')}>
      {empty(data.name)}
    </Descriptions.Item>
    <Descriptions.Item label={t('strategyGroup.detail.status')}>
      {renderStatus(data.status, t)}
    </Descriptions.Item>
    <Descriptions.Item label={t('strategyGroup.detail.remark')}>
      {empty(data.remark)}
    </Descriptions.Item>
    <Descriptions.Item label={t('strategyGroup.detail.createdAt')}>
      {data.createdAt ? dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
    </Descriptions.Item>
    <Descriptions.Item label={t('strategyGroup.detail.updatedAt')}>
      {data.updatedAt ? dayjs(data.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
    </Descriptions.Item>
    <Descriptions.Item label={t('strategyGroup.detail.metadata')}>
      {data.metadata && Object.keys(data.metadata).length > 0 ? (
        <pre
          style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {JSON.stringify(data.metadata, null, 2)}
        </pre>
      ) : (
        '-'
      )}
    </Descriptions.Item>
  </Descriptions>
)

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
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      {t('common.noData')}
    </div>
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
      title={t('strategyGroup.modal.detail.title')}
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
      {body}
    </Modal>
  )
}

export default DetailView
