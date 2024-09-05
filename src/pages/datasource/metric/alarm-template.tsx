/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatasourceItemType } from '@/api/datasource/types'
import { Button, Flex, Form, Input, Select, Space, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import React from 'react'

export interface AlarmTemplateProps {
  datasource?: DatasourceItemType
}

export const AlarmTemplate: React.FC<AlarmTemplateProps> = (props) => {
  const { datasource } = props
  const [data, setData] = React.useState<any[]>([
    {
      id: 1,
      name: '模板1',
      category: '告警模板',
      status: '启用',
      description: '模板描述',
      creator: 'admin'
    }
  ])
  const columns: ColumnsType<any> = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>
    },
    {
      title: '类型',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <a>{text}</a>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text) => <a>{text}</a>
    },
    {
      title: '模板描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator'
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size='middle'>
          <a>详情</a>
          <a>删除</a>
        </Space>
      )
    }
  ]
  return (
    <div className='alarm-template'>
      <Flex justify='space-between' align='center' gap={12} className='op'>
        <Button type='primary'>新建模板</Button>
        <Form layout='inline'>
          <Form.Item>
            <Select placeholder='请选择模板类型' className='select' />
          </Form.Item>
          <Form.Item>
            <Input.Search placeholder='请输入模板名称' className='search' />
          </Form.Item>
        </Form>
      </Flex>
      <Table rowKey={(row) => row.id} columns={columns} dataSource={data} />
    </div>
  )
}
