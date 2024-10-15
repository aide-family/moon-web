import { ActionKey } from '@/api/global'
import { Button, Dropdown } from 'antd'
import type { MenuProps } from 'antd/es/menu'
import { FC } from 'react'

export type MoreMenuProps = {
  items: MenuProps['items']
  onClick?: (key: ActionKey) => void
}

const MoreMenu: FC<MoreMenuProps> = (props) => {
  const { items, onClick } = props
  return (
    <Dropdown menu={{ items, onClick: ({ key }) => onClick?.(key as ActionKey) }} trigger={['click']}>
      <Button size='small' type='link' onClick={(e) => e.preventDefault()}>
        更多
      </Button>
    </Dropdown>
  )
}

export default MoreMenu
