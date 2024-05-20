import { Avatar, Card, Skeleton, Space } from "antd"
import Meta from "antd/es/card/Meta"
import React, { useEffect } from "react"

export interface MyTeamProps {
  children?: React.ReactNode
}

type TeamItemType = {
  id: number
  name: string
  avatar: string
}

const defaultTeamItems: TeamItemType[] = [
  {
    id: 1,
    name: "team1",
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=2",
  },
  {
    id: 2,
    name: "team2",
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=2",
  },
]

export const MyTeam: React.FC<MyTeamProps> = (props) => {
  const { children } = props

  const [teamItems, setTeamItems] =
    React.useState<TeamItemType[]>(defaultTeamItems)
  const [loading, setLoading] = React.useState(true)
  useEffect(() => {
    setLoading(true)
    setTeamItems(defaultTeamItems)
    setLoading(false)
  }, [])

  return (
    <Space size={8}>
      {teamItems.map(({ id, name, avatar }) => {
        return (
          <Card key={`${id}`}>
            <Skeleton loading={loading} avatar active>
              <Meta
                avatar={<Avatar src={avatar} />}
                title={name}
                description='This is the description'
              />
            </Skeleton>
          </Card>
        )
      })}
      {children}
    </Space>
  )
}
