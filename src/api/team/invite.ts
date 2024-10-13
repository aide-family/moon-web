import { Role } from '../enum'
import request from '../request'

/**
 * 邀请团队成员
 * @method: post
 */
export function inviteUser(params: InviteUserRequest): Promise<InviteUserReply> {
  return request.POST<InviteUserReply>(`/v1/admin/invite/user`, params)
}

export interface InviteUserRequest {
  role: Role
  roleIds: number[]
  inviteCode: string
}

export interface InviteUserReply {}
