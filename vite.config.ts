import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import postcssPxToRem from 'postcss-pxtorem'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  css: {
    // 预处理器配置项
    preprocessorOptions: {
      less: {
        math: 'always'
      },
      scss: {
        additionalData: '@import"./src/assets/styles/variables.scss"; @import "./src/assets/styles/mixin.scss";'
      }
    },
    // 配置 postcss-pxtorem 插件
    postcss: {
      plugins: [
        postcssPxToRem({
          rootValue: 16, // UI设计稿的宽度/10
          unitPrecision: 3, // 转rem精确到小数点多少位
          propList: ['*'], // 需要转换的属性 *表示所有
          selectorBlackList: ['ignore'], // 不进行px转换的选择器
          replace: true, // 是否直接更换属性值，而不添加备用属性
          mediaQuery: false, // 是否在媒体查询的css代码中也进行转换
          minPixelValue: 0, // 设置要替换的最小像素值
          exclude: /node_modules/i // 排除node_modules文件夹下的文件
        })
      ]
    }
  }
})
