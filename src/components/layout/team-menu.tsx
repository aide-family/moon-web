import { DownOutlined } from "@ant-design/icons"
import { Dropdown, MenuProps, Space } from "antd"
import React, { useEffect } from "react"

export interface TeamMenuProps {}

export type TeamItemType = {
  name: string
  id: string | number
}

const items: TeamItemType[] = [
  {
    id: 1,
    name: "运维团队",
  },
  {
    id: 2,
    name: "监控团队",
  },
]

export const TeamMenu: React.FC<TeamMenuProps> = () => {
  const [teamItem, setTeamItem] = React.useState<TeamItemType>()
  const [teamList, setTeamList] = React.useState<MenuProps["items"]>([])

  useEffect(() => {
    const teams = items.map((item) => ({
      key: item.id,
      label: item.name,
      onClick: () => setTeamItem(item),
    }))
    setTeamList(teams)
    if (items.length) {
      setTeamItem(items[0])
    }
  }, [])
  return (
    <Dropdown menu={{ items: teamList }} placement='bottom'>
      <Space>
        {teamItem?.name || "请选择你的团队"}
        <DownOutlined />
      </Space>
    </Dropdown>
  )
}
