import { AlarmSendType, Status } from '@/api/enum'
import { ActionKey, AlarmSendTypeData, StatusData } from '@/api/global'
import type { SendTemplateItem } from '@/api/model-types'
import type { DataFromItem } from '@/components/data/form'
import type { SearchFormItem } from '@/components/data/search-box'
import MoreMenu, { type MoreMenuProps } from '@/components/moreMenu'
import { Avatar, Badge, Button, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'

export const formList: SearchFormItem[] = [
  {
    name: 'keyword',
    label: '名称',
    dataProps: {
      type: 'input',
      itemProps: {
        placeholder: '名称模糊查询',
        allowClear: true,
        autoComplete: 'off'
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
            value: +key
          }
        })
      }
    }
  },
  {
    name: 'sendTypes',
    label: '通知类型',
    dataProps: {
      type: 'select',
      itemProps: {
        placeholder: '通知类型',
        allowClear: true,
        mode: 'multiple',
        maxTagCount: 1,
        options: Object.entries(AlarmSendTypeData).map(([key, value]) => {
          const { label, icon } = value
          return {
            label: (
              <Space direction='horizontal'>
                <Avatar size='small' shape='square' icon={icon} />
                {label}
              </Space>
            ),
            value: +key
          }
        })
      }
    }
  }
]

interface NotifyTemplateColumnProps {
  onHandleMenuOnClick: (item: SendTemplateItem, key: ActionKey) => void
  current: number
  pageSize: number
}

export const getColumnList = (props: NotifyTemplateColumnProps): ColumnsType<SendTemplateItem> => {
  const { onHandleMenuOnClick, current, pageSize } = props
  const tableOperationItems = (record: SendTemplateItem): MoreMenuProps['items'] => [
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
      width: 60,
      render: (_, __, index: number) => {
        return <span>{(current - 1) * pageSize + index + 1}</span>
      }
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '通知类型',
      dataIndex: 'sendType',
      key: 'sendType',
      width: 160,
      render: (sendType: AlarmSendType) => {
        const { label, icon } = AlarmSendTypeData[sendType]
        return (
          <Space direction='horizontal'>
            <Avatar size='small' shape='square' icon={icon} />
            {label}
          </Space>
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 100,
      render: (status: Status) => {
        const { text, color } = StatusData[status]
        return <Badge color={color} text={text} />
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: (remark: string) => {
        return remark || '-'
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
      render: (record: SendTemplateItem) => (
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

export const editModalFormItems: (DataFromItem | DataFromItem[])[] = [
  [
    {
      name: 'name',
      label: '名称',
      type: 'input',
      formProps: {
        rules: [{ required: true, message: '请输入名称' }]
      },
      props: {
        placeholder: '请输入名称'
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
          .map(([key, value]) => ({ label: value.text, value: +key }))
      }
    }
  ],
  [
    {
      name: 'sendType',
      label: '通知类型',
      type: 'select',
      formProps: {
        rules: [{ required: true, message: '请选择通知类型' }]
      },
      props: {
        placeholder: '请选择通知类型',
        options: Object.entries(AlarmSendTypeData)
          .filter(([key]) => +key !== AlarmSendType.StrategyTypeUnknown)
          .map(([key, value]) => ({
            label: (
              <Space direction='horizontal'>
                <Avatar size='small' shape='square' icon={value.icon} />
                {value.label}
              </Space>
            ),
            value: +key
          }))
      }
    },
    {
      name: 'templateType',
      label: '模板类型',
      type: 'radio-group'
    }
  ],
  {
    name: 'content',
    label: '模板内容',
    type: 'textarea',
    formProps: {
      rules: [{ required: true, message: '请输入模板内容' }]
    },
    props: {
      placeholder: '请输入模板内容'
    }
  },
  {
    name: 'remark',
    label: '备注',
    type: 'textarea',
    props: {
      placeholder: '请输入备注',
      maxLength: 200,
      showCount: true
    }
  }
]
