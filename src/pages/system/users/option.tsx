import { UserItem } from '@/api/authorization/user'
import { Gender, Status, StatusData } from '@/api/global'
import { ManOutlined, WomanOutlined } from '@ant-design/icons'
import { Avatar, Tooltip, Image, Button, Badge } from 'antd'

export const UserAvatar: React.FC<UserItem> = (props: UserItem) => {
  const { name, nickname, avatar } = props
  return (
    <Tooltip title={nickname || name}>
      {!avatar ? (
        <Avatar {...props} size={40} shape='circle'>
          {nickname || name}
        </Avatar>
      ) : (
        <Image width={40} height={40} src={avatar} preview={false} />
      )}
    </Tooltip>
  )
}

export const StatusBadge: React.FC<{ status: Status }> = (props) => {
  const { status } = props
  return (
    <Badge color={StatusData[status].color} text={StatusData[status].text} />
  )
}

export const Username: React.FC<UserItem> = (props: UserItem) => {
  const { name, gender } = props
  return (
    <Button
      type='text'
      icon={
        gender === Gender.MALE ? (
          <ManOutlined style={{ color: '#1890ff' }} />
        ) : gender === Gender.FEMALE ? (
          <WomanOutlined style={{ color: '#f759ab' }} />
        ) : null
      }
    >
      {name}
    </Button>
  )
}
