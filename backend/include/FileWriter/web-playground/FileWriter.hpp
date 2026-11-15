/*
	Name: FileWriter.hpp
	License: Apache 2.0
	Description: FileWriter 的 Playground 实现。
	             静态站点不可写，产物一律写入内存文件。
*/

#pragma once

#include "IFileWriter.hpp"
#include "PlaygroundUtility.hpp"

namespace stamon::webplayground {

class FileWriter {
	ArrayList<byte> *buffer;

public:
	log::Exception *ex;

	FileWriter(log::Exception *e, const String &filename)
		: buffer(&playground::MemoryFile::open(filename))
		, ex(e) {
	}

	FileWriter(const FileWriter &) = delete;
	FileWriter &operator=(const FileWriter &) = delete;

	void write(byte b) {
		buffer->add(b);
	}

	void close() {
		// 数据已逐字节写入内存文件，无需额外处理
	}
};

} // namespace stamon::webplayground

namespace stamon {

using FileWriter = interface::IFileWriter<webplayground::FileWriter>;

}
