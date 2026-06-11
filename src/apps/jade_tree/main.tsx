import { createRoot } from 'react-dom/client'
import App from './App'
import '@/styles/index.css'
import { initRem } from '@/utils'
import { message } from 'antd'

/** 获取 micro-app 中当前子应用的容器节点 */
const getContainer = () => {
  return document.getElementById('root') || document.body
}
message.config({ getContainer })

initRem({
  baseWidth: 1920,
  minFontSize: 14,
  maxFontSize: 64,
  resize: true,
  convertAntd: true,
})

createRoot(document.getElementById('root')!).render(<App />)
