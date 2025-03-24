import { StatusData } from '@/api/global'
import { TimeEngineItem } from '@/api/model-types'
import { getTimeEngine } from '@/api/notify/time-engine'
import { useRequest } from 'ahooks'
import { Avatar, Badge, Descriptions, DescriptionsProps, Modal, Space, Tag, Tooltip } from 'antd'
import { useEffect, useState } from 'react'

export interface EngineDetailModalProps {
  Id: number
  open?: boolean
  onCancel?: () => void
  onOk?: () => void
}

export function EngineDetailModal(props: EngineDetailModalProps) {
  const { Id, open, onCancel, onOk } = props

  const [detail, setDetail] = useState<TimeEngineItem>()
  const { run: getEngineDetail } = useRequest((id: number) => getTimeEngine(id), {
    manual: true, // 手动触发请求
    onSuccess: (res) => {
      setDetail(res.detail)
    }
  })

  const items: DescriptionsProps['items'] = [
    {
      label: '名称',
      children: detail?.name,
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    },
    {
      label: '状态',
      children: detail ? (
        <Badge color={StatusData[detail?.status].color} text={StatusData[detail?.status].text} />
      ) : (
        '-'
      ),
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    },
    {
      label: '规则',
      children: detail?.rules.slice(0, 3).map((item, index) => (
        <Space key={index} size={8} wrap>
          <Tag color='blue' bordered={false}>
            {item.name}
          </Tag>
        </Space>
      )),
      span: 3
    },
    {
      label: '创建人',
      children: (
        <Tooltip title={detail?.creator?.nickname || detail?.creator?.name}>
          <div className='flex items-center gap-2'>
            <Avatar src={detail?.creator?.avatar}>{detail?.creator?.nickname || detail?.creator?.name}</Avatar>
            {detail?.creator?.nickname || detail?.creator?.name}
          </div>
        </Tooltip>
      ),
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    },
    {
      label: '备注',
      children: detail?.remark || '-',
      span: 3
    },

    {
      label: '创建时间',
      children: detail?.createdAt,
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    },
    {
      label: '更新时间',
      children: detail?.updatedAt,
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    }
  ]

  useEffect(() => {
    if (Id && open) {
      getEngineDetail(Id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Id, open])

  return (
    <>
      <Modal width='50%' centered open={open} onOk={onOk} onCancel={onCancel} footer={null}>
        <Descriptions title='时间引擎信息' bordered items={items} />
      </Modal>
    </>
  )
}
