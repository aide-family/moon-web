import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Space,
  Tag,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { emailService } from '../../../api/services'
import { EmailConfigItem, GlobalStatus } from '../../../api/types'

export default function EmailConfigs() {
  const [data, setData] = useState<EmailConfigItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<EmailConfigItem | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [page, pageSize, keyword])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await emailService.list({ page, pageSize, keyword })
      setData(res.data.items)
      setTotal(res.data.total)
    } catch {
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = async (item: EmailConfigItem) => {
    setEditingItem(item)
    const res = await emailService.get(item.uid)
    form.setFieldsValue(res.data)
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingItem) {
        await emailService.update(editingItem.uid, values)
        message.success('更新成功')
      } else {
        await emailService.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch {
      message.error('操作失败')
    }
  }

  const handleDelete = async (uid: string) => {
    try {
      await emailService.delete(uid)
      message.success('删除成功')
      loadData()
    } catch {
      message.error('删除失败')
    }
  }

  const handleStatusToggle = async (item: EmailConfigItem) => {
    try {
      const newStatus =
        item.status === GlobalStatus.ENABLED
          ? GlobalStatus.DISABLED
          : GlobalStatus.ENABLED
      await emailService.updateStatus(item.uid, newStatus)
      message.success('状态更新成功')
      loadData()
    } catch {
      message.error('状态更新失败')
    }
  }

  const columns = [
    { title: 'UID', dataIndex: 'uid', key: 'uid', width: 120, ellipsis: true },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '主机', dataIndex: 'host', key: 'host' },
    { title: '端口', dataIndex: 'port', key: 'port', width: 80 },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: GlobalStatus) =>
        status === GlobalStatus.ENABLED ? (
          <Tag color='success'>启用</Tag>
        ) : (
          <Tag color='default'>禁用</Tag>
        ),
    },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: EmailConfigItem) => (
        <Space>
          <Button type='link' size='small' onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            type='link'
            size='small'
            onClick={() => handleStatusToggle(record)}
          >
            {record.status === GlobalStatus.ENABLED ? '禁用' : '启用'}
          </Button>
          <Popconfirm
            title='确定删除？'
            onConfirm={() => handleDelete(record.uid)}
            okText='确定'
            cancelText='取消'
          >
            <Button type='link' danger size='small'>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
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
          新建邮件配置
        </Button>
      </div>

      <Table
        dataSource={data}
        columns={columns}
        rowKey='uid'
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
        title={editingItem ? '编辑邮件配置' : '新建邮件配置'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText='确定'
        cancelText='取消'
        width={600}
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            name='name'
            label='名称'
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder='配置名称' />
          </Form.Item>
          <Form.Item
            name='host'
            label='SMTP 主机'
            rules={[{ required: true, message: '请输入 SMTP 主机' }]}
          >
            <Input placeholder='smtp.example.com' />
          </Form.Item>
          <Form.Item
            name='port'
            label='端口'
            rules={[{ required: true, message: '请输入端口' }]}
          >
            <InputNumber
              placeholder='587'
              style={{ width: '100%' }}
              min={1}
              max={65535}
            />
          </Form.Item>
          <Form.Item
            name='username'
            label='用户名'
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder='user@example.com' />
          </Form.Item>
          <Form.Item
            name='password'
            label='密码'
            rules={[{ required: !editingItem, message: '请输入密码' }]}
          >
            <Input.Password
              placeholder={editingItem ? '留空表示不修改' : '请输入密码'}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
