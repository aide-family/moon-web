import { Status } from '@/api/enum'
import { ActionKey, StatusData } from '@/api/global'
import { AlarmNoticeGroupItem } from '@/api/model-types'
import { SearchFormItem } from '@/components/data/search-box'
import MoreMenu, { MoreMenuProps } from '@/components/moreMenu'
import { Badge, Button, Space, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'

export const formList: SearchFormItem[] = [
  {
    name: 'keyword',
    label: '名称',
    dataProps: {
      type: 'input',
      itemProps: {
        placeholder: '规则组名称',
        allowClear: true
      }
    }
  }
]

interface NotifyGroupItemTypeColumnProps {
  onHandleMenuOnClick: (item: AlarmNoticeGroupItem, key: ActionKey) => void
  current: number
  pageSize: number
}

export const getColumnList = (props: NotifyGroupItemTypeColumnProps): ColumnsType<AlarmNoticeGroupItem> => {
  const { onHandleMenuOnClick, current, pageSize } = props
  const tableOperationItems = (record: AlarmNoticeGroupItem): MoreMenuProps['items'] => [
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
      align: 'center',
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
      align: 'center',
      width: 200,
      render: (text: string) => {
        return (
          <Tooltip
            placement='top'
            title={() => {
              return <div>{text}</div>
            }}
          >
            <div>{text ? text : '-'}</div>
          </Tooltip>
        )
      }
    },
    {
      title: '类型',
      dataIndex: 'categories',
      key: 'categories',
      align: 'center',
      width: 160,
      render: (text: string) => {
        return (
          <Tooltip
            placement='top'
            title={() => {
              return <div>{text}</div>
            }}
          >
            <div>{text ? text : '-'}</div>
          </Tooltip>
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
      align: 'center',
      width: 300,
      render: (text: string) => {
        return (
          <Tooltip
            placement='top'
            title={() => {
              return <div>{text}</div>
            }}
          >
            <div>{text ? text : '-'}</div>
          </Tooltip>
        )
      }
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      align: 'center',
      width: 180
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      ellipsis: true,
      fixed: 'right',
      width: 120,
      render: (record: AlarmNoticeGroupItem) => (
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
