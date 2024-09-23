import { HookAppData, StatusData } from '@/api/global'
import { AlarmHookItem } from '@/api/model-types'
import { getHook } from '@/api/notify/hook'
import { Badge, Descriptions, DescriptionsProps, Modal } from 'antd'
import { useEffect, useState } from 'react'

export interface HookDetailModalProps {
  hookId: number
  open?: boolean
  onCancel?: () => void
  onOk?: () => void
}

let timer: NodeJS.Timeout | null = null
export function HookDetailModal(props: HookDetailModalProps) {
  const { hookId, open, onCancel, onOk } = props

  const [detail, setDetail] = useState<AlarmHookItem>()
  const getHookDetail = () => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      getHook({ id: hookId }).then((res) => {
        setDetail(res.detail)
      })
    }, 200)
  }

  const items: DescriptionsProps['items'] = [
    {
      label: '名称',
      children: detail?.name,
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    },
    {
      label: '类型',
      children: HookAppData[detail?.hookApp!],
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    },
    {
      label: '状态',
      children: detail ? (
        <Badge color={StatusData[detail?.status!].color} text={StatusData[detail?.status!].text} />
      ) : (
        '-'
      ),
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    },
    {
      label: '创建人',
      children: detail?.creator || '-',
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    },
    {
      label: 'URL',
      children: detail?.url,
      span: 3
    },
    {
      label: '密钥',
      children: detail?.secret || '-',
      span: 3
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
    if (hookId) {
      getHookDetail()
    }
  }, [hookId])

  return (
    <>
      <Modal width='50%' centered open={open} onOk={onOk} onCancel={onCancel} footer={null}>
        <Descriptions title='Hook信息' bordered items={items} />
      </Modal>
    </>
  )
}
