import { dictSelectList } from '@/api/dict'
import { AlertStatus, DictType } from '@/api/enum'
import { ActionKey, AlertStatusData } from '@/api/global'
import { RealtimeAlarmItem } from '@/api/model-types'
import { DataFromItem } from '@/components/data/form'
import type { SearchFormItem } from '@/components/data/search-box'
import TimeDifference from '@/components/layout/header-message'
import type { MoreMenuProps } from '@/components/moreMenu'
import MoreMenu from '@/components/moreMenu'
import OverflowTooltip from '@/components/overflowTooltip'
import { Button, Space } from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

export const formList: SearchFormItem[] = [
  {
    name: 'keyword',
    label: '模糊查询',
    dataProps: {
      type: 'input',
      itemProps: {
        placeholder: '根据告警内容模糊查询',
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
        options: Object.entries(AlertStatusData).map(([key, value]) => {
          return {
            label: value,
            value: Number(key)
          }
        })
      }
    }
  }
]

interface GroupColumnProps {
  onHandleMenuOnClick: (item: RealtimeAlarmItem, key: ActionKey) => void
  current: number
  pageSize: number
}

export const getColumnList = (props: GroupColumnProps): ColumnsType<RealtimeAlarmItem> => {
  const { onHandleMenuOnClick } = props
  const tableOperationItems = (record: RealtimeAlarmItem): MoreMenuProps['items'] => [
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: AlertStatus) => {
        return AlertStatusData[status]
      }
    },
    {
      title: '持续时间',
      key: 'duration',
      width: 100,
      render(_, record) {
        return (
          <div style={{ fontSize: 12 }}>
            <TimeDifference timestamp={dayjs(record.startsAt).unix() * 1000} />
          </div>
        )
      }
    },
    {
      title: '总览',
      dataIndex: 'summary',
      key: 'summary',
      width: 400
    },
    {
      title: '明细',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => {
        return <OverflowTooltip content={text || '-'} maxWidth='300px' />
      }
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      ellipsis: true,
      fixed: 'right',
      width: 120,
      render: (_, record: RealtimeAlarmItem) => (
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

export const addPagesFormItems: (DataFromItem | DataFromItem[])[] = [
  {
    name: 'alarmPageIds',
    label: '告警页面',
    type: 'select-fetch',
    props: {
      selectProps: {
        mode: 'multiple',
        placeholder: '请选择告警页面'
      },
      async handleFetch(value) {
        return dictSelectList({
          dictType: DictType.DictTypeAlarmPage,
          pagination: { pageNum: 1, pageSize: 999 },
          keyword: value
        }).then(({ list }) => list)
      }
    }
  }
]
