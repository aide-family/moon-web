/* eslint-disable @typescript-eslint/no-explicit-any */
import { MenuType, Status } from '@/api/enum'
import { ActionKey, StatusData } from '@/api/global'
import type { MenuItem, ResourceItem } from '@/api/model-types'
import type { DataFromItem } from '@/components/data/form'
import type { SearchFormItem } from '@/components/data/search-box'
import { renderIcon } from '@/components/icon'
import type { MoreMenuProps } from '@/components/moreMenu'
import MoreMenu from '@/components/moreMenu'
import { Badge, Button, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'

export const formList: SearchFormItem[] = [
  {
    name: 'keyword',
    label: '名称',
    dataProps: {
      type: 'input',
      itemProps: {
        placeholder: '资源名称模糊查询',
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
  onHandleResourceOnClick: (item: ResourceItem, key: ActionKey) => void
  current: number
  pageSize: number
}
interface MenuColumnProps {
  onHandleMenuOnClick: (item: MenuItem, key: ActionKey) => void
}

export const getColumnList = (props: GroupColumnProps): ColumnsType<ResourceItem> => {
  const { onHandleResourceOnClick, current, pageSize } = props
  const tableOperationItems = (record: ResourceItem): MoreMenuProps['items'] => [
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
      title: '资源地址',
      dataIndex: 'path',
      key: 'path',
      width: 160
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
      render: (_, record: ResourceItem) => (
        <Space size={20}>
          <Button size='small' type='link' onClick={() => onHandleResourceOnClick(record, ActionKey.DETAIL)}>
            详情
          </Button>
          {tableOperationItems && tableOperationItems?.length > 0 && (
            <MoreMenu
              items={tableOperationItems(record)}
              onClick={(key: ActionKey) => {
                onHandleResourceOnClick(record, key)
              }}
            />
          )}
        </Space>
      )
    }
  ]
}

export const editModalFormItems: (DataFromItem | DataFromItem[])[] = [
  {
    name: 'name',
    label: '名称',
    type: 'input',
    formProps: {
      rules: [{ required: true, message: '请输入资源名称' }]
    },
    props: {
      placeholder: '请输入资源名称'
    }
  },
  {
    name: 'path',
    label: '资源地址',
    type: 'input'
  },
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

export const getMenuColumnList = (props: MenuColumnProps): ColumnsType<MenuItem> => {
  const { onHandleMenuOnClick } = props
  const tableOperationItems = (record: MenuItem): MoreMenuProps['items'] => [
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
        <Button type='link' size='small'>
          编辑
        </Button>
      )
    },
    {
      key: ActionKey.DETAIL,
      label: (
        <Button type='link' size='small'>
          详情
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
    // {
    //   title: '序号',
    //   dataIndex: 'index',
    //   key: 'index',
    //   width: 60,
    //   render: (_, __, index: number) => {
    //     return <span>{(current - 1) * pageSize + index + 1}</span>
    //   }
    // },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      width: 160
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 160,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (icon: any) => {
        return renderIcon(icon)
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
      render: (_, record: MenuItem) => (
        <Space size={20}>
          <Button size='small' type='link' onClick={() => onHandleMenuOnClick(record, ActionKey.ADD)}>
            新增
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

export const menuEditModalFormItems = (formData: any) => {
  return [
    {
      name: 'menuType',
      label: '菜单类型',
      type: 'radio-group',
      props: {
        placeholder: '请选择菜单类型',
        options: [
          {
            label: '菜单',
            value: MenuType.MenuTypeMenu
          },
          {
            label: '按钮',
            value: MenuType.MenuTypeButton
          }
        ]
      },
      formProps: {
        rules: [{ required: true, message: '请选择菜单类型' }]
      }
    },
    {
      name: 'name',
      label: '菜单名称',
      type: 'input',
      formProps: {
        hidden: formData?.menuType === MenuType.MenuTypeButton,
        rules: [formData?.menuType === MenuType.MenuTypeMenu && { required: true, message: '请输入菜单名称' }]
      },
      props: {
        placeholder: '请输入菜单名称'
      }
    },
    {
      name: 'path',
      label: '路径',
      type: 'input',
      formProps: {
        hidden: formData?.menuType === MenuType.MenuTypeButton,
        rules: [formData?.menuType === MenuType.MenuTypeMenu && { required: true, message: '请输入路径' }]
      },
      props: {
        placeholder: '请输入路径'
      }
    },
    {
      name: 'status',
      label: '状态',
      type: 'select',
      formProps: {
        rules: [{ required: true, message: '请选择状态' }]
      },
      props: {
        placeholder: '请选择状态',
        options: [
          {
            label: '启用',
            value: Status.StatusEnable
          },
          {
            label: '禁用',
            value: Status.StatusDisable
          }
        ]
      }
    },
    {
      name: 'icon',
      label: '图标',
      type: 'input',
      formProps: {
        hidden: formData?.menuType === MenuType.MenuTypeButton
      },
      props: {
        placeholder: '请输入图标'
      }
    },
    {
      name: 'component',
      label: '组件',
      type: 'input',
      formProps: {
        hidden: formData?.menuType === MenuType.MenuTypeButton
      },
      props: {
        placeholder: '请输入组件'
      }
    },
    {
      name: 'permission',
      label: '权限',
      type: 'input',
      formProps: {
        rules: [{ required: true, message: '请输入权限' }]
      },
      props: {
        placeholder: '请输入权限'
      }
    }
  ] as (DataFromItem | DataFromItem[])[]
}
