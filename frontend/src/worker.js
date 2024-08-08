import stamon from './stamon.js'

let module

stamon().then(mod => {
  module = mod

  self.onmessage = function (e) {
    const data = e.data
    if (data.type === 'run') {
      const valuePtr = module.stringToNewUTF8(data.input)

      module._RunStamon(valuePtr)
      module._free(valuePtr)
    }
  }
})
