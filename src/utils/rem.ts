/**
 * rem 等比例缩放工具
 * 根据屏幕宽度动态调整根元素的 font-size，实现页面等比例缩放
 */

interface RemConfig {
  /** 设计稿基准宽度，默认 1920px */
  baseWidth?: number
  /** 根元素最小 font-size，默认 14px */
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
    minFontSize = 14,
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
  let originalCreateElement: typeof document.createElement | null = null
  let styleProxyInstalled = false

  // 转换样式内容（如果包含 antd 样式）
  const convertStyleContent = (content: string): string => {
    if (!content || !content.includes('px')) {
      return content
    }

    // 只处理 Ant Design 的样式
    if (!content.includes('.ant-') && !content.includes('ant-')) {
      return content
    }

    return convertPxToRem(content, BASE_FONT_SIZE)
  }

  // 转换单个 style 标签的内容
  const convertStyleTag = (styleTag: HTMLStyleElement, force = false) => {
    if (!styleTag.textContent) return

    // 如果已经转换过且不是强制转换，则检查是否需要重新转换
    if (!force && convertedTags.has(styleTag)) {
      // 检查内容是否被 Ant Design 更新了（重新注入了 px 单位）
      if (styleTag.textContent.includes('px')) {
        // 如果包含 px，说明样式被更新了，需要重新转换
        convertedTags.delete(styleTag)
      } else {
        // 如果已经是 rem 单位，跳过
        return
      }
    }

    const originalContent = styleTag.textContent
    const convertedContent = convertStyleContent(originalContent)

    // 只有当内容发生变化时才更新，避免无限循环
    if (convertedContent !== originalContent) {
      try {
        // 使用 Object.defineProperty 直接设置，避免触发 setter
        const descriptor = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent')
        if (descriptor && descriptor.set) {
          descriptor.set.call(styleTag, convertedContent)
        } else {
          styleTag.textContent = convertedContent
        }
        convertedTags.add(styleTag)
      } catch (e) {
        // 如果更新失败（可能样式标签被移除），忽略错误
        console.warn('Failed to convert style tag:', e)
      }
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

  // ========== 使用 Proxy 拦截样式注入 ==========
  let observer: MutationObserver | null = null
  let checkInterval: ReturnType<typeof setInterval> | null = null

  if (convertAntd && !styleProxyInstalled) {
    styleProxyInstalled = true

    // 拦截 document.createElement，拦截 style 标签的创建
    originalCreateElement = document.createElement.bind(document)
    document.createElement = function (
      tagName: string,
      options?: ElementCreationOptions
    ): HTMLElement {
      const element = originalCreateElement!(tagName, options)

      // 如果是 style 标签，拦截 textContent 和 innerHTML 的设置
      if (tagName.toLowerCase() === 'style') {
        const styleElement = element as HTMLStyleElement

        // 保存原始描述符
        const originalTextContentDescriptor = Object.getOwnPropertyDescriptor(
          Node.prototype,
          'textContent'
        )
        const originalInnerHTMLDescriptor = Object.getOwnPropertyDescriptor(
          Element.prototype,
          'innerHTML'
        )

        // 拦截 textContent
        Object.defineProperty(styleElement, 'textContent', {
          get() {
            return originalTextContentDescriptor?.get?.call(this) || ''
          },
          set(value: string) {
            // 在设置时就立即转换
            const converted = convertStyleContent(value || '')
            // 调用原始的 setter，传入转换后的值
            if (originalTextContentDescriptor?.set) {
              originalTextContentDescriptor.set.call(this, converted)
            }
            convertedTags.add(styleElement)
          },
          configurable: true,
          enumerable: true,
        })

        // 拦截 innerHTML（某些库可能使用 innerHTML）
        Object.defineProperty(styleElement, 'innerHTML', {
          get() {
            return originalInnerHTMLDescriptor?.get?.call(this) || ''
          },
          set(value: string) {
            const converted = convertStyleContent(value || '')
            if (originalInnerHTMLDescriptor?.set) {
              originalInnerHTMLDescriptor.set.call(this, converted)
            }
            convertedTags.add(styleElement)
          },
          configurable: true,
          enumerable: true,
        })
      }

      return element
    }

    // MutationObserver 作为备用方案，处理动态修改的情况
    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData') {
          const target = mutation.target
          if (
            target.nodeType === Node.TEXT_NODE &&
            target.parentNode &&
            (target.parentNode as HTMLElement).tagName === 'STYLE'
          ) {
            // 如果内容被更新，移除标记以便重新转换
            const styleTag = target.parentNode as HTMLStyleElement
            convertedTags.delete(styleTag)
            convertStyleTag(styleTag)
          }
        }
      })
    })

    // 开始观察 document.head 和 document.body
    observer.observe(document.head, {
      characterData: true,
      characterDataOldValue: true,
      subtree: true,
    })

    const observeBody = () => {
      if (document.body) {
        observer?.observe(document.body, {
          characterData: true,
          characterDataOldValue: true,
          subtree: true,
        })
      }
    }

    if (document.body) {
      observeBody()
    } else {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeBody)
      } else {
        setTimeout(observeBody, 0)
      }
    }

    // 定期检查作为最后的保障
    checkInterval = setInterval(() => {
      convertAllStyleTags()
    }, 1000) // 降低频率到 1 秒，因为 Proxy 已经拦截了大部分情况
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
    // 立即执行一次转换
    convertAllStyleTags()
    
    // 在 DOM 加载完成后再次转换
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        // 多次延迟转换，确保 antd 样式已完全注入
        setTimeout(convertAllStyleTags, 50)
        setTimeout(convertAllStyleTags, 200)
        setTimeout(convertAllStyleTags, 500)
      })
    } else {
      // 如果 DOM 已经加载完成，也进行多次延迟转换
      setTimeout(convertAllStyleTags, 50)
      setTimeout(convertAllStyleTags, 200)
      setTimeout(convertAllStyleTags, 500)
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

    // 清理定期检查
    if (checkInterval) {
      clearInterval(checkInterval)
    }

    // 恢复原始的 createElement（如果需要）
    if (originalCreateElement && styleProxyInstalled) {
      document.createElement = originalCreateElement
      styleProxyInstalled = false
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

