##!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
 * File Name : deploy-status.py
 * Date Created : 2021.03.16
 * Writer  : 박다정
 * Description : ABLESTACK 배포상태 조회 스크립트
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
    tmp_parser = argparse.ArgumentParser(description='ABLESTACK 배포상태 조회하는 프로그램',
                                         epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')

    # 선택지 추가(동작 선택)
    tmp_parser.add_argument('action', choices=['list'], help="ablestack deloy status action")

    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐)
    tmp_parser.add_argument("-v", "--verbose", action='count', default=0,
                            help="increase output verbosity")

    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    tmp_parser.add_argument("-H", "--Human", action='store_const',
                            dest='H', const=True,
                            help="Human readable")

    return tmp_parser


def selectDeployStatus(H=False):

    item=[]

    # 클러스터 구성준비 상태 조회
    # scvm 개수 확인(호스트명 scvm)
    res = check_output(['grep', '-c', 'scvm', '/etc/hosts'], universal_newlines=True).split(' ')
    if int(res[0])>=3:
        cluster_res = 'true'
    else:
        cluster_res = 'false'

    # 스토리지센터 VM 배포 상태 조회
    # virsh 명령어 이용하여 배포상태 확인(호스트명 SCVM 픽스)
    res = check_output(['grep', '-c', 'scvm', '/etc/hosts'], universal_newlines=True).split(' ')
    if int(res[0])>=3:
        storage_res = 'true'
    else:
        storage_res = 'false'

    # 클라우드센터 VM 배포 상태 조회
    # PCS cluster/resource 명령어 이용하여 배포상태 확인(resource명 cloudcenter_res 픽스)
    res = check_output(['grep', '-c', 'scvm', '/etc/hosts'], universal_newlines=True).split(' ')
    if int(res[0])>=3:
        cloud_res = 'true'
    else:
        cloud_res = 'false'

    item = [
        {'cluster_config' : cluster_res,
        'storage_vm' : storage_res,
        'cloud_vm' : cloud_res}
    ]
    
    if H: 
        return json.dumps(json.loads(createReturn(code=200, val=item)), indent=4) 

    return createReturn(code=200, val=item)


def deployStatusAction(action, H=True):

    if(action == 'list'):
        return selectDeployStatus(H=H)


if __name__ == '__main__':

    parser = createArgumentParser()
    args = parser.parse_args()
    verbose = (5 - args.verbose) * 10
    
    # 로깅을 위한 logger 생성, 모든 인자에 default 인자가 있음.
    logger = createLogger(verbosity=verbose, log_file="log.txt", file_log_level=logging.ERROR)
   
    # 실제 로직 부분 호출 및 결과 출력
    ret = deployStatusAction(args.action, H=args.H)
    print(ret)
