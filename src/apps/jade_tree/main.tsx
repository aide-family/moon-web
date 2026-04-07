import { createRoot } from 'react-dom/client'
import App from './App'
import '@/styles/index.css'
import { initRem } from '@/utils'

initRem({
  baseWidth: 1920,
  minFontSize: 14,
  maxFontSize: 64,
  resize: true,
  convertAntd: true,
})

createRoot(document.getElementById('root')!).render(<App />)
