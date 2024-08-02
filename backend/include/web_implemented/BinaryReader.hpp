/*
	Name: BinaryWriter.hpp
	Copyright: Apache 2.0
	Author: CLimber-Rong
	Date: 22/02/24 21:52
	Description: 二进制写入器
*/

#pragma once

#define FILE_ERR { THROW("file opening error") return; }

#include"Exception.hpp"
#include"String.hpp"
#include"stdio.h"

char* binary_buffer;
int binary_buffer_len = 0;
int allocated_buffer_len = 0;

class BinaryReader {
	public:
		int size;
		STMException* ex;

		BinaryReader() {}
		BinaryReader(STMException* e, String filename) {
			ex = e;
			size = binary_buffer_len;
		}

		char* read() {
            binary_buffer = (char*)realloc(binary_buffer, binary_buffer_len);
			return binary_buffer;
        }

		void close() {
			;
		}
};

#undef FILE_ERROR