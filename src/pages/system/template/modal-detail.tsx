import { AlarmSendTypeData, StatusData } from '@/api/global'
import type { SendTemplateItem } from '@/api/model-types'
import { getTemplate } from '@/api/notify/template'
import { useRequest } from 'ahooks'
import { Avatar, Badge, Descriptions, type DescriptionsProps, Modal, type ModalProps, Space, Tooltip } from 'antd'
import { useCallback, useEffect, useState } from 'react'

export interface SendTemplateDetailModalProps extends ModalProps {
  sendTemplateId: number
  onOk?: () => void
}

export function SendTemplateDetailModal(props: SendTemplateDetailModalProps) {
  const { sendTemplateId, open, onCancel, onOk, ...rest } = props

  const [detail, setDetail] = useState<SendTemplateItem>()

  const { run: runGetSendTemplateDetail, loading: getSendTemplateDetailLoading } = useRequest(getTemplate, {
    manual: true,
    onSuccess: (res) => {
      setDetail(res.detail)
    }
  })

  const getSendTemplateDetail = useCallback(() => {
    if (!sendTemplateId) {
      return
    }
    runGetSendTemplateDetail(sendTemplateId, true)
  }, [sendTemplateId, runGetSendTemplateDetail])

  useEffect(() => {
    if (sendTemplateId && open) {
      getSendTemplateDetail()
    }
  }, [sendTemplateId, open, getSendTemplateDetail])

  if (!detail) {
    return null
  }

  const items: DescriptionsProps['items'] = [
    {
      label: '名称',
      children: detail?.name,
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    },
    {
      label: '通知类型',
      children: (
        <Space direction='horizontal'>
          <Avatar size='small' shape='square' icon={AlarmSendTypeData[detail.sendType].icon} />
          {AlarmSendTypeData[detail.sendType].label}
        </Space>
      ),
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
      label: '模板内容',
      children: detail?.content || '-',
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
    },
    {
      label: '备注',
      children: detail?.remark || '-',
      span: 3
    }
  ]

  return (
    <>
      <Modal
        {...rest}
        centered
        open={open}
        onOk={onOk}
        onCancel={onCancel}
        footer={null}
        loading={getSendTemplateDetailLoading}
      >
        <Descriptions title='通知模板信息' bordered items={items} />
      </Modal>
    </>
  )
}
