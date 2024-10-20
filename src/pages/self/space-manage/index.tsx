import { Status } from '@/api/enum'
import { TeamItem } from '@/api/model-types'
import { myTeam, updateTeamStatus } from '@/api/team'
import { useCreateTeamModal } from '@/components/layout/create-team-provider'
import { GlobalContext } from '@/utils/context'
import { EditOutlined, PlusOutlined, UserSwitchOutlined } from '@ant-design/icons'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsProps,
  Dropdown,
  Empty,
  MenuProps,
  Row,
  Space,
  Spin,
  Switch,
  Typography
} from 'antd'
import React, { useContext, useEffect } from 'react'
import { EditSpaceModal } from './edit-space-modal'
import './index.scss'

export interface SpaceManageProps {
  children?: React.ReactNode
}

let timeout: NodeJS.Timeout | null = null
const SpaceManage: React.FC<SpaceManageProps> = () => {
  const { setRefreshMyTeamList, teamInfo } = useContext(GlobalContext)
  const { setOpen, open } = useCreateTeamModal()
  const [openEditModal, setOpenEditModal] = React.useState(false)
  const [operatorTeam, setOperatorTeam] = React.useState<TeamItem>()
  const [loading, setLoading] = React.useState(false)
  const [teamList, setTeamList] = React.useState<TeamItem[]>([])
  const [refresh, setRefresh] = React.useState(false)

  const handleEditTeam = (teamInfo: TeamItem) => {
    setOperatorTeam(teamInfo)
    setOpenEditModal(true)
  }
  const menuItems = (teamInfo: TeamItem): MenuProps['items'] => [
    {
      label: '编辑信息',
      key: '1',
      icon: <EditOutlined />,
      onClick: () => handleEditTeam(teamInfo)
    },
    {
      label: '转移团队',
      key: '2',
      icon: <UserSwitchOutlined />
    }
  ]

  const handleRefresh = () => {
    setRefresh(!refresh)
  }

  const handleGetTeamList = () => {
    if (timeout) {
      clearTimeout(timeout)
    }
    setLoading(true)
    timeout = setTimeout(() => {
      myTeam()
        .then((res) => {
          const { list } = res
          setTeamList(list)
        })
        .finally(() => setLoading(false))
    }, 200)
  }

  const handleChangeStatus = (teamId: number, checked: boolean) => {
    updateTeamStatus({
      id: teamId,
      status: checked ? Status.StatusEnable : Status.StatusDisable
    }).then(handleRefresh)
  }

  useEffect(() => {
    handleGetTeamList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, open])

  const handleEditModalOnOK = () => {
    setOpenEditModal(false)
    setOperatorTeam(undefined)
    handleRefresh()
    setRefreshMyTeamList?.()
  }

  const handleOnCancel = () => {
    setOpenEditModal(false)
    setOperatorTeam(undefined)
  }

  return (
    <>
      <EditSpaceModal
        open={openEditModal}
        onCancel={handleOnCancel}
        onOk={handleEditModalOnOK}
        spaceId={operatorTeam?.id}
      />
      <div className='spaceBox'>
        <Row className='operator'>
          <Col span={16} className='right'>
            <Button type='primary' onClick={() => setOpen?.(true)}>
              新建团队
              <PlusOutlined />
            </Button>
            <Button color='default' variant='filled' onClick={handleRefresh}>
              刷新
            </Button>
          </Col>
        </Row>
        <div className='center'>{!teamList?.length && <Empty />}</div>
        {loading ? (
          <Spin spinning={loading} style={{ height: '600px' }}>
            <div></div>
          </Spin>
        ) : (
          <Row gutter={[12, 12]} style={{ flex: 1, overflow: 'auto' }}>
            {teamList?.map((item, index) => {
              const { name, logo, status, id, remark, leader, admin, creator } = item
              const items: DescriptionsProps['items'] = [
                {
                  key: 'leader',
                  label: '负责人',
                  children: (
                    <Space direction='horizontal'>
                      <Avatar src={leader?.avatar} />
                      {`${leader?.name}(${leader?.nickname})`}
                    </Space>
                  ),
                  span: 4
                },
                {
                  key: 'creator',
                  label: '创建者',
                  children: (
                    <Space direction='horizontal'>
                      <Avatar src={creator?.avatar} />
                      {`${leader?.name}(${leader?.nickname})`}
                    </Space>
                  ),
                  span: 4
                },
                {
                  key: '2',
                  label: '管理员',
                  children: (
                    <Avatar.Group size='small'>
                      {admin
                        ? admin?.map((item) => (
                            <Avatar src={item?.user?.avatar}>{item?.user?.nickname || item?.user?.name}</Avatar>
                          ))
                        : '-'}
                    </Avatar.Group>
                  ),
                  span: 4
                },
                {
                  key: '3',
                  label: '团队描述',
                  children: (
                    <Typography.Paragraph
                      ellipsis={{
                        rows: 2,
                        expandable: 'collapsible'
                      }}
                    >
                      {remark || '-'}
                    </Typography.Paragraph>
                  )
                }
              ]
              return (
                <Col xs={24} sm={12} md={12} lg={12} xl={8} xxl={6}>
                  <Badge.Ribbon style={{ display: teamInfo?.id === id ? '' : 'none' }} text='current' color='purple'>
                    <Card
                      key={index + name}
                      className='cardItem'
                      hoverable
                      title={
                        <Space>
                          <Avatar shape='square' src={logo} className='logo'>
                            {!logo && name?.at(0)?.toUpperCase()}
                          </Avatar>
                          {name}
                          <Switch
                            checkedChildren='正常'
                            unCheckedChildren='禁用'
                            value={status === Status.StatusEnable}
                            onChange={(checked) => handleChangeStatus(id, checked)}
                          />
                        </Space>
                      }
                    >
                      <Dropdown menu={{ items: menuItems(item) }} trigger={['contextMenu']}>
                        <Descriptions items={items} layout='vertical' />
                      </Dropdown>
                    </Card>
                  </Badge.Ribbon>
                </Col>
              )
            })}
          </Row>
        )}
      </div>
    </>
  )
}

export default SpaceManage
