import { logout } from '@/api/authorization'
import { GlobalContext } from '@/utils/context'
import { GithubOutlined, MoonOutlined, SunOutlined, TranslationOutlined } from '@ant-design/icons'
import { Avatar, Button, Dropdown, MenuProps } from 'antd'
import React, { useContext } from 'react'
import { TeamMenu } from './team-menu'

const github = `https://github.com/aide-family/moon`

export const HeaderOp: React.FC = () => {
  const { lang, setLang, theme, setTheme, userInfo } = useContext(GlobalContext)
  const dropdownItems: MenuProps['items'] = [
    {
      key: 'logout',
      label: '退出登录',
      onClick: logout
    }
  ]
  return (
    <div className='center gap8'>
      <TeamMenu />
      <Button type='text' href={github} target='_blank' icon={<GithubOutlined />} />
      <Button
        type='text'
        icon={<TranslationOutlined />}
        // style={{ color: '#FFF' }}
        onClick={() => {
          setLang?.(lang === 'zh-CN' ? 'en-US' : 'zh-CN')
          window.location.reload()
        }}
      >
        {lang === 'zh-CN' ? 'English' : '中文'}
      </Button>
      <Button
        type='text'
        icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
        // style={{ color: '#FFF' }}
        onClick={() => {
          setTheme?.(theme === 'dark' ? 'light' : 'dark')
        }}
      />
      <Dropdown menu={{ items: dropdownItems }}>
        <Avatar src={userInfo?.avatar}>{userInfo?.nickname || userInfo?.name}</Avatar>
      </Dropdown>
    </div>
  )
}
