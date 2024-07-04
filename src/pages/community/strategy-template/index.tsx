import { Status, StatusData } from '@/api/global'
import { getStrategyTemplateList } from '@/api/template'
import {
  GetStrategyTemplateListRequest,
  StrategyTemplateItemType,
} from '@/api/template/types'
import { Flex, Button, Form, Table, Space, Badge, theme } from 'antd'
import { ColumnsType } from 'antd/es/table'
import React, { useEffect, useState } from 'react'
import SearchForm from '@/components/data/search-form'
import { searchItems } from './options'

import './index.scss'

export interface StrategyTemplateProps {}

const { useToken } = theme

const defaultSearchParams: GetStrategyTemplateListRequest = {
  pagination: {
    pageNum: 1,
    pageSize: 10,
  },
  keyword: '',
  status: Status.ALL,
}

let searchTimeout: NodeJS.Timeout | null = null
const StrategyTemplate: React.FC<StrategyTemplateProps> = () => {
  const [form] = Form.useForm()
  const { token } = useToken()
  const [datasource, setDatasource] = useState<StrategyTemplateItemType[]>([])
  const [searchPrams, setSearchPrams] =
    useState<GetStrategyTemplateListRequest>(defaultSearchParams)
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [total, setTotal] = useState(0)

  function onRefresh() {
    setRefresh(!refresh)
  }

  function fetchData() {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    searchTimeout = setTimeout(() => {
      setLoading(true)
      getStrategyTemplateList(searchPrams)
        .then(({ list, pagination }) => {
          setDatasource(list)
          setTotal(pagination.total)
        })
        .finally(() => setLoading(false))
    }, 500)
  }

  const columns: ColumnsType<StrategyTemplateItemType> = [
    {
      title: '模板名称',
      dataIndex: 'alert',
      key: 'alert',
      render: (text) => <a>{text}</a>,
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
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size='middle'>
          <a onClick={() => showDetail(record.id)}>详情</a>
          <a onClick={() => onDelete(record.id)}>删除</a>
        </Space>
      ),
    },
  ]
  function showDetail(id: number) {
    console.log(id)
  }

  function onDelete(id: number) {
    console.log(id)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onValuesChange(_: any, allValues: any) {
    setSearchPrams((prev) => {
      return {
        ...prev,
        ...allValues,
      }
    })
  }

  useEffect(() => {
    onRefresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchPrams])

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh])

  return (
    <div className='box'>
      <div
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius,
        }}
      >
        <SearchForm
          initialValues={defaultSearchParams}
          items={searchItems}
          form={form}
          layout='inline'
          className='search'
          onValuesChange={onValuesChange}
        />

        <Flex justify='space-between' align='center' gap={12} className='op'>
          <Button type='primary'>新建模板</Button>
          <Space size={8}>
            <Button type='primary' onClick={onRefresh}>
              刷新
            </Button>
            <Button>导出</Button>
          </Space>
        </Flex>
      </div>
      <Table
        className='table'
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius,
        }}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={datasource}
        loading={loading}
        pagination={{
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => {
            setSearchPrams({
              ...searchPrams,
              pagination: {
                pageNum: page,
                pageSize: pageSize,
              },
            })
          },
        }}
      />
    </div>
  )
}

export default StrategyTemplate
