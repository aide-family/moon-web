import { Card, Button, Dropdown, Space, Typography, Flex } from 'antd'
import { MailOutlined, EllipsisOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { EmailItem } from '@/api/rabbit/email/index'
import { useLocale } from '@/contexts/LocaleContext'
import { emptyPlaceholder, renderStatusTag } from '@/utils/marksman'

interface EmailCardProps {
  item: EmailItem
  menuItems: MenuProps['items']
  onView: () => void
}

const EmailCard: React.FC<EmailCardProps> = ({ item, menuItems, onView }) => {
  const { t } = useLocale()

  const endpoint =
    item.host != null && item.host !== ''
      ? `${item.host}${item.port != null ? `:${item.port}` : ''}`
      : '-'

  return (
    <div className='config-card-wrapper h-full min-w-0 p-1'>
      <Card
        hoverable
        size='small'
        className='h-full min-w-0 overflow-hidden config-card'
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
        <Flex vertical gap={4} className='min-w-0'>
          <Typography.Text ellipsis className='text-sm' title={endpoint}>
            {endpoint}
          </Typography.Text>
          <Typography.Text
            type='secondary'
            ellipsis
            className='text-xs'
            title={item.username}
          >
            {emptyPlaceholder(item.username)}
          </Typography.Text>
        </Flex>
      </Card>
    </div>
  )
}

export default EmailCard
