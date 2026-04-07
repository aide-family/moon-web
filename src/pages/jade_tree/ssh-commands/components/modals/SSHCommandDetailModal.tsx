import React from 'react'
import { Button, Descriptions, Modal, Space, Tag } from 'antd'
import { useLocale } from '@/contexts/LocaleContext'
import type { SSHCommandItem } from '@/api'

interface SSHCommandDetailModalProps {
  open: boolean
  data?: SSHCommandItem
  onCancel: () => void
}

const SSHCommandDetailModal: React.FC<SSHCommandDetailModalProps> = ({
  open,
  data,
  onCancel,
}) => {
  const { t } = useLocale()
  const statusLabel = data?.disabled ? 'common.status.DISABLED' : 'common.status.ENABLED'
  const statusColor = data?.disabled ? 'default' : 'success'

  return (
    <Modal
      title={t('jadeTree.command.detailTitle')}
      open={open}
      onCancel={onCancel}
      footer={<Space><Button onClick={onCancel}>{t('common.close')}</Button></Space>}
      width={760}
      destroyOnHidden
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      {data ? (
        <Descriptions column={1} bordered size='small' styles={{ label: { width: 140, minWidth: 140 } }}>
          <Descriptions.Item label={t('jadeTree.command.uid')}>{data.uid || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('jadeTree.command.name')}>{data.name || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('common.status')}><Tag color={statusColor}>{t(statusLabel)}</Tag></Descriptions.Item>
          <Descriptions.Item label={t('jadeTree.command.description')}>{data.description || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('jadeTree.command.workDir')}>{data.workDir || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('jadeTree.command.createdAt')}>{data.createdAt || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('jadeTree.command.updatedAt')}>{data.updatedAt || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('jadeTree.command.content')}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{data.content || '-'}</pre>
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>{t('common.noData')}</div>
      )}
    </Modal>
  )
}

export default SSHCommandDetailModal
