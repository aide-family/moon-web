import { Status, StatusData } from '@/api/global'
import SearchForm from '@/components/data/search-form'
import { Flex, Button, Form, Table, Space, Badge } from 'antd'
import React from 'react'
import { text } from 'stream/consumers'

export interface StrategyTemplateProps {}

const StrategyTemplate: React.FC<StrategyTemplateProps> = () => {
  const [form] = Form.useForm()
  const [data, setData] = React.useState<any[]>([
    {
      id: 1,
      name: '模板1',
      category: '告警模板',
      status: 1,
      description: '模板描述',
      creator: 'admin',
    },
  ])
  const columns: ColumnsType<any> = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'category',
      key: 'category',
      width: 200,
      render: (text) => <a>{text}</a>,
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
      },
    },
    {
      title: '模板描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size='middle'>
          <a>详情</a>
          <a>删除</a>
        </Space>
      ),
    },
  ]
  return (
    <div>
      <SearchForm
        props={{ form }}
        items={[
          {
            label: '模板名称',
            name: 'name',
            type: 'input',
            props: {
              placeholder: '请输入模板名称',
            },
          },
          {
            label: '模板类型',
            name: 'type',
            type: 'select',
            props: {
              placeholder: '请选择模板类型',
              options: [
                {
                  label: '模板类型1',
                  value: 1,
                },
                {
                  label: '模板类型2',
                  value: 2,
                },
              ],
            },
          },
        ]}
      />
      <Flex justify='space-between' align='center' gap={12} className='op'>
        <Button type='primary'>新建模板</Button>
        <span>
          <Button>刷新</Button>
          <Button>导出</Button>
        </span>
      </Flex>
      <Table columns={columns} dataSource={data} />
    </div>
  )
}

export default StrategyTemplate
