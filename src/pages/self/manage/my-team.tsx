import team from '@/api/team'
import { TeamItemType } from '@/api/team/types'
import { Avatar, Card, Skeleton, Space } from 'antd'
import Meta from 'antd/es/card/Meta'
import React, { useEffect } from 'react'

export interface MyTeamProps {
  children?: React.ReactNode
}

export const MyTeam: React.FC<MyTeamProps> = (props) => {
  const { children } = props

  const [teamItems, setTeamItems] = React.useState<TeamItemType[]>([])
  const [loading, setLoading] = React.useState(true)

  const handleGetMyTeamList = () => {
    team.getMyTeamApi().then(({ list }) => {
      setTeamItems(list || [])
    })
  }

  useEffect(() => {
    setLoading(true)
    handleGetMyTeamList()
    setLoading(false)
  }, [])

  return (
    <Space size={8}>
      {teamItems.map(({ id, name, logo, remark }) => {
        return (
          <Card key={`${id}`}>
            <Skeleton loading={loading} avatar active>
              <Meta
                avatar={<Avatar src={logo}>{name?.at(0)?.toUpperCase()}</Avatar>}
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
