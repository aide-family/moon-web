import { AlertStatus } from '@/api/enum'
import { ActionKey, AlertStatusData } from '@/api/global'
import { AlarmHistoryItem } from '@/api/realtime/history'
import type { SearchFormItem } from '@/components/data/search-box'
import type { MoreMenuProps } from '@/components/moreMenu'
import MoreMenu from '@/components/moreMenu'
import { Button, Space } from 'antd'
import { ColumnsType } from 'antd/es/table'

export const formList: SearchFormItem[] = [
  {
    name: 'keyword',
    label: '模糊查询',
    dataProps: {
      type: 'input',
      itemProps: {
        placeholder: '模糊查询',
        allowClear: true
      }
    }
  },
  {
    name: 'alarmStatuses',
    label: '状态',
    dataProps: {
      type: 'select',
      itemProps: {
        placeholder: '告警状态',
        allowClear: true,
        mode: 'multiple',
        options: Object.entries(AlertStatusData).map(([key, val]) => {
          return {
            label: val,
            value: +key
          }
        })
      }
    }
  }
]

interface GroupColumnProps {
  onHandleMenuOnClick: (item: AlarmHistoryItem, key: ActionKey) => void
  current: number
  pageSize: number
}

export const getColumnList = (props: GroupColumnProps): ColumnsType<AlarmHistoryItem> => {
  const { onHandleMenuOnClick, current, pageSize } = props
  const tableOperationItems = (): MoreMenuProps['items'] => [
    {
      key: ActionKey.OPERATION_LOG,
      label: (
        <Button size='small' type='link'>
          事件日志
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
      title: '状态',
      dataIndex: 'alertStatus',
      key: 'alertStatus',
      width: 160,
      render: (status: AlertStatus) => {
        return AlertStatusData[status]
      }
    },
    {
      title: '持续时间',
      key: 'duration',
      dataIndex: 'duration',
      width: 100
    },
    {
      title: '告警时间',
      dataIndex: 'startsAt',
      key: 'startsAt',
      align: 'center',
      width: 160
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      ellipsis: true,
      fixed: 'right',
      width: 120,
      render: (_, record: AlarmHistoryItem) => (
        <Space size={20}>
          <Button size='small' type='link' onClick={() => onHandleMenuOnClick(record, ActionKey.DETAIL)}>
            详情
          </Button>
          {tableOperationItems && tableOperationItems?.length > 0 && (
            <MoreMenu
              items={tableOperationItems()}
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
