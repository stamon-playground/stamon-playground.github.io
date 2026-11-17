COMPILER = emcc
STD = c++17
PNPM = pnpm

# 特判复制工具
ifeq ($(OS),Windows_NT)
SHELL = cmd.exe
COPY_DIR = xcopy $(subst /,\,$(1)) $(subst /,\,$(2)) /e /y /i
COPY_FILE = copy /Y $(subst /,\,$(1)) $(subst /,\,$(2))
else
COPY_DIR = mkdir -p $(2) && cp -r $(1)/. $(2)/
COPY_FILE = cp $(1) $(2)
endif

# 移植接口定义
BASIC_LINK =	-I backend/include/pure \
				-I backend/include/ArrayList/interface \
				-I backend/include/BasicIo/interface \
				-I backend/include/BasicPlatform/interface \
				-I backend/include/SmartPtr/interface \
				-I backend/include/FileReader/interface \
				-I backend/include/FileWriter/interface \
				-I backend/include/HashMap/interface \
				-I backend/include/MemoryPool/interface \
				-I backend/include/Stack/interface \
				-I backend/include/String/interface \
				-I backend/src/ast \
				-I backend/src/datatype \
				-I backend/src/vm \
				-I backend/src/ir \
				-I backend/src/compiler \
				-I backend/src/sfn \
				-I backend/src/action \
				-I backend/src/exception \
				-I backend/src/config \
				-I backend/src

# Playground的移植接口实现
PLAYGROUND_LINK =	-I backend/include/PlaygroundUtility \
					-I backend/include/FileReader/web-playground \
					-I backend/include/FileWriter/web-playground \
					-I backend/include/BasicIo/web-playground

# 与Playground交互无关的模块采用stdcpp实现
STDCPP_LINK =	-I backend/include/ArrayList/stdcpp \
				-I backend/include/BasicPlatform/stdcpp \
				-I backend/include/SmartPtr/stdcpp \
				-I backend/include/HashMap/stdcpp \
				-I backend/include/MemoryPool/stdc \
				-I backend/include/Stack/stdcpp \
				-I backend/include/String/stdcpp \
				-lm

LINK = $(BASIC_LINK) $(PLAYGROUND_LINK) $(STDCPP_LINK)

JS_LIBRARY = backend/include/PlaygroundUtility/PlaygroundUtility.js

.PHONY: all stamon-lib backend frontend

all: backend frontend

stamon-lib:
	$(call COPY_DIR,backend/src/bin-include,frontend/public/stamon-lib)
	$(call COPY_FILE,backend/LICENSE,frontend/public/stamon-lib/LICENSE)

backend: stamon-lib
	$(COMPILER) backend/src/Main.cpp \
	-o frontend/src/stamon.js \
	-std=$(STD) \
	-Oz \
	$(LINK) \
	-s EXPORT_ES6=1 \
	-s MODULARIZE=1 \
	-s ENVIRONMENT='web' \
	-s USE_ES6_IMPORT_META=0 \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s "EXPORTED_RUNTIME_METHODS=stringToNewUTF8,UTF8ToString" \
	-s "EXPORTED_FUNCTIONS=_malloc,_free,_runStamon,_getVersion" \
	--js-library $(JS_LIBRARY)

frontend:
	cd frontend && $(PNPM) install && $(PNPM) build