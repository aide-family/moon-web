import React from 'react'
import { Button, Descriptions, Modal, Space, Tag } from 'antd'
import { useLocale } from '@/contexts/LocaleContext'
import { SSHCommandAuditStatus, type SSHCommandAuditItem } from '@/api'

interface AuditDetailModalProps {
  open: boolean
  data?: SSHCommandAuditItem
  onCancel: () => void
}

const renderAuditStatus = (status: SSHCommandAuditStatus | undefined, t: (key: string) => string) => {
  if (status === SSHCommandAuditStatus.APPROVED) return <Tag color='success'>{t('jadeTree.audit.status.APPROVED')}</Tag>
  if (status === SSHCommandAuditStatus.REJECTED) return <Tag color='error'>{t('jadeTree.audit.status.REJECTED')}</Tag>
  if (status === SSHCommandAuditStatus.PENDING) return <Tag color='processing'>{t('jadeTree.audit.status.PENDING')}</Tag>
  return <Tag>{t('jadeTree.audit.status.UNKNOWN')}</Tag>
}

const AuditDetailModal: React.FC<AuditDetailModalProps> = ({ open, data, onCancel }) => {
  const { t } = useLocale()

  return (
    <Modal
      title={t('jadeTree.audit.detailTitle')}
      open={open}
      onCancel={onCancel}
      footer={<Space><Button onClick={onCancel}>{t('common.close')}</Button></Space>}
      width={760}
      destroyOnHidden
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      {data ? (
        <Descriptions column={1} bordered size='small' styles={{ label: { width: 140, minWidth: 140 } }}>
          <Descriptions.Item label={t('jadeTree.audit.uid')}>{data.uid || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('jadeTree.audit.name')}>{data.name || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('common.status')}>{renderAuditStatus(data.status, t)}</Descriptions.Item>
          <Descriptions.Item label={t('jadeTree.audit.targetCommandUid')}>{data.targetCommandUid || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('jadeTree.audit.rejectReason')}>{data.rejectReason || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('jadeTree.command.workDir')}>{data.workDir || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('jadeTree.audit.reviewerUid')}>{data.reviewerUid || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('jadeTree.audit.reviewedAt')}>{data.reviewedAt || '-'}</Descriptions.Item>
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

export default AuditDetailModal
