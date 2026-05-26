import { http } from '../../index'
import type {
  AlertSubscriptionItem,
  CreateAlertSubscriptionParams,
  CreateAlertSubscriptionReply,
  DeleteAlertSubscriptionReply,
  ListAlertSubscriptionsParams,
  ListAlertSubscriptionsResponse,
  UpdateAlertSubscriptionParams,
  UpdateAlertSubscriptionReply,
  UpdateAlertSubscriptionStatusParams,
  UpdateAlertSubscriptionStatusReply,
} from './types'

export const createAlertSubscription = (
  params?: CreateAlertSubscriptionParams,
): Promise<CreateAlertSubscriptionReply> => {
  return http.post<CreateAlertSubscriptionReply>('/alert-subscriptions', {
    ...params,
  })
}

export const updateAlertSubscription = (
  uid: string,
  params?: UpdateAlertSubscriptionParams,
): Promise<UpdateAlertSubscriptionReply> => {
  return http.put<UpdateAlertSubscriptionReply>(`/alert-subscriptions/${uid}`, {
    ...params,
  })
}

export const deleteAlertSubscription = (
  uid: string,
): Promise<DeleteAlertSubscriptionReply> => {
  return http.delete<DeleteAlertSubscriptionReply>(
    `/alert-subscriptions/${uid}`,
  )
}

export const getAlertSubscriptionDetail = (
  uid: string,
): Promise<AlertSubscriptionItem> => {
  return http.get<AlertSubscriptionItem>(`/alert-subscriptions/${uid}`)
}

export const getAlertSubscriptionList = (
  params?: ListAlertSubscriptionsParams,
): Promise<ListAlertSubscriptionsResponse> => {
  return http.get<ListAlertSubscriptionsResponse>('/alert-subscriptions', {
    ...params,
  })
}

export const updateAlertSubscriptionStatus = (
  params: UpdateAlertSubscriptionStatusParams,
): Promise<UpdateAlertSubscriptionStatusReply> => {
  return http.put<UpdateAlertSubscriptionStatusReply>(
    `/alert-subscriptions/${params.uid}/status`,
    { ...params },
  )
}

export type {
  AlertSubscriptionItem,
  AlertSubscriptionMemberItem,
  AlertSubscriptionMemberRequest,
  CreateAlertSubscriptionParams,
  CreateAlertSubscriptionReply,
  DeleteAlertSubscriptionReply,
  ListAlertSubscriptionsParams,
  ListAlertSubscriptionsResponse,
  UpdateAlertSubscriptionParams,
  UpdateAlertSubscriptionReply,
  UpdateAlertSubscriptionStatusParams,
  UpdateAlertSubscriptionStatusReply,
} from './types'
