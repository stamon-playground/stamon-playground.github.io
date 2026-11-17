/* @refresh reload */
import { render } from 'solid-js/web';
import App from './App';
import { registerSW } from 'virtual:pwa-register'

// 新版本只会在页面启动时被发现，此时立即确认更新，避免打断正在编辑的会话
const updateServiceWorker = registerSW({
  immediate: true,
  onNeedRefresh: () => updateServiceWorker()
})

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => <App />, root);
