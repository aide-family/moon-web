import React from 'react'
import { Modal, Descriptions, Tag, Button, Space } from 'antd'
import type { UserItem } from '@/api/user'
import { UserStatus, parseUserStatus } from '@/api/user'
import dayjs from 'dayjs'
import { useLocale } from '@/contexts/LocaleContext'

const USER_STATUS_MAP: Record<UserStatus, { textKey: string; color: string }> = {
  [UserStatus.UserStatus_UNKNOWN]: { textKey: 'user.status.UserStatus_UNKNOWN', color: 'default' },
  [UserStatus.ACTIVE]: { textKey: 'user.status.ACTIVE', color: 'success' },
  [UserStatus.BANNED]: { textKey: 'user.status.BANNED', color: 'error' },
}

interface UserDetailViewProps {
  open: boolean
  data?: UserItem | null
  onCancel: () => void
}

const UserDetailView: React.FC<UserDetailViewProps> = ({ open, data, onCancel }) => {
  const { t } = useLocale()

  const getStatusInfo = (status?: UserStatus | string) => {
    const s = parseUserStatus(status)
    const info = USER_STATUS_MAP[s]
    return { text: t(info.textKey), color: info.color }
  }

  return (
    <Modal
      title={t('user.modal.detail.title')}
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
        <Descriptions column={1} bordered styles={{ label: { width: 120, minWidth: 120 } }}>
          <Descriptions.Item label={t('user.detail.uid')}>{data.uid || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('user.detail.email')}>{data.email || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('user.detail.name')}>{data.name || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('user.detail.nickname')}>{data.nickname || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('user.detail.phone')}>{data.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('table.status')}>
            <Tag color={getStatusInfo(data.status).color}>{getStatusInfo(data.status).text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('user.detail.avatar')}>
            {data.avatar ? (
              <a href={data.avatar} target="_blank" rel="noopener noreferrer">
                {data.avatar}
              </a>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('user.detail.remark')}>{data.remark || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('user.detail.createdAt')}>
            {data.createdAt ? dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('user.detail.updatedAt')}>
            {data.updatedAt ? dayjs(data.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>{t('common.noData')}</div>
      )}
    </Modal>
  )
}

export default UserDetailView
