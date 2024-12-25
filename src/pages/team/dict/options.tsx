import { DictType, Status } from '@/api/enum'
import { ActionKey, DictTypeData, StatusData } from '@/api/global'
import type { DictItem } from '@/api/model-types'
import type { DataFromItem } from '@/components/data/form'
import type { SearchFormItem } from '@/components/data/search-box'
import type { MoreMenuProps } from '@/components/moreMenu'
import MoreMenu from '@/components/moreMenu'
import { Badge, Button, Space } from 'antd'
import type { Color } from 'antd/es/color-picker'
import type { ColumnsType } from 'antd/es/table'

export const formList: SearchFormItem[] = [
  {
    name: 'keyword',
    label: '名称',
    dataProps: {
      type: 'input',
      itemProps: {
        placeholder: '字典名称',
        allowClear: true
      }
    }
  },
  {
    name: 'dictType',
    label: '字典类型',
    dataProps: {
      type: 'select',
      itemProps: {
        placeholder: '字典类型',
        allowClear: true,
        options: Object.entries(DictTypeData).map(([key, value]) => {
          return {
            label: value,
            value: Number(key)
          }
        })
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
  onHandleMenuOnClick: (item: DictItem, key: ActionKey) => void
  current: number
  pageSize: number
}

export const getColumnList = (props: GroupColumnProps): ColumnsType<DictItem> => {
  const { onHandleMenuOnClick, current, pageSize } = props
  const tableOperationItems = (record: DictItem): MoreMenuProps['items'] => [
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
      fixed: 'left',
      render: (_, __, index: number) => {
        return <span>{(current - 1) * pageSize + index + 1}</span>
      }
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string, record: DictItem) => {
        return (
          <Space className='w-full'>
            <div className='w-4 h-4' style={{ background: record.cssClass }} />
            {name}
          </Space>
        )
      }
    },
    {
      title: '编码',
      dataIndex: 'value',
      key: 'value',
      width: 160
    },
    {
      title: '语言',
      dataIndex: 'languageCode',
      key: 'languageCode',
      width: 160
    },
    {
      title: '类型',
      dataIndex: 'dictType',
      key: 'dictType',
      width: 160,
      render: (dictType: DictType) => {
        return <>{DictTypeData[dictType]}</>
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
      render: (_, record: DictItem) => (
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

export interface CreateDictFormType {
  name: string
  value: string
  dictType: DictType
  colorType: string
  cssClass: Color | string
  icon: string
  imageUrl: string
  status: Status
  languageCode: string
  remark: string
}
export const editModalFormItems = (colorType: ColorType): (DataFromItem | DataFromItem[])[] => [
  [
    {
      name: 'dictType',
      label: '字典类型',
      type: 'select',
      formProps: {
        rules: [{ required: true, message: '请选择字典类型' }]
      },
      props: {
        placeholder: '请选择字典类型',
        options: Object.entries(DictTypeData)
          .filter(([key]) => {
            return +key !== DictType.DictTypeUnknown
          })
          .map(([key, value]) => {
            return {
              label: value,
              value: Number(key)
            }
          })
      }
    },
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
        options: ['zh-CN', 'en-US'].map((item) => ({
          label: item,
          value: item
        }))
      }
    }
  ],
  [
    {
      name: 'colorType',
      label: '颜色类型',
      type: 'select',
      props: {
        placeholder: '请选择颜色类型',
        options: ['hex', 'rgb', 'hsb'].map((item) => ({
          label: item,
          value: item
        }))
      }
    },
    {
      name: 'cssClass',
      label: '颜色',
      type: 'color',
      props: {
        format: colorType,
        showText: true
      }
    }
  ],
  [
    {
      name: 'icon',
      label: '图标',
      type: 'input',
      props: {
        placeholder: '请输入图标'
      }
    },
    {
      name: 'imageUrl',
      label: '图片',
      type: 'input',
      props: {
        placeholder: '请输入图片URL'
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
