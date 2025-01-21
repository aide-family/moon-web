import type { TeamItem } from '@/api/model-types'
import { myTeam } from '@/api/team'
import { useRequest } from 'ahooks'
import { Avatar, Card, Skeleton, Space } from 'antd'
import Meta from 'antd/es/card/Meta'
import React, { useEffect } from 'react'

export interface MyTeamProps {
  children?: React.ReactNode
}

export const MyTeam: React.FC<MyTeamProps> = (props) => {
  const { children } = props

  const [teamItems, setTeamItems] = React.useState<TeamItem[]>([])

  const { run: initMyTeams, loading: initMyTeamsLoading } = useRequest(myTeam, {
    manual: true,
    onSuccess: ({ list }) => {
      setTeamItems(list || [])
    }
  })

  useEffect(() => {
    initMyTeams()
  }, [initMyTeams])

  return (
    <Space size={8}>
      {teamItems.map(({ id, name, logo, remark }) => {
        return (
          <Card key={`${id}`}>
            <Skeleton loading={initMyTeamsLoading} avatar active>
              <Meta
                avatar={<Avatar src={logo.trim()}>{name?.at(0)?.toUpperCase()}</Avatar>}
                title={name}
                description={remark || '-'}
              />
            </Skeleton>
          </Card>
        )
      })}
      {children}
    </Space>
  )
}
