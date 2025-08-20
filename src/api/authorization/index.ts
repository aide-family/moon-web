import { TeamMemberItem, UserItem } from '../model-types'
import request from '../request'

/**
 * 登录
 * @param {LoginRequest} params
 * @returns {Promise<LoginReply>}
 */
export function login(params: LoginRequest): Promise<LoginReply> {
  return request.POST<LoginReply>('/v1/authorization/login', params)
}

/**
 * 登出
 * @param {LogoutRequest} params
 * @returns {Promise<LogoutReply>}
 */
export function logout(): Promise<LogoutReply> {
  return request.POST<LogoutReply>('/v1/authorization/logout', {})
}

/**
 * 刷新 token
 * @param {RefreshTokenRequest} params
 * @returns {Promise<RefreshTokenReply>}
 */
export function refreshToken(params: RefreshTokenRequest): Promise<RefreshTokenReply> {
  return request.POST<RefreshTokenReply>('/v1/authorization/refresh', params)
}

/**
 * 获取验证码
 * @param {CaptchaReq} params
 * @returns {Promise<CaptchaReply>}
 */
export function getCaptcha(): Promise<CaptchaReply> {
  return request.GET<CaptchaReply>('/api/auth/captcha')
}

/**
 * 校验用户在当前资源下是否有权限
 * @param {CheckPermissionRequest} params
 * @returns {Promise<CheckPermissionReply>}
 */
export function checkPermission(params: CheckPermissionRequest): Promise<CheckPermissionReply> {
  return request.POST<CheckPermissionReply>('/v1/authorization/check_permission', params)
}

/**
 * 校验 token 是否登录中的状态
 * @param {CheckTokenRequest} params
 * @returns {Promise<CheckTokenReply>}
 */
export function checkToken(params: CheckTokenRequest): Promise<CheckTokenReply> {
  return request.POST<CheckTokenReply>('/v1/authorization/check_token', params)
}

/**
 * 验证邮箱
 * post /v1/authorization/verify_email
 * @param {VerifyEmailRepquest} params
 * @returns {Promise<VerifyEmailReply>}
 */
export function verifyEmail(params: VerifyEmailRepquest): Promise<void> {
  return request.POST('/api/auth/verify/email', params)
}

/**
 * 设置账号邮箱
 * post /v1/authorization/set_email
 * @param {SetEmailRequest} params
 * @returns {Promise<SetEmailReply>}
 */
export function setEmailWithLogin(params: SetEmailRequest): Promise<RefreshTokenReply> {
  return request.POST('/api/auth/oauth2/login/email', params)
}

/**
 * 展示oauth列表
 * get /v1/authorization/oauths
 * @returns {Promise<OAuthListReply>}
 */
export function getOAuthList(): Promise<OAuthListReply> {
  return request.POST<OAuthListReply>('/api/auth/oauth2/list', {})
}

/**
 * 邮箱注册
 * post /v1/authorization/register_with_email
 * @param {RegisterWithEmailRequest} params
 * @returns {Promise<RegisterWithEmailReply>}
 */
export function registerWithEmail(params: RegisterWithEmailRequest): Promise<RegisterWithEmailReply> {
  return request.POST('/v1/authorization/register_with_email', params)
}

// Types

/**
 * 登录请求
 */
export interface LoginRequest {
  /**
   * 用户名
   */
  username: string
  /**
   * 密码
   */
  password: string
  /**
   * 验证码
   */
  captcha: AuthCaptcha
  /**
   * 重定向地址
   */
  redirect?: string
  /**
   * 团队ID
   */
  teamID?: number
}

/**
 * 登录响应
 */
export interface LoginReply {
  /**
   * 用户信息
   */
  user: UserItem
  /**
   * token
   */
  token: string
  /**
   * 重定向地址
   */
  redirect?: string
}

/**
 * 登出请求
 */
export interface LogoutRequest {}

/**
 * 登出响应
 */
export interface LogoutReply {
  /**
   * 重定向地址
   */
  redirect: string
}

/**
 * 刷新 token 请求
 */
export interface RefreshTokenRequest {
  /**
   * 团队ID
   */
  teamID: number
}

/**
 * 刷新 token 响应
 */
export interface RefreshTokenReply {
  /**
   * token
   */
  token: string
  /**
   * 用户信息
   */
  user: UserItem
  /**
   * 团队ID
   */
  teamID?: number
  /**
   * 团队成员ID
   */
  teamMemberID: number
}

/**
 * 验证码响应
 */
export interface CaptchaReply {
  captchaId: string
  captchaImg: string
  expired_seconds: number
}

/**
 * 登录验证码
 */
export interface AuthCaptcha {
  /**
   * 验证码
   */
  answer: string
  /**
   * ID
   */
  captchaId: string
}

/**
 * 校验权限请求
 */
export interface CheckPermissionRequest {
  /**
   * 资源
   */
  operation: string
}

/**
 * 校验权限响应
 */
export interface CheckPermissionReply {
  /**
   * 是否有权限
   */
  hasPermission: boolean
  /**
   * 团队成员信息
   */
  teamMember: TeamMemberItem
}

/**
 * 校验 token 请求
 */
export interface CheckTokenRequest {}

/**
 * 校验 token 响应
 */
export interface CheckTokenReply {
  /**
   * 是否已登录
   */
  isLogin: boolean
  /**
   * 用户信息
   */
  user: UserItem
}

/**
 * 验证邮箱请求
 */
export interface VerifyEmailRepquest {
  /**
   * 邮箱
   */
  email: string
  /**
   * 验证码
   */
  captcha: AuthCaptcha
}

/**
 * 设置邮箱请求
 */
export interface SetEmailRequest {
  /**
   * 邮箱
   */
  email: string
  /**
   * 验证码
   */
  code: string
  /**
   * OAuthID
   */
  oauthID: number
  /**
   * Token
   */
  token: string
  app: number
}

/**
 * 展示 oauth 列表响应
 */
export interface OAuthListReply {
  /**
   * oauth 列表
   */
  items: OAuthItem[]
}

/**
 * oauth 列表
 */
export interface OAuthItem {
  /**
   * 图标
   */
  icon: 'google' | 'github' | 'gitlab' | 'gitee'
  /**
   * 名称
   */
  label: string
  /**
   * 重定向地址
   */
  redirect: string
}

/**
 * 邮箱注册请求
 */
export interface RegisterWithEmailRequest {
  /**
   * 邮箱
   */
  email: string
  /**
   * 密码
   */
  password: string
  /**
   * 验证码
   */
  code: string
  /**
   * 用户名
   */
  username: string
}

/**
 * 邮箱注册响应
 */
export interface RegisterWithEmailReply {
  /**
   * 用户信息
   */
  user: UserItem
  /**
   * token
   */
  token: string
}
