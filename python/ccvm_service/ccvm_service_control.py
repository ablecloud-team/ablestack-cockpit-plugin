'''
Copyright (c) 2021 ABLECLOUD Co. Ltd

이 파일은 클라우드센터 가상머신의 서비스를 제어하는 기능을 수행합니다.
최초 작성일 : 2022. 07. 26
'''
##!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import socket
import logging
import requests
import os
import argparse
from ablestack import *

# 함수명 : createArgumentParser
# 주요 기능 : 입력된 argument를 파싱하여 dictionary 처럼 사용하게 만들어 주는 parser 생성
def createArgumentParser():
   
    parser = argparse.ArgumentParser(description='클라우드센터 가상머신의 서비스를 제어하는 프로그램',
                                         epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')

    parser.add_argument('action', choices=['start', 'restart', 'stop', 'status'], help="")
    parser.add_argument("-sn", "--service-name", metavar="service name", type=str, help='The name of the CCVM Snapshot')
    parser.add_argument("-v", "--verbose", action='count', default=0, help="increase output verbosity")
    parser.add_argument("-H", "--Human", action='store_const', dest='H', const=True, help="Human readable")
    parser.add_argument("-V", "--Version", action='version', version="%(prog)s 1.0")

    return parser

# 함수명 : serviceControl
# 주요 기능 : 서비스 제어
def serviceControl(action):

    ip = socket.gethostbyname('ccvm-mngt')

    # 서비스 제어 명령
    result = os.system("ssh root@"+ip+" 'systemctl "+args.action+" "+args.service_name+"' > /dev/null")

    if result == 0: #서비스 제어가 성공일 경우
        return createReturn(code=200, val=args.service_name+" service "+args.action+" control success")
    else: # 서비스 제어가 실패할 경우
        return createReturn(code=500, val=args.service_name+" service "+args.action+" control error")

if __name__ == '__main__':

    parser = createArgumentParser()
    args = parser.parse_args()
    verbose = (5 - args.verbose) * 10
    
    # 로깅을 위한 logger 생성, 모든 인자에 default 인자가 있음.
    logger = createLogger(verbosity=logging.CRITICAL, file_log_level=logging.ERROR, log_file='test.log')
   
    # 실제 로직 부분 호출 및 결과 출력
    print(serviceControl(args))
