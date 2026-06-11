import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import '@/styles/index.css'
import { initRem, isMainIntegrated } from '@/utils'
import microApp from '@micro-zoe/micro-app'
import { message } from 'antd'

// 微前端模式才初始化 micro-app
if (
  !isMainIntegrated() &&
  !(window as Window & { __MICRO_APP_STARTED__?: boolean })
    .__MICRO_APP_STARTED__
) {
  microApp.start()
  ;(
    window as Window & { __MICRO_APP_STARTED__?: boolean }
  ).__MICRO_APP_STARTED__ = true
}

/** 获取 micro-app 中当前子应用的容器节点 */
const getContainer = () => {
  return document.getElementById('root') || document.body
}
message.config({ getContainer })

// 初始化 rem 等比例缩放（平板/手机下保证最小字号可读）
initRem({
  baseWidth: 1920, // 设计稿基准宽度
  minFontSize: 14, // 最小字体大小，兼顾手机可读性
  maxFontSize: 16, // 最大字体大小
  resize: true, // 窗口大小改变时重新计算
})

createRoot(document.getElementById('root')!).render(<App />)
