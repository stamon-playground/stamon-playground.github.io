/*
	Name: Main.cpp
	Copyright: Apache 2.0
	Author: CLimber-Rong
	Date: 24/02/24 11:59
	Description:
    * 命令行工具
    * 该文件并不属于编译器或虚拟机的范畴，所以使用了C标准库
    * 开发者可以自行更改或者建立属于自己的命令行工具
	* 在使用stamon之前，你需要配置环境变量
	* 即：将可执行文件所在目录设为STAMON
*/

#include"Stamon.hpp"

using namespace stamon;
using namespace stamon::config;	//由于命名空间前缀过于繁琐，因此引用此命名空间

#include"stdio.h"
#include"stdlib.h"
#include"locale.h"

#include"Emscripten.hpp"

void console_log(char* msg) {
    char* s = (char*)calloc(13+strlen(msg)+4, 1);
    sprintf(s, "console.log(\"%s\");", msg);
    emscripten_run_script(s);
}

#define LOG(s) console_log((char_type*)s)
#define LOG_S(s) console_log(s.getstr())

String getNoEndingSeparatorPath(String path);	//获取末尾没有分隔符的路径
int StamonBuildCommand(ArrayList<String> args);
int StamonRunCommand(ArrayList<String> args);

int StamonMain(int argc, char* argv[]) {

	//参数表
	ArrayList<String> args;

	//获取可执行文件路径
	String s(argv[0]);

	for(int i=1; i<argc; i++) {
		args.add(String(argv[i]));
	}

	if(args.empty()) {
		//没有传入任何参数
		platform_print(
		    "stamon: fatal error: too few arguments\n"
		    "please enter \'stamon help\' to get more information.\n"
		);
		return -1;
	}

	if(
	    args[0].equals(String((char*)"build"))
	    ||args[0].equals(String((char*)"-b"))
	) {
		return StamonBuildCommand(args);

	} else if(
	    args[0].equals(String((char*)"run"))
	    ||args[0].equals(String((char*)"-r"))
	) {
		return StamonRunCommand(args);

	}

	return 0;

}

String getNoEndingSeparatorPath(String path) {
	//去除末尾分隔符
	if(path[path.length()-1]=='\\' || path[path.length()-1]=='/') {
		return path.substring(0, path.length()-1);
	}
	return path;
}

int StamonBuildCommand(ArrayList<String> args) {

	String program_path(getenv("STAMON"));

	String src;

	//先设置为配置文件的默认值
	String dst = stamon::c::config::DefaultObjectFileName;
	int warning_level = stamon::c::config::WarningLevel;
	bool isSupportImport = stamon::c::config::isSupportImport;
	bool isStrip = stamon::c::config::isStrip;

	//解析编译的文件名

	if(args.size()>=2) {
		src = args[1];

		//目标文件名是可选的
		
		if(args.size()>=3) {

			dst = args[2];

			for(int i=3; i<args.size(); i++) {

				if(args[i].equals(String((char*)"--import=false"))) {

					isSupportImport = false;

				} else if(args[i].equals(String((char*)"--import=true"))) {

					isSupportImport = true;

				} else if(args[i].equals(String((char*)"--strip=false"))) {

					isStrip = false;

				} else if(args[i].equals(String((char*)"--strip=true"))) {

					isStrip = true;
				
				} else if(args[i].equals(String((char*)"--IgnoreWarning"))) {

					warning_level = StamonWarningSafeLevel_IgnoreWarning;
				
				} else if(args[i].equals(String((char*)"--JustWarn"))) {

					warning_level = StamonWarningSafeLevel_JustWarn;
				
				} else if(args[i].equals(String((char*)"--FatalWarning"))) {

					warning_level = StamonWarningSafeLevel_FatalWarning;
				
				} else if(
					args[i].length()>=3
					&&args[i].substring(0, 2).equals((char*)"-I")) {

					//添加引用路径
					ImportPaths.add(
						getNoEndingSeparatorPath(
							args[i].substring(2, args[i].length())
						)
					);

				} else if(
					args[i].length()>=10
					&&args[i].substring(0, 9).equals((char*)"--locale=")) {

					//设置语言环境
					setlocale(LC_ALL, args[i].substring(9,args[i].length()).getstr());

				} else {

					//错误参数
					platform_print(
						"stamon: compile: bad command\n"
						"please enter \'stamon help\' "
						"to get more information.\n"
					);

					return -1;
				}

			}
		}
	} else {
		platform_print("stamon: build: too few arguments\n"
			   "please enter \'stamon help\' "
			   "to get more information.\n");
		return -1;
	}

	if(isSupportImport) {
		ImportPaths.insert(
			0,
			getNoEndingSeparatorPath(program_path)
			+ String((char*)"/include/")
		);
		//加入标准库路径
	}

	Stamon stamon;

	stamon.Init();

	stamon.compile(src, dst, isSupportImport, isStrip);

	if(
		stamon.WarningMsg.empty()==false
		&& warning_level != StamonWarningSafeLevel_IgnoreWarning
	) {
		if(warning_level==StamonWarningSafeLevel_JustWarn) {
			platform_print("stamon: compile: warning:\n");
		} else if(warning_level==stamon::config::StamonWarningSafeLevel_FatalWarning) {
			platform_print("stamon: compile: fatal error:\n");
		}

		for(int i=0,len=stamon.WarningMsg.size(); i<len; i++) {
			platform_print(stamon.WarningMsg.at(i).getstr());
		}
		if(warning_level==StamonWarningSafeLevel_FatalWarning) {
			return -1;
		}
	}

	if(stamon.ErrorMsg.empty()==false) {
		platform_print("stamon: compile: fatal error:\n");
		for(int i=0,len=stamon.ErrorMsg.size(); i<len; i++) {
			platform_print(stamon.ErrorMsg.at(i).getstr());
		}
		return -1;
	}

	return 0;
}

int StamonRunCommand(ArrayList<String> args) {

	String src;

	//先设置为配置文件的默认值
	int warning_level = stamon::vm::config::WarningLevel;
	bool isGC = stamon::vm::config::isGC;
	int MemLimit = stamon::vm::config::MemLimit;
	int PoolCacheSize = stamon::vm::config::PoolCacheSize;

	if(args.size()<2) {
		platform_print("stamon: run: too few arguments\n"
			   "please enter \'stamon help\' "
			   "to get more information.\n");
		return -1;
	} else {
		src = args[1];

		for(int i=2,len=args.size(); i<len; i++) {
			if(args[i].equals(String((char*)"--GC=true"))) {
				isGC = true;
			} else if(args[i].equals(String((char*)"--GC=false"))) {
				isGC = false;
			} else if(
				args[i].length()>11
				&&args[i].substring(0, 11).equals(
					String((char*)"--MemLimit=")
				)
			) {
				MemLimit = args[i]
						   .substring(11, args[i].length())
						   .toInt();
			} else if(
				args[i].length()>15
				&&args[i].substring(0, 15).equals(
					String((char*)"--MemPoolCache=")
				)
			) {
				PoolCacheSize = args[i]
								.substring(15, args[i].length())
								.toInt();
			} else if(args[i].equals(String((char*)"--IgnoreWarning"))) {

				warning_level = StamonWarningSafeLevel_IgnoreWarning;
			
			} else if(args[i].equals(String((char*)"--JustWarn"))) {

				warning_level = StamonWarningSafeLevel_JustWarn;
			
			} else if(args[i].equals(String((char*)"--FatalWarning"))) {

				warning_level = StamonWarningSafeLevel_FatalWarning;
			
			} else if(
				args[i].length()>=10
				&&args[i].substring(0, 9).equals((char*)"--locale=")) {

				//设置语言环境
				setlocale(LC_ALL, args[i].substring(9,args[i].length()).getstr());

			} else {
				platform_print(
					"stamon: run: bad command\n"
					"please enter \'stamon help\' "
					"to get more information.\n"
				);
				return -1;
			}
		}
	}

	Stamon stamon;

	stamon.Init();

	stamon.run(src, isGC, MemLimit, PoolCacheSize);

	if(
		stamon.WarningMsg.empty()==false
		&& warning_level != StamonWarningSafeLevel_IgnoreWarning
	) {
		if(warning_level==StamonWarningSafeLevel_JustWarn) {
			platform_print("stamon: run: warning:\n");
		} else if(warning_level==StamonWarningSafeLevel_FatalWarning) {
			platform_print("stamon: run: fatal error:\n");
		}
		for(int i=0,len=stamon.WarningMsg.size(); i<len; i++) {
			platform_print(stamon.WarningMsg.at(i).getstr());
		}
		if(warning_level==StamonWarningSafeLevel_FatalWarning) {
			return -1;
		}
	}

	if(stamon.ErrorMsg.empty()==false) {
		platform_print("stamon: run: fatal error:\n");
		for(int i=0,len=stamon.ErrorMsg.size(); i<len; i++) {
			platform_print(stamon.ErrorMsg.at(i).getstr());
		}
		return -1;
	}

	return 0;
}

void close_binary_buffer() {
	free(binary_buffer);
	binary_buffer_len = 0;
	allocated_buffer_len = 0;
}

EM_PORT_API(int) RunStamon(char* code) {

	init_stamon_std_lib_code();

    demo_st_code = code;

    char* argv1[] = {
        (char*)"stamon",
        (char*)"build",
        (char*)"demo.st",
        (char*)"demo.stvc"
    };

	if(StamonMain(4, argv1)!=0) {
		return -1;
	}

    char* argv2[] = {
        (char*)"stamon",
        (char*)"run",
        (char*)"demo.stvc"
    };

	if(StamonMain(3, argv2)!=0) {
		close_binary_buffer();
		return -1;
	}

	close_binary_buffer();

	return 0;
}