// POST /v1/authorization/captcha

import request from '../request'

export interface GetCaptchaRequest {
  captchaType: number
  theme: string
  width: number
  height: number
}

export interface GetCaptchaResponse {
  captchaType: number
  captcha: string
  id: string
}

const defaultGetCaptchaParams: GetCaptchaRequest = {
  captchaType: 0,
  theme: (localStorage.getItem('theme') || 'dark') === 'dark' ? 'light' : 'dark',
  width: 100,
  height: 40
}

export const getCaptcha = (params: GetCaptchaRequest = defaultGetCaptchaParams) => {
  return request.POST<GetCaptchaResponse>('/v1/authorization/captcha', params)
}
