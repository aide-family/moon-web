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
  TeamOutlined,
  EllipsisOutlined,
  FileTextOutlined,
  MailOutlined,
  ApiOutlined,
  UserOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { RecipientGroupItem } from '@/api/rabbit/recipient-group'
import dayjs from 'dayjs'
import { useLocale } from '@/contexts/LocaleContext'
import { emptyPlaceholder, renderStatusTag } from '@/utils/marksman'

interface RecipientGroupCardProps {
  item: RecipientGroupItem
  menuItems: MenuProps['items']
  onView: () => void
}

const RecipientGroupCard: React.FC<RecipientGroupCardProps> = ({
  item,
  menuItems,
  onView,
}) => {
  const { t } = useLocale()

  const formatTime = (text?: string) =>
    text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'

  const metadataEntries = Object.entries(item.metadata ?? {})

  const metrics = [
    {
      key: 'templates',
      title: t('recipientGroup.table.templates'),
      value: item.templates?.length ?? 0,
      icon: <FileTextOutlined className='text-(--ant-color-primary)' />,
    },
    {
      key: 'emailConfigs',
      title: t('recipientGroup.table.emailConfigs'),
      value: item.emailConfigs?.length ?? 0,
      icon: <MailOutlined className='text-(--ant-color-primary)' />,
    },
    {
      key: 'webhookConfigs',
      title: t('recipientGroup.table.webhookConfigs'),
      value: item.webhookConfigs?.length ?? 0,
      icon: <ApiOutlined className='text-(--ant-color-primary)' />,
    },
    {
      key: 'members',
      title: t('recipientGroup.table.members'),
      value: item.members?.length ?? 0,
      icon: <UserOutlined className='text-(--ant-color-primary)' />,
    },
  ]

  return (
    <div className='config-card-wrapper h-full min-w-0 p-1'>
      <Card
        hoverable
        className='h-full min-w-0 overflow-hidden config-card'
        title={
          <Space size='small' className='min-w-0 max-w-full'>
            <TeamOutlined className='shrink-0 text-(--ant-color-primary)' />
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
        <Flex vertical gap={12} className='min-w-0'>
          <div className='min-w-0'>
            <Typography.Text type='secondary' className='text-xs'>
              {t('recipientGroup.table.metadata')}
            </Typography.Text>
            <div className='mt-1 min-w-0'>
              {metadataEntries.length > 0 ? (
                <Space size={[4, 4]} wrap className='min-w-0'>
                  {metadataEntries.slice(0, 3).map(([key, value]) => (
                    <Tag key={key} className='m-0! max-w-full'>
                      <Typography.Text
                        ellipsis
                        className='text-xs max-w-[120px]'
                      >{`${key}=${value}`}</Typography.Text>
                    </Tag>
                  ))}
                  {metadataEntries.length > 3 ? (
                    <Typography.Text type='secondary' className='text-xs'>
                      {`+${metadataEntries.length - 3}`}
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
              {t('recipientGroup.table.updatedAt')}: {formatTime(item.updatedAt)}
            </Typography.Text>
          </Flex>
        </Flex>
      </Card>
    </div>
  )
}

export default RecipientGroupCard
