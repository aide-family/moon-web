import { createRoot } from 'react-dom/client'
import App from './pages'

import './index.css'

// 开发环境启用 Mock
if (import.meta.env.DEV) {
  import('./mocks/index')
}

const el = document.getElementById('root')
if (!el) {
  throw new Error('Root element not found')
}

const root = createRoot(el)
root.render(<App />)
