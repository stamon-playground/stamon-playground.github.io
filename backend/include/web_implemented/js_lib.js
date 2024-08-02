mergeInto(LibraryManager.library, {
    // c将传入两个int，js返回int
    js_print: function (s) {
      s = UTF8ToString(s);
      document.getElementById("result").value += s;
      console.log(s);
    }
  })
  