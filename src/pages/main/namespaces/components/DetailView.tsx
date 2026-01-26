import React from 'react'
import { Modal, Descriptions, Tag, Button, Space } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import type { NamespaceItem } from '@/api/namespace/index'
import dayjs from 'dayjs'

interface DetailViewProps {
  open: boolean
  data?: NamespaceItem | null
  onCancel: () => void
  onEdit?: (data: NamespaceItem) => void
}

const DetailView: React.FC<DetailViewProps> = ({ open, data, onCancel, onEdit }) => {

  // 处理编辑
  const handleEdit = () => {
    if (data && onEdit) {
      onEdit(data)
    }
  }

  // 状态映射
  const getStatusInfo = (status: number) => {
    const statusMap: Record<number, { text: string; color: string }> = {
      0: { text: '未知', color: 'default' },
      1: { text: '启用', color: 'success' },
      2: { text: '禁用', color: 'error' },
    }
    return statusMap[status] || statusMap[0]
  }

  return (
    <Modal
      title="命名空间详情"
      open={open}
      onCancel={onCancel}
      footer={
        <Space>
          <Button onClick={onCancel}>关闭</Button>
          {data && onEdit && (
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
              编辑
            </Button>
          )}
        </Space>
      }
      width={700}
      destroyOnClose
    >
      {data ? (
        <Descriptions column={1} bordered>
          <Descriptions.Item label="UID">{data.uid}</Descriptions.Item>
          <Descriptions.Item label="名称">{data.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={getStatusInfo(data.status).color}>
              {getStatusInfo(data.status).text}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {data.createdAt ? dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {data.updatedAt ? dayjs(data.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          {data.metadata && Object.keys(data.metadata).length > 0 && (
            <Descriptions.Item label="元数据">
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(data.metadata, null, 2)}
              </pre>
            </Descriptions.Item>
          )}
        </Descriptions>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>暂无数据</div>
      )}
    </Modal>
  )
}

export default DetailView
