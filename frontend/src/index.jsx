/* @refresh reload */
import { render } from 'solid-js/web';
import App from './App';
import { registerSW } from 'virtual:pwa-register'

const root = document.getElementById('root');
const loading = document.getElementById('app-loading');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

const renderApp = () => {
  if (loading) loading.remove()
  render(() => <App />, root)
}

// 注册前是否已有控制器：首次访问（含首次安装 SW）没有旧界面可闪，直接渲染
const hadController = 'serviceWorker' in navigator && Boolean(navigator.serviceWorker.controller)

if (import.meta.env.DEV || !('serviceWorker' in navigator) || !hadController) {
  renderApp()
} else {
  // 旧页面必须先确认无更新才渲染；发现更新则保持空白，等新 SW 接管后 reload，
  // 由新版本页面渲染，避免旧 UI 先出现再闪一下
  let updated = false
  let reloading = false
  let settled = false
  let rendered = false
  let registration
  let installing

  const finish = () => { if (!rendered && !updated) { rendered = true; renderApp() } }
  const reloadWithNewVersion = () => {
    updated = true
    if (reloading || !registration) return
    reloading = true
    navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true })
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    } else if (installing?.state === 'installing') {
      // skipWaiting 在 installing 阶段无效，等进入 waiting 再发消息
      installing.addEventListener('statechange', function activate() {
        if (installing.state === 'installed') {
          installing.removeEventListener('statechange', activate)
          registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
        }
      })
    }
  }

  const watchInstall = (sw) => {
    if (!sw || sw === installing) return
    installing = sw
    sw.addEventListener('statechange', function onChange() {
      if (sw.state === 'installed') {
        sw.removeEventListener('statechange', onChange)
        reloadWithNewVersion()
      } else if (sw.state === 'redundant' && !settled) {
        // 安装失败：照常渲染，避免白屏
        settled = true
        finish()
      } else if (sw.state === 'activated' && !updated) {
        // 新 SW 自行接管：本页内容已是最新，无需等待
        finish()
      }
    })
  }

  const settle = () => {
    if (settled || !registration) return
    settled = true
    // register({ immediate: true }) 已发起检查；waiting/installing 都视为有更新，
    // 此时不渲染旧界面，由安装结果与接管流程决定后续
    if (registration.waiting) return reloadWithNewVersion()
    if (registration.installing) return watchInstall(registration.installing)
    finish()
  }

  registerSW({
    immediate: true,
    // workbox 延迟的 waiting 事件仅作为兜底提示；上面已通过原生生命周期更早接管
    onNeedRefresh: reloadWithNewVersion,
    onRegisterError: () => { settled = true; finish() },
    onRegisteredSW: (_, r) => {
      registration = r
      r?.addEventListener('updatefound', () => watchInstall(r.installing))
      settle()
    }
  })
}
