'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : ccvm snap 리스트, 복구 등 액션을 관리
최초 작성일 : 2021. 10. 22
'''

#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import logging
import sys
import os
import json
import datetime
import subprocess
import sh
import socket
from subprocess import check_output

from ablestack import *
from sh import python3

env=os.environ.copy()
env['LANG']="en_US.utf-8"
env['LANGUAGE']="en"

ccvm_name = 'ccvm'
ccvm_image_name = 'ccvm'
pool_name = 'rbd'

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

    parser.add_argument('action', choices=['list', 'rollback', 'backup'], help='choose one of the actions')
    parser.add_argument('--snap-name', metavar='snapshot name', type=str, help='The name of the CCVM Snapshot')

    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐):
    parser.add_argument('-v', '--verbose', action='count', default=0, help='increase output verbosity')
    
    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    parser.add_argument('-H', '--Human', action='store_const', dest='flag_readerble', const=True, help='Human readable')
    
    # Version 추가
    parser.add_argument('-V', '--Version', action='version', version='%(prog)s 1.0')

    return parser

def listCcvmSnap(args):
    try:

        # rbd 스냅 조회
        output = check_output(["rbd snap list "+ccvm_image_name+" --format json"], universal_newlines=True, shell=True, env=env)
        output_json = json.loads(output)

        return createReturn(code=200, val=output_json)

    except Exception as e:
        # 결과값 리턴
        print(e)
        return createReturn(code=500, val={})

def rollbackCcvmSnap(args):
    try:        
        # ccvm 스냅 롤백
        result = os.system("rbd snap rollback "+pool_name+"/"+ccvm_image_name+"@"+args.snap_name)
        
        if result == 0:
            return createReturn(code=200, val="CCVM Snapshot Rollback Success")
        else:
            return createReturn(code=500, val="CCVM Snapshot Rollback Fail. Check if ccvm is Stopped")

    except Exception as e:
        # 결과값 리턴
        return createReturn(code=500, val=e)

def backupCcvmSnap(args):
    # 현재 데이터의 안정성을 위해 클라우드센터 가상머신이 정지된 상태에서 백업 가능하도록 개발 되어있음
    # 실행중인 상태의 클라우드센터 가상머신 스냅샷 생성하려면 추가 작업 필요
    # 실행중인 ccvm 백업할 경우 추가작업 : ccvm이 실행중인 호스트를 확인하여 virsh 명령으로 suspend 후 스냅샷 생성하고 완료후 다시 resume 하는 로직 필요
    try:
        now = datetime.datetime.now().strftime('%Y-%m-%d-%H:%M:%S')
        pcs_status = json.loads(sh.python3(pluginpath + "/python/pcs/main.py","status", "--resource", "cloudcenter_res").stdout.decode())
        pcs_started_host_name = pcs_status['val']['started']
        pcs_status = pcs_status['val']['role']
        ccvm_name = 'ccvm'
        ccvm_image_name = 'ccvm'
        pool_name = 'rbd'

        if pcs_started_host_name == 'None' or pcs_status == 'Started' or pcs_status == 'Stopped':
            
            if pcs_status == 'Started':
                # ccvm suspend
                os.system("ssh root@"+pcs_started_host_name+" \"virsh suspend "+ccvm_name+" > /dev/null\"")

                # ccvm 스냅 생성
                result = os.system("rbd snap create "+pool_name+"/"+ccvm_image_name+"@"+now)
                
                # ccvm resume
                os.system("ssh root@"+pcs_started_host_name+" \"virsh resume "+ccvm_name+" > /dev/null\"")
            else:
                # ccvm 스냅 생성
                result = os.system("rbd snap create "+pool_name+"/"+ccvm_image_name+"@"+now)

            # ccvm 스냅이 10개 이상이면 마지막 스냅 삭제
            output = check_output(["rbd snap list "+ccvm_image_name+" --format json"], universal_newlines=True, shell=True, env=env)
            output_json = json.loads(output)

            ccvm_snap_cnt = len(output_json)
            ccvm_snap_limit = 10

            for ccvm_snap_info in output_json:
                if ccvm_snap_cnt > ccvm_snap_limit:
                    ccvm_snap_cnt = ccvm_snap_cnt - 1
                    os.system("rbd snap rm "+pool_name+"/"+ccvm_image_name+"@"+ccvm_snap_info["name"])

            if result == 0:
                return createReturn(code=200, val="CCVM Snapshot Backup Create Success")
            else:
                return createReturn(code=500, val="CCVM Snapshot Backup Create Fail. Snapshot backup is possible only in the stop or start state1")

        else :
            return createReturn(code=500, val="CCVM Snapshot Backup Create Fail. Snapshot backup is possible only in the stop or start state")

    except Exception as e:
        # 결과값 리턴
        return createReturn(code=500, val=e)

# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    # parser 생성
    parser = createArgumentParser()
    # input 파싱
    args = parser.parse_args()

    verbose = (5 - args.verbose) * 10

    # 로깅을 위한 logger 생성, 모든 인자에 default 인자가 있음.
    logger = createLogger(verbosity=logging.CRITICAL, file_log_level=logging.ERROR, log_file='ccvm_snap.log')

    # 실제 로직 부분 호출 및 결과 출력
    if (args.action) == 'list':
        print(listCcvmSnap(args))
    elif (args.action) == 'rollback':
        print(rollbackCcvmSnap(args))
    elif (args.action) == 'backup':
        print(backupCcvmSnap(args))
