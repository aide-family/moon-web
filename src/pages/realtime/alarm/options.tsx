import { dictSelectList } from '@/api/dict'
import { DictType } from '@/api/enum'
import { ActionKey } from '@/api/global'
import { RealtimeAlarmItem, StrategyLevelItem } from '@/api/model-types'
import { DataFromItem } from '@/components/data/form'
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
        placeholder: '根据告警内容模糊查询',
        allowClear: true,
        autoComplete: 'off'
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
  const tableOperationItems = (): MoreMenuProps['items'] => [
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
      title: '告警等级',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: StrategyLevelItem) => {
        return level?.level?.label || '-'
      }
    },
    {
      title: '告警时间',
      dataIndex: 'startsAt',
      key: 'startsAt',
      width: 200
    },
    {
      title: '持续时间',
      key: 'duration',
      dataIndex: 'duration',
      width: 100
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary',
      width: 400
    },
    {
      title: '明细',
      dataIndex: 'description',
      key: 'description',
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
      render: (_, record: RealtimeAlarmItem) => (
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
