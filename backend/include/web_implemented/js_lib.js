mergeInto(LibraryManager.library, {
  js_print: function (s) {
    s = UTF8ToString(s)
    postMessage({ type: 'print', output: s })
  }
})