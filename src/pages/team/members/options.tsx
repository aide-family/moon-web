import { type Role, Status } from '@/api/enum'
import { ActionKey, RoleData, StatusData } from '@/api/global'
import type { TeamMemberItem } from '@/api/model-types'
import { getRoleSelectList } from '@/api/team/role'
import type { DataFromItem } from '@/components/data/form'
import type { SearchFormItem } from '@/components/data/search-box'
import type { MoreMenuProps } from '@/components/moreMenu'
import MoreMenu from '@/components/moreMenu'
import { Avatar, Badge, Button, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'

export const formList: SearchFormItem[] = [
  {
    name: 'keyword',
    label: '名称',
    dataProps: {
      type: 'input',
      itemProps: {
        placeholder: '成员名称',
        allowClear: true
      }
    }
  },
  {
    name: 'status',
    label: '状态',
    dataProps: {
      type: 'select',
      itemProps: {
        placeholder: '状态',
        allowClear: true,
        options: Object.entries(StatusData).map(([key, value]) => {
          return {
            label: value.text,
            value: Number(key)
          }
        })
      }
    }
  }
]

interface GroupColumnProps {
  onHandleMenuOnClick: (item: TeamMemberItem, key: ActionKey) => void
  current: number
  pageSize: number
  userId: number
}

export const getColumnList = (props: GroupColumnProps): ColumnsType<TeamMemberItem> => {
  const { onHandleMenuOnClick, current, pageSize, userId } = props
  const tableOperationItems = (record: TeamMemberItem): MoreMenuProps['items'] => [
    record.status === Status.StatusDisable
      ? {
          key: ActionKey.ENABLE,
          label: (
            <Button type='link' size='small'>
              启用
            </Button>
          )
        }
      : {
          key: ActionKey.DISABLE,
          label: (
            <Button type='link' size='small' danger>
              禁用
            </Button>
          )
        },
    {
      key: ActionKey.OPERATION_LOG,
      label: (
        <Button size='small' type='link'>
          操作日志
        </Button>
      )
    },
    {
      key: ActionKey.DELETE,
      label: (
        <Button type='link' size='small' danger>
          删除
        </Button>
      )
    }
  ]

  return [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      fixed: 'left',
      render: (_, __, index: number) => {
        return <span>{(current - 1) * pageSize + index + 1}</span>
      }
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (_: string, record: TeamMemberItem) => {
        const {
          user: { avatar, name, nickname }
        } = record
        return (
          <div className='flex items-center gap-2'>
            <Avatar src={avatar}>{(nickname || name).at(0)?.toUpperCase()}</Avatar>
            {nickname || name}
          </div>
        )
      }
    },

    {
      title: '角色类型',
      dataIndex: 'role',
      key: 'role',
      align: 'center',
      width: 160,
      render: (role: Role) => {
        return <>{RoleData[role]}</>
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 160,
      render: (status: Status) => {
        const { text, color } = StatusData[status]
        return <Badge color={color} text={text} />
      }
    },
    {
      title: '描述',
      dataIndex: 'remark',
      key: 'remark',
      width: 300,
      ellipsis: true,
      render: (_: string, { user: { remark } }) => {
        return remark || '-'
      }
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (text: string) => {
        return text || '-'
      }
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      ellipsis: true,
      fixed: 'right',
      width: 120,
      render: (_, record: TeamMemberItem) => (
        <Space size={20}>
          <Button size='small' type='link' onClick={() => onHandleMenuOnClick(record, ActionKey.DETAIL)}>
            详情
          </Button>
          {userId !== record.userId && tableOperationItems && tableOperationItems?.length > 0 && (
            <MoreMenu
              items={tableOperationItems(record)}
              onClick={(key: ActionKey) => {
                onHandleMenuOnClick(record, key)
              }}
            />
          )}
        </Space>
      )
    }
  ]
}

export const inviteModalFormItems: (DataFromItem | DataFromItem[])[] = [
  {
    name: 'inviteCode',
    label: '邮箱或电话号码',
    type: 'input',
    formProps: {
      rules: [{ required: true, message: '请输入邮箱或电话号码' }]
    },
    props: {
      placeholder: '请输入邮箱或电话号码'
    }
  },
  {
    name: 'role',
    label: '团队角色',
    type: 'select',
    props: {
      placeholder: '请选择角色',
      options: Object.entries(RoleData).map(([key, value]) => {
        return {
          label: value,
          value: Number(key)
        }
      })
    }
  },
  {
    name: 'roleIds',
    label: '角色权限',
    type: 'select-fetch',
    props: {
      handleFetch: (keyword: string) => {
        return getRoleSelectList({
          keyword,
          pagination: { pageNum: 1, pageSize: 999 }
        }).then((res) => {
          return res.list
        })
      },
      selectProps: {
        mode: 'multiple',
        placeholder: '请选择角色权限'
      }
    }
  }
]
