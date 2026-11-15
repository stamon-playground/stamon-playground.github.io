/*
	Name: BasicIo.hpp
	License: Apache 2.0
	Description: BasicIo 的 Playground 实现。
	             Playground 只提供输出能力。
*/

#pragma once

#include "IBasicIo.hpp"
#include "PlaygroundUtility.hpp"
#include "String.hpp"

namespace stamon {

int platform_print(String s) {
	playground::bridge::playground_print(s.getstr());
	return 0;
}

} // namespace stamon
