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
  /** 是否转换 Ant Design 样式，默认 true */
  convertAntd?: boolean
}

/**
 * 统一的 rem 系统初始化函数
 * 同时初始化 rem 等比例缩放和 Ant Design 样式转换
 * @param config 配置选项
 */
export function initRem(config: RemConfig = {}) {
  const {
    baseWidth = 1920,
    minFontSize = 10,
    maxFontSize = 64,
    resize = true,
    convertAntd = true,
  } = config

  // 固定的基准 font-size（16px），用于 px 转 rem
  const BASE_FONT_SIZE = 16

  /**
   * 计算并设置根元素的 font-size
   */
  const setRem = () => {
    const clientWidth = document.documentElement.clientWidth || window.innerWidth
    console.log(clientWidth)
    // 计算缩放比例
    const scale = clientWidth / baseWidth
    // 计算 font-size（基准为 16px）
    let fontSize = 16 * scale

    // 限制在最小和最大值之间
    fontSize = Math.max(minFontSize, Math.min(maxFontSize, fontSize))

    // 设置根元素的 font-size
    document.documentElement.style.fontSize = `${fontSize}px`
  }

  // ========== Ant Design 样式转换相关 ==========
  const convertedTags = new WeakSet<HTMLStyleElement>()

  // 转换单个 style 标签的内容
  const convertStyleTag = (styleTag: HTMLStyleElement, force = false) => {
    if (!styleTag.textContent) return

    // 如果已经转换过且不是强制转换，则跳过
    if (!force && convertedTags.has(styleTag)) {
      // 检查内容是否被 Ant Design 更新了
      if (styleTag.textContent.includes('px')) {
        convertedTags.delete(styleTag)
      } else {
        return
      }
    }

    const originalContent = styleTag.textContent

    // 检查是否包含 px
    if (!originalContent.includes('px')) {
      convertedTags.add(styleTag)
      return
    }

    // 转换 px 为 rem（使用固定的 16px 基准）
    const convertedContent = convertPxToRem(originalContent, BASE_FONT_SIZE)

    // 只有当内容发生变化时才更新，避免无限循环
    if (convertedContent !== originalContent) {
      // 使用 requestAnimationFrame 确保在合适的时机更新
      requestAnimationFrame(() => {
        // 再次检查内容是否还是原来的（防止被 Ant Design 更新）
        if (styleTag.textContent === originalContent || styleTag.textContent?.includes('px')) {
          styleTag.textContent = convertedContent
          convertedTags.add(styleTag)
        }
      })
    } else {
      convertedTags.add(styleTag)
    }
  }

  // 转换所有 style 标签
  const convertAllStyleTags = () => {
    if (!convertAntd) return

    const styleTags = document.querySelectorAll('style')
    styleTags.forEach((styleTag) => {
      // 只处理 Ant Design 的样式标签（通常包含 ant- 类名）
      if (
        styleTag.textContent &&
        (styleTag.textContent.includes('.ant-') ||
          styleTag.textContent.includes('ant-'))
      ) {
        convertStyleTag(styleTag)
      }
    })
  }

  // ========== 统一的窗口变化监听 ==========
  let resizeTimer: ReturnType<typeof setTimeout> | null = null

  const handleResize = () => {
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }
    // 防抖处理
    resizeTimer = setTimeout(() => {
      // 更新根元素的 font-size
      setRem()
      // 重新转换 Ant Design 样式（因为 font-size 可能变化）
      if (convertAntd) {
        convertAllStyleTags()
      }
    }, 100)
  }

  // ========== MutationObserver 监听 DOM 变化 ==========
  let observer: MutationObserver | null = null

  if (convertAntd) {
    observer = new MutationObserver((mutations) => {
      let shouldConvert = false

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              (node as HTMLElement).tagName === 'STYLE'
            ) {
              shouldConvert = true
              // 立即转换新添加的 style 标签
              convertStyleTag(node as HTMLStyleElement)
            }
          })
        } else if (mutation.type === 'characterData') {
          const target = mutation.target
          if (
            target.nodeType === Node.TEXT_NODE &&
            target.parentNode &&
            (target.parentNode as HTMLElement).tagName === 'STYLE'
          ) {
            shouldConvert = true
            // 如果内容被更新，移除标记以便重新转换
            const styleTag = target.parentNode as HTMLStyleElement
            convertedTags.delete(styleTag)
          }
        }
      })

      if (shouldConvert) {
        // 延迟执行，确保样式已完全注入
        setTimeout(convertAllStyleTags, 10)
      }
    })

    // 开始观察
    observer.observe(document.head, {
      childList: true,
      subtree: false,
      characterData: true,
      attributes: true,
      attributeFilter: ['textContent'],
    })
  }

  // ========== 初始化 ==========
  // 初始化设置 rem
  setRem()

  // 监听窗口大小变化
  if (resize) {
    window.addEventListener('resize', handleResize)
  }

  // 初始转换 Ant Design 样式
  if (convertAntd) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(convertAllStyleTags, 100)
      })
    } else {
      setTimeout(convertAllStyleTags, 100)
    }
  }

  // ========== 返回统一的清理函数 ==========
  return () => {
    // 清理窗口大小监听
    if (resize) {
      window.removeEventListener('resize', handleResize)
    }
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }

    // 清理 MutationObserver
    if (observer) {
      observer.disconnect()
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

/**
 * 将样式字符串中的 px 转换为 rem
 * @param styleValue 样式值（如 "16px"）
 * @param baseFontSize 基准 font-size，默认 16
 * @returns 转换后的 rem 值（如 "1rem"）
 */
function convertPxToRem(styleValue: string, baseFontSize: number = 16): string {
  // 匹配数字+px的模式，但排除一些特殊情况（如0px、1px等可能需要保留的）
  return styleValue.replace(/(\d+\.?\d*)px/g, (_match, pxValue) => {
    const numValue = parseFloat(pxValue)
    // 小于等于1px的值不转换，避免过小的值
    if (numValue <= 1) {
      return `${pxValue}px`
    }
    const remValue = numValue / baseFontSize
    // 保留足够的小数精度
    return `${remValue.toFixed(4)}rem`.replace(/\.?0+rem$/, 'rem')
  })
}

