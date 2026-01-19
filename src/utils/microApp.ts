/**
 * micro-app 通信工具函数
 */

interface MicroAppData {
  type?: string
  data?: {
    app?: string
    path?: string
  }
  pathname?: string
  [key: string]: unknown
}

interface MicroAppWindow extends Window {
  __MICRO_APP_BASE_ROUTE__?: string
  microApp?: {
    dispatch: (data: MicroAppData) => void
    addDataListener: (callback: (data: MicroAppData) => void) => void
    removeDataListener: (callback: (data: MicroAppData) => void) => void
    getBaseRoute?: () => string
  }
}

// 获取 micro-app 的 baseroute
export function getBaseRoute(): string {
  const win = window as MicroAppWindow
  
  // 优先从 micro-app 全局变量获取
  if (win.__MICRO_APP_BASE_ROUTE__) {
    return win.__MICRO_APP_BASE_ROUTE__
  }
  
  // 从 micro-app 实例中获取
  if (win.microApp?.getBaseRoute) {
    const route = win.microApp.getBaseRoute()
    if (route) return route
  }
  
  // 如果是 iframe 模式，尝试从 URL 或 location 获取
  // 检查是否在 iframe 中
  if (window.self !== window.top) {
    // 在 iframe 中，尝试从父窗口获取或从当前路径推断
    try {
      const pathname = window.location.pathname
      // 如果路径包含 /test 或 /template，提取作为 baseroute
      if (pathname.startsWith('/test')) {
        return '/test'
      }
      if (pathname.startsWith('/template')) {
        return '/template'
      }
    } catch {
      // 跨域限制，无法访问父窗口
    }
  }
  
  return ''
}

// 向主应用发送数据
export function sendDataToMainApp(data: MicroAppData) {
  const win = window as MicroAppWindow
  if (win.microApp) {
    win.microApp.dispatch(data)
  }
}

// 跳转到其他子应用
export function navigateToSubApp(appName: string, path: string = '/') {
  sendDataToMainApp({
    type: 'navigate',
    data: {
      app: appName,
      path: path,
    },
  })
}

// 监听主应用发送的数据
export function listenToMainApp(callback: (data: MicroAppData) => void) {
  const win = window as MicroAppWindow
  if (win.microApp) {
    win.microApp.addDataListener((data: MicroAppData) => {
      callback(data)
    })
  }
}

// 移除监听
export function removeMainAppListener(callback: (data: MicroAppData) => void) {
  const win = window as MicroAppWindow
  if (win.microApp) {
    win.microApp.removeDataListener(callback)
  }
}

