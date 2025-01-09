import { getMetric } from '@/api/datasource/metric'
import { MetricType } from '@/api/enum'
import { MetricTypeData } from '@/api/global'
import { MetricItem, MetricLabelItem } from '@/api/model-types'
import { Modal, ModalProps, Space, Table, Tag } from 'antd'
import { ColumnsType } from 'antd/es/table'
import React, { useEffect } from 'react'
import { LabelEditModal } from './label-edit-modal'

export interface LabelProps extends ModalProps {
  metricDetail?: MetricItem
}

let searchTimer: NodeJS.Timeout | null = null
export const Label: React.FC<LabelProps> = (props) => {
  const { metricDetail, open, onCancel, onOk } = props
  const [metricLabels, setMetricLabels] = React.useState<MetricLabelItem[]>([])
  const [metricLabelDetail, setMetricLabelDetail] = React.useState<MetricLabelItem>()
  const [openEditModal, setOpenEditModal] = React.useState(false)

  const handleEditModalOnOK = () => {
    setOpenEditModal(false)
    getMetricLabels()
  }

  const handleOnCancel = () => {
    setOpenEditModal(false)
    setMetricLabelDetail(undefined)
  }

  const columns: ColumnsType<MetricLabelItem> = [
    {
      title: '标签名',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: 300
    },
    {
      title: '标签值',
      dataIndex: 'value',
      key: 'value',
      ellipsis: true,
      render(_, record) {
        return (
          <>
            {record.values.map((item, index) => (
              <Tag key={`${index}-${item}`}>{item}</Tag>
            ))}
          </>
        )
      }
    }
    // {
    //   title: '备注',
    //   dataIndex: 'remark',
    //   key: 'remark',
    //   render(value) {
    //     return <div>{value || '-'}</div>
    //   }
    // }
    // {
    //   title: '操作',
    //   key: 'op',
    //   width: 120,
    //   align: 'center',
    //   render: (_, record) => {
    //     return (
    //       <Space>
    //         <Button size='small' type='link' onClick={() => handleEdit(record)}>
    //           编辑
    //         </Button>
    //       </Space>
    //     )
    //   }
    // }
  ]

  const getMetricLabels = async () => {
    if (metricDetail) {
      if (searchTimer) {
        clearTimeout(searchTimer)
      }
      searchTimer = setTimeout(async () => {
        const res = await getMetric({
          id: metricDetail.id
        })
        setMetricLabels(res?.data?.labels || [])
      }, 500)
    }
  }

  const getMetricType = (metricType?: MetricType) => {
    if (!metricType) {
      return {
        color: '',
        text: '未知'
      }
    }
    return MetricTypeData[metricType]
  }

  useEffect(() => {
    getMetricLabels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metricDetail])

  return (
    <>
      <LabelEditModal
        labelDetail={metricLabelDetail}
        open={openEditModal}
        onCancel={handleOnCancel}
        onOk={handleEditModalOnOK}
      />
      <Modal
        title={
          <Space>
            {metricDetail?.name}
            <Tag color={getMetricType(metricDetail?.type).color}>{getMetricType(metricDetail?.type).text}</Tag>
          </Space>
        }
        width='60%'
        open={open}
        onCancel={onCancel}
        onOk={onOk}
        footer={false}
      >
        <Table
          size='small'
          pagination={false}
          scroll={{ y: 400, x: true }}
          columns={columns}
          dataSource={metricLabels}
        />
      </Modal>
    </>
  )
}
