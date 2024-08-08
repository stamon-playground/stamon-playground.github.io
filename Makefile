debug:

	xcopy src\bin-include bin\include /s /e /y /i
	emcc src/Main.cpp \
	-o bin/Stamon.js \
	-sFORCE_FILESYSTEM -sEXIT_RUNTIME=1 \
	-O2 -sWASM=0 \
	-std=c++17 \
	-I include/web_implemented \
	-I src/ast \
	-I src/data_type \
	-I src/vm \
	-I src/ir \
	-I src/compiler \
	-I src/sfn \
	-I src \
	--js-library include/web_implemented/js_lib.js \
	-s ALLOW_MEMORY_GROWTH=1 \
	"-sEXPORTED_RUNTIME_METHODS=['stringToNewUTF8']" \
	"-sEXPORTED_FUNCTIONS=['_malloc', '_free']" \
	-lm
	node bin/Stamon.js

debug_html:

	xcopy src\bin-include bin\include /s /e /y /i
	emcc src/Main.cpp \
	-o Stamon.html \
	-sFORCE_FILESYSTEM -sEXIT_RUNTIME=1 \
	-O2 -sWASM=0 \
	-std=c++17 \
	-I include/web_implemented \
	-I src/ast \
	-I src/data_type \
	-I src/vm \
	-I src/ir \
	-I src/compiler \
	-I src/sfn \
	-I src \
	-s ALLOW_MEMORY_GROWTH=1 \
	"-sEXPORTED_RUNTIME_METHODS=['stringToNewUTF8']" \
	"-sEXPORTED_FUNCTIONS=['_malloc', '_free']" \
	-lm
	node bin/Stamon.js 

website:

# -----编译后端代码，并将目标文件输出至前端-----

# 把Stamon标准库复制到bin目录下，方便下一步进行
	xcopy backend\src\bin-include backend\bin\include /s /e /y /i

# 用Python把Stamon标准库写入程序数据
	cd backend && \
	python StamonBuildSystem.py gen_data

# 编译程序
	cd backend && \
	emcc src/Main.cpp \
	-o ../frontend/src/stamon.js \
	-sFORCE_FILESYSTEM -sEXIT_RUNTIME=1 \
	-O2 -sWASM=0 \
	-std=c++17 \
	-I include/web_implemented \
	-I src/ast \
	-I src/data_type \
	-I src/vm \
	-I src/ir \
	-I src/compiler \
	-I src/sfn \
	-I src \
	--js-library include/web_implemented/js_lib.js \
	-s ALLOW_MEMORY_GROWTH=1 \
	"-sEXPORTED_RUNTIME_METHODS=['stringToNewUTF8']" \
	"-sEXPORTED_FUNCTIONS=['_malloc', '_free']" \
	-lm

# 修改js的Module对象为导出模式
	cd backend && \
	python StamonBuildSystem.py edit_js

# -----编译前端界面-----
	cd frontend && npm install
	cd frontend && npm run build

# -----将编译好的网站复制到根目录-----
	xcopy frontend\dist . /s /e /y /i