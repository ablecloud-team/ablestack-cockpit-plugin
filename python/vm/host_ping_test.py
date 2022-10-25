'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : 장애조치 클러스터 구성할 호스트의 네트워크 연결 상태를 확인하는 프로그램
최초 작성일 : 2021. 03. 31
'''

#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import logging
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
    parser = argparse.ArgumentParser(description='장애조치 클러스터 구성할 호스트의 네트워크 연결 상태를 확인하는 프로그램',
                                        epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™',
                                        usage='%(prog)s arguments')

    # 인자 추가: https://docs.python.org/ko/3/library/argparse.html#the-add-argument-method

    parser.add_argument('-hns', '--host-names', type=str, nargs='*', help='input Value to three host names', required=True)

    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐):
    parser.add_argument('-v', '--verbose', action='count', default=0, help='increase output verbosity')
    
    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    parser.add_argument('-H', '--Human', action='store_const', dest='flag_readerble', const=True, help='Human readable')
    
    # Version 추가
    parser.add_argument('-V', '--Version', action='version', version='%(prog)s 1.0')

    return parser

def hostPingTest(args):
    try:
        # 3대의 호스트에 ping 테스트
        ret_val = []
        ret_text = ""
        for host in args.host_names:
            item = {}
            ping_check = os.system("ping -c 1 -W 1 "+ host + " > /dev/null")
            if ping_check == 0 :
                item["host"] = host
                item["status"] = 'up'
                
            else:
                item["host"] = host
                item["status"] = 'down'
                ret_text += host+" network ip ping 테스트 실패\n"

            ret_val.append(item)

        # ex : ssh root@host echo 명령을 수행시 인증이 되어있으면 바로 응답이 오는데 인증이 되어있지 않으면 정상응답이 오지 않음
        # 핑거프린트 해결을 위해 ssh-scan.py 호출
        #python3(pluginpath+'/python/host/ssh-scan.py')

        if ret_text == "":
            return createReturn(code=200, val="host ping test success")
        else:
            return createReturn(code=500, val=ret_text)

    except Exception as e:
        # 결과값 리턴
        #print(e)
        return createReturn(code=500, val={})

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
    ret = hostPingTest(args)
    print(ret)
