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
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      filename: 'serviceWorker.js',
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
