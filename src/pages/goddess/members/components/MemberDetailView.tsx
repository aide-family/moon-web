import React from 'react'
import { Modal, Descriptions, Tag, Button, Space } from 'antd'
import type { MemberItem } from '@/api/account/member'
import { MemberStatus, normalizeMemberStatus } from '@/api/account/member'
import dayjs from 'dayjs'
import { useLocale } from '@/contexts/LocaleContext'

const MEMBER_STATUS_MAP: Record<
  MemberStatus,
  { textKey: string; color: string }
> = {
  [MemberStatus.MemberStatus_UNKNOWN]: {
    textKey: 'member.status.MemberStatus_UNKNOWN',
    color: 'default',
  },
  [MemberStatus.JOINED]: { textKey: 'member.status.JOINED', color: 'success' },
  [MemberStatus.INVITED]: {
    textKey: 'member.status.INVITED',
    color: 'processing',
  },
  [MemberStatus.EXPIRED]: {
    textKey: 'member.status.EXPIRED',
    color: 'warning',
  },
}

interface MemberDetailViewProps {
  open: boolean
  data?: MemberItem | null
  onCancel: () => void
}

const MemberDetailView: React.FC<MemberDetailViewProps> = ({
  open,
  data,
  onCancel,
}) => {
  const { t } = useLocale()

  const getStatusInfo = (status?: string) => {
    const s = normalizeMemberStatus(status)
    const info = MEMBER_STATUS_MAP[s]
    return { text: t(info.textKey), color: info.color }
  }

  return (
    <Modal
      title={t('member.modal.detail.title')}
      open={open}
      onCancel={onCancel}
      footer={
        <Space>
          <Button onClick={onCancel}>{t('common.close')}</Button>
        </Space>
      }
      width={700}
      destroyOnHidden
    >
      {data ? (
        <Descriptions
          column={1}
          bordered
          styles={{ label: { width: 120, minWidth: 120 } }}
        >
          <Descriptions.Item label={t('member.detail.uid')}>
            {data.uid || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('member.detail.namespaceUID')}>
            {data.namespaceUID || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('member.detail.email')}>
            {data.email || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('member.detail.name')}>
            {data.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('member.detail.nickname')}>
            {data.nickname || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('member.detail.phone')}>
            {data.phone || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('member.table.status')}>
            <Tag color={getStatusInfo(data.status).color}>
              {getStatusInfo(data.status).text}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('member.detail.avatar')}>
            {data.avatar ? (
              <a href={data.avatar} target='_blank' rel='noopener noreferrer'>
                {data.avatar}
              </a>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('member.detail.remark')}>
            {data.remark || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('member.detail.createdAt')}>
            {data.createdAt
              ? dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss')
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('member.detail.updatedAt')}>
            {data.updatedAt
              ? dayjs(data.updatedAt).format('YYYY-MM-DD HH:mm:ss')
              : '-'}
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

export default MemberDetailView
