import { GlobalContext } from "@/utils/context"
import { Avatar, Button } from "antd"
import React, { useContext } from "react"
import {
  GithubOutlined,
  MoonOutlined,
  SunOutlined,
  TranslationOutlined,
} from "@ant-design/icons"
import { TeamMenu } from "./team-menu"

const url = `https://q4.itc.cn/q_70/images03/20240405/39ec09deda3a41d79e03897b0fdf68a0.jpeg`
const github = `https://github.com/aide-family/moon`

export const HeaderOp: React.FC = () => {
  const { lang, setLang, theme, setTheme } = useContext(GlobalContext)

  return (
    <div className='center gap8'>
      <TeamMenu />
      <Button
        type='text'
        href={github}
        target='_blank'
        icon={<GithubOutlined />}
        style={{ color: "#FFF" }}
      />
      <Button
        type='text'
        icon={<TranslationOutlined />}
        style={{ color: "#FFF" }}
        onClick={() => {
          setLang?.(lang === "zh-CN" ? "en-US" : "zh-CN")
        }}
      />
      <Button
        type='text'
        icon={theme === "dark" ? <SunOutlined /> : <MoonOutlined />}
        style={{ color: "#FFF" }}
        onClick={() => {
          setTheme?.(theme === "dark" ? "light" : "dark")
        }}
      />
      <Avatar src={url} />
    </div>
  )
}
