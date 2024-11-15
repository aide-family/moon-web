import { refreshToken } from '@/api/authorization'
import { Status } from '@/api/enum'
import { TeamItem } from '@/api/model-types'
import { setToken } from '@/api/request'
import { myTeam } from '@/api/team'
import { GlobalContext } from '@/utils/context'
import { DownOutlined } from '@ant-design/icons'
import { Avatar, Col, Dropdown, Row, Space } from 'antd'
import { debounce } from 'lodash'
import React, { useCallback, useContext, useEffect } from 'react'
import { useCreateTeamModal } from './create-team-provider'

export interface TeamMenuProps {}

export const defaultTeamInfo: TeamItem = {
  id: 0,
  name: '请选择团队信息',
  status: Status.StatusEnable,
  remark: '',
  createdAt: '',
  updatedAt: '',
  logo: '',
  admin: []
}
function getTeamInfo() {
  const teamInfo = localStorage.getItem('teamInfo')
  if (teamInfo) {
    try {
      return JSON.parse(teamInfo)
    } catch (e) {
      return defaultTeamInfo
    }
  }
  return defaultTeamInfo
}

export const TeamMenu: React.FC<TeamMenuProps> = () => {
  const createTeamContext = useCreateTeamModal()
  const { teamInfo, setTeamInfo, setUserInfo, refreshMyTeamList } = useContext(GlobalContext)
  const [teamList, setTeamList] = React.useState<TeamItem[]>([])

  const handleRefreshToken = (team?: TeamItem) => {
    if (!team || !team.id) return
    setTeamInfo?.(team)
    refreshToken({ teamID: team.id }).then((res) => {
      const { token, user } = res
      setToken(token)
      setUserInfo?.(user)
    })
  }

  const handleGetMyTeamList = useCallback(
    debounce(async () => {
      myTeam().then(({ list }) => {
        setTeamList(list || [])
        if (!list?.length) {
          setTeamInfo?.(getTeamInfo())
          createTeamContext?.setOpen?.(true)
          return
        }
        const exist = list.some((item) => {
          if (item.id === teamInfo?.id) {
            setTeamInfo?.(item)
            return true
          }
        })
        if (!exist) {
          handleRefreshToken(list?.[0])
          setTeamInfo?.(list?.[0])
        }
      })
    }, 500),
    []
  )

  useEffect(() => {
    handleRefreshToken(teamInfo)
    const interval = setInterval(
      () => {
        handleRefreshToken(teamInfo)
      },
      1000 * 60 * 10
    )
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!teamInfo || !teamInfo.id) {
      createTeamContext?.setOpen?.(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamInfo])

  useEffect(() => {
    if (!createTeamContext.open) {
      handleGetMyTeamList()
    }
  }, [createTeamContext.open, handleGetMyTeamList, refreshMyTeamList])

  return (
    <Dropdown
      menu={{
        items: teamList?.map((item) => {
          return {
            key: item.id,
            label: (
              <Row gutter={12} style={{ textAlign: 'center', display: 'flex', alignItems: 'center', minWidth: 200 }}>
                <Col>
                  <Avatar src={item.logo} shape='square'>
                    {item?.name?.at(0)?.toUpperCase()}
                  </Avatar>
                </Col>
                <Col>{item.name}</Col>
              </Row>
            ),
            onClick: () => {
              handleRefreshToken(item)
              window.location.reload()
            }
          }
        })
      }}
      placement='bottom'
    >
      <Space>
        {teamInfo ? (
          <Row gutter={12} style={{ textAlign: 'center', display: 'flex', alignItems: 'center' }}>
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
