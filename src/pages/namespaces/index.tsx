import { PlusOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import {
  Button,
  Descriptions,
  Drawer,
  Dropdown,
  Form,
  Input,
  message,
  Modal,
  Space,
  Table,
  Tag,
} from 'antd'
import { ColumnType } from 'antd/es/table'
import { useCallback, useEffect, useState } from 'react'
import { namespaceService } from '../../api/services'
import { GlobalStatus, NamespaceItem } from '../../api/types'

export default function Namespaces() {
  const [data, setData] = useState<NamespaceItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<NamespaceItem | null>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [detailItem, setDetailItem] = useState<NamespaceItem | null>(null)
  const [deletingName, setDeletingName] = useState<string | null>(null)
  const [form] = Form.useForm()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await namespaceService.list({ page, pageSize, keyword })
      setData(res.data.items)
      setTotal(res.data.total)
    } catch {
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, keyword])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreate = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = async (item: NamespaceItem) => {
    try {
      setEditingItem(item)
      const res = await namespaceService.get(item.name)
      const ns = res.data
      form.setFieldsValue({
        name: ns.name,
        metadataJson: ns.metadata ? JSON.stringify(ns.metadata, null, 2) : '',
      })
      setModalVisible(true)
    } catch {
      message.error('加载详情失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      let metadata: Record<string, string> | undefined
      if (values.metadataJson) {
        try {
          const parsed = JSON.parse(values.metadataJson)
          if (parsed && typeof parsed === 'object') {
            metadata = parsed
          } else {
            throw new Error('元数据需为对象')
          }
        } catch {
          message.error('元数据 JSON 无效')
          return
        }
      }

      if (editingItem) {
        await namespaceService.save({
          name: editingItem.name,
          metadata,
        })
        message.success('更新成功')
      } else {
        await namespaceService.save({ name: values.name, metadata })
        message.success('创建成功')
      }
      setModalVisible(false)
      setEditingItem(null)
      loadData()
    } catch {
      message.error('操作失败')
    }
  }

  const handleDelete = async (name: string) => {
    try {
      await namespaceService.delete(name)
      message.success('删除成功')
      setDeletingName(null)
      loadData()
    } catch {
      message.error('删除失败')
    }
  }

  const handleStatusToggle = async (item: NamespaceItem) => {
    try {
      const newStatus =
        item.status === GlobalStatus.ENABLED
          ? GlobalStatus.DISABLED
          : GlobalStatus.ENABLED
      await namespaceService.updateStatus(item.name, newStatus)
      message.success('状态更新成功')
      loadData()
    } catch {
      message.error('状态更新失败')
    }
  }

  const handleViewDetail = (record: NamespaceItem) => {
    setDetailItem(record)
    setDrawerVisible(true)
  }

  const handleMenuClick = (key: string, record: NamespaceItem) => {
    if (key === 'status') {
      handleStatusToggle(record)
    } else if (key === 'delete') {
      setDeletingName(record.name)
    }
  }

  const columns: ColumnType<NamespaceItem>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status: GlobalStatus) =>
        status === GlobalStatus.ENABLED ? (
          <Tag color='success'>启用</Tag>
        ) : (
          <Tag color='error'>禁用</Tag>
        ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      render: (_: unknown, record: NamespaceItem) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'status',
            label:
              record.status === GlobalStatus.DISABLED ? (
                <Button size='small' variant='link' color='green'>
                  启用
                </Button>
              ) : (
                <Button size='small' variant='link' color='red'>
                  禁用
                </Button>
              ),
          },
          {
            key: 'edit',
            label: (
              <Button type='link' size='small' variant='link' color='blue'>
                编辑
              </Button>
            ),
            onClick: () => handleEdit(record),
          },
          { type: 'divider' },
          {
            key: 'delete',
            label: (
              <Button type='link' size='small' danger>
                删除
              </Button>
            ),
            onClick: () => handleDelete(record.name),
          },
        ]

        return (
          <Space>
            <Button
              type='link'
              size='small'
              onClick={() => handleViewDetail(record)}
            >
              详情
            </Button>
            <Dropdown
              menu={{
                items: menuItems,
                onClick: ({ key }) => handleMenuClick(key, record),
              }}
              trigger={['click']}
            >
              <Button type='link' size='small'>
                更多
              </Button>
            </Dropdown>
          </Space>
        )
      },
    },
  ]

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Input.Search
          placeholder='搜索名称'
          onSearch={setKeyword}
          style={{ width: 300 }}
          allowClear
        />
        <Button type='primary' icon={<PlusOutlined />} onClick={handleCreate}>
          新建命名空间
        </Button>
      </div>

      <Table
        dataSource={data}
        columns={columns}
        rowKey='name'
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => {
            setPage(p)
            setPageSize(ps)
          },
        }}
      />

      <Modal
        title={editingItem ? '编辑命名空间' : '新建命名空间'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText='确定'
        cancelText='取消'
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            name='name'
            label='名称'
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder='请输入命名空间名称' disabled={!!editingItem} />
          </Form.Item>
          <Form.Item name='metadataJson' label='元数据 (JSON)'>
            <Input.TextArea placeholder='{"key":"value"}' rows={6} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title='命名空间详情'
        placement='right'
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        {detailItem && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label='名称'>
              {detailItem.name}
            </Descriptions.Item>
            <Descriptions.Item label='状态'>
              {detailItem.status === GlobalStatus.ENABLED ? (
                <Tag color='success'>启用</Tag>
              ) : (
                <Tag color='default'>禁用</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label='创建时间'>
              {detailItem.createdAt}
            </Descriptions.Item>
            <Descriptions.Item label='更新时间'>
              {detailItem.updatedAt}
            </Descriptions.Item>
            {detailItem.metadata && (
              <Descriptions.Item label='元数据'>
                <pre>{JSON.stringify(detailItem.metadata, null, 2)}</pre>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Drawer>

      <Modal
        title='确认删除'
        open={!!deletingName}
        onOk={() => deletingName && handleDelete(deletingName)}
        onCancel={() => setDeletingName(null)}
        okText='确定'
        cancelText='取消'
        okButtonProps={{ danger: true }}
      >
        <p>确定要删除命名空间 "{deletingName}" 吗？</p>
        <p style={{ color: '#ff4d4f' }}>删除后无法恢复，请确认是否继续</p>
      </Modal>
    </div>
  )
}
