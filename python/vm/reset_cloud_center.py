'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : 장애조치 클러스터 및 클라우드센터 가상머신 배포를 초기화하는 프로그램
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
    parser = argparse.ArgumentParser(description='장애조치 클러스터 및 클라우드센터 가상머신 배포를 초기화하는 프로그램',
                                        epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™',
                                        usage='%(prog)s arguments')

    # 인자 추가: https://docs.python.org/ko/3/library/argparse.html#the-add-argument-method

    #parser.add_argument('action', choices=['reset'], help='choose one of the actions')

    #parser.add_argument('-hns', '--host-names', metavar=('[hostname1]','[hostname2]','[hostname3]'), type=str, nargs=3, help='input Value to three host names', required=True)

    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐):
    parser.add_argument('-v', '--verbose', action='count', default=0, help='increase output verbosity')
    
    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    parser.add_argument('-H', '--Human', action='store_const', dest='flag_readerble', const=True, help='Human readable')
    
    # Version 추가
    parser.add_argument('-V', '--Version', action='version', version='%(prog)s 1.0')

    return parser

def resetCloud(args):
    
    success_bool = True

    #=========== pcs cluster 초기화 ===========
    # 리소스 삭제
    result = json.loads(python3('/usr/share/cockpit/cockpit-plugin-ablestack/python/pcs/main.py', 'remove', '--resource', 'cloudcenter_res').stdout.decode())
    if result['code'] not in [200,400]:
        success_bool = False

    # 클러스터 삭제
    result = json.loads(python3('/usr/share/cockpit/cockpit-plugin-ablestack/python/pcs/main.py', 'destroy').stdout.decode())
    if result['code'] not in [200,400]:
        success_bool = False
    
    # ceph rbd 이미지 삭제
    result = os.system("rbd ls -p rbd | grep ccvm > /dev/null")
    if result == 0:
        os.system("rbd rm rbd/ccvm")

    # virsh 초기화
    os.system("virsh destroy ccvm")
    os.system("virsh undefine ccvm")

    # 작업폴더 생성
    os.system("mkdir -p /var/lib/libvirt/ablestack/vm/ccvm")
    '''
    # cloudinit iso 삭제
    os.system("rm -f /var/lib/libvirt/ablestack/vm/ccvm/ccvm-cloudinit.iso")
    
    # vm xml 템플릿 삭제
    os.system("rm -f /var/lib/libvirt/ablestack/vm/ccvm/ccvm.xml")
    
    # cloudinit iso에 사용할 hosts 삭제
    os.system("rm -f /var/lib/libvirt/ablestack/vm/ccvm/hosts")

    # cloudinit iso에 사용할 개인키 : ablecloud 삭제
    os.system("rm -f /var/lib/libvirt/ablestack/vm/ccvm/ablecloud")

    # cloudinit iso에 사용할 공개키 : ablecloud.pub 삭제
    os.system("rm -f /var/lib/libvirt/ablestack/vm/ccvm/ablecloud.pub")
    '''

    # 확인후 폴더 밑 내용 다 삭제해도 무관하면 아래 코드 수행
    os.system("rm -rf /var/lib/libvirt/ablestack/vm/ccvm/*")
    
    # 결과값 리턴
    if success_bool:
        return createReturn(code=200, val="cloud center reset success")
    else:
        return createReturn(code=500, val="cloud center reset fail")

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
