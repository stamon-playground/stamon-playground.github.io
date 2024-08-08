/*
	Name: LineReader.cpp
	Copyright: Apache 2.0
	Author: CLimber-Rong
	Date: 03/02/24 16:07
	Description: 行阅读器
*/

#pragma once

#include"Exception.hpp"
#include"String.hpp"
#include"ArrayList.hpp"
#include"StamonStandardLib.hpp"

#include"stdio.h"
#include"stdlib.h"

#define FILE_ERR { THROW("file opening error") return; }
//这个宏用于简写，并且该宏只能在本文件中使用

ArrayList<String> ImportPaths;

String demo_st_code;

class LineReader {
		int size;
		ArrayList<String> split_texts;
		//按行分割后的文本
	public:
		STMException* ex;
		
		LineReader() {}

		LineReader(String filename, STMException* e) {

			ex = e;

			String text;

			if(filename!="demo.st") {
				if(stamon_std_lib_code.containsKey(filename)==false) {
					LOG("??");
					FILE_ERR;
				}
				text = stamon_std_lib_code.get(filename);
			} else {
				text = demo_st_code;
			}

			//然后开始逐行分割

			int start = 0, end=0;	//设当前分割的文本为text[start...end]

			while(end<text.length()) {
				if(text[end]=='\n') {
					//分割一行文本
					split_texts.add(text.substring(start, end+1));
					start = end;	//更新start
				}
				end++;
			}

			split_texts.add(text.substring(start, end));	//把最后一行文本写入
		}

		String getLine() {
			//读取一行的文本
			String rst = split_texts[0];
			split_texts.erase(0);
			char* a = (char*)calloc(1,1000);
			return rst;
		}

		bool isMore() {
			return !split_texts.empty();
		}

		void close() {
			;
		}
};

#undef FILE_ERR