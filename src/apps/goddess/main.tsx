import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import '@/styles/index.css'
import { initRem } from '@/utils'
import { message } from 'antd'

/** 获取 micro-app 中当前子应用的容器节点 */
const getContainer = () => {
  return document.getElementById('root') || document.body
}
message.config({ getContainer })

// 初始化 rem 等比例缩放（无论是否在微应用环境中都需要初始化，以确保 antd 样式正确转换）
initRem({
  baseWidth: 1920, // 设计稿基准宽度
  minFontSize: 14, // 最小字体大小
  maxFontSize: 64, // 最大字体大小
  resize: true, // 窗口大小改变时重新计算
  convertAntd: true, // 转换 Ant Design 样式
})

createRoot(document.getElementById('root')!).render(<App />)
