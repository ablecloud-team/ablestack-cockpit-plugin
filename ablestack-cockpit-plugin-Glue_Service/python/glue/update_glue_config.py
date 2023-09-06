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

    return_val = "cluster.json file read failed."
    try:
        # cluster.json 파일 읽어오기
        json_data = openClusterJson()

        hostname = socket.gethostname()

        # 명령수행 호스트에 ceph.conf 파일 업데이트
        return_val = "ceph config generate-minimal-conf command failed. Check cube host /etc/ceph/ceph.client.admin.keyring or ceph.conf"
        ret_num = os.system("ceph config generate-minimal-conf > /etc/ceph/ceph_temp.conf")
        ret_num += os.system("mv -f /etc/ceph/ceph_temp.conf /etc/ceph/ceph.conf")
    
        if ret_num == 0:
            # ping test로 네트워크가 연결되어 있는지 상태 체크하는 부분
            return_val = "The ping test failed. Check ablecube cube hosts and scvms network IPs. Please check the config.json file."

            host_list = []
            for f_val1 in json_data["clusterConfig"]["hosts"]:
                host_list.append(f_val1["ablecube"])
                host_list.append(f_val1["scvmMngt"])

            ping_result = json.loads(python3(pluginpath+'/python/vm/host_ping_test.py', '-hns', host_list).stdout.decode())

            if ping_result["code"] == 200:
                # 명령 수행이 가능한 상태인지 체크하는 부분
                return_val = "Command execution test failed. Check the ablecube cube hosts and scvms status. Please check the config.json file or ip"
                for f_val2 in json_data["clusterConfig"]["hosts"]:
                    ret = ssh('-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=5', f_val2["ablecube"], "echo ok").stdout.strip().decode()
                    if ret != "ok":
                        return createReturn(code=500, val=return_val + " : " + f_val2["ablecube"])

                    ret = ssh('-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=5', f_val2["scvmMngt"], "echo ok").stdout.strip().decode()
                    if ret != "ok":
                        return createReturn(code=500, val=return_val + " : " + f_val2["scvmMngt"])
                
                # cube 호스트 및 scvm에 keyring, ceph.conf 파일 전송
                return_val = "cube host and scvm scp keyring, ceph.conf Failed"

                for f_val3 in json_data["clusterConfig"]["hosts"]:
                    ret_scp = os.system("scp -q /etc/ceph/* root@"+f_val3["ablecube"]+":/etc/ceph/")
                    if ret_scp != 0:
                        return createReturn(code=500, val=f_val3["ablecube"]+" : Glue Config copy Failed.")

                    ret_scp = os.system("scp -q /etc/ceph/* root@"+f_val3["scvmMngt"]+":/etc/ceph/")
                    if ret_scp != 0:
                        return createReturn(code=500, val=f_val3["scvmMngt"]+" : Glue Config copy Failed.")

                #모든 작업이 수행 완료되면 성공결과 return
                return createReturn(code=200, val="Glue Config All cube host and scvm update Success")
        else:
            return createReturn(code=500, val=return_val)
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