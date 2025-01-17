import { ActionKey } from '@/api/global'
import { Button, Dropdown } from 'antd'
import type { MenuProps } from 'antd/es/menu'
import { FC, ReactNode } from 'react'

export type MoreMenuProps = {
  items: MenuProps['items']
  onClick?: (key: ActionKey) => void
  text?: string | ReactNode
}

const MoreMenu: FC<MoreMenuProps> = (props) => {
  const { items, onClick, text = '更多' } = props
  return (
    <Dropdown menu={{ items, onClick: ({ key }) => onClick?.(key as ActionKey) }} trigger={['click']}>
      <Button size='small' type='link' onClick={(e) => e.preventDefault()}>
        {text}
      </Button>
    </Dropdown>
  )
}

export default MoreMenu
