import { UserItem } from '@/api/authorization/user'
import {
  Gender,
  GenderData,
  Status,
  StatusData,
  SystemRoleData,
} from '@/api/global'
import { DataFromItem } from '@/components/data/form'
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

export const userListSearchItems: DataFromItem[] = [
  {
    name: 'keyword',
    label: '模糊查询',
    type: 'input',
    props: {
      placeholder: '请输入用户名、昵称、手机号、邮箱',
      allowClear: true,
    },
  },
  {
    name: 'status',
    label: '状态',
    type: 'radio-group',
    props: {
      optionType: 'button',
      options: Object.entries(StatusData).map(([key, value]) => {
        return {
          label: value.text,
          value: Number(key),
        }
      }),
    },
  },
  {
    name: 'gender',
    label: '性别',
    type: 'radio-group',
    props: {
      optionType: 'button',
      options: Object.entries(GenderData).map(([key, value]) => {
        return {
          label: value,
          value: Number(key),
        }
      }),
    },
  },
  {
    name: 'role',
    label: '角色',
    type: 'select',
    props: {
      options: Object.entries(SystemRoleData).map(([key, value]) => {
        return {
          label: value,
          value: Number(key),
        }
      }),
    },
  },
]
