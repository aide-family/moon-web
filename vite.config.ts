import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

// 定义所有应用
const apps = ['main', 'goddess', 'rabbit', 'marksman', 'jade_tree']

// 应用端口配置
const appPorts = {
  main: 5172,
  main_integrated: 5173,
  goddess: 5174,
  rabbit: 5175,
  marksman: 5176,
  jade_tree: 5177,
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 获取应用名称，支持通过环境变量指定
  const appName = process.env.APP_NAME
  const isMainIntegrated =
    appName === 'main' && process.env.VITE_MAIN_MODE === 'integrated'
  const buildAppName = isMainIntegrated ? 'main-integrated' : appName
  const env = loadEnv(mode, process.cwd())
  const appUrls = {
    goddess: {
      v1: env.VITE_V1_GODDESS_API || '',
      health: env.VITE_HEALTH_GODDESS_API || '',
    },
    rabbit: {
      v1: env.VITE_V1_RABBIT_API || '',
      health: env.VITE_HEALTH_RABBIT_API || '',
    },
    main: {
      v1: env.VITE_V1_MAIN_API || '',
      health: env.VITE_HEALTH_MAIN_API || '',
    },
    marksman: {
      v1: env.VITE_V1_MARKSMAN_API || '',
      health: env.VITE_HEALTH_MARKSMAN_API || '',
    },
    jade_tree: {
      v1: env.VITE_V1_JADE_TREE_API || '',
      health: env.VITE_HEALTH_JADE_TREE_API || '',
    },
  }
  const v1ApiUrl = appName ? appUrls[appName as keyof typeof appUrls]?.v1 : ''
  const healthApiUrl = appName
    ? appUrls[appName as keyof typeof appUrls]?.health
    : ''
  // 如果指定了应用名称，只构建该应用
  if (appName && apps.includes(appName)) {
    const appHtmlPath = path.resolve(
      __dirname,
      `src/apps/${appName}/index.html`,
    )
    const appRoot = path.resolve(__dirname, `src/apps/${appName}`)
    const srcRoot = path.resolve(__dirname, './src')
    const appBase = process.env.VITE_APP_BASE || '/'

    return {
      base: appBase,
      // 在开发模式下，将 root 设置为应用目录，这样 Vite 只会处理该应用的 HTML
      root: appRoot,
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          // 保持 @ 指向 src 目录，这样应用代码中的 @/ 别名仍然可以正常工作
          '@': srcRoot,
        },
      },
      optimizeDeps: {
        exclude: ['lucide-react'],
        include: [
          '@ant-design/icons',
          'antd',
          'ahooks',
          'dayjs',
          'react',
          'react-dom',
          'react-router-dom',
          '@micro-zoe/micro-app',
          '@monaco-editor/react',
          'monaco-editor',
          'monaco-promql',
        ],
      },
      build: {
        rollupOptions: {
          input: appHtmlPath,
        },
        outDir: path.resolve(__dirname, `dist/${buildAppName}`),
      },
      server: {
        port:
          (isMainIntegrated
            ? appPorts.main_integrated
            : appPorts[appName as keyof typeof appPorts]) || 5172,
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        proxy: {
          '/v1': {
            target: v1ApiUrl,
            changeOrigin: true,
          },
          '/oauth2': {
            target: v1ApiUrl,
            changeOrigin: true,
          },
          '/health': {
            target: healthApiUrl,
            changeOrigin: true,
          },
        },
      },
    }
  }

  // 统一构建所有应用
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
