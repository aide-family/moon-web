import {
  Card,
  Button,
  Dropdown,
  Space,
  Typography,
  Tag,
  Divider,
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
  MailOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { AlertSubscriptionItem } from '@/api/rabbit/alert'
import dayjs from 'dayjs'
import { useLocale } from '@/contexts/LocaleContext'
import { emptyPlaceholder, renderStatusTag } from '@/utils/marksman'
import { GlobalStatus } from '@/api/common/types'

interface MessageSubscriptionCardProps {
  item: AlertSubscriptionItem
  menuItems: MenuProps['items']
  onView: () => void
}

const formatDirectConfigDisplay = (name?: string, uid?: string) => {
  if (name) return name
  if (!uid || uid === '0') return '-'
  return uid
}

const MessageSubscriptionCard: React.FC<MessageSubscriptionCardProps> = ({
  item,
  menuItems,
  onView,
}) => {
  const { t } = useLocale()

  const formatTime = (text?: string) =>
    text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'

  const labelEntries = Object.entries(item.labels ?? {})
  const excludeLabelEntries = Object.entries(item.excludeLabels ?? {})

  const metrics = [
    {
      key: 'recipientGroups',
      title: t('alertSubscription.table.recipientGroups'),
      value: item.recipientGroupUids?.length ?? 0,
      icon: <TeamOutlined className='text-(--ant-color-primary)' />,
    },
    {
      key: 'members',
      title: t('alertSubscription.table.members'),
      value: item.members?.length ?? 0,
      icon: <UserOutlined className='text-(--ant-color-primary)' />,
    },
  ]

  const directEmail = formatDirectConfigDisplay(
    item.directMemberEmailConfig?.name,
    item.directMemberEmailConfigUid,
  )
  const directTemplate = formatDirectConfigDisplay(
    item.directMemberTemplate?.name,
    item.directMemberTemplateUid,
  )

  return (
    <div className='config-card-wrapper h-full min-w-0 p-1'>
      <Card
        hoverable
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
        <Flex vertical gap={12} className='min-w-0'>
          <div className='min-w-0'>
            <Typography.Text type='secondary' className='text-xs'>
              {t('alertSubscription.table.remark')}
            </Typography.Text>
            <Typography.Paragraph
              ellipsis={{ rows: 2 }}
              className='mb-0! mt-1 text-sm'
              type={item.remark ? undefined : 'secondary'}
            >
              {emptyPlaceholder(item.remark)}
            </Typography.Paragraph>
          </div>

          <Divider size='small' className='my-0!' />

          <div className='min-w-0'>
            <Typography.Text type='secondary' className='text-xs'>
              {t('alertSubscription.table.labels')}
            </Typography.Text>
            <div className='mt-1 min-w-0'>
              {labelEntries.length > 0 ? (
                <Space size={[4, 4]} wrap className='min-w-0'>
                  {labelEntries.slice(0, 3).map(([key, value]) => (
                    <Tag key={key} className='m-0! max-w-full'>
                      <Typography.Text
                        ellipsis
                        className='text-xs max-w-[120px]'
                      >{`${key}=${value}`}</Typography.Text>
                    </Tag>
                  ))}
                  {labelEntries.length > 3 ? (
                    <Typography.Text type='secondary' className='text-xs'>
                      {`+${labelEntries.length - 3}`}
                    </Typography.Text>
                  ) : null}
                </Space>
              ) : (
                <Typography.Text type='secondary'>-</Typography.Text>
              )}
            </div>
          </div>

          <div className='min-w-0'>
            <Typography.Text type='secondary' className='text-xs'>
              {t('alertSubscription.table.excludeLabels')}
            </Typography.Text>
            <div className='mt-1 min-w-0'>
              {excludeLabelEntries.length > 0 ? (
                <Space size={[4, 4]} wrap className='min-w-0'>
                  {excludeLabelEntries.slice(0, 3).map(([key, value]) => (
                    <Tag key={key} color='orange' className='m-0! max-w-full'>
                      <Typography.Text
                        ellipsis
                        className='text-xs max-w-[120px]'
                      >{`${key}=${value}`}</Typography.Text>
                    </Tag>
                  ))}
                  {excludeLabelEntries.length > 3 ? (
                    <Typography.Text type='secondary' className='text-xs'>
                      {`+${excludeLabelEntries.length - 3}`}
                    </Typography.Text>
                  ) : null}
                </Space>
              ) : (
                <Typography.Text type='secondary'>-</Typography.Text>
              )}
            </div>
          </div>

          <Divider size='small' className='my-0!' />

          <Row gutter={[8, 8]}>
            {metrics.map((metric) => (
              <Col key={metric.key} span={12}>
                <Statistic
                  title={
                    <Typography.Text
                      type='secondary'
                      ellipsis
                      className='text-xs'
                      title={metric.title}
                    >
                      {metric.title}
                    </Typography.Text>
                  }
                  value={metric.value}
                  prefix={metric.icon}
                  styles={{
                    title: { marginBottom: 4 },
                    content: {
                      fontSize: 18,
                      lineHeight: 1.2,
                      fontWeight: 500,
                    },
                  }}
                />
              </Col>
            ))}
          </Row>

          <Divider size='small' className='my-0!' />

          <Flex vertical gap={6} className='min-w-0'>
            <div className='min-w-0'>
              <Space size={4}>
                <MailOutlined className='text-(--ant-color-text-secondary) text-xs' />
                <Typography.Text type='secondary' className='text-xs shrink-0'>
                  {t('alertSubscription.table.directEmailConfig')}:
                </Typography.Text>
                <Typography.Text ellipsis className='text-xs min-w-0' title={directEmail}>
                  {directEmail}
                </Typography.Text>
              </Space>
            </div>
            <div className='min-w-0'>
              <Space size={4}>
                <FileTextOutlined className='text-(--ant-color-text-secondary) text-xs' />
                <Typography.Text type='secondary' className='text-xs shrink-0'>
                  {t('alertSubscription.table.directTemplate')}:
                </Typography.Text>
                <Typography.Text ellipsis className='text-xs min-w-0' title={directTemplate}>
                  {directTemplate}
                </Typography.Text>
              </Space>
            </div>
          </Flex>

          <Divider size='small' className='my-0!' />

          <Flex vertical gap={4} className='min-w-0'>
            <Typography.Text
              type='secondary'
              ellipsis
              copyable={!!item.uid}
              className='text-xs'
              title={item.uid}
            >
              {emptyPlaceholder(item.uid)}
            </Typography.Text>
            <Typography.Text type='secondary' className='text-xs'>
              {t('alertSubscription.table.updatedAt')}: {formatTime(item.updatedAt)}
            </Typography.Text>
          </Flex>
        </Flex>
      </Card>
    </div>
  )
}

export default MessageSubscriptionCard
