import stamon from './stamon.js'
import stamonWasm from './stamon.wasm?url'

let module

// wasm 由 Vite 作为资源处理，路径在打包后会变，必须显式告诉 Emscripten
stamon({ locateFile: () => stamonWasm }).then(mod => {
  module = mod

  // 版本号由后端提供，模块就绪后主动上报，页面无需额外请求
  postMessage({ type: 'version', version: mod.UTF8ToString(mod._getVersion()) })

  self.onmessage = function (e) {
    const data = e.data
    if (data.type === 'run') {
      const valuePtr = module.stringToNewUTF8(data.input)

      module._runStamon(valuePtr)
      module._free(valuePtr)

      postMessage({ type: 'finish' })
    }
  }
})
