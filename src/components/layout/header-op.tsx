import { logout } from '@/api/authorization'
import { removeToken } from '@/api/request'
import { GlobalContext } from '@/utils/context'
import { GithubOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Avatar, Button, Dropdown, MenuProps } from 'antd'
import React, { useContext } from 'react'
import { useCreateTeamModal } from './create-team-provider'
import { TeamMenu } from './team-menu'

export const githubURL = `https://github.com/aide-family/moon`

export const HeaderOp: React.FC = () => {
  const { theme, setTheme, userInfo } = useContext(GlobalContext)
  const { setOpen } = useCreateTeamModal()
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
            logout()
            removeToken()
          }
        }
      ]
    }
  ]
  return (
    <div className='center gap8'>
      <TeamMenu />
      <Button type='text' href={githubURL} target='_blank' icon={<GithubOutlined />} />
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
