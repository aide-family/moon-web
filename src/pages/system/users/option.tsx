import { UserItem } from '@/api/authorization/user'
import {
  Gender,
  GenderData,
  Status,
  StatusData,
  SystemRoleData,
} from '@/api/global'
import { DataFromItem } from '@/components/data/form'
import { AutoTableColumnType } from '@/components/table'
import { ManOutlined, WomanOutlined } from '@ant-design/icons'
import { Avatar, Tooltip, Image, Button, Badge } from 'antd'

export const searchDataFormItem: DataFromItem[] = [
  {
    name: 'keyword',
    label: '模糊查询',
    type: 'input',
    props: {
      placeholder: '通过姓名模糊查询',
    },
  },
  {
    name: 'status',
    label: '状态',
    type: 'radio-group',
    formProps: {
      initialValue: 0,
    },
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
    type: 'radio-group',
    props: {
      optionType: 'button',
      options: Object.entries(SystemRoleData).map(([key, value]) => {
        return {
          label: value,
          value: Number(key),
        }
      }),
    },
  },
]

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

export const usersColumns: AutoTableColumnType<UserItem>[] = [
  {
    title: '头像',
    dataIndex: 'avatar',
    key: 'avatar',
    align: 'center',
    width: 100,
    render: (_: string, item: UserItem) => {
      return <UserAvatar {...item} />
    },
  },
  {
    title: '姓名',
    dataIndex: 'username',
    key: 'username',
    width: 200,
    render: (_: string, record: UserItem) => {
      return <Username {...record} />
    },
  },
  {
    title: '昵称',
    dataIndex: 'nickname',
    key: 'nickname',
    // width: 200,
    ellipsis: true,
    render: (text: string) => {
      return <>{text || '-'}</>
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    width: 120,
    render: (_: string, record: UserItem) => {
      return <StatusBadge {...record} />
    },
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    key: 'phone',
    width: 200,
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
    width: 300,
  },
]
