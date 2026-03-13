/**
 * 刷新 token 接口响应
 */
export interface RefreshTokenResponse {
  token?: string
  access_token?: string
}

/**
 * Self_Info 接口响应（GET /v1/self/info）
 */
export interface SelfInfo {
  uid?: string
  email?: string
  phone?: string
  status?: number
  createdAt?: string
  updatedAt?: string
  name?: string
  nickname?: string
  avatar?: string
  remark?: string
}
