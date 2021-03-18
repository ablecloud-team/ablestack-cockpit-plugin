##!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
 * File Name : create-address.py
 * Date Created : 2021.03.12
 * Writer  : 박다정
 * Description : 스토리지 및 클라우드 관련 연결 주소를 생성하는 스크립트
"""
import json
import logging
import argparse
from subprocess import check_output
from ablestack import *

def createArgumentParser():
   
    """
    입력된 argument를 파싱하여 dictionary 처럼 사용하게 만들어 주는 parser를 생성하는 함수
    :return: argparse.ArgumentParser
    """
    # 프로그램 설명
    tmp_parser = argparse.ArgumentParser(description='스토리지 및 클라우드 관련 연결 주소를 생성하는 프로그램',
                                         epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')

    # 선택지 추가(동작 선택)
    tmp_parser.add_argument('action', choices=['cloudCenterVm', 'cloudCenter', 'storageCenterVm', 'storageCenter'], help="Create storage and cloud related connection addresses")

    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐)
    tmp_parser.add_argument("-v", "--verbose", action='count', default=0,
                            help="increase output verbosity")

    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    tmp_parser.add_argument("-H", "--Human", action='store_const',
                            dest='H', const=True,
                            help="Human readable")

    # Version 추가
    tmp_parser.add_argument("-V", "--Version", action='version',
                            version="%(prog)s 1.0")

    return tmp_parser


def cloudCenterVmUrl(H=False):

    # ccvm cockpit 주소 생성
    # ccvm cockpit port fix 필요
    ip = check_output(['grep', '-w', 'ablecloud', '/etc/hosts'], universal_newlines=True).split(' ')
    value = 'https://'+ip[0]+':9898'
   
    if H: 
        return json.dumps(json.loads(createReturn(code=200, val=value)), indent=4) 

    return createReturn(code=200, val=value)

def cloudCenterUrl(H=False):   

    # ccvm cloudstack 주소 생성
    # https 구성시 automatic redirect 설정  
    ip = check_output(['grep', '-w', 'ablecloud', '/etc/hosts'], universal_newlines=True).split(' ')
    value = 'http://'+ip[0]+':8080'

    if H: 
        return json.dumps(json.loads(createReturn(code=200, val=value)), indent=4) 

    return createReturn(code=200, val=value)
       
def storageCenterVmUrl(H=False):   

    # scvm cockpit 주소 생성
    # 호스트의 scvm ip 조회
    ip = check_output(['grep', '-w', 'host', '/etc/hosts'], universal_newlines=True).split(' ')
    value = 'https://'+ip[0]+':9090'

    if H: 
        return json.dumps(json.loads(createReturn(code=200, val=value)), indent=4) 

    return createReturn(code=200, val=value)

def storageCenterUrl(H=False):  
     
    # scvm ceph 주소 생성
    # Active MGR 조회 (ceph -s details -f pretty-json data.services.mgr 항목의 node명 확인하여 ip 조회)
    ip = check_output(['grep', '-w', 'host', '/etc/hosts'], universal_newlines=True).split(' ')
    value = 'https://'+ip[0]+':8443'

    if H: 
        return json.dumps(json.loads(createReturn(code=200, val=value)), indent=4) 

    return createReturn(code=200, val=value)


def createAddressAction(action, H):
    if action == 'cloudCenterVm':
        return cloudCenterVmUrl(H=H)

    elif action == 'cloudCenter':
        return cloudCenterUrl(H=H)
    
    elif action == 'storageCenterVm':
        return storageCenterVmUrl(H=H)

    else:
        return storageCenterUrl(H=H)
    

if __name__ == '__main__':

    parser = createArgumentParser()
    args = parser.parse_args()
    verbose = (5 - args.verbose) * 10
    
    # 로깅을 위한 logger 생성, 모든 인자에 default 인자가 있음.
    logger = createLogger(verbosity=verbose, log_file="log.txt", file_log_level=logging.ERROR)
   
    # 실제 로직 부분 호출 및 결과 출력
    ret = createAddressAction(args.action, H=args.H)
    print(ret)