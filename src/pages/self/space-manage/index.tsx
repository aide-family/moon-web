import { EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons"
import {
  Card,
  Avatar,
  Space,
  Button,
  Row,
  Col,
  Input,
  Switch,
  Image,
  DescriptionsProps,
  Descriptions,
  Dropdown,
  MenuProps,
} from "antd"
import React from "react"
import "./index.scss"
import { EditSpaceModal } from "./edit-space-modal"

export interface SpaceManageProps {
  children?: React.ReactNode
}

const items: DescriptionsProps["items"] = [
  {
    key: "leader",
    label: "负责人",
    children: <Avatar src='https://api.dicebear.com/7.x/miniavs/svg?seed=8' />,
    span: 1,
  },
  {
    key: "2",
    label: "管理员",
    children: (
      <Avatar.Group size='small'>
        <Avatar src='https://api.dicebear.com/7.x/miniavs/svg?seed=8' />
        <Avatar src='https://api.dicebear.com/7.x/miniavs/svg?seed=8' />
      </Avatar.Group>
    ),
    span: 2,
  },
  {
    key: "3",
    label: "团队描述",
    children:
      "Ant Design, a design language for background applications, is refined by Ant UED Team",
  },
]

const SpaceManage: React.FC<SpaceManageProps> = () => {
  const [status, setStatus] = React.useState(true)
  const [openEditModal, setOpenEditModal] = React.useState(false)
  const menuItems: MenuProps["items"] = [
    {
      label: "编辑信息",
      key: "1",
      icon: <EditOutlined />,
      onClick: () => setOpenEditModal(true),
    },
    {
      label: "转移团队",
      key: "2",
      icon: <EditOutlined />,
    },
    {
      label: "成员管理",
      key: "3",
      icon: <EditOutlined />,
    },
    {
      label: "角色管理",
      key: "4",
      icon: <EditOutlined />,
    },
  ]
  return (
    <>
      <EditSpaceModal
        open={openEditModal}
        onCancel={() => setOpenEditModal(false)}
        onOk={() => setOpenEditModal(false)}
      />
      <div className='spaceBox'>
        <Row className='operator'>
          <Col span={12}>
            <Button
              type='primary'
              size='large'
              onClick={() => setOpenEditModal(true)}
            >
              新建团队
              <PlusOutlined />
            </Button>
          </Col>
          <Col span={12} style={{ textAlign: "right" }}>
            <Input
              placeholder='搜索团队'
              suffix={<SearchOutlined />}
              size='large'
            />
          </Col>
        </Row>
        <Space size={8}>
          <Card
            className='cardItem'
            hoverable
            extra={
              <Switch
                checkedChildren='开启'
                unCheckedChildren='关闭'
                value={status}
                onChange={(checked) => setStatus(checked)}
              />
            }
            title={
              <Space>
                <Image
                  src='https://api.dicebear.com/7.x/bottts/svg?seed=8'
                  preview={false}
                  className='logo'
                />
                Moon监控团队
              </Space>
            }
          >
            <Dropdown menu={{ items: menuItems }} trigger={["contextMenu"]}>
              <Descriptions items={items} layout='vertical' />
            </Dropdown>
          </Card>
        </Space>
      </div>
    </>
  )
}

export default SpaceManage
