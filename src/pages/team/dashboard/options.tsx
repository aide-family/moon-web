import { Status } from '@/api/enum'
import { ActionKey, StatusData } from '@/api/global'
import type { ChartItem, DashboardItem } from '@/api/model-types'
import type { DataFromItem } from '@/components/data/form'
import type { SearchFormItem } from '@/components/data/search-box'
import type { MoreMenuProps } from '@/components/moreMenu'
import MoreMenu from '@/components/moreMenu'
import { Badge, Button, Space, Tag } from 'antd'
import type { Color } from 'antd/es/color-picker'
import type { ColumnsType } from 'antd/es/table'

export const formList: SearchFormItem[] = [
  {
    name: 'keyword',
    label: '名称',
    dataProps: {
      type: 'input',
      itemProps: {
        placeholder: '大盘名称模糊查询',
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
          return { label: <Badge {...value} />, value: Number(key) }
        })
      }
    }
  }
]

interface GroupColumnProps {
  onHandleMenuOnClick: (item: DashboardItem, key: ActionKey) => void
  current: number
  pageSize: number
}

export const getColumnList = (props: GroupColumnProps): ColumnsType<DashboardItem> => {
  const { onHandleMenuOnClick, current, pageSize } = props
  const tableOperationItems = (record: DashboardItem): MoreMenuProps['items'] => [
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
      key: ActionKey.EDIT,
      label: (
        <Button size='small' type='link'>
          编辑
        </Button>
      )
    },
    {
      key: ActionKey.CHART_MANAGE,
      label: (
        <Button size='small' type='link'>
          图表管理
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
      render: (_, __, index: number) => {
        return <span>{(current - 1) * pageSize + index + 1}</span>
      }
    },
    {
      title: '名称',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text: string, record: DashboardItem) => {
        return <Tag color={record.color}>{text ? text : '-'}</Tag>
      }
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
      ellipsis: true,
      render: (text: string) => {
        return text || '-'
      }
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      ellipsis: true,
      fixed: 'right',
      width: 120,
      render: (_, record: DashboardItem) => (
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

export type ColorType = 'hex' | 'rgb' | 'hsb'

export interface CreateDashobardFormType {
  title: string
  remark: string
  color: Color | string
  charts: ChartItem[]
  strategyGroups: number[]
}
export const editModalFormItems = (colorType: ColorType): (DataFromItem | DataFromItem[])[] => [
  [
    {
      name: 'title',
      label: '名称',
      type: 'input',
      formProps: {
        rules: [{ required: true, message: '请输入仪表盘名称' }]
      },
      props: {
        placeholder: '请输入仪表盘名称'
      }
    }
  ],
  [
    {
      name: 'color',
      label: '颜色',
      type: 'color',
      props: {
        format: colorType,
        showText: true
      }
    },
    {
      name: 'status',
      label: '状态',
      type: 'radio-group',
      formProps: {
        rules: [{ required: true, message: '请选择状态' }]
      },
      props: {
        options: Object.entries(StatusData)
          .filter(([key]) => +key !== Status.StatusAll)
          .map(([key, value]) => {
            return {
              label: value.text,
              value: Number(key)
            }
          })
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
