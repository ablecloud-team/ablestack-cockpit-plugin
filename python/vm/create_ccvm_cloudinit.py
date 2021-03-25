#!/usr/bin/env python3

import argparse
import logging
import json
import sys
import os

from ablestack import *
from sh import python3

def createArgumentParser():
    '''
    입력된 argument를 파싱하여 dictionary 처럼 사용하게 만들어 주는 parser를 생성하는 함수
    :return: argparse.ArgumentParser
    '''
    # 참조: https://docs.python.org/ko/3/library/argparse.html
    # 프로그램 설명
    parser = argparse.ArgumentParser(description='클라우드 센터를 초기화하는 프로그램',
                                        epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™',
                                        usage='%(prog)s arguments')

    # 인자 추가: https://docs.python.org/ko/3/library/argparse.html#the-add-argument-method

    #parser.add_argument('action', choices=['reset'], help='choose one of the actions')

    parser.add_argument('-f1', '--file1', metavar='[file location]', type=str, help='input Value to hosts file location and name', required=True)
    parser.add_argument('-t1', '--text1', metavar='[file text]', type=str, help='input Value to hosts text', required=True)
    parser.add_argument('-f2', '--file2', metavar='[file2 location]', type=str, help='input Value to pricate key file location and name', required=True)
    parser.add_argument('-t2', '--text2', metavar='[file2 text]', type=str, help='input Value to pricate key text', required=True)
    parser.add_argument('-f3', '--file3', metavar='[file3 location]', type=str, help='input Value to public key file location and name', required=True)
    parser.add_argument('-t3', '--text3', metavar='[file3 text]', type=str, help='input Value to public key text', required=True)

    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐):
    parser.add_argument('-v', '--verbose', action='count', default=0, help='increase output verbosity')
    
    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    parser.add_argument('-H', '--Human', action='store_const', dest='flag_readerble', const=True, help='Human readable')
    
    # Version 추가
    parser.add_argument('-V', '--Version', action='version', version='%(prog)s 1.0')

    return parser

def resetCloud(args):
    
    success_bool = True
    
    # cloudinit iso에 사용할 hosts 파일 생성
    cmd = "cat > "+args.file1+"<< EOF\n"
    cmd += args.text1
    cmd += "\nEOF"
    os.system(cmd)

    # cloudinit iso에 사용할 개인키 : ablecloud 파일 생성
    cmd = "cat > "+args.file2+"<< EOF\n"
    cmd += args.text2
    cmd += "\nEOF"
    os.system(cmd)

    # cloudinit iso에 사용할 공개키 : ablecloud.pub 생성
    cmd = "cat > "+args.file3+"<< EOF\n"
    cmd += args.text3
    cmd += "\nEOF"
    os.system(cmd)

    # cloudinit iso 생성 (/opt/ablestack/vm/ccvm/ccvm-cloudinit.iso)
    #
    #
    #
    #
    #

    # 결과값 리턴
    if success_bool:
        return createReturn(code=200, val="ccvm cloudinit iso create success")
    else:
        return createReturn(code=500, val="ccvm cloudinit iso create fail")

# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    # parser 생성
    parser = createArgumentParser()
    # input 파싱
    args = parser.parse_args()

    verbose = (5 - args.verbose) * 10

    # 로깅을 위한 logger 생성, 모든 인자에 default 인자가 있음.
    logger = createLogger(verbosity=logging.CRITICAL, file_log_level=logging.ERROR, log_file='test.log')

    # 실제 로직 부분 호출 및 결과 출력
    ret = resetCloud(args)
    print(ret)
