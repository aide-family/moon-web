import { RoleData, StatusData } from '@/api/global'
import { UserItem } from '@/api/model-types'
import { getUser } from '@/api/user'
import { Avatar, Badge, Descriptions, DescriptionsProps, Modal } from 'antd'
import { useEffect, useState } from 'react'

export interface UserDetailModalProps {
  id: number
  open?: boolean
  onCancel?: () => void
  onOk?: () => void
}

let timer: NodeJS.Timeout | null = null
export function DetailModal(props: UserDetailModalProps) {
  const { id, open, onCancel, onOk } = props

  const [detail, setDetail] = useState<UserItem>({} as UserItem)
  const getUserDetail = () => {
    if (!id) {
      return
    }
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      getUser({ id }).then((res) => {
        setDetail(res.detail)
      })
    }, 400)
  }

  const items: DescriptionsProps['items'] = [
    {
      label: '名称',
      children: (
        <div className='flex items-center gap-2'>
          <Avatar src={detail?.avatar}>{detail?.nickname || detail?.name}</Avatar>
          {detail?.nickname || detail?.name}
          <Badge color={StatusData[detail?.status]?.color} />
        </div>
      ),
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    },
    {
      label: '角色',
      children: RoleData[detail.role],
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    },

    {
      label: '昵称',
      children: detail?.nickname || '-',
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    },
    {
      label: '邮箱',
      children: detail?.email || '-',
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
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
      children: detail?.remark || '-'
    }
  ]

  useEffect(() => {
    if (id && open) {
      getUserDetail()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, open])

  return (
    <>
      <Modal width='50%' centered open={open} onOk={onOk} onCancel={onCancel} footer={null}>
        <Descriptions title='成员信息' bordered items={items} />
      </Modal>
    </>
  )
}
