import { Card, Button, Dropdown, Space, Typography, Descriptions } from 'antd'
import { MailOutlined, EllipsisOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { EmailItem } from '@/api/rabbit/email/index'
import dayjs from 'dayjs'
import { useLocale } from '@/contexts/LocaleContext'
import { emptyPlaceholder, renderStatusTag } from '@/utils/marksman'

interface EmailCardProps {
  item: EmailItem
  menuItems: MenuProps['items']
  onView: () => void
}

const EmailCard: React.FC<EmailCardProps> = ({ item, menuItems, onView }) => {
  const { t } = useLocale()

  const formatTime = (text?: string) =>
    text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'

  return (
    <div className='email-config-card-wrapper h-full min-w-0 p-1'>
      <Card
        hoverable
        className='h-full min-w-0 overflow-hidden email-config-card'
        title={
          <Space size='small' className='min-w-0 max-w-full'>
            <MailOutlined className='shrink-0 text-(--ant-color-primary)' />
            <Typography.Text ellipsis className='min-w-0' title={item.name}>
              {emptyPlaceholder(item.name)}
            </Typography.Text>
          </Space>
        }
        extra={renderStatusTag(item.status, t)}
        actions={[
          <Button type='link' size='small' onClick={onView} key='detail'>
            {t('common.detail')}
          </Button>,
          <Dropdown menu={{ items: menuItems }} trigger={['click']} key='more'>
            <Button type='link' size='small' icon={<EllipsisOutlined />}>
              {t('common.more')}
            </Button>
          </Dropdown>,
        ]}
      >
        <Descriptions
          column={1}
          size='small'
          colon={false}
          className='min-w-0'
          styles={{
            label: {
              color: 'var(--ant-color-text-secondary)',
              width: 72,
              paddingBottom: 4,
            },
            content: { paddingBottom: 4, minWidth: 0, overflow: 'hidden' },
          }}
        >
          <Descriptions.Item label={t('email.table.host')}>
            <Typography.Text ellipsis title={item.host}>
              {emptyPlaceholder(item.host)}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('email.table.port')}>
            {item.port != null ? item.port : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('email.table.username')}>
            <Typography.Text ellipsis title={item.username}>
              {emptyPlaceholder(item.username)}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('email.table.uid')}>
            <Typography.Text
              ellipsis
              copyable={!!item.uid}
              className='text-xs text-(--ant-color-text-secondary)'
            >
              {emptyPlaceholder(item.uid)}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('email.table.updatedAt')}>
            <span className='text-xs text-(--ant-color-text-secondary)'>
              {formatTime(item.updatedAt)}
            </span>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}

export default EmailCard
