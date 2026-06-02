import {
  Card,
  Button,
  Dropdown,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
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
        size='small'
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
                  title: { marginBottom: 0 },
                  content: { fontSize: 16, lineHeight: 1.2 },
                }}
              />
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  )
}

export default RecipientGroupCard
