// 导出主要组件
export { default as CaptchaButton } from './captcha-button'
export { default as ClickCaptcha } from './click-captcha'
export { default as RotateCaptcha } from './rotate-captcha'
export { default as SlideCaptcha } from './slide-captcha'
export { default as SmartCaptcha } from './smart-captcha'

// 导出类型
export type { CaptchaButtonProps, CaptchaType } from './captcha-button'
export type { ClickCaptchaProps } from './click-captcha'
export type { RotateCaptchaProps } from './rotate-captcha'
export type { SlideCaptchaProps } from './slide-captcha'
export type { SmartCaptchaProps } from './smart-captcha'

// 导出 hook
export { useCaptcha } from './hook'
export type { CaptchaConfig, CaptchaData } from './hook'

// 导出 API 相关类型
export type { CaptchaReply, CaptchaVerifyData } from '@/api/authorization'

