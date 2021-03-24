#!/usr/bin/env python3

import argparse
import logging
import sys
import fileinput
import random

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

    parser.add_argument('action', choices=['reset'], help='choose one of the actions')

    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐):
    parser.add_argument('-v', '--verbose', action='count', default=0, help='increase output verbosity')
    
    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    parser.add_argument('-H', '--Human', action='store_const', dest='flag_readerble', const=True, help='Human readable')
    
    # Version 추가
    parser.add_argument('-V', '--Version', action='version', version='%(prog)s 1.0')

    return parser

def resetCloud(args):
    
        
    # 3대의 호스트에 ping 테스트

    #=========== pcs cluster 초기화 ===========
    # 리소스 삭제
    python3('/root/cockpit-smlee/python/pcs/main.py', 'status', '--resource', 'cloudcenter_res')

    # 클러스터 삭제
    python3('/root/cockpit-smlee/python/pcs/main.py', 'destroy')
    if code =

    print(~~진행중)

    python3('/root/cockpit-smlee/python/pcs/main.py', 'status', '--resource', 'cloudcenter_res')

    python3('/usr/share/cockpit/cockpit-plugin-ablestack/python/vm/create_scvm_xml.py -c 4 -m 16 -dt raid_passthrough -rpl 00:01.0 00:02.0 -mnb br0 -stnt nic_passthrough -snp 0003:03:03.3 -rnp 0005:05:05.5')

    hostname~3
    
    
    # 결과값 리턴
    
    
    return createReturn(code=200, val={})        


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
