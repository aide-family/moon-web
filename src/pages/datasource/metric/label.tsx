import { getMetric } from '@/api/datasource/metric'
import { MetricType } from '@/api/enum'
import { MetricTypeData } from '@/api/global'
import { MetricItem, MetricLabelItem } from '@/api/model-types'
import { GlobalContext } from '@/utils/context'
import { message, Modal, ModalProps, Space, Table, Tag } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { Network } from 'lucide-react'
import React, { useContext, useEffect } from 'react'
import { LabelEditModal } from './label-edit-modal'

export interface LabelProps extends ModalProps {
  metricDetail?: MetricItem
}

let searchTimer: NodeJS.Timeout | null = null
export const Label: React.FC<LabelProps> = (props) => {
  const { theme } = useContext(GlobalContext)
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
      width: 400
    },
    {
      title: '标签值',
      dataIndex: 'value',
      key: 'value',
      ellipsis: true,
      render(_, record) {
        return (
          <Space size={4} wrap>
            {record.values.map((item, index) => (
              <Tag
                key={`${index}-${item}`}
                bordered={false}
                onClick={() => {
                  navigator.clipboard.writeText(item).then(() => {
                    message.success('复制成功')
                  })
                }}
                className={
                  theme === 'dark'
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 transition-colors'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors'
                }
              >
                {item}
              </Tag>
            ))}
          </Space>
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
            <Network className='h-6 w-6 text-blue-500' />
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
