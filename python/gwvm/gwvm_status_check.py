'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : gwvm의 상태를 확인 하는 프로그램
최초 작성일 : 2023. 05. 25
'''

#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import logging
import sys
import os
import time
import json
import socket
import subprocess
from subprocess import check_output

from ablestack import *
from sh import python3
from sh import ssh
from python_hosts import Hosts, HostsEntry

env = os.environ.copy()

json_file_path = pluginpath+"/tools/properties/cluster.json"
hosts_file_path = "/etc/hosts"
# ablecube_host는 scvm이 실행중인 호스트의 ip 또는 호스트 네임
ablecube_host = "ablecube"

def createArgumentParser():
    '''
    입력된 argument를 파싱하여 dictionary 처럼 사용하게 만들어 주는 parser를 생성하는 함수
    :return: argparse.ArgumentParser
    '''
    # 참조: https://docs.python.org/ko/3/library/argparse.html
    # 프로그램 설명
    parser = argparse.ArgumentParser(description='gwvm의 상태를 확인 하는 프로그램',
                                        epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™',
                                        usage='%(prog)s arguments')

    # 인자 추가: https://docs.python.org/ko/3/library/argparse.html#the-add-argument-method
    parser.add_argument('action', choices=['check'], help='choose one of the actions')

    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐):
    parser.add_argument('-v', '--verbose', action='count', default=0, help='increase output verbosity')

    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    parser.add_argument('-H', '--Human', action='store_const', dest='flag_readerble', const=True, help='Human readable')

    # Version 추가
    parser.add_argument('-V', '--Version', action='version', version='%(prog)s 1.0')

    return parser

def openClusterJson():
    try:
        with open(json_file_path, 'r') as json_file:
            ret = json.load(json_file)
    except Exception as e:
        ret = createReturn(code=500, val='cluster.json read error')
        print ('EXCEPTION : ',e)

    return ret

def check(args):
    gwvm_info = {}

    # 하이퍼 바이저 확인
    hypervisor = "cell"

    if hypervisor == "cell":
        # gwvm pcs 클러스터 배포
        # result = json.loads(python3(pluginpath + 'python/pcs/pcsExehost.py' ))
        # pcs_exe_ip = result.val
        pcs_exe_ip = '10.10.2.1'

        ret = json.loads(ssh('-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=1', pcs_exe_ip, "python3 " + pluginpath + "/python/pcs/main.py", "status", "--resource", "gateway_res").strip())
        if ret["code"] == 200:
            # 가상머신 상태
            gwvm_info['role'] = ret["val"]["role"]
            # 실행 노드
            gwvm_info['started'] = ret["val"]["started"]

            if ret["val"]["role"] == "Started":
                gwvm_info['ip'] = "Unknown"
                gwvm_info['mac'] = "Unknown"
                gwvm_info['nictype'] = "Unknown"
                gwvm_info['nicbridge'] = "Unknown"

                ret = ssh('-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=1', pcs_exe_ip, "virsh dominfo --domain gwvm").strip().splitlines()
                for line in ret[:-1]:
                    items = line.split(":", maxsplit=1)
                    k = items[0].strip()
                    v = items[1].strip()
                    gwvm_info[k] = v
                ret = ssh('-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=1', pcs_exe_ip, "virsh domifaddr --domain gwvm --source agent --interface enp0s20").strip().splitlines()
                for line in ret[:-1]:
                    if 'ipv4' in line and 'enp0s20' in line:
                        items = line.split(maxsplit=4)
                        ipPrefix = items[3]
                        ipSplit = ipPrefix.split('/')
                        gwvm_info['ip'] = ipSplit[0]
                        gwvm_info['prefix'] = ipSplit[1]
                        gwvm_info['mac'] = items[1]
                ret = ssh('-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=1', pcs_exe_ip, "virsh domiflist --domain gwvm").strip().splitlines()
                for line in ret[:-1]:
                    if gwvm_info['mac'] in line:
                        items = line.split()
                        gwvm_info['nictype'] = items[1]
                        gwvm_info['nicbridge'] = items[2]
                try:
                    ret = ssh('-o', 'StrictHostKeyChecking=no', gwvm_info['ip'], '/usr/sbin/route', '-n', '|', 'grep', '-P', '"^0.0.0.0|UG"').splitlines()
                    for line in ret[:]:
                        items = line.split()
                        gwvm_info['gw'] = items[1]
                except Exception as e:
                    pass

                ret = ssh('-o', 'StrictHostKeyChecking=no', gwvm_info['ip'], '/usr/bin/df', '-h').splitlines()
                ret.reverse()
                for line in ret[:]:
                    if 'root' in line:
                        items = line.split(maxsplit=5)
                        gwvm_info['disk_cap'] = items[1]
                        gwvm_info['disk_alloc'] = items[2]
                        gwvm_info['disk_phy'] = items[3]
                        gwvm_info['disk_usage_rate'] = items[4]

            return createReturn(code=200, val=gwvm_info)
        else:
            return createReturn(code=400, val="gwvm is not configured")

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
    if args.action == 'check':
        ret = check(args)
        print(ret)