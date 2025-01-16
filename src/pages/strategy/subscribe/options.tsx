import { NotifyType, StrategyType } from '@/api/enum'
import { ActionKey, StatusData, StrategyTypeDataTag } from '@/api/global'
import { StrategySubscribeItem } from '@/api/model-types'
import { SearchFormItem } from '@/components/data/search-box'
import MoreMenu, { MoreMenuProps } from '@/components/moreMenu'
import { Badge, Button, Space, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'

export const formList: SearchFormItem[] = [
  {
    name: 'keyword',
    label: '策略名称',
    dataProps: {
      type: 'input',
      itemProps: {
        placeholder: '请输入策略名称',
        allowClear: true,
        autoComplete: 'off'
      }
    }
  },
  {
    name: 'notifyType',
    label: '订阅类型',
    dataProps: {
      type: 'select',
      itemProps: {
        placeholder: '请选择订阅类型',
        options: [
          { label: '手机', value: NotifyType.NOTIFY_PHONE },
          { label: '邮件', value: NotifyType.NOTIFY_EMAIL },
          { label: '短信', value: NotifyType.NOTIFY_SMS }
        ]
      }
    }
  }
]

export interface ColumnProps {
  onHandleMenuOnClick: (item: StrategySubscribeItem, key: ActionKey) => void
  current: number
  pageSize: number
}

export const getColumnList = (props: ColumnProps): ColumnsType<StrategySubscribeItem> => {
  const { onHandleMenuOnClick } = props
  const tableOperationItems: MoreMenuProps['items'] = [
    {
      key: ActionKey.SUBSCRIBE,
      label: (
        <Button type='link' size='small'>
          修改订阅
        </Button>
      )
    },
    {
      key: ActionKey.CANCEL_SUBSCRIBE,
      label: (
        <Button type='link' size='small' danger>
          取消订阅
        </Button>
      )
    }
  ]

  return [
    {
      title: '类型',
      dataIndex: 'strategyType',
      key: 'strategyType',
      align: 'center',
      width: 80,
      render: (_, record) => {
        return StrategyTypeDataTag[record?.strategy?.strategyType || StrategyType.StrategyTypeMetric]
      }
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (_, record) => {
        return record?.strategy?.name || '-'
      }
    },
    {
      title: '数据源',
      dataIndex: 'datasource',
      key: 'datasource',
      width: 160,
      ellipsis: true,
      render: (_, record: StrategySubscribeItem) => {
        const { strategy } = record
        if (!strategy) return '-'
        const { datasource } = strategy
        if (!datasource || datasource.length === 0) return '-'
        if (datasource.length === 1) {
          const { name } = datasource[0]
          return <div>{name}</div>
        }
        return (
          <Tooltip placement='top' title={<div>{datasource.map((item) => item.name).join(', ')}</div>}>
            <div>{datasource.map((item) => item.name).join(', ')}</div>
          </Tooltip>
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 80,
      render: (_, record) => {
        if (!record?.strategy) return '-'
        const { status } = record.strategy
        const { text, color } = StatusData[status]
        return <Badge color={color} text={text} />
      }
    },
    {
      title: '策略组',
      dataIndex: 'group',
      key: 'group',
      width: 160,
      render: (_, record) => {
        const { strategy } = record
        if (!strategy) return '-'
        const { group } = strategy
        if (!group) return '-'
        return group?.name || '-'
      }
    },
    {
      title: '策略类目',
      dataIndex: 'categories',
      key: 'categories',
      ellipsis: true,
      render: (_, record) => {
        const { strategy } = record
        if (!strategy) return '-'
        const { categories } = strategy
        if (!categories) return '-'
        return categories.map((item) => item.name).join(', ')
      }
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (_, record) => {
        if (!record?.strategy) return '-'
        const { updatedAt } = record.strategy
        return updatedAt || '-'
      }
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      ellipsis: true,
      fixed: 'right',
      width: 120,
      render: (record: StrategySubscribeItem) => (
        <Space size={20}>
          <Button size='small' type='link' onClick={() => onHandleMenuOnClick(record, ActionKey.DETAIL)}>
            详情
          </Button>
          {tableOperationItems && tableOperationItems?.length > 0 && (
            <MoreMenu
              items={tableOperationItems}
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
