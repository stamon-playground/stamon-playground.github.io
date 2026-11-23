/*
	Name: Main.cpp
	License: Apache 2.0
	Description: Playground 后端入口。
	             Playground 没有命令行，本文件只提供网页调用所需的接口。
*/

#include "PlaygroundUtility.hpp"
#include "Stamon.hpp"

using namespace stamon;

namespace {

const char *const SOURCE_FILE_NAME = "main.st"; // 用户源码
const char *const BINARY_FILE_NAME = "<bin>"; // 编译产物

void loadSource(const char *code) {
	// 把用户源码放进内存文件，编译时由 FileReader 读回
	ArrayList<byte> &source = playground::MemoryFile::open(SOURCE_FILE_NAME);

	for (unsigned int i = 0; code[i] != '\0'; i++) {
		source.add((byte) code[i]);
	}
}

void printAll(ArrayList<String> &messages) {
	// 把消息逐条输出到页面
	for (unsigned int i = 0; i < messages.size(); i++) {
		platform_print(messages[i] + String("\n"));
	}
}

void execute(const char *code) {
	loadSource(code);

	Stamon stamon;

	stamon.compile(SOURCE_FILE_NAME, BINARY_FILE_NAME, true, false);

	if (stamon.getErrorMessages()->empty()) {
		stamon.run(BINARY_FILE_NAME, vm::config::isGC,
				vm::config::MemLimit, vm::config::PoolCacheSize);
	}

	printAll(*stamon.getErrorMessages());
	printAll(*stamon.getWarningMessages());
}

} // namespace

PLAYGROUND_EXPORT(int) runStamon(const char *code) {
	execute(code);
	return 0;
}

PLAYGROUND_EXPORT(const char *) getVersion() {
	// 版本号即 Stamon.hpp 中 VerX/VerY/VerZ 的来源，编码为 X.Y.Z 供前端显示
	static const String version = toString(config::STAMON_VER_X)
								+ "."
								+ toString(config::STAMON_VER_Y)
								+ "."
								+ toString(config::STAMON_VER_Z);

	return version.getstr(); // 静态量保证指针长期有效
}
