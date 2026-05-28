import { http } from '../../index'
import type {
  CreateRecipientGroupParams,
  CreateRecipientGroupReply,
  DeleteRecipientGroupReply,
  RecipientGroupItem,
  RecipientGroupListParams,
  RecipientGroupListResponse,
  SelectRecipientGroupParams,
  SelectRecipientGroupResponse,
  UpdateRecipientGroupParams,
  UpdateRecipientGroupReply,
  UpdateRecipientGroupStatusParams,
  UpdateRecipientGroupStatusReply,
} from './types'

export const getRecipientGroupList = (
  params?: RecipientGroupListParams,
): Promise<RecipientGroupListResponse> => {
  return http.get<RecipientGroupListResponse>('/recipient-groups', {
    ...params,
  })
}

export const getRecipientGroupDetail = (
  uid: string,
): Promise<RecipientGroupItem> => {
  return http.get<RecipientGroupItem>(`/recipient-group/${uid}`)
}

export const createRecipientGroup = (
  params?: CreateRecipientGroupParams,
): Promise<CreateRecipientGroupReply> => {
  return http.post<CreateRecipientGroupReply>('/recipient-group', {
    ...params,
  })
}

export const updateRecipientGroup = (
  uid: string,
  params?: UpdateRecipientGroupParams,
): Promise<UpdateRecipientGroupReply> => {
  return http.put<UpdateRecipientGroupReply>(`/recipient-group/${uid}`, {
    ...params,
  })
}

export const deleteRecipientGroup = (
  uid: string,
): Promise<DeleteRecipientGroupReply> => {
  return http.delete<DeleteRecipientGroupReply>(`/recipient-group/${uid}`)
}

export const updateRecipientGroupStatus = (
  params: UpdateRecipientGroupStatusParams,
): Promise<UpdateRecipientGroupStatusReply> => {
  return http.put<UpdateRecipientGroupStatusReply>(
    `/recipient-group/${params.uid}/status`,
    { ...params },
  )
}

export const getRecipientGroupSelectList = (
  params?: SelectRecipientGroupParams,
): Promise<SelectRecipientGroupResponse> => {
  return http.get<SelectRecipientGroupResponse>('/recipient-groups/select', {
    ...params,
  })
}

export type {
  CreateRecipientGroupParams,
  CreateRecipientGroupReply,
  DeleteRecipientGroupReply,
  RecipientGroupItem,
  RecipientGroupListParams,
  RecipientGroupListResponse,
  RecipientGroupMemberItem,
  RecipientGroupMemberRequest,
  SelectRecipientGroupItem,
  SelectRecipientGroupParams,
  SelectRecipientGroupResponse,
  UpdateRecipientGroupParams,
  UpdateRecipientGroupReply,
  UpdateRecipientGroupStatusParams,
  UpdateRecipientGroupStatusReply,
} from './types'
