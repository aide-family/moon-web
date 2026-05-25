import type { MenuProps } from 'antd'

type MenuItemType = NonNullable<MenuProps['items']>[number]

/** Dropdown/Menu：常规操作与删除、危险操作之间的分割线 */
export const MENU_DIVIDER: MenuItemType = { type: 'divider' }
