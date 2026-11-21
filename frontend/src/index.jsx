/* @refresh reload */
import { render } from 'solid-js/web';
import App from './App';
import { registerSW } from 'virtual:pwa-register'

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

const renderApp = () => render(() => <App />, root)

// 注册前是否已有控制器：无控制器说明是首次访问（首次安装不是更新，必须照常渲染）
const hadController = 'serviceWorker' in navigator && Boolean(navigator.serviceWorker.controller)
let updatePending = false

// 安装结束前保持等待：安装失败（redundant）时需恢复渲染，避免白屏
const settleInstall = (sw) => new Promise((resolve) => {
  if (sw.state !== 'installing') return resolve()
  sw.addEventListener('statechange', function done() {
    if (sw.state !== 'installing') {
      sw.removeEventListener('statechange', done)
      resolve()
    }
  })
})

// 开发模式与不支持 SW 的环境无需检查，直接渲染
if (import.meta.env.DEV || !('serviceWorker' in navigator)) {
  renderApp()
} else {
  // 先完成更新检查再渲染：发现新版本时不渲染旧界面，由 onNeedRefresh 激活后
  // reload，新页面已是最新版本，届时再渲染，避免界面先跳出再闪一下
  const updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh: () => {
      updatePending = true
      updateServiceWorker()
    },
    onRegisterError: renderApp,
    onRegisteredSW: async (_, registration) => {
      if (!hadController || !registration) return renderApp()
      try {
        // 等待更新检查收敛，此时若有新版本已进入 installing / waiting
        await registration.update()
      } catch {
        return renderApp()
      }
      const sw = registration.waiting || registration.installing
      if (!sw) return updatePending ? undefined : renderApp()
      await settleInstall(sw)
      // 安装失败则照常渲染；安装成功则交给 onNeedRefresh 激活并 reload
      if (sw.state === 'redundant' && !updatePending) renderApp()
    }
  })
}
