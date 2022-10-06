'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : 클러스터 설정 파일 cluster.json의 hosts정보를 편집하는 프로그램
최초 작성일 : 2022. 10. 06
'''

#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import logging
import sys
import os
import json
import socket

from ablestack import *
from sh import python3
from sh import ssh

json_file_path = pluginpath+"/tools/properties/cluster.json"
def createArgumentParser():
    '''
    입력된 argument를 파싱하여 dictionary 처럼 사용하게 만들어 주는 parser를 생성하는 함수
    :return: argparse.ArgumentParser
    '''
    # 참조: https://docs.python.org/ko/3/library/argparse.html
    # 프로그램 설명
    parser = argparse.ArgumentParser(description='모든 cube 호스트, scvm에 /etc/ceph/ 설정의 keyring, ceph.conf 파일을 동기화 시키는 프로그램',
                                        epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™',
                                        usage='%(prog)s arguments')

    # 인자 추가: https://docs.python.org/ko/3/library/argparse.html#the-add-argument-method
    parser.add_argument('action', choices=['update'], help='choose one of the actions')

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

# 모든 호스트, scvm에 keyring, ceph.conf 파일을 업데이트 후 전송
def updateAllHostGlueConfig(args):
    return_val = "The ping test failed. Check ablecube cube hosts and scvms network IPs. Please check the config.json file."

    try:
        if args.json_string is not None:
            #hostname = socket.gethostname()

            # 파라미터로 받아온 json으로 변환
            param_json = json.loads(args.json_string)

            # 명령수행 호스트에 ceph.conf 파일 업데이트
            result = os.system("ceph config generate-minimal-conf > /etc/ceph/aaa.conf")
            
            if result == 0:
                print("asdfjasdkflsdsdafj")
            return 0

            # ping test로 네트워크가 연결되어 있는지 상태 체크하는 부분
            ping_check_list = []
            for p_val1 in param_json:
                ping_check_list.append(p_val1["ablecube"])
                if args.exclude_hostname != p_val1["hostname"]:
                    ping_check_list.append(p_val1["scvmMngt"])

            ping_check_list.append(args.ccvm_mngt_ip)
            ping_result = json.loads(python3(pluginpath+'/python/vm/host_ping_test.py', '-hns', ping_check_list).stdout.decode())

            if ping_result["code"] == 200:
                # 명령 수행이 가능한 상태인지 체크하는 부분
                return_val = "Command execution test failed. Check the ablecube cube hosts and scvms status. Please check the config.json file or ip"

                for p_val2 in param_json:
                    ret = ssh('-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=5', p_val2["ablecube"], "echo ok").stdout.strip().decode()
                    if ret != "ok":
                        return createReturn(code=500, val=return_val + " : " + p_val2["ablecube"])

                    ret = ssh('-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=5', p_val2["scvmMngt"], "echo ok").stdout.strip().decode()
                    if ret != "ok":
                        return createReturn(code=500, val=return_val + " : " + p_val2["scvmMngt"])
                
                # 원격 ablecube 호스트 및 scvm의 hosts 정보를 수정하는 명령 수행
                return_val = "insertAllHost Failed to modify cluster_config.py and hosts file."
                for p_val3 in param_json:
                # if p_val3["hostname"] == 'ablecube4': #개발 완료후 제거
                    cmd_str = "python3 /usr/share/cockpit/ablestack/python/cluster/cluster_config.py insert"
                    cmd_str += " -js '" + args.json_string + "'"
                    
                    if args.exclude_hostname != p_val3["hostname"]:
                        cmd_str += " -co withScvm"
                    else:
                        cmd_str += " -co withCcvm"

                    ret = ssh('-o', 'StrictHostKeyChecking=no', p_val3["ablecube"], cmd_str, " -cmi "+args.ccvm_mngt_ip, " -pcl "+args.pcs_cluster_list[0] +" "+ args.pcs_cluster_list[1] +" "+ args.pcs_cluster_list[2]).stdout.decode()
                    if json.loads(ret)["code"] != 200:
                        return createReturn(code=500, val=return_val + " : " + p_val3["ablecube"])

                #모든 작업이 수행 완료되면 성공결과 return
                return createReturn(code=200, val="Cluster Config insertAllHost Success")
            else:
                return createReturn(code=500, val=ping_result["val"])
    except Exception as e:
        # 결과값 리턴
        return createReturn(code=500, val=return_val)

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
    if args.action == 'update':
        ret = updateAllHostGlueConfig(args)
        print(ret)