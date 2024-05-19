import { Avatar, Button, Card, Descriptions, Space, theme } from "antd"
import React, { useState } from "react"
import type { DescriptionsProps } from "antd"
import "./index.scss"

export interface SelfManageProps {
  children?: React.ReactNode
}

type TabType = "basic" | "team" | "notify" | "password"
const url = `https://q4.itc.cn/q_70/images03/20240405/39ec09deda3a41d79e03897b0fdf68a0.jpeg`
const { useToken } = theme

const SelfManage: React.FC<SelfManageProps> = (props) => {
  const { children } = props
  const [tab, setTab] = useState<TabType>("basic")
  const { token } = useToken()

  const items: DescriptionsProps["items"] = [
    {
      key: "username",
      label: "用户名",
      children: <b>admin</b>,
    },
    {
      key: "phone",
      label: "手机号",
      children: (
        <Space size={4}>
          <div>1810000000</div>
          <Button type='link' size='small'>
            修改
          </Button>
        </Space>
      ),
    },
    {
      key: "nikename",
      label: "昵称",
      children: "Hangzhou, Zhejiang",
    },
    {
      key: "email",
      label: "邮箱",
      children: (
        <Space size={4}>
          <div>1068165620@qq.com</div>
          <Button type='link' size='small'>
            修改
          </Button>
        </Space>
      ),
    },
    {
      key: "remark",
      label: "备注",
      children: "这是我的备注， 他是一个很有才华的人",
    },
  ]

  const showTab = (t: TabType) => {
    switch (t) {
      case "basic":
        return <div>基本信息</div>
      case "team":
        return <div>我的团队</div>
      case "notify":
        return <div>通知历史</div>
      case "password":
        return <div>修改密码</div>
      default:
        return <div>基本信息</div>
    }
  }

  return (
    <div
      className='manage'
      style={{
        background: token.colorBgLayout,
      }}
    >
      <Card
        style={{
          background: token.colorBgContainer,
        }}
      >
        <div className='manage-user'>
          <div>
            <Avatar className='manage-user-avatar' src={url}></Avatar>
          </div>
          <Descriptions
            // layout='vertical'
            className='manage-user-descriptions'
            column={2}
            items={items}
          />
        </div>
      </Card>
      <Card
        className='manage-content'
        style={{
          background: token.colorBgContainer,
        }}
      >
        <div>
          <Space size={8}>
            <Button
              type={tab === "basic" ? "primary" : "default"}
              onClick={() => setTab("basic")}
            >
              基本信息
            </Button>
            <Button
              type={tab === "team" ? "primary" : "default"}
              onClick={() => setTab("team")}
            >
              我的团队
            </Button>
            <Button
              type={tab === "notify" ? "primary" : "default"}
              onClick={() => setTab("notify")}
            >
              通知历史
            </Button>
            <Button
              type={tab === "password" ? "primary" : "default"}
              onClick={() => setTab("password")}
            >
              修改密码
            </Button>
          </Space>
          <div className='manage-content-detail'>{showTab(tab)}</div>
          {children}
        </div>
      </Card>
    </div>
  )
}

export default SelfManage
