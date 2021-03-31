'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : 장애조치 클러스터를 구성하고 클라우드센터 가상머신을 배포하는 프로그램
최초 작성일 : 2021. 03. 31
'''

#!/usr/bin/env python3
# -*- coding: utf-8 -*-

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
    parser = argparse.ArgumentParser(description='장애조치 클러스터를 구성하고 클라우드센터 가상머신을 배포하는 프로그램',
                                        epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™',
                                        usage='%(prog)s arguments')

    # 인자 추가: https://docs.python.org/ko/3/library/argparse.html#the-add-argument-method

    #parser.add_argument('action', choices=['reset'], help='choose one of the actions')

    parser.add_argument('-hns', '--host-names', metavar=('[hostname1]','[hostname2]','[hostname3]'), type=str, nargs=3, help='input Value to three host names', required=True)

    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐):
    parser.add_argument('-v', '--verbose', action='count', default=0, help='increase output verbosity')
    
    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    parser.add_argument('-H', '--Human', action='store_const', dest='flag_readerble', const=True, help='Human readable')
    
    # Version 추가
    parser.add_argument('-V', '--Version', action='version', version='%(prog)s 1.0')

    return parser

def resetCloud(args):
    
    success_bool = True


    #=========== pcs cluster 구성 ===========
    # ceph 이미지 등록

    os.system("qemu-img convert -f qcow2 -O rbd /var/lib/libvirt/images/centos8-template.qcow2 rbd:rbd/ccvm")

    # 클러스터 구성
    result = json.loads(python3('/usr/share/cockpit/cockpit-plugin-ablestack/python/pcs/main.py', 'config', '--cluster', 'cloudcenter_cluster', '--hosts', args.host_names[0], args.host_names[1], args.host_names[2] ).stdout.decode())
    if result['code'] not in [200]:
        success_bool = False

    # 리소스 생성
    result = json.loads(python3('/usr/share/cockpit/cockpit-lugin-ablestack/python/pcs/main.py', 'create', '--resource', 'cloudcenter_res', '--xml', '/var/lib/libvirt/ablestack/vm/ccvm/ccvm.xml' ).stdout.decode())
    if result['code'] not in [200]:
        success_bool = False

    #ccvm이 정상적으로 생성 되었는지 확인
    domid_check = os.system("virsh domid ccvm > /dev/null")
    if domid_check != 0:
        success_bool = False

    # 결과값 리턴
    if success_bool:
        return createReturn(code=200, val="cloud center setup success")
    else:
        return createReturn(code=500, val="cloud center setup fail")

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
