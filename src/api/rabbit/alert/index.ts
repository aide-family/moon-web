import { http } from '../../index'
import type {
  AlertRecordItem,
  AlertSubscriptionItem,
  CreateAlertSubscriptionParams,
  CreateAlertSubscriptionReply,
  DeleteAlertSubscriptionReply,
  ListAlertRecordsParams,
  ListAlertRecordsResponse,
  ListAlertSubscriptionsParams,
  ListAlertSubscriptionsResponse,
  ReceivePrometheusWebhookReply,
  ReceivePrometheusWebhookRequest,
  UpdateAlertSubscriptionParams,
  UpdateAlertSubscriptionReply,
  UpdateAlertSubscriptionStatusParams,
  UpdateAlertSubscriptionStatusReply,
} from './types'

export const receivePrometheusWebhook = (
  params?: ReceivePrometheusWebhookRequest,
): Promise<ReceivePrometheusWebhookReply> => {
  return http.post<ReceivePrometheusWebhookReply>(
    '/alerts/prometheus/webhook',
    { ...params },
    { skipAuth: true },
  )
}

export const getAlertRecordDetail = (uid: string): Promise<AlertRecordItem> => {
  return http.get<AlertRecordItem>(`/alerts/${uid}`)
}

export const getAlertRecordList = (
  params?: ListAlertRecordsParams,
): Promise<ListAlertRecordsResponse> => {
  return http.get<ListAlertRecordsResponse>('/alerts', { ...params })
}

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
  AlertRecordItem,
  AlertSubscriptionItem,
  AlertSubscriptionMemberItem,
  AlertSubscriptionMemberRequest,
  CreateAlertSubscriptionParams,
  CreateAlertSubscriptionReply,
  DeleteAlertSubscriptionReply,
  ListAlertRecordsParams,
  ListAlertRecordsResponse,
  ListAlertSubscriptionsParams,
  ListAlertSubscriptionsResponse,
  PrometheusAlertItem,
  ReceivePrometheusWebhookReply,
  ReceivePrometheusWebhookRequest,
  UpdateAlertSubscriptionParams,
  UpdateAlertSubscriptionReply,
  UpdateAlertSubscriptionStatusParams,
  UpdateAlertSubscriptionStatusReply,
} from './types'
