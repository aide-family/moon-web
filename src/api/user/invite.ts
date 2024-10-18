import { TeamItem, TeamRole } from '../model-types'
import request from '../request'

export interface InviteItem {
  roles: TeamRole[]
  team: TeamItem
  id: number
  inviteType: number
}

export interface GetInviteRequest {
  id: number
}

export interface GetInviteReply {
  detail: InviteItem
}

export function getInvite(params: GetInviteRequest): Promise<GetInviteReply> {
  return request.GET(`/v1/admin/invite/detail/${params.id}`)
}
