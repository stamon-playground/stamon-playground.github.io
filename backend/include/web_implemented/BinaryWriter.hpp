/*
	Name: BinaryWriter.hpp
	Copyright: Apache 2.0
	Author: CLimber-Rong
	Date: 22/02/24 21:52
	Description: 二进制写入器
*/

#pragma once

#define FILE_ERROR { THROW("file opening error") return; }

#include"Exception.hpp"
#include"String.hpp"
#include"stdio.h"
#include"BinaryReader.hpp"

class BinaryWriter {
    public:
        STMException* ex;

        BinaryWriter() {}
        BinaryWriter(STMException* e, String filename) {
            ex = e;
            binary_buffer = (char*)malloc(1024);
            allocated_buffer_len = 1024;
        }

        void write(char b) {
            if(binary_buffer_len+1>allocated_buffer_len) {
                binary_buffer = (char*)realloc(binary_buffer, allocated_buffer_len+1024);
                allocated_buffer_len += 1024;
            }
            binary_buffer[binary_buffer_len] = b;
            binary_buffer_len++;
        }

        void close() {
            ;
        }
};

#undef FILE_ERROR