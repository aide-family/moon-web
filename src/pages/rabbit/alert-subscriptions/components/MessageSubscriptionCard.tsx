import {
  Card,
  Button,
  Dropdown,
  Space,
  Typography,
  Tag,
  Row,
  Col,
  Statistic,
  Flex,
} from 'antd'
import {
  BellOutlined,
  EllipsisOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { AlertSubscriptionItem } from '@/api/rabbit/alert'
import { useLocale } from '@/contexts/LocaleContext'
import { emptyPlaceholder, renderStatusTag } from '@/utils/marksman'
import { GlobalStatus } from '@/api/common/types'

interface MessageSubscriptionCardProps {
  item: AlertSubscriptionItem
  menuItems: MenuProps['items']
  onView: () => void
}

const MessageSubscriptionCard: React.FC<MessageSubscriptionCardProps> = ({
  item,
  menuItems,
  onView,
}) => {
  const { t } = useLocale()

  const labelEntries = Object.entries(item.labels ?? {})

  return (
    <div className='config-card-wrapper h-full min-w-0 p-1'>
      <Card
        hoverable
        size='small'
        className='h-full min-w-0 overflow-hidden config-card'
        title={
          <Space size='small' className='min-w-0 max-w-full'>
            <BellOutlined className='shrink-0 text-(--ant-color-primary)' />
            <Typography.Text ellipsis className='min-w-0' title={item.name}>
              {emptyPlaceholder(item.name)}
            </Typography.Text>
          </Space>
        }
        extra={renderStatusTag(item.status ?? GlobalStatus.UNKNOWN, t)}
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
        <Flex vertical gap={8} className='min-w-0'>
          {item.remark ? (
            <Typography.Text
              type='secondary'
              ellipsis
              className='text-xs'
              title={item.remark}
            >
              {item.remark}
            </Typography.Text>
          ) : null}

          {labelEntries.length > 0 ? (
            <Space size={[4, 4]} wrap className='min-w-0'>
              {labelEntries.slice(0, 2).map(([key, value]) => (
                <Tag key={key} className='m-0!'>
                  <Typography.Text
                    ellipsis
                    className='text-xs max-w-[100px]'
                  >{`${key}=${value}`}</Typography.Text>
                </Tag>
              ))}
              {labelEntries.length > 2 ? (
                <Typography.Text type='secondary' className='text-xs'>
                  {`+${labelEntries.length - 2}`}
                </Typography.Text>
              ) : null}
            </Space>
          ) : (
            <Typography.Text type='secondary' className='text-xs'>
              {t('alertSubscription.table.labels')}: -
            </Typography.Text>
          )}

          <Row gutter={8}>
            <Col span={12}>
              <Statistic
                title={
                  <Typography.Text type='secondary' ellipsis className='text-xs'>
                    {t('alertSubscription.table.recipientGroups')}
                  </Typography.Text>
                }
                value={item.recipientGroupUids?.length ?? 0}
                prefix={<TeamOutlined className='text-(--ant-color-primary)' />}
                styles={{
                  title: { marginBottom: 0 },
                  content: { fontSize: 16, lineHeight: 1.2 },
                }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title={
                  <Typography.Text type='secondary' ellipsis className='text-xs'>
                    {t('alertSubscription.table.members')}
                  </Typography.Text>
                }
                value={item.members?.length ?? 0}
                prefix={<UserOutlined className='text-(--ant-color-primary)' />}
                styles={{
                  title: { marginBottom: 0 },
                  content: { fontSize: 16, lineHeight: 1.2 },
                }}
              />
            </Col>
          </Row>
        </Flex>
      </Card>
    </div>
  )
}

export default MessageSubscriptionCard
