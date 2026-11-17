import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import suidPlugin from "@suid/vite-plugin"
import { ViteMinifyPlugin } from 'vite-plugin-minify'
import { VitePWA } from 'vite-plugin-pwa'

// 构建时间取配置求值时刻并换算到 UTC+8，避免不同时区的构建机产出不同时间
// toISOString 按 UTC 输出且自带补零，整体偏移 8 小时后即为北京时间
const buildTime = new Date(Date.now() + 8 * 60 * 60 * 1000)
  .toISOString().slice(0, 19).replace('T', ' ')
const BUILD_TIME = `UTC+8（北京时间）${buildTime}`

export default defineConfig({
  define: {
    __BUILD_TIME__: JSON.stringify(BUILD_TIME)
  },
  plugins: [
    suidPlugin(),
    solidPlugin(),
    ViteMinifyPlugin(),
    VitePWA({
      // 何时接管新版本交给 src/index.jsx 的 registerSW 回调决定
      registerType: 'prompt',
      // 注册由 src/index.jsx 负责，避免 index.html 内联脚本重复注册
      injectRegister: false,
      filename: 'serviceWorker.js',
      workbox: {
        // 新版本安装后保持等待，只在页面启动时由页面发消息触发激活，避免打断正在编辑的会话
        skipWaiting: false,
        // 激活后立即接管当前页面，页面才能收到 controlling 事件完成刷新
        clientsClaim: true
      },
      manifest: {
        name: "Stamon Playground",
        short_name: "Stamon",
        description:"Run stamon in a one-click playground",
        lang: 'zh-CN',
        theme_color: '#ffffff',
        icons: [{
          src: 'logo.svg',
          type: "image/svg+xml",
          sizes: "any",
          purpose: "any"
        }]
      }
    })
  ],
  build: {
    minify: 'terser',
    reportCompressedSize: false,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    }
  }
})
