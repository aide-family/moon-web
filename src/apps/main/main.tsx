import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import '@/styles/index.css'
import { initRem } from '@/utils'
import microApp from '@micro-zoe/micro-app'

// 初始化 micro-app（只执行一次）
// 对于 Vite 开发环境，需要禁用沙箱以支持 ES 模块
if (!(window as Window & { __MICRO_APP_STARTED__?: boolean }).__MICRO_APP_STARTED__) {
  microApp.start()
  ;(window as Window & { __MICRO_APP_STARTED__?: boolean }).__MICRO_APP_STARTED__ = true
}

// 初始化 rem 等比例缩放
initRem({
  baseWidth: 1920, // 设计稿基准宽度
  minFontSize: 10, // 最小字体大小
  maxFontSize: 64, // 最大字体大小
  resize: true, // 窗口大小改变时重新计算
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

