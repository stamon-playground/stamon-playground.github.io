import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import suidPlugin from "@suid/vite-plugin"
import { ViteMinifyPlugin } from 'vite-plugin-minify'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
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
