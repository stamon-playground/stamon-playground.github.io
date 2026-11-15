/*
	Name: PlaygroundUtility.hpp
	License: Apache 2.0
	Description: Playground 与浏览器之间的对接层。
	             主体代码只通过本文件使用浏览器能力，不直接依赖 Emscripten。
*/

#pragma once

#include "ArrayList.hpp"
#include "String.hpp"
#include "HashMap.hpp"
#include "stdlib.h"

#if defined(__EMSCRIPTEN__)
#include <emscripten.h>
#define PLAYGROUND_EXPORT(rettype) extern "C" EMSCRIPTEN_KEEPALIVE rettype
#else
#define PLAYGROUND_EXPORT(rettype) extern "C" rettype
#endif

namespace stamon::playground {

namespace bridge {
/*
 * 以下函数由 PlaygroundUtility.js 实现（emcc --js-library）。
 * playground_fetch_file 成功时返回由 JS 申请的内存，调用方须用 release 释放。
 */
extern "C" const char *
playground_fetch_file(const char *path, unsigned int *size);
extern "C" void playground_print(const char *text);
} // namespace bridge

inline void release(const char *memory) {
	free((void *) memory);
}

class MemoryFile {
	/*
	 * Playground 部署在静态站点上，无法写盘，
	 * 因此编译产物驻留内存，以文件名区分。
	 * FileWriter 写入的文件，FileReader 可以直接读回。
	 */
	static HashMap<String, ArrayList<byte> *> &registry() {
		// 函数内静态量，避免静态初始化顺序问题
		static HashMap<String, ArrayList<byte> *> files;
		return files;
	}

public:
	static const ArrayList<byte> *find(const String &filename) {
		HashMap<String, ArrayList<byte> *> &files = registry();

		if (!files.exist(filename)) {
			return NULL;
		}

		return files.get(filename);
	}

	static ArrayList<byte> &open(const String &filename) {
		HashMap<String, ArrayList<byte> *> &files = registry();

		if (files.exist(filename)) {
			ArrayList<byte> *existed = files.get(filename);
			existed->clear(); // 覆盖式打开
			return *existed;
		}

		ArrayList<byte> *created = new ArrayList<byte>();
		files.put(filename, created);

		return *created;
	}
};

} // namespace stamon::playground
