import { Status } from '@/api/enum'
import { ActionKey, RoleData, StatusData } from '@/api/global'
import { UserItem } from '@/api/model-types'
import { DataFromItem } from '@/components/data/form'
import type { SearchFormItem } from '@/components/data/search-box'
import type { MoreMenuProps } from '@/components/moreMenu'
import MoreMenu from '@/components/moreMenu'
import { Avatar, Badge, Button, Space, Tag } from 'antd'
import { ColumnsType } from 'antd/es/table'

export const formList: SearchFormItem[] = [
  {
    name: 'keyword',
    label: '名称',
    dataProps: {
      type: 'input',
      itemProps: {
        placeholder: '用户名称',
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
  onHandleMenuOnClick: (item: UserItem, key: ActionKey) => void
  current: number
  pageSize: number
}

export const getColumnList = (props: GroupColumnProps): ColumnsType<UserItem> => {
  const { onHandleMenuOnClick, current, pageSize } = props
  const tableOperationItems = (record: UserItem): MoreMenuProps['items'] => [
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
      key: ActionKey.EDIT,
      label: (
        <Button size='small' type='link'>
          编辑
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
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      align: 'center',
      width: 50,
      render: (avatar: string) => {
        return <Avatar src={avatar} />
      }
    },
    {
      title: '用户名',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string, record: UserItem) => {
        return (
          <div className='flex items-center gap-2'>
            <div className='text-sm font-bold'>{name}</div>
            <Tag color='blue'>{RoleData[record.role]}</Tag>
          </div>
        )
      }
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 200
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 120,
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
      render: (remark: string) => {
        return remark || '-'
      }
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      ellipsis: true,
      fixed: 'right',
      width: 120,
      render: (_, record: UserItem) => (
        <Space size={20}>
          <Button size='small' type='link' onClick={() => onHandleMenuOnClick(record, ActionKey.DETAIL)}>
            详情
          </Button>
          {tableOperationItems && tableOperationItems?.length > 0 && (
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

export interface CreateDictFormType {
  name: string
  value: string
  status: Status
  languageCode: string
  remark: string
}
export const editModalFormItems = (): (DataFromItem | DataFromItem[])[] => [
  [
    {
      name: 'name',
      label: '名称',
      type: 'input',
      formProps: {
        rules: [{ required: true, message: '请输入字典名称' }]
      },
      props: {
        placeholder: '请输入字典名称'
      }
    }
  ],
  [
    {
      name: 'value',
      label: '编码',
      type: 'input',
      formProps: {
        rules: [{ required: true, message: '请输入字典编码' }]
      },
      props: {
        placeholder: '请输入字典编码'
      }
    },
    {
      name: 'languageCode',
      label: '语言',
      type: 'select',
      props: {
        placeholder: '请输入语言',
        options: ['zh-CN', 'en-US'].map((item) => ({ label: item, value: item }))
      }
    }
  ],
  {
    name: 'remark',
    label: '描述',
    type: 'textarea',
    props: {
      placeholder: '请输入描述',
      maxLength: 200,
      showCount: true
    }
  }
]
