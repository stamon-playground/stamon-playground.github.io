'''
Name: StamonBuildSystem.py
Copyright: 
Author: CLimber-Rong
Date: 01/08/24 12:49
Description: Python构建系统
'''
import os
import sys

def gen_data():
    def GenFileData(code: bytes) -> bytes:
        data = code + bytes('\0', encoding='ansi')
        rst = '{'
        for i in data:
            rst += str(int(i)) + ','
        return rst[0:-1] + '}'

    file_list = os.listdir('bin/include/')

    for i in file_list:
        print('Scanned File: '+str(i))

    dst_file = open('include/web_implemented/StamonStandardLib.hpp', 'w', encoding='utf8')

    dst_file.write(
    '''#pragma once

    #include"StringMap.hpp"

    StringMap<char> stamon_std_lib_code;
    '''
    )

    id = 0

    for i in file_list:
        temp = open('bin/include/'+i, 'rb')
        data = GenFileData(temp.read())
        dst_file.write('unsigned char stamon_standard_code_data_'+str(id)+'[] = '+data+';\n')
        id += 1
        print('Resulting Binary Data: '+'File=\"'+i+'\", Length of Data='+str(len(data)))
        temp.close()

    dst_file.write('void init_stamon_std_lib_code() {\n')

    id = 0

    for i in file_list:
        dst_file.write('\tstamon_std_lib_code.put((char*)\"' + i + '\",' 
                    + '(char*)stamon_standard_code_data_' + str(id) + ');\n')
        id += 1

    dst_file.write('}')

    dst_file.close()

    print('Done!')


def edit_js():
    fin = open('../frontend/src/stamon.js', 'r')
    code = fin.read()
    fin.close()
    fout = open('../frontend/src/stamon.js', 'w')
    fout.write(code+'\nexport default Module;')
    fout.close()

if sys.argv[1]=='gen_data':
    gen_data()
if sys.argv[1]=='edit_js':
    edit_js()
    print('Done!')