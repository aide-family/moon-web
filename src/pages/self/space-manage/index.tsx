import { Status } from '@/api/enum'
import type { TeamItem } from '@/api/model-types'
import { myTeam, updateTeamStatus } from '@/api/team'
import { useCreateTeamModal } from '@/hooks/create-team'
import { GlobalContext } from '@/utils/context'
import { EditOutlined, PlusOutlined, UserSwitchOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  type DescriptionsProps,
  Dropdown,
  Empty,
  type MenuProps,
  Row,
  Space,
  Spin,
  Switch,
  Typography
} from 'antd'
import React, { useContext, useEffect } from 'react'
import { EditSpaceModal } from './edit-space-modal'

export interface SpaceManageProps {
  children?: React.ReactNode
}

const SpaceManage: React.FC<SpaceManageProps> = () => {
  const { setRefreshMyTeamList, teamInfo } = useContext(GlobalContext)
  const { setOpen } = useCreateTeamModal()
  const [openEditModal, setOpenEditModal] = React.useState(false)
  const [operatorTeam, setOperatorTeam] = React.useState<TeamItem>()
  const [teamList, setTeamList] = React.useState<TeamItem[]>([])

  const { runAsync: initTeamList, loading: initTeamListLoading } = useRequest(myTeam, {
    manual: true,
    onSuccess: (res) => {
      setTeamList(res?.list)
    }
  })

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
    initTeamList()
  }

  const handleChangeStatus = (teamId: number, checked: boolean) => {
    updateTeamStatus({
      id: teamId,
      status: checked ? Status.StatusEnable : Status.StatusDisable
    }).then(handleRefresh)
  }

  useEffect(() => {
    initTeamList()
  }, [initTeamList])

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
      <div className='p-3 h-full flex flex-col gap-3'>
        <Row className='pb-3'>
          <Col span={16} className='flex gap-3'>
            <Button type='primary' onClick={() => setOpen?.(true)}>
              新建团队
              <PlusOutlined />
            </Button>
            <Button color='default' variant='filled' onClick={handleRefresh}>
              刷新
            </Button>
          </Col>
        </Row>
        <div className='flex justify-center items-center'>{!teamList?.length && <Empty />}</div>
        {initTeamListLoading ? (
          <Spin spinning={initTeamListLoading} className='h-[600px]'>
            <div className='h-[600px]' />
          </Spin>
        ) : (
          <Row gutter={[12, 12]} className='flex-1 overflow-auto'>
            {teamList?.map((item, index) => {
              const { name, logo, status, id, remark, leader, admins: admin, creator } = item
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
                            <Avatar key={item?.user?.id} src={item?.user?.avatar}>
                              {item?.user?.nickname || item?.user?.name}
                            </Avatar>
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
                <Col key={index + name} xs={24} sm={12} md={12} lg={12} xl={8} xxl={6}>
                  <Badge.Ribbon style={{ display: teamInfo?.id === id ? '' : 'none' }} text='current' color='purple'>
                    <Card
                      key={index + name}
                      className='min-h-[306px] border-none'
                      hoverable
                      title={
                        <Space>
                          <Avatar shape='square' src={logo} className='w-11 h-11'>
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
