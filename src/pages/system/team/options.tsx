import { Status } from '@/api/enum'
import { ActionKey, StatusData } from '@/api/global'
import type { TeamItem, TeamMemberItem, UserItem } from '@/api/model-types'
import type { SearchFormItem } from '@/components/data/search-box'
import type { MoreMenuProps } from '@/components/moreMenu'
import MoreMenu from '@/components/moreMenu'
import { Avatar, Badge, Button, Col, Row, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'

export const formList: SearchFormItem[] = [
  {
    name: 'keyword',
    label: '名称',
    dataProps: {
      type: 'input',
      itemProps: {
        placeholder: '团队名称',
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
  onHandleMenuOnClick: (item: TeamItem, key: ActionKey) => void
  current: number
  pageSize: number
}

export const getColumnList = (props: GroupColumnProps): ColumnsType<TeamItem> => {
  const { onHandleMenuOnClick, current, pageSize } = props
  const tableOperationItems = (record: TeamItem): MoreMenuProps['items'] => [
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
      key: ActionKey.SYNC,
      label: (
        <Button type='link' size='small'>
          同步
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
      render: (_, __, index: number) => {
        return <span>{(current - 1) * pageSize + index + 1}</span>
      }
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (name: string, item: TeamItem) => {
        return (
          <Row gutter={12} className='text-center flex items-center min-w-[200px]'>
            <Col>
              <Avatar src={item?.logo} shape='square'>
                {name?.at(0)?.toUpperCase()}
              </Avatar>
            </Col>
            <Col>{name}</Col>
          </Row>
        )
      }
    },
    {
      title: '负责人',
      dataIndex: 'leader',
      key: 'leader',
      align: 'center',
      width: 180,
      render: (leader: UserItem) => {
        return (
          <Row gutter={12}>
            <Col>
              <Avatar src={leader?.avatar} shape='square'>
                {leader?.name?.at(0)?.toUpperCase()}
              </Avatar>
            </Col>
            <Col>{leader?.name}</Col>
          </Row>
        )
      }
    },
    {
      title: '管理员',
      dataIndex: 'admins',
      key: 'admins',
      width: 160,
      render: (admins: TeamMemberItem[]) => {
        return admins?.length > 0 ? (
          <Avatar.Group size='small'>
            {admins?.map((item) => (
              <Avatar src={item?.user?.avatar} shape='square' key={item?.user?.id}>
                {item?.user?.name?.at(0)?.toUpperCase()}
              </Avatar>
            ))}
          </Avatar.Group>
        ) : (
          '-'
        )
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
      render: (_, record: TeamItem) => (
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
