/* eslint-disable @typescript-eslint/no-explicit-any */

import { DatasourceType, Status, StorageType } from '@/api/enum'
import { DatasourceItem } from '@/api/model-types'
import { Button, Flex, Form, Input, Select, Space, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import React from 'react'

export interface AlarmTemplateProps {
  datasource?: DatasourceItem
}

export const AlarmTemplate: React.FC<AlarmTemplateProps> = () => {
  const [data] = React.useState<DatasourceItem[]>([
    {
      id: 1,
      name: '模板1',
      status: Status.StatusEnable,
      remark: '模板描述',
      datasourceType: DatasourceType.DatasourceTypeUnknown,
      endpoint: '',
      createdAt: '',
      updatedAt: '',
      config: '',
      storageType: StorageType.StorageTypeUnknown
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
      dataIndex: 'remark',
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
      render: () => (
        <Space size='middle'>
          <a>详情</a>
          <a>删除</a>
        </Space>
      )
    }
  ]
  return (
    <>
      <Flex justify='space-between' align='center' gap={12} className='gap-3 pb-3'>
        <Button type='primary'>新建模板</Button>
        <Form layout='inline'>
          <Form.Item>
            <Select placeholder='请选择模板类型' />
          </Form.Item>
          <Form.Item>
            <Input.Search placeholder='请输入模板名称' className='w-[400px]' />
          </Form.Item>
        </Form>
      </Flex>
      <Table rowKey={(row) => row.id} columns={columns} dataSource={data} />
    </>
  )
}
