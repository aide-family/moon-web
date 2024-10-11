import { Status } from '@/api/enum'
import { TeamItem } from '@/api/model-types'
import { listTeam, ListTeamRequest, updateTeamStatus } from '@/api/team'
import { GlobalContext } from '@/utils/context'
import { EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsProps,
  Dropdown,
  Empty,
  Input,
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

const defaultSearchParams: ListTeamRequest = {
  status: 0,
  pagination: {
    pageNum: 1,
    pageSize: 10
  }
}

let timeout: NodeJS.Timeout | null = null
let searchTimeout: NodeJS.Timeout | null = null
const SpaceManage: React.FC<SpaceManageProps> = () => {
  const { setRefreshMyTeamList } = useContext(GlobalContext)
  const [openEditModal, setOpenEditModal] = React.useState(false)
  const [operatorTeam, setOperatorTeam] = React.useState<TeamItem>()
  const [searchParams, setSearchParams] = React.useState<ListTeamRequest>(defaultSearchParams)
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
      icon: <EditOutlined />
    },
    {
      label: '成员管理',
      key: '3',
      icon: <EditOutlined />
    },
    {
      label: '角色管理',
      key: '4',
      icon: <EditOutlined />
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
      listTeam(searchParams)
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
  }, [refresh, searchParams])

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
            <Button type='primary' onClick={() => setOpenEditModal(true)}>
              新建团队
              <PlusOutlined />
            </Button>
            <Button type='primary' onClick={handleRefresh}>
              刷新
            </Button>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Input
              allowClear
              placeholder='搜索团队'
              suffix={<SearchOutlined />}
              onChange={(keyword) => {
                if (searchTimeout) {
                  clearTimeout(searchTimeout)
                }
                searchTimeout = setTimeout(() => {
                  setSearchParams({
                    ...searchParams,
                    keyword: keyword.target.value + '%'
                  })
                }, 500)
              }}
            />
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
              const { name, logo, status, id, remark, leader, admin } = item
              const items: DescriptionsProps['items'] = [
                {
                  key: 'leader',
                  label: '负责人',
                  children: <Avatar src={leader?.avatar}>{leader?.nickname || leader?.name}</Avatar>,
                  span: 1
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
                  span: 2
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
                  <Card
                    key={index + name}
                    className='cardItem'
                    hoverable
                    extra={
                      <Switch
                        checkedChildren='正常'
                        unCheckedChildren='禁用'
                        value={status === Status.StatusEnable}
                        onChange={(checked) => handleChangeStatus(id, checked)}
                      />
                    }
                    title={
                      <Space>
                        <Avatar shape='square' src={logo} className='logo'>
                          {!logo && name?.at(0)?.toUpperCase()}
                        </Avatar>
                        {name}
                      </Space>
                    }
                  >
                    <Dropdown menu={{ items: menuItems(item) }} trigger={['contextMenu']}>
                      <Descriptions items={items} layout='vertical' />
                    </Dropdown>
                  </Card>
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
