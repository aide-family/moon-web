import '@/utils/rem'
import { px2remTransformer, StyleProvider } from '@ant-design/cssinjs'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './pages'

const px2rem = px2remTransformer({
  rootValue: 32 // 32px = 1rem; @default 16
})

const root = createRoot(document.getElementById('root')!)
root.render(
  <StyleProvider transformers={[px2rem]} layer>
    <App />
  </StyleProvider>
)
