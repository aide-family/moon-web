export type MainMode = 'micro' | 'integrated'

/** 主应用运行模式：micro 微前端嵌入子应用，integrated 打包本地组件 */
export const MAIN_MODE: MainMode =
  import.meta.env.VITE_MAIN_MODE === 'integrated' ? 'integrated' : 'micro'

export const isMainIntegrated = (): boolean => MAIN_MODE === 'integrated'

export const isMainMicro = (): boolean => MAIN_MODE === 'micro'
