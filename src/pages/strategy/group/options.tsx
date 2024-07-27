import { Condition, Status, StatusData, SustainType, SearchFormItem } from '@/api/global'
import { Button, Tooltip, Badge, Space } from 'antd'
import { DataFromItem } from '@/components/data/form'
import MoreMenu from "@/components/moreMenu"

export type GroupEditModalFormData = {
  name: string,
  remark: string,
  status: number,
  categoriesIds: number[],
  teamId: number
}

export const formList: SearchFormItem[] = [
  {
    type: 1,
    label: '名称',
    name: 'keyword',
    placeholder: '规则组名称',
    allowClear: true,
  },
  {
    type: 4,
    name: 'teamId',
    label: '分类',
    placeholder: '规则分类',
    allowClear: true,
    options: [],
  },
  {
    type: 4,
    name: 'status',
    label: '状态',
    placeholder: '规则组状态',
    allowClear: true,
    options: Object.entries(StatusData).map(([key, value]) => {
      return {
        label: value.text,
        value: Number(key),
      }
    }),
  },
];
interface GroupColumnProps {
  onHandleMenuOnClick: Function
}

export const getColumnList = (props: GroupColumnProps) => {
  let { onHandleMenuOnClick } = props
  const tableOperationItems = (
    record: StrategyGroupItemType
  ): MenuProps['items'] => [
      record.status === Status.STATUS_DISABLED
        ? {
          key: 1,
          label: (
            <Button
              type="link"
              size="small"
  
            >
              启用
            </Button>
          )
        }
        : {
          key: 1,
          label: (
            <Button
              type="link"
              size="small"
              danger
  
            >
              禁用
            </Button>
          )
        },
      {
        key: 5,
        label: (
          <Button
            size="small"
            type="link"
  
          >
            操作日志
          </Button>
        )
      },
      {
        key: 6,
        label: (
          <Button
            size="small"
            type="link"
  
          >
            编辑
          </Button>
        )
      },
      {
        key: 7,
        label: (
          <Button
          type="link"
          size="small"
          danger

        >
            删除
          </Button>
        )
      },
    ]
  
  return [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      align: "center",
      width: 60,
      fixed: 'left',
      render: (text: any, record: any, index: any) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      align: "center",
      width: 200,
      render: (text: string) => {
        return (
          <Tooltip
            placement="top"
            title={() => {
              return <div>{text}</div>
            }}
          >
            <span
            >
              {text ? text : "-"}
            </span>
          </Tooltip>
        );
      }
    },
    {
      title: '类型',
      dataIndex: 'categories',
      key: 'categories',
      align: "center",
      width: 160,
      render: (categories?: SelectType[]) => (
        <>
          {categories?.map((item, index) => {
            const { label, extend } = item
            return (
              <Tag key={index} color={extend?.color}>
                {label}
              </Tag>
            )
          })}
        </>
      ),
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
      },
    },
    {
      // 策略数量
      title: '策略数量',
      dataIndex: 'strategyCount',
      key: 'strategyCount',
      width: 120,
      align: 'center',
      render: (
        strategyCount: number | string,
        record: StrategyGroupItemType
      ) => {
        return (
          <b>
            <span style={{ color: '' }}>{strategyCount}</span>
            {' / '}
            <span style={{ color: 'green' }}>
              {record.enableStrategyCount}
            </span>
          </b>
        )
      }
    },
    {
      title: '描述',
      dataIndex: 'remark',
      key: 'remark',
      align: "center",
      width: 300,
      render: (text: string) => {
        return (
          <Tooltip
            placement="top"
            title={() => {
              return <div>{text}</div>
            }}
          >
            <span
            >
              {text ? text : "-"}
            </span>
          </Tooltip>
        );
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: "center",
      width: 180,
      render: (text: string) => {
        return (
          <Tooltip
            placement="top"
            title={() => {
              return <div>{text}</div>
            }}
          >
            <span
            >
              {text ? text : "-"}
            </span>
          </Tooltip>
        );
      }
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      align: "center",
      width: 180,
      render: (text: string) => {
        return (
          <Tooltip
            placement="top"
            title={() => {
              return <div>{text}</div>
            }}
          >
            <span
            >
              {text ? text : "-"}
            </span>
          </Tooltip>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      align: "center",
      ellipsis: true,
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size={20}>
          <Button size='small' type='link' onClick={() => onHandleMenuOnClick(record, '1')}>
            详情
          </Button>
          {tableOperationItems && tableOperationItems?.length > 0 && (
            <MoreMenu
              items={tableOperationItems(record)}
              onClick={(key) =>{
                onHandleMenuOnClick(record, key)
               }
               
              }
            />
          )}
        </Space>
      ),
    },
  ]
}