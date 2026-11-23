/*
	Name: FileReader.hpp
	License: Apache 2.0
	Description: FileReader 的 Playground 实现。
	             内存文件直接读取，其余文件由浏览器从站点实时抓取。
*/

#pragma once

#define FILE_ERR(reason) \
	THROW(log::Info("FileReader", "FileError", \
			String("an error has occured in ") + String(reason) \
					+ String(": ") + filename, \
			"FileReader()"));

#include "IFileReader.hpp"
#include "PlaygroundUtility.hpp"

namespace stamon::webplayground {

class FileReader {
	SmartPtr<byte[]> data;
	int size = 0;
	String filename;

	void resize(int length) {
		size = length;
		data = SmartPtr<byte[]>(new byte[size + 1]);
		data[size] = '\0'; // 供 readLines() 当作文本使用
	}

	void loadFromMemory(const ArrayList<byte> &file) {
		resize(file.size());

		for (int i = 0; i < size; i++) {
			data[i] = file.at(i);
		}
	}

	void loadFromRemote() {
		unsigned int length = 0;
		const char *content = playground::bridge::playground_fetch_file(
				filename.getstr(), &length);

		if (content == NULL) {
			FILE_ERR("playground_fetch_file()");
			return;
		}

		resize(length);

		for (unsigned int i = 0; i < length; i++) {
			data[i] = (byte) content[i];
		}

		playground::release(content);
	}

public:
	log::Exception *ex;

	FileReader(log::Exception *e, const String &name)
		: data(NULL, stamon::DestroyNothing)
		, filename(name)
		, ex(e) {
		const ArrayList<byte> *file = playground::MemoryFile::find(name);

		if (file != NULL) {
			loadFromMemory(*file);
			return;
		}

		loadFromRemote();
	}

	FileReader(const FileReader &) = delete;
	FileReader &operator=(const FileReader &) = delete;

	int getSize() const {
		return size;
	}

	SmartPtr<byte[]> read() {
		return data;
	}

	void close() {
		// 数据已在内存中，无需释放资源
	}
};

} // namespace stamon::webplayground

namespace stamon {

using FileReader = interface::IFileReader<webplayground::FileReader>;

}

#undef FILE_ERR
