import { UserItem } from '../authorization/user'

export interface NotifyHookItemType {
  id: number
  name: string
  remark: string
  creator: UserItem
  creatorId: number
  status: number
  createdAt: string
  updatedAt: string
}

export interface NotifyGroupItemType {
  id: number
  name: string
  remark: string
  creator: UserItem
  creatorId: number
  status: number
  createdAt: string
  updatedAt: string
}
