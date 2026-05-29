import { Card, Button, Dropdown, Space, Typography, Flex } from 'antd'
import { EllipsisOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { WebhookItem } from '@/api/rabbit/webhook/index'
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

  const appLabel =
    item.app != null && item.app !== '' ? getAppLabel(item.app, t) : '-'
  const methodLabel =
    item.method != null && item.method !== ''
      ? getMethodLabel(item.method, t)
      : '-'

  return (
    <div className='config-card-wrapper h-full min-w-0 p-1'>
      <Card
        hoverable
        size='small'
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
        <Flex vertical gap={4} className='min-w-0'>
          <Typography.Text type='secondary' ellipsis className='text-xs'>
            {appLabel} · {methodLabel}
          </Typography.Text>
          <Typography.Text ellipsis className='text-sm' title={item.url}>
            {emptyPlaceholder(item.url)}
          </Typography.Text>
        </Flex>
      </Card>
    </div>
  )
}

export default WebhookCard
