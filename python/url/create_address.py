'''
Copyright (c) 2021 ABLECLOUD Co. Ltd

이 파일은 스토리지 및 클라우드 센터 관련 연결 주소를 생성하는 기능을 수행합니다.
최초 작성일 : 2021. 03. 19
'''
##!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
import json
import socket
import logging
import argparse
from subprocess import check_output
from ablestack import *


# 함수명 : createArgumentParser
# 주요 기능 : 입력된 argument를 파싱하여 dictionary 처럼 사용하게 만들어 주는 parser 생성
def createArgumentParser():
   
    tmp_parser = argparse.ArgumentParser(description='스토리지 및 클라우드 관련 연결 주소를 생성하는 프로그램',
                                         epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')

    tmp_parser.add_argument('action', choices=['cloudCenterVm', 'cloudCenter', 'storageCenterVm', 'storageCenter'], help="Create storage and cloud center related connection addresses")
    tmp_parser.add_argument("-v", "--verbose", action='count', default=0, help="increase output verbosity")
    tmp_parser.add_argument("-H", "--Human", action='store_const', dest='H', const=True, help="Human readable")
    tmp_parser.add_argument("-V", "--Version", action='version', version="%(prog)s 1.0")

    return tmp_parser


# 함수명 : cloudCenter
# 주요 기능 : 클라우드센터 및 가상머신 연결 주소 생성 
def cloudCenter(action, H=False):

    ip = socket.gethostbyname('ccvm-mngt')

    if action == 'cloudCenter':
        # 클라우드센터 
        value = 'http://'+ip+':8080'

    else:
        # 클라우드센터 가상머신
        value = 'https://'+ip+':9000'

    if H: 
        return json.dumps(json.loads(createReturn(code=200, val=value, retname=action)), indent=4) 

    return createReturn(code=200, val=value, retname=action)


# 함수명 : storageCenter
# 주요 기능 : 스토리지센터 및 가상머신 연결 주소 생성 
def storageCenter(action, H=False):

    if action == 'storageCenter':
        # 스토리지센터
        mgr = check_output(['ceph', 'mgr', 'services'], universal_newlines=True)
        mgr_json = json.loads(mgr)
        mgr_re = re.compile('{}(.*){}'.format(re.escape('//'), re.escape(':')))
        mgr_name = mgr_re.findall(mgr)
        
        ip = socket.gethostbyname(mgr_name[0])
        value = mgr_json['dashboard'].replace(mgr_name[0], ip)

    else:
        # 스토리지센터 가상머신
        num = socket.gethostname()[-1:]
        ip = socket.gethostbyname('scvm'+num)
        value = 'https://'+ip+':9090'

    if H: 
        return json.dumps(json.loads(createReturn(code=200, val=value, retname=action)), indent=4) 

    return createReturn(code=200, val=value, retname=action)


# 함수명 : createAddressAction
# 주요 기능 : 파라미터에 따른 함수 호출 
def createAddressAction(action, H):

    if action == 'cloudCenterVm':
        return cloudCenter(action, H=H)

    elif action == 'cloudCenter':
        return cloudCenter(action, H=H)

    elif action == 'storageCenter':
        return storageCenter(action, H=H)

    else:
        return storageCenter(action, H=H)


if __name__ == '__main__':

    parser = createArgumentParser()
    args = parser.parse_args()
    verbose = (5 - args.verbose) * 10
    
    # 로깅을 위한 logger 생성, 모든 인자에 default 인자가 있음.
    logger = createLogger(verbosity=logging.CRITICAL, file_log_level=logging.ERROR, log_file='test.log')
   
    # 실제 로직 부분 호출 및 결과 출력
    ret = createAddressAction(args.action, H=args.H)
    print(ret)