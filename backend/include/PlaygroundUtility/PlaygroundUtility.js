/*
	Name: PlaygroundUtility.js
	License: Apache 2.0
	Description: PlaygroundUtility.hpp 中 bridge 命名空间的浏览器侧实现，
	             由 emcc --js-library 链接进产物，运行在 Web Worker 中。
*/

mergeInto(LibraryManager.library, {
  playground_print: function (text) {
    postMessage({ type: 'print', output: UTF8ToString(text) })
  },

  playground_fetch_file__deps: ['malloc'],
  playground_fetch_file__sig: 'iii',
  playground_fetch_file: function (path, sizePtr) {
    // 标准库文件与站点根目录同级，路径约定见 Makefile 的发布步骤
    const url = '/stamon-lib/' + UTF8ToString(path)

    const request = new XMLHttpRequest()
    request.overrideMimeType('text/plain; charset=x-user-defined')

    try {
      request.open('GET', url, false)
      request.send(null)
    } catch (error) {
      return 0
    }

    if (request.status !== 200) {
      return 0
    }

    const content = request.responseText
    const buffer = _malloc(Math.max(content.length, 1))

    for (let i = 0; i < content.length; i++) {
      HEAPU8[buffer + i] = content.charCodeAt(i) & 0xff
    }

    HEAPU32[sizePtr >> 2] = content.length

    return buffer
  }
})
