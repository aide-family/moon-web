import React from 'react'
import { createRoot } from 'react-dom/client'
import { px2remTransformer, StyleProvider } from '@ant-design/cssinjs'
import '@/utils/rem'
import App from './pages'
import './index.css'

const px2rem = px2remTransformer({
  rootValue: 32 // 32px = 1rem; @default 16
})

const root = createRoot(document.getElementById('root')!)
root.render(
  <StyleProvider transformers={[px2rem]} layer>
    <App />
  </StyleProvider>
)
