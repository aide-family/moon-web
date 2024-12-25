import { RoleData, StatusData } from '@/api/global'
import type { TeamMemberItem } from '@/api/model-types'
import { getTeamMemberDetail } from '@/api/team'
import { useRequest } from 'ahooks'
import { Avatar, Badge, Descriptions, type DescriptionsProps, Modal } from 'antd'
import { useEffect, useState } from 'react'

export interface HookDetailModalProps {
  id: number
  open?: boolean
  onCancel?: () => void
  onOk?: () => void
}

export function DetailModal(props: HookDetailModalProps) {
  const { id, open, onCancel, onOk } = props

  const [detail, setDetail] = useState<TeamMemberItem>({} as TeamMemberItem)

  const { run: initTeamMemberDetail, loading: initTeamMemberDetailLoading } = useRequest(getTeamMemberDetail, {
    manual: true,
    onSuccess: (res) => {
      setDetail(res.detail)
    }
  })

  const items: DescriptionsProps['items'] = [
    {
      label: '名称',
      children: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar src={detail?.user?.avatar}>{detail?.user?.nickname || detail?.user?.name}</Avatar>
          {detail?.user?.nickname || detail?.user?.name}
        </div>
      ),
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    },
    {
      label: '角色类型',
      children: RoleData[detail.role],
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    },
    {
      label: '状态',
      children: detail ? (
        <Badge color={StatusData[detail?.status]?.color} text={StatusData[detail.status]?.text} />
      ) : (
        '-'
      ),
      span: { xs: 1, sm: 2, md: 3, lg: 3, xl: 2, xxl: 2 }
    },
    {
      label: '角色列表',
      children: '-',
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
      children: detail?.user?.remark || '-'
    }
  ]

  useEffect(() => {
    if (id && open) {
      initTeamMemberDetail({ id })
    }
  }, [open, id, initTeamMemberDetail])

  return (
    <>
      <Modal
        width='50%'
        centered
        open={open}
        onOk={onOk}
        loading={initTeamMemberDetailLoading}
        onCancel={onCancel}
        footer={null}
      >
        <Descriptions title='成员信息' bordered items={items} />
      </Modal>
    </>
  )
}
