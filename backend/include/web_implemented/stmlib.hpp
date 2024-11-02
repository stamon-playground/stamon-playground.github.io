/*
	Name: clib.h
	Copyright: Apache 2.0
	Author: CLimber-Rong, GusemFowage
	Date: 12/08/23 23:24
	Description: 一些杂糅的库定义
*/

// 这个库原本叫做clib.h
// 由于需要引入c++代码，所以后缀改为hpp，顺便把文件名改为stmlib

#pragma once

#include "String.hpp"
#include "stdlib.h"

/*由于代码经常涉及到基类转派生类，所以我编写了这个可以直接转换的宏*/
/*
 * 这个宏的用法是：
 * dst = cast_class(转换后的类型,需要转换的值)
 */
#define cast_class(T, value) (*(T *) (&(value)))
#ifndef NULL
#define NULL 0
#endif

template<typename T, typename F> T cast_func(F f) {
	// 这个函数用于将类成员函数（也就是T）转为普通的函数（也就是F）
	union FT {
		T t;
		F f;
	};
	FT ft;
	ft.f = f;
	return ft.t; // 运用同一个地址，变相转换
}


template<class T>
String toString(T&& t){
	return String().toString(t);
}

#define MACRO_START do {

#define MACRO_END \
	} \
	while (0)

EM_PORT_API(void) js_print(const char* s);

#define platform_exit exit
#define platform_system system
#define platform_scanf scanf
#define platform_printf printf
#define platform_puts js_print