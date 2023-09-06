'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : ccvm snap 자동 생성을 기능
최초 작성일 : 2021. 10. 21
사용 방법 : 모든 cube 호스트에서 ccvm 배포시 해당 python 파일을 crontab에 등록하여 1일 1회 최대 10개의 스냅샷을 생성하고 유지할 수 있도록 하는 기능
          ccvm이 배포 되면 해당 python 파일을 crontab에 등록해야 함
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
from subprocess import check_output

from ablestack import *
from sh import python3

env=os.environ.copy()
env['LANG']="en_US.utf-8"
env['LANGUAGE']="en"

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

    # parser.add_argument('-hns', '--host-names', type=str, nargs='*', help='input Value to three host names', required=True)

    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐):
    parser.add_argument('-v', '--verbose', action='count', default=0, help='increase output verbosity')
    
    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    parser.add_argument('-H', '--Human', action='store_const', dest='flag_readerble', const=True, help='Human readable')
    
    # Version 추가
    parser.add_argument('-V', '--Version', action='version', version='%(prog)s 1.0')

    return parser

def createCcvmSnap(args):
    try:
        ccvm_name = 'ccvm'
        ccvm_image_name = 'ccvm'
        pool_name = 'rbd'
        # 정지된 ccvm 존재하는지 여부를 확인 존재하면 0 return
        check_host_in_ccvm = os.system("virsh list --name --state-running |grep "+ccvm_name+" > /dev/null")
        if check_host_in_ccvm == 0:
            now = datetime.datetime.now().strftime('%Y-%m-%d-%H:%M:%S')
            
            # ccvm 중지
            os.system("virsh suspend "+ccvm_name+" > /dev/null")

            # ccvm 스냅 생성
            os.system("rbd snap create "+pool_name+"/"+ccvm_image_name+"@"+now)

            # ccvm 재시작
            os.system("virsh resume "+ccvm_name+" > /dev/null")

            # ccvm 스냅이 10개 이상이면 마지막 스냅 삭제
            output = check_output(["rbd snap list "+ccvm_image_name+" --format json"], universal_newlines=True, shell=True, env=env)
            output_json = json.loads(output)
            
            ccvm_snap_cnt = len(output_json)
            ccvm_snap_limit = 10

            for ccvm_snap_info in output_json:
                if ccvm_snap_cnt > ccvm_snap_limit:
                    ccvm_snap_cnt = ccvm_snap_cnt - 1
                    os.system("rbd snap rm "+pool_name+"/"+ccvm_image_name+"@"+ccvm_snap_info["name"])

    except Exception as e:
        # 결과값 리턴
        print(e)
        return createReturn(code=500, val={})

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
    ret = createCcvmSnap(args)
    # print(ret)