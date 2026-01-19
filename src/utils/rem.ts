/**
 * rem 等比例缩放工具
 * 根据屏幕宽度动态调整根元素的 font-size，实现页面等比例缩放
 */

interface RemConfig {
  /** 设计稿基准宽度，默认 1920px */
  baseWidth?: number
  /** 根元素最小 font-size，默认 12px */
  minFontSize?: number
  /** 根元素最大 font-size，默认 24px */
  maxFontSize?: number
  /** 是否在窗口大小改变时重新计算，默认 true */
  resize?: boolean
}

/**
 * 初始化 rem 等比例缩放
 * @param config 配置选项
 */
export function initRem(config: RemConfig = {}) {
  const {
    baseWidth = 1920,
    minFontSize = 10,
    maxFontSize = 64,
    resize = true,
  } = config

  /**
   * 计算并设置根元素的 font-size
   */
  const setRem = () => {
    const clientWidth = document.documentElement.clientWidth || window.innerWidth
    // 计算缩放比例
    const scale = clientWidth / baseWidth
    // 计算 font-size（基准为 16px）
    let fontSize = 16 * scale

    // 限制在最小和最大值之间
    fontSize = Math.max(minFontSize, Math.min(maxFontSize, fontSize))

    // 设置根元素的 font-size
    document.documentElement.style.fontSize = `${fontSize}px`
  }

  // 初始化设置
  setRem()

  // 监听窗口大小变化
  if (resize) {
    let timer: ReturnType<typeof setTimeout> | null = null
    const handleResize = () => {
      if (timer) {
        clearTimeout(timer)
      }
      // 防抖处理
      timer = setTimeout(() => {
        setRem()
      }, 100)
    }

    window.addEventListener('resize', handleResize)

    // 返回清理函数
    return () => {
      window.removeEventListener('resize', handleResize)
      if (timer) {
        clearTimeout(timer)
      }
    }
  }
}

/**
 * px 转 rem 的工具函数
 * @param px 像素值
 * @param baseFontSize 基准 font-size，默认 16
 * @returns rem 值
 */
export function pxToRem(px: number, baseFontSize: number = 16): string {
  return `${px / baseFontSize}rem`
}

/**
 * rem 转 px 的工具函数
 * @param rem rem 值
 * @param baseFontSize 基准 font-size，默认 16
 * @returns 像素值
 */
export function remToPx(rem: number, baseFontSize: number = 16): number {
  return rem * baseFontSize
}
