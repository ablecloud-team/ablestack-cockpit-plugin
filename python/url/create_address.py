'''
Copyright (c) 2021 ABLECLOUD Co. Ltd

이 파일은 스토리지 및 클라우드 센터 관련 연결 주소를 생성하는 기능을 수행합니다.
최초 작성일 : 2021. 03. 19
'''
##!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import socket
import logging
import requests
import argparse
from subprocess import check_output
from ablestack import *


# 함수명 : createArgumentParser
# 주요 기능 : 입력된 argument를 파싱하여 dictionary 처럼 사용하게 만들어 주는 parser 생성
def createArgumentParser():
   
    tmp_parser = argparse.ArgumentParser(description='스토리지 및 클라우드 관련 연결 주소를 생성하는 프로그램',
                                         epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')

    tmp_parser.add_argument('action', choices=['cloudCenterVm', 'cloudCenter', "wallCenter", 'storageCenterVm', 'storageCenter'], help="Create storage and cloud center related connection addresses")
    tmp_parser.add_argument("-v", "--verbose", action='count', default=0, help="increase output verbosity")
    tmp_parser.add_argument("-H", "--Human", action='store_const', dest='H', const=True, help="Human readable")
    tmp_parser.add_argument("-V", "--Version", action='version', version="%(prog)s 1.0")

    return tmp_parser


# 함수명 : cloudCenter
# 주요 기능 : 클라우드센터 및 가상머신 연결 주소 생성 
def cloudCenter(action, H=False):

    ip = socket.gethostbyname('ccvm-mngt')

    if action == 'cloudCenter':
        try:
            # 클라우드센터 
            value = "http://"+ip+":8080"
            request = requests.get(value)

        except:
             # http 접속되지않는 경우
            return createReturn(code=500, val="클라우드센터에 정상적으로 연결되지 않습니다. <br>클라우드센터 서비스 상태를 확인하거나, 잠시 후에 다시 시도해주십시오.")

    else:
        # 클라우드센터 가상머신
        value = 'https://'+ip+':9000'

    if H: 
        return json.dumps(json.loads(createReturn(code=200, val=value, retname=action)), indent=4) 

    return createReturn(code=200, val=value, retname=action)


# 함수명 : wallCenter
# 주요 기능 : Wall 모니터링 센터 연결 주소 생성 
def wallCenter(action, H=False):

    ip = socket.gethostbyname('ccvm-mngt')

    if action == 'wallCenter':
        try:
            # 클라우드센터 
            value = "http://"+ip+":3000/login"
            request = requests.get(value)

        except:
             # http 접속되지않는 경우
            return createReturn(code=500, val="모니터링센터 대시보드에 정상적으로 연결되지 않습니다. <br>Wall 모니터링센터 서비스 상태를 확인하거나, 잠시 후에 다시 시도해주십시오.")

    else:
        # 클라우드센터 가상머신
        value = 'https://'+ip+':3000/login'

    if H: 
        return json.dumps(json.loads(createReturn(code=200, val=value, retname=action)), indent=4) 

    return createReturn(code=200, val=value, retname=action)


# 함수명 : storageCenter
# 주요 기능 : 스토리지센터 및 가상머신 연결 주소 생성 
def storageCenter(action, H=False):

    if action == 'storageCenter':
        try:
            # 스토리지센터
            mgr = check_output(['ceph', 'mgr', 'stat'], universal_newlines=True)
            mgr_json = json.loads(mgr)
        
            if "active_name" in mgr_json and mgr_json['active_name'] is not None:
                mgr_name = mgr_json['active_name'].split('.')
                ip = socket.gethostbyname(mgr_name[0]+'-mngt')
                value = 'https://'+ip+':8443'
            else: 
                # ceph 명령어는 정상적으로 전송되지만 ceph mgr module이 활성화되지 않은 경우
                return createReturn(code=500, val="ceph mgr module이 활성화되지 않았습니다. <br>mgr 상태를 확인하십시오.")
                
        except:
             # ceph 설치가 되어있지 않은 경우
            return createReturn(code=500, val="ceph 명령어 실행에 실패하였습니다. <br>호스트의 ceph 설정 파일을 확인하십시오.")

    else:
        # 스토리지센터 가상머신        
        ip = socket.gethostbyname('scvm-mngt')
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

    elif action == 'wallCenter':
        return wallCenter(action, H=H)

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
