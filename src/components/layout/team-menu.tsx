import { refreshToken } from '@/api/authorization/user'
import { setToken } from '@/api/request'
import team from '@/api/team'
import { TeamItemType } from '@/api/team/types'
import { GlobalContext } from '@/utils/context'
import { DownOutlined } from '@ant-design/icons'
import { Avatar, Col, Dropdown, Row, Space } from 'antd'
import React, { useContext, useEffect } from 'react'

export interface TeamMenuProps {}

export const TeamMenu: React.FC<TeamMenuProps> = () => {
  const { teamInfo, setTeamInfo, setUserInfo } = useContext(GlobalContext)
  const [teamList, setTeamList] = React.useState<TeamItemType[]>([])

  const handleGetMyTeamList = () => {
    team.getMyTeamApi().then(({ list }) => {
      setTeamList(list || [])
    })
  }

  useEffect(() => {
    handleGetMyTeamList()
  }, [])
  return (
    <Dropdown
      menu={{
        items: teamList?.map((item) => {
          return {
            key: item.id,
            label: (
              <Row gutter={12} style={{ textAlign: 'center' }}>
                <Col>
                  <Avatar src={item.logo} shape='square'>
                    {item?.name?.at(0)?.toUpperCase()}
                  </Avatar>
                </Col>
                <Col>{item.name}</Col>
              </Row>
            ),
            onClick: () => {
              refreshToken(item.id).then((res) => {
                const { token, user } = res
                setToken(token)
                setUserInfo?.(user)
                setTeamInfo?.(item)
              })
            },
          }
        }),
      }}
      placement='bottom'
    >
      <Space>
        {teamInfo ? (
          <Row gutter={12} style={{ textAlign: 'center' }}>
            <Col>
              <Avatar src={teamInfo?.logo} shape='square'>
                {teamInfo?.name?.at(0)?.toUpperCase()}
              </Avatar>
            </Col>
            <Col>{teamInfo?.name}</Col>
          </Row>
        ) : (
          '请选择你的团队'
        )}
        <DownOutlined />
      </Space>
    </Dropdown>
  )
}
