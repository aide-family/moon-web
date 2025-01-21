import { logout } from '@/api/authorization'
import { removeToken } from '@/api/request'
import { useCreateTeamModal } from '@/hooks/create-team'
import { GlobalContext } from '@/utils/context'
import { GithubOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Avatar, Button, Dropdown, type MenuProps, theme } from 'antd'
import type React from 'react'
import { useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import MoonChat from '../chat/moon-chat'
import { Docusaurus } from '../icon'
import { ButtonFullScreen } from './button-full-screen'
import { HeaderMessage } from './header-message'
import { TeamMenu } from './team-menu'

export const githubURL = 'https://github.com/aide-family/moon'
export const docURL = 'https://aide-family.github.io/'
export const giteeURL = 'https://gitee.com/aide-cloud/moon'

const { useToken } = theme

export const HeaderOp: React.FC = () => {
  // 获取当前路由
  const location = useLocation()
  const { token } = useToken()
  const { theme, setTheme, userInfo, setLocalURL } = useContext(GlobalContext)
  const { setOpen } = useCreateTeamModal()
  const [logoutURL, setLogoutURL] = useState<string>('')

  useEffect(() => {
    setLogoutURL(location.pathname)
  }, [location.pathname, setLogoutURL])

  const dropdownItems: MenuProps['items'] = [
    {
      label: userInfo?.name,
      key: userInfo?.id || 0,
      type: 'group',
      children: [
        {
          key: 'profile',
          label: '个人中心',
          disabled: true,
          onClick: () => {}
        },
        {
          key: 'my-team',
          label: '团队管理',
          disabled: true,
          onClick: () => {}
        },
        {
          key: 'change-password',
          label: '修改密码',
          disabled: true,
          onClick: () => {}
        },
        {
          key: 'new-team',
          label: '新建团队',
          onClick: () => {
            setOpen?.(true)
          }
        },
        {
          type: 'divider'
        },
        {
          key: 'logout',
          label: '退出登录',
          danger: true,
          onClick: () => {
            logout().then(() => {
              setLocalURL?.(logoutURL)
              removeToken()
            })
          }
        }
      ]
    }
  ]
  return (
    <div className='flex items-center gap-2' style={{ color: token.colorText }}>
      <TeamMenu />
      <ButtonFullScreen bodyId='content-body' type='text' />
      <HeaderMessage />
      <MoonChat />
      <Button type='text' href={githubURL} target='_blank' icon={<GithubOutlined />} />
      <Button type='text' href={docURL} target='_blank' icon={<Docusaurus />} />
      <Button
        type='text'
        icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
        onClick={() => {
          setTheme?.(theme === 'dark' ? 'light' : 'dark')
        }}
      />
      <Dropdown menu={{ items: dropdownItems }}>
        <Avatar src={userInfo?.avatar}>{(userInfo?.nickname || userInfo?.name)?.at(0)?.toUpperCase()}</Avatar>
      </Dropdown>
    </div>
  )
}
