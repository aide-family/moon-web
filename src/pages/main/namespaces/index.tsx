import React, { useState } from 'react'
import { Table, Input, Radio, Button, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { getNamespaceTableList, type NamespaceItem, type NamespaceListParams } from '@/api/namespace/index'
import dayjs from 'dayjs'

const NamespaceList: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<NamespaceItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [searchParams, setSearchParams] = useState<NamespaceListParams>({
    keyword: '',
    status: undefined,
  })

  // 获取数据
  const fetchData = async () => {
    setLoading(true)
    try {
      const params: NamespaceListParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword: searchParams.keyword || undefined,
        status: searchParams.status,
      }
      const response = await getNamespaceTableList(params)
      if (response) {
        setDataSource(response.items || [])
        setPagination(prev => ({
          ...prev,
          total: parseInt(response.total || '0', 10),
        }))
      }
    } catch (error) {
      console.error('获取命名空间列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 处理搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchData()
  }

  // 处理重置
  const handleReset = () => {
    setSearchParams({
      keyword: '',
      status: undefined,
    })
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    })
    // 重置后查询
    fetchData()
  }

  // 处理表格变化（分页）
  const handleTableChange = (page: number, pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize,
    }))
    // 分页变化时查询
    setTimeout(() => {
      fetchData()
    }, 0)
  }

  // 表格列定义
  const columns: ColumnsType<NamespaceItem> = [
    {
      title: 'UID',
      dataIndex: 'uid',
      key: 'uid',
      width: 200,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => {
        const statusMap: Record<number, { text: string; color: string }> = {
          0: { text: '未知', color: 'default' },
          1: { text: '启用', color: 'success' },
          2: { text: '禁用', color: 'error' },
        }
        const statusInfo = statusMap[status] || statusMap[0]
        return <span style={{ color: statusInfo.color }}>{statusInfo.text}</span>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
  ]

  return (
    <div className="p-4">
      <div className="mb-4">
        <Space size="middle" wrap>
          <Input
            placeholder="请输入关键字"
            allowClear
            style={{ width: 200 }}
            value={searchParams.keyword}
            onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
          />
          <Radio.Group
            value={searchParams.status}
            onChange={(e) => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
            buttonStyle="solid"
          >
            <Radio.Button value={undefined}>全部</Radio.Button>
            <Radio.Button value={1}>启用</Radio.Button>
            <Radio.Button value={2}>禁用</Radio.Button>
          </Radio.Group>
          <Button icon={<SearchOutlined />} onClick={handleSearch} type="primary">
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="uid"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: handleTableChange,
          onShowSizeChange: handleTableChange,
        }}
      />
    </div>
  )
}

export default NamespaceList
