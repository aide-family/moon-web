import { StatusData } from '@/api/global'
import type { TeamItem } from '@/api/model-types'
import { getTeam } from '@/api/team'
import { useRequest } from 'ahooks'
import { Avatar, Descriptions, type DescriptionsProps, Modal, type ModalProps, Tag } from 'antd'
import { useEffect, useState } from 'react'

export interface ModalDetailProps extends ModalProps {
  teamId: number
}

export const TeamDetailModal: React.FC<ModalDetailProps> = (props) => {
  const { teamId, open } = props
  const [detail, setDetail] = useState<TeamItem | null>(null)

  const { run: initTeamDetail } = useRequest(getTeam, {
    manual: true,
    onSuccess: (res) => {
      setDetail(res.detail)
    }
  })

  const items: DescriptionsProps['items'] = [
    {
      label: '团队名称',
      children: detail?.name
    },
    {
      label: '团队logo',
      children: detail?.logo ? <Avatar src={detail.logo} shape='square' /> : '--'
    },
    {
      label: '负责人',
      children: detail?.leader ? `${detail?.leader?.name} (${detail?.leader?.nickname})` : '--'
    },
    {
      label: '团队状态',
      children: detail?.status ? (
        <Tag color={StatusData[detail.status].color}>{StatusData[detail.status].text}</Tag>
      ) : (
        '--'
      )
    },
    {
      label: '管理员',
      span: 2,
      children: detail?.admins?.length ? (
        <Avatar.Group size='small'>
          {detail?.admins?.map((item) => (
            <Avatar src={item?.user?.avatar} shape='square' key={item?.user?.id}>
              {item?.user?.name?.at(0)?.toUpperCase()}
            </Avatar>
          ))}
        </Avatar.Group>
      ) : (
        '--'
      )
    },
    {
      label: '创建时间',
      children: detail?.createdAt
    },
    {
      label: '更新时间',
      children: detail?.updatedAt
    },
    {
      label: '团队描述',
      children: detail?.remark || '--',
      span: 2
    }
  ]

  useEffect(() => {
    if (open) {
      initTeamDetail({ id: teamId })
    }
  }, [open, teamId, initTeamDetail])

  return (
    <Modal {...props} footer={null} open={open}>
      <Descriptions bordered items={items} column={2} />
    </Modal>
  )
}
