/**
 * 图形验证码接口
 * GET /v1/captcha - 获取验证码（Captcha_GetCaptcha）
 */

import { http } from '../../common/request'

export interface GetCaptchaResult {
  /** 验证码唯一标识，提交校验时需携带 */
  captchaId?: string
  /** 验证码图片 Base64 字符串 */
  captchaB64s?: string
}

/**
 * 获取图形验证码
 * @returns { captchaId, captchaB64s }
 */
export function getCaptcha(): Promise<GetCaptchaResult> {
  return http.get<GetCaptchaResult>('/captcha', undefined, { skipAuth: true })
}
