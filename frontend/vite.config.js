import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import suidPlugin from "@suid/vite-plugin"
import { ViteMinifyPlugin } from 'vite-plugin-minify'
import { VitePWA } from 'vite-plugin-pwa'
import packageInfo from './package.json'

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
        name: packageInfo.fullname,
        short_name: packageInfo.shortname,
        description: packageInfo.description,
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
    target: 'esnext',
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
        assetFileNames: '[ext]/[name]-[hash].[ext]',
        manualChunks: (id) => {
          if (id.includes('node_modules')) return 'vendor'
          if (id.includes('stamon.js')) return 'stamon'
        }
      }
    }
  }
})
