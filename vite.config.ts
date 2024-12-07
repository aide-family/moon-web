import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        math: 'always'
      },
      scss: {
        additionalData: '@import"./src/assets/styles/variables.scss"; @import "./src/assets/styles/mixin.scss";'
      }
    }
  }
})
