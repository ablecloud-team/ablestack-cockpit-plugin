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
    parser = argparse.ArgumentParser(description='스토리지센터 가상머신 배포 초기화 프로그램',
                                        epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™',
                                        usage='%(prog)s arguments')

    # 인자 추가: https://docs.python.org/ko/3/library/argparse.html#the-add-argument-method

    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐):
    parser.add_argument('-v', '--verbose', action='count', default=0, help='increase output verbosity')
    
    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    parser.add_argument('-H', '--Human', action='store_const', dest='flag_readerble', const=True, help='Human readable')
    
    # Version 추가
    parser.add_argument('-V', '--Version', action='version', version='%(prog)s 1.0')

    return parser

def resetStorageCenter(args):
    
    # 기본 작업 폴더 생성
    os.system("mkdir -p /var/lib/libvirt/ablestack/vm/scvm")

    # virsh 초기화
    os.system("virsh destroy scvm")
    os.system("virsh undefine scvm")

    # 스토리지센터 가상머신 qcow2 템플릿 삭제
    os.system("rm -rf /var/lib/libvirt/images/scvm.qcow2")

    # cloudinit iso 삭제
    #os.system("rm -f /var/lib/libvirt/ablestack/vm/scvm/scvm-cloudinit.iso")
    
    # vm xml 템플릿 삭제
    #os.system("rm -f /var/lib/libvirt/ablestack/vm/scvm/scvm.xml")
    
    # cloudinit iso에 사용할 hosts 삭제
    #os.system("rm -f /var/lib/libvirt/ablestack/vm/scvm/hosts")

    # cloudinit iso에 사용할 개인키 : ablecloud 삭제
    #os.system("rm -f /var/lib/libvirt/ablestack/vm/scvm/ablecloud")

    # cloudinit iso에 사용할 공개키 : ablecloud.pub 삭제
    #os.system("rm -f /var/lib/libvirt/ablestack/vm/scvm/ablecloud.pub")

    # 확인후 폴더 밑 내용 다 삭제해도 무관하면 아래 코드 수행
    os.system("rm -rf /var/lib/libvirt/ablestack/vm/scvm/*")
    
    # 결과값 리턴
    return createReturn(code=200, val="storage center reset success")

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
    ret = resetStorageCenter(args)
    print(ret)
