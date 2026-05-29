import { Card, Button, Dropdown, Space, Typography, Descriptions } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { WebhookItem } from '@/api/rabbit/webhook/index'
import dayjs from 'dayjs'
import { useLocale } from '@/contexts/LocaleContext'
import { emptyPlaceholder, renderStatusTag } from '@/utils/marksman'
import { IconFont } from '@/components/Icon/IconFont'
import { getAppIconType, getAppLabel, getMethodLabel } from '../constants'

interface WebhookCardProps {
  item: WebhookItem
  menuItems: MenuProps['items']
  onView: () => void
}

const WebhookCard: React.FC<WebhookCardProps> = ({
  item,
  menuItems,
  onView,
}) => {
  const { t } = useLocale()

  const formatTime = (text?: string) =>
    text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'

  const appLabel =
    item.app != null && item.app !== ''
      ? getAppLabel(item.app, t)
      : '-'
  const methodLabel =
    item.method != null && item.method !== ''
      ? getMethodLabel(item.method, t)
      : '-'

  return (
    <div className='config-card-wrapper h-full min-w-0 p-1'>
      <Card
        hoverable
        className='h-full min-w-0 overflow-hidden config-card'
        title={
          <Space size='small' className='min-w-0 max-w-full'>
            {item.app != null && item.app !== '' ? (
              <IconFont
                type={getAppIconType(item.app)}
                className='shrink-0 text-(--ant-color-primary)'
              />
            ) : null}
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
          <Descriptions.Item label={t('webhook.table.app')}>
            <Typography.Text ellipsis title={appLabel}>
              {appLabel}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('webhook.table.url')}>
            <Typography.Text ellipsis title={item.url}>
              {emptyPlaceholder(item.url)}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('webhook.table.method')}>
            {methodLabel}
          </Descriptions.Item>
          <Descriptions.Item label={t('webhook.table.uid')}>
            <Typography.Text
              ellipsis
              copyable={!!item.uid}
              className='text-xs text-(--ant-color-text-secondary)'
            >
              {emptyPlaceholder(item.uid)}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label={t('webhook.table.updatedAt')}>
            <span className='text-xs text-(--ant-color-text-secondary)'>
              {formatTime(item.updatedAt)}
            </span>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}

export default WebhookCard
