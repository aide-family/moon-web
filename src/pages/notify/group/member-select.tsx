import { NotifyType, Status } from '@/api/enum'
import type { NoticeItem, TeamMemberItem, UserItem } from '@/api/model-types'
import { listTeamMember } from '@/api/team'
import { useRequest } from 'ahooks'
import { Avatar, Checkbox, Select, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type React from 'react'
import { useEffect, useState } from 'react'

export interface MemberSelectProps {
  value?: NoticeItem[]
  onChange?: (value: NoticeItem[]) => void
}

export interface UserAvatarProps extends UserItem {}

export const UserAvatar: React.FC<UserAvatarProps> = (props) => {
  const { id, name, nickname, avatar } = props

  return (
    <Space direction='horizontal' key={id}>
      <Avatar src={avatar} size='small' />
      {`${name}(${nickname})`}
    </Space>
  )
}

export const MemberSelect: React.FC<MemberSelectProps> = (props) => {
  const { value, onChange } = props

  const [memberList, setMemberList] = useState<TeamMemberItem[]>([])
  const [members, setMembers] = useState<{ [key: number]: NoticeItem }>({})

  const { run: initMemberList, loading: initMemberListLoading } = useRequest(listTeamMember, {
    manual: true,
    onSuccess: (data) => {
      setMemberList(data.list || [])
    }
  })

  useEffect(() => {
    initMemberList({
      pagination: { pageNum: 1, pageSize: 999 },
      status: Status.StatusEnable
    })
  }, [initMemberList])

  const noticeMemberColumns: ColumnsType<NoticeItem> = [
    {
      dataIndex: 'user',
      title: '成员名称',
      width: '40%',
      render(_, record) {
        const { member } = record
        if (!member) return '-'
        const { user } = member
        return <UserAvatar {...user} />
      }
    },
    {
      dataIndex: 'notifyType',
      title: '通知方式',
      width: '60%',
      render(_, record) {
        const { notifyType } = record
        const checkedList: NotifyType[] = []
        if (notifyType & NotifyType.NOTIFY_PHONE) {
          checkedList.push(NotifyType.NOTIFY_PHONE)
        }
        if (notifyType & NotifyType.NOTIFY_EMAIL) {
          checkedList.push(NotifyType.NOTIFY_EMAIL)
        }
        if (notifyType & NotifyType.NOTIFY_SMS) {
          checkedList.push(NotifyType.NOTIFY_SMS)
        }
        return (
          <Checkbox.Group
            options={[
              { label: '手机', value: NotifyType.NOTIFY_PHONE, disabled: true },
              { label: '邮件', value: NotifyType.NOTIFY_EMAIL },
              { label: '短信', value: NotifyType.NOTIFY_SMS, disabled: true }
            ]}
            defaultValue={checkedList}
            onChange={(checkedList) => {
              const v = {
                ...members,
                [record.member?.id]: {
                  member: record.member,
                  notifyType: checkedList.reduce((prev, curr) => prev | curr, 0)
                }
              }
              setMembers(v)
              onChange?.(Object.values(v))
            }}
          />
        )
      }
    }
  ]

  return (
    <div>
      <Select
        loading={initMemberListLoading}
        placeholder='请选择成员'
        mode='multiple'
        options={memberList.map((item) => ({
          label: <UserAvatar {...item?.user} />,
          value: item.id
        }))}
        value={value?.map((item) => item?.member.id)}
        // size='large'
        onChange={(list) => {
          const items = memberList.filter((item) => list.includes(item.id))
          if (items.length === 0) {
            setMembers({})
            onChange?.([])
            return
          }
          for (const item of items) {
            const v = {
              ...members,
              [item.id]: {
                member: item,
                notifyType: NotifyType.NOTIFY_UNKNOWN
              }
            }
            setMembers(v)
            onChange?.(Object.values(v))
          }
        }}
        allowClear
      />
      <Table rowKey={(row) => row.member?.id} pagination={false} columns={noticeMemberColumns} dataSource={value} />
    </div>
  )
}
