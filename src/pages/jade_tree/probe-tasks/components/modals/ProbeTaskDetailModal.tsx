import React from 'react'
import { Button, Descriptions, Modal, Space, Spin, Tag } from 'antd'
import { useLocale } from '@/contexts/LocaleContext'
import { ProbeTaskStatus, type ProbeTaskItem } from '@/api'

interface ProbeTaskDetailModalProps {
  open: boolean
  data?: ProbeTaskItem
  loading?: boolean
  onCancel: () => void
}

const renderProbeStatus = (
  status: ProbeTaskStatus | undefined,
  t: (key: string) => string,
) => {
  if (status === ProbeTaskStatus.ENABLED)
    return <Tag color='success'>{t('common.status.ENABLED')}</Tag>
  if (status === ProbeTaskStatus.DISABLED)
    return <Tag>{t('common.status.DISABLED')}</Tag>
  return <Tag color='warning'>{t('common.status.UNKNOWN')}</Tag>
}

const ProbeTaskDetailModal: React.FC<ProbeTaskDetailModalProps> = ({
  open,
  data,
  loading = false,
  onCancel,
}) => {
  const { t } = useLocale()

  return (
    <Modal
      title={t('jadeTree.probe.detailTitle')}
      open={open}
      onCancel={onCancel}
      footer={
        <Space>
          <Button onClick={onCancel}>{t('common.close')}</Button>
        </Space>
      }
      width={760}
      destroyOnHidden
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size='large' />
        </div>
      ) : data ? (
        <Descriptions
          column={1}
          bordered
          size='small'
          styles={{ label: { width: 140, minWidth: 140 } }}
        >
          <Descriptions.Item label={t('jadeTree.probe.uid')}>
            {data.uid || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('table.search.type')}>
            {data.type || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('jadeTree.probe.name')}>
            {data.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('common.status')}>
            {renderProbeStatus(data.status, t)}
          </Descriptions.Item>
          <Descriptions.Item label={t('jadeTree.probe.host')}>
            {data.host || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('jadeTree.probe.port')}>
            {data.port || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('jadeTree.probe.url')}>
            {data.url || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('jadeTree.probe.timeout')}>
            {data.timeoutSeconds ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('jadeTree.command.createdAt')}>
            {data.createdAt || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('jadeTree.command.updatedAt')}>
            {data.updatedAt || '-'}
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

export default ProbeTaskDetailModal
