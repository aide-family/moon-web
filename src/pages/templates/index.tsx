import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Space,
  Tag,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { templateService } from '../../api/services'
import { TemplateItem, GlobalStatus, TemplateAPP } from '../../api/types'

export default function Templates() {
  const [data, setData] = useState<TemplateItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<TemplateItem | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [page, pageSize, keyword])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await templateService.list({ page, pageSize, keyword })
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
    form.setFieldsValue({ app: TemplateAPP.TEMPLATE_APP_EMAIL })
    setModalVisible(true)
  }

  const handleEdit = async (item: TemplateItem) => {
    setEditingItem(item)
    const res = await templateService.get(item.uid)
    form.setFieldsValue({
      name: res.data.name,
      app: res.data.app,
      jsonData: res.data.jsonData,
    })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingItem) {
        await templateService.update(editingItem.uid, values)
        message.success('更新成功')
      } else {
        await templateService.create(values)
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
      await templateService.delete(uid)
      message.success('删除成功')
      loadData()
    } catch {
      message.error('删除失败')
    }
  }

  const handleStatusToggle = async (item: TemplateItem) => {
    try {
      const newStatus =
        item.status === GlobalStatus.ENABLED
          ? GlobalStatus.DISABLED
          : GlobalStatus.ENABLED
      await templateService.updateStatus(item.uid, newStatus)
      message.success('状态更新成功')
      loadData()
    } catch {
      message.error('状态更新失败')
    }
  }

  const columns = [
    { title: 'UID', dataIndex: 'uid', key: 'uid', width: 120, ellipsis: true },
    { title: '名称', dataIndex: 'name', key: 'name' },
    {
      title: '应用类型',
      dataIndex: 'app',
      key: 'app',
      width: 100,
      render: (app: TemplateAPP) => {
        const appMap: Partial<Record<TemplateAPP, string>> = {
          [TemplateAPP.TEMPLATE_APP_EMAIL]: '邮件',
          [TemplateAPP.TEMPLATE_APP_WEBHOOK_OTHER]: 'Webhook',
          [TemplateAPP.TEMPLATE_APP_WEBHOOK_DINGTALK]: '钉钉',
          [TemplateAPP.TEMPLATE_APP_WEBHOOK_WECHAT]: '微信',
          [TemplateAPP.TEMPLATE_APP_WEBHOOK_FEISHU]: '飞书',
        }
        return appMap[app] || <Tag color='default'>未知</Tag>
      },
    },
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
      render: (_: unknown, record: TemplateItem) => (
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
          新建模板
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
        title={editingItem ? '编辑模板' : '新建模板'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText='确定'
        cancelText='取消'
        width={800}
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            name='name'
            label='名称'
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder='模板名称' />
          </Form.Item>
          <Form.Item
            name='app'
            label='应用类型'
            rules={[{ required: true, message: '请选择应用类型' }]}
          >
            <Select>
              <Select.Option value={TemplateAPP.TEMPLATE_APP_EMAIL}>
                邮件
              </Select.Option>
              <Select.Option value={TemplateAPP.TEMPLATE_APP_WEBHOOK_OTHER}>
                Webhook
              </Select.Option>
              <Select.Option value={TemplateAPP.TEMPLATE_APP_WEBHOOK_DINGTALK}>
                钉钉
              </Select.Option>
              <Select.Option value={TemplateAPP.TEMPLATE_APP_WEBHOOK_WECHAT}>
                微信
              </Select.Option>
              <Select.Option value={TemplateAPP.TEMPLATE_APP_WEBHOOK_FEISHU}>
                飞书
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name='jsonData'
            label='模板内容 (JSON)'
            rules={[{ required: true, message: '请输入模板内容' }]}
          >
            <Input.TextArea
              placeholder='{"subject": "{{title}}", "body": "{{content}}"}'
              rows={10}
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
