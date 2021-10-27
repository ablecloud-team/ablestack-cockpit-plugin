# Copyright (c) 2021 ABLECLOUD Co. Ltd

# 스토리지센터 가상머신 상태 상세조회를 위한 파일입니다.
# 최초 작성일 : 2021. 03. 19
import sys
import argparse
import json
import logging
import os
import subprocess
from subprocess import check_output
from subprocess import call

from ablestack import *

env = os.environ.copy()
env['LANG'] = "en_US.utf-8"
env['LANGUAGE'] = "en"

'''
함수명 : parseArgs
이 함수는 python library argparse를 시용하여 함수를 실행될 때 필요한 파라미터를 입력받고 파싱하는 역할을 수행합니다.
예를들어 action을 요청하면 해당 action일 때 요구되는 파라미터를 입력받고 해당 코드를 수행합니다.
'''


def parseArgs():
    parser = argparse.ArgumentParser(description='Time Sever Synchronization Check',
                                     epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')
    parser.add_argument('action', choices=['detail'])
    '''output 민감도 추가(v갯수에 따라 output및 log가 많아짐)'''
    parser.add_argument("-v", "--verbose", action='count', default=0, help="increase output verbosity")
    '''flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)'''
    parser.add_argument("-H", "--Human", action='store_const', dest='H', const=True, help="Human readable")
    '''Version 추가'''
    parser.add_argument("-V", "--Version", action='version', version="%(prog)s 1.0")
    return parser.parse_args()


'''
함수명 : checkTimeSever
주요 기능 : 스토리지 가상머신 상태 상세조회
'''


def checkTimeSever():
    synchronization_state = 'synchronization_ERR'
    name_or_ip = 'N/A'

    try:
        '''scvm 관리 nic 확인 시 리턴값 0이면 정상, 아니면 비정상'''
        rc = call(["chronyc sources | grep '*'"], universal_newlines=True, shell=True, env=env,
                  stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        print(rc)
        if rc == 0:
            synchronization_state = check_output(["chronyc sources | grep '*' | awk '{print $2}'"], universal_newlines=True, shell=True, env=env)
            output = check_output(["chronyc sources | grep '*' | awk '{print $2}'"], universal_newlines=True, shell=True, env=env)
            synchronization_state = output.strip()
        else :
            synchronization_state = 'HEALTH_ERR'

        rc = call(["ping -c 1 scvm"], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        if rc == 0:
            '''scvm '''
            synchronization_state = check_output(["chronyc sources | grep '*' | awk '{print $2}'"], universal_newlines=True, shell=True, env=env)
            if synchronization_state == "*":
                synchronization_state = "current synced"
            if synchronization_state == "+":
                synchronization_state = "combined"
            if synchronization_state == "-":
                synchronization_state = "not combined"
            if synchronization_state == "?":
                synchronization_state = "unreachable"
            if synchronization_state == "x":
                synchronization_state = "error"
            if synchronization_state == "~":
                synchronization_state = "time too variable"
            else :
                synchronization_state = "unknown error"


            output = check_output(["/usr/bin/ssh -o StrictHostKeyChecking=no scvm df -h | grep 'root' | awk '{print $4}'"], universal_newlines=True, shell=True, env=env)
            rootDiskAvail = output.strip();
            if rootDiskAvail == "" :
                rootDiskAvail = "N/A"
            output = check_output(["/usr/bin/ssh -o StrictHostKeyChecking=no scvm df -h | grep 'root' | awk '{print $5}'"], universal_newlines=True, shell=True, env=env)
            rootDiskUsePer = output.strip();
            if rootDiskUsePer == "" :
                rootDiskUsePer = "N/A"
        else :
            rootDiskSize = 'N/A'
            rootDiskAvail = 'N/A'
            rootDiskUsePer = 'N/A'







        '''실제 데이터 세팅'''
        ret_val = {
            'synchronization_state': synchronization_state,
            'name_or_ip': name_or_ip,

        }
        ret = createReturn(code=200, val=ret_val, retname='Time Sever Synchronization Check')
    except Exception as e:
        '''실제 데이터 세팅'''
        ret_val = {
            'synchronization_state': synchronization_state,
            'nameOrIp': name_or_ip,
        }
        ret = createReturn(code=500, val=ret_val, retname='Time Sever Synchronization Check')
    return print(json.dumps(json.loads(ret), indent=4))


if __name__ == '__main__':
    '''parser 생성'''
    args = parseArgs()
    if args.action == 'detail':
        '''스토리지센터 가상머신 상태 조회 action'''
        checkTimeSever()
    '''print(ret)'''
