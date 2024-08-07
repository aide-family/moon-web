import { Status, StatusData, ActionKey, Condition, SustainType } from '@/api/global'
import type { SearchFormItem } from '@/components/data/search-box'
import { StrategyGroupItemType, StrategyItemType, StrategyLevelTemplateType } from '@/api/strategy/types'
import { Button, Tooltip, Badge, Space, Tag, Avatar } from 'antd'
import { getStrategyGroupList } from '@/api/strategy'
import { ColumnsType } from 'antd/es/table'
import MoreMenu from '@/components/moreMenu'
import type { MoreMenuProps } from '@/components/moreMenu'

export type LevelItemType = {
  condition: Condition
  count: number
  duration: number
  levelId: number
  sustainType: SustainType
  threshold: number
  status: Status
  id?: number
}

export type MetricEditModalFormData = {
  name: string
  expr: string
  remark: string
  datasource?: string
  labelsItems: {
    key: string
    value: string
  }[]
  annotations: {
    summary: string
    description: string
  }
  levelItems: LevelItemType[]
  categoriesIds: number[]
  groupId: number
  step: number
  datasourceIds: number[]
  strategyLevel: StrategyLevelTemplateType[]
}

export type GroupEditModalFormData = {
  name: string
  remark: string
  status?: number
  categoriesIds: number[]
  teamId?: number
}

export const getStrategyGroups = () => {
  return getStrategyGroupList({
    pagination: {
      pageNum: 1,
      pageSize: 10
    }
  }).then(() => {
    const selectFetch = []
    for (let i = 0; i < 100000; i++) {
      const value = `${i.toString(36)}${i}`
      selectFetch.push({
        label: <Tag color='blue'>{value}</Tag>,
        value: i
      })
    }
    return selectFetch
  })
}

export const formList: SearchFormItem[] = [
  {
    name: 'keyword',
    label: '策略名称',
    dataProps: {
      type: 'input',
      itemProps: {
        placeholder: '请输入策略名称',
        allowClear: true
      }
    }
  },
  {
    name: 'teamId',
    label: '策略组',
    dataProps: {
      type: 'select-fetch',
      itemProps: {
        selectProps: {
          placeholder: '请选择策略组',
          mode: 'multiple',
          maxTagCount: 'responsive'
        },
        handleFetch: getStrategyGroups,
        defaultOptions: []
      }
    }
  },
  {
    name: 'status',
    label: '策略状态',
    dataProps: {
      type: 'select',
      itemProps: {
        placeholder: '策略状态',
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
  onHandleMenuOnClick: (item: StrategyGroupItemType, key: ActionKey) => void
  current: number
  pageSize: number
}

export const getColumnList = (props: GroupColumnProps): ColumnsType<StrategyGroupItemType> => {
  const { onHandleMenuOnClick, current, pageSize } = props
  const tableOperationItems = (record: StrategyGroupItemType): MoreMenuProps['items'] => [
    record.status === Status.DISABLE
      ? {
        key: ActionKey.DISABLE,
        label: (
          <Button type='link' size='small'>
            启用
          </Button>
        )
      }
      : {
        key: ActionKey.ENABLE,
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
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      width: 60,
      fixed: 'left',
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
      title: '数据源',
      // dataIndex: 'datasource',
      key: 'datasource',
      align: 'center',
      width: 160,
      render: (record: StrategyItemType) => {
        if (!record.datasource || !record.datasource.length)
          return '-'
        const datasourceList = record.datasource
        if (datasourceList.length === 1) {
          const { name } = datasourceList[0]
          return (
            <div>
              {name}
            </div>
          )
        }
        return (
          <Avatar.Group maxCount={2} shape="square" size="small">
            {datasourceList.map((item, index) => {
              return (
                <Tooltip title={item.name} key={index}>
                  <Avatar
                    key={item.type}
                  >
                    {item.name}
                  </Avatar>
                </Tooltip>
              )
            })}
          </Avatar.Group>
        )
      }
    },
    {
      title: '策略组',
      dataIndex: 'group',
      key: 'group',
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
      title: '持续时间',
      dataIndex: 'duration',
      key: 'duration',
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
      title: '策略等级',
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
      title: '策略类型',
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
      title: '告警页面',
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
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      width: 180,
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
      width: 180,
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
      title: '操作',
      key: 'action',
      align: 'center',
      ellipsis: true,
      fixed: 'right',
      width: 120,
      render: (record: StrategyGroupItemType) => (
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
