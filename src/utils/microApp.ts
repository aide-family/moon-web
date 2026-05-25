/**
 * 检测是否在微服务环境中
 */
export function isInMicroApp(): boolean {
  // 检查 window.microApp 是否存在（micro-app 注入的全局对象）
  const win = window as Window & {
    microApp?: unknown
    __MICRO_APP_BASE_ROUTE__?: string
  }

  // 方式1：检查 microApp 对象
  if (win.microApp) {
    return true
  }

  // 方式2：检查 __MICRO_APP_BASE_ROUTE__（主应用设置的标识）
  if (win.__MICRO_APP_BASE_ROUTE__) {
    return true
  }

  // 方式3：检查是否在 iframe 中（micro-app 使用 iframe 模式）
  try {
    if (window.self !== window.top || window.parent !== window) {
      return true
    }
  } catch {
    // 跨域情况下会抛出异常，说明在 iframe 中
    return true
  }

  return false
}
