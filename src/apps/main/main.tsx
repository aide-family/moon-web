import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import '@/styles/index.css'
import { initRem } from '@/utils'

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

