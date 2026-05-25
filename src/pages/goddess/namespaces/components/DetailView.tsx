import React from 'react'
import { Modal, Descriptions, Tag, Button, Space, Spin, Image } from 'antd'
import type { NamespaceItem } from '@/api/account/namespace/index'
import { GlobalStatus } from '@/api/common/types'
import dayjs from 'dayjs'
import { useLocale } from '@/contexts/LocaleContext'

interface DetailViewProps {
  open: boolean
  data?: NamespaceItem | null
  loading?: boolean
  onCancel: () => void
  onEdit?: (data: NamespaceItem) => void
}

const DetailView: React.FC<DetailViewProps> = ({
  open,
  data,
  loading = false,
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

  // 状态映射
  const getStatusInfo = (status: GlobalStatus) => {
    const statusMap: Record<GlobalStatus, { text: string; color: string }> = {
      [GlobalStatus.UNKNOWN]: {
        text: t(`common.status.${GlobalStatus.UNKNOWN}`),
        color: 'default',
      },
      [GlobalStatus.ENABLED]: {
        text: t(`common.status.${GlobalStatus.ENABLED}`),
        color: 'success',
      },
      [GlobalStatus.DISABLED]: {
        text: t(`common.status.${GlobalStatus.DISABLED}`),
        color: 'error',
      },
    }
    return statusMap[status]
  }

  return (
    <Modal
      title={t('namespace.modal.detail.title')}
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
      width={700}
      destroyOnHidden
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size='large' />
        </div>
      ) : data ? (
        <Descriptions
          column={1}
          bordered
          styles={{ label: { width: 120, minWidth: 120 } }}
        >
          <Descriptions.Item label={t('namespace.detail.uid')}>
            {data.uid || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('namespace.detail.name')}>
            {data.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('namespace.detail.remark')}>
            {data.remark || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('namespace.detail.logo')}>
            {data.logo ? (
              <Image
                src={data.logo}
                alt='logo'
                width={120}
                height={120}
                style={{ objectFit: 'contain' }}
              />
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('namespace.detail.banners')}>
            {data.banners && data.banners.length > 0 ? (
              <Image.PreviewGroup>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    gap: 8,
                    alignItems: 'flex-start',
                  }}
                >
                  {data.banners.slice(0, 3).map((url, i) => (
                    <Image
                      key={i}
                      src={url}
                      alt={`${t('namespace.detail.banners')} ${i + 1}`}
                      width={150}
                      height={120}
                      style={{ objectFit: 'contain', borderRadius: 4 }}
                    />
                  ))}
                </div>
              </Image.PreviewGroup>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('common.status')}>
            <Tag color={getStatusInfo(data.status).color}>
              {getStatusInfo(data.status).text}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('namespace.detail.createdAt')}>
            {data.createdAt
              ? dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss')
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('namespace.detail.updatedAt')}>
            {data.updatedAt
              ? dayjs(data.updatedAt).format('YYYY-MM-DD HH:mm:ss')
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('namespace.detail.metadata')}>
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
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          {t('common.noData')}
        </div>
      )}
    </Modal>
  )
}

export default DetailView
