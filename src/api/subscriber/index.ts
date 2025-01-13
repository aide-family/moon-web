import { NotifyType } from '../enum'
import { PaginationReply, PaginationReq } from '../global'
import { StrategySubscribeItem, StrategySubscriberItem } from '../model-types'
import request from '../request'

/**
 * 当前用户订阅某个策略
 * @method: post /v1/strategy/subscriber
 * @param {SubscriberStrategyRequest} params
 * @returns {SubscriberStrategyReply}
 */
export function userSubscriberStrategy(params: SubscriberStrategyRequest): Promise<SubscriberStrategyReply> {
  return request.POST<SubscriberStrategyReply>('/v1/strategy/subscriber', params)
}

/**
 * 当前取消订阅策略
 * @method: post /v1/strategy/un/subscriber
 * @param {UnSubscriberRequest} params
 * @returns {UnSubscriberReply}
 */
export function unSubscriber(params: UnSubscriberRequest): Promise<UnSubscriberReply> {
  return request.POST<UnSubscriberReply>('/v1/strategy/un/subscriber', params)
}

/**
 * 当前用户订阅策略列表
 * @method: post /v1/strategy/user/subscriber/list
 * @param {UserSubscriberListRequest} params
 * @returns {UserSubscriberListReply}
 */
export function userSubscriberList(params: UserSubscriberListRequest): Promise<UserSubscriberListReply> {
  return request.POST<UserSubscriberListReply>('/v1/strategy/user/subscriber/list', params)
}

/**
 * 策略订阅者列表
 * @method: post /v1/strategy/subscriber/list
 * @param {StrategySubscriberRequest} params
 * @returns {StrategySubscriberReply}
 */
export function getStrategySubscriber(params: StrategySubscriberRequest): Promise<StrategySubscriberReply> {
  return request.POST<StrategySubscriberReply>('/v1/strategy/subscriber/list', params)
}

// 示例类型定义
export interface SubscriberStrategyRequest {
  strategyId: number
  notifyType: number
}

export interface SubscriberStrategyReply {}

export interface UnSubscriberRequest {
  strategyId: number
}

export interface UnSubscriberReply {}

export interface UserSubscriberListRequest {
  pagination: PaginationReq
  keyword?: string
  notifyType?: NotifyType
}

export interface UserSubscriberListReply {
  list: StrategySubscribeItem[]
  pagination: PaginationReply
}

export interface StrategySubscriberRequest {
  strategyId: number
  pagination: PaginationReq
  notifyType?: NotifyType
}

export interface StrategySubscriberReply {
  subscribers: StrategySubscriberItem[]
  pagination: PaginationReply
}
