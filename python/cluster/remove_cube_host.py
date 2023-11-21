'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : Cube호스트 설정 정보를 초기화하는 프로그램
최초 작성일 : 2022. 12. 17
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

hosts_file_path = "/etc/hosts"
ablecloud_file_path = pluginpath+"/tools/properties/ablestack.json"
cluster_file_path = pluginpath+"/tools/properties/cluster.json"
ccvm_config_path = pluginpath+"/tools/vmconfig/ccvm/"
scvm_config_path = pluginpath+"/tools/vmconfig/scvm/"
def createArgumentParser():
    '''
    입력된 argument를 파싱하여 dictionary 처럼 사용하게 만들어 주는 parser를 생성하는 함수
    :return: argparse.ArgumentParser
    '''
    # 참조: https://docs.python.org/ko/3/library/argparse.html
    # 프로그램 설명
    parser = argparse.ArgumentParser(description='Cube 호스트 제거하기위해 설정 정보를 초기화하는 프로그램',
                                        epilog='copyrightⓒ 2022 All rights reserved by ABLECLOUD™',
                                        usage='%(prog)s arguments')

    # 인자 추가: https://docs.python.org/ko/3/library/argparse.html#the-add-argument-method
    parser.add_argument('action', choices=['remove'], help='choose one of the actions')

    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐):
    parser.add_argument('-v', '--verbose', action='count', default=0, help='increase output verbosity')

    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    parser.add_argument('-H', '--Human', action='store_const', dest='flag_readerble', const=True, help='Human readable')

    # Version 추가
    parser.add_argument('-V', '--Version', action='version', version='%(prog)s 1.0')

    return parser

def openClusterJson():
    try:
        with open(cluster_file_path, 'r') as json_file:
            ret = json.load(json_file)
    except Exception as e:
        ret = createReturn(code=500, val='cluster.json read error')
        print ('EXCEPTION : ',e)

    return ret

# 설정 정보 초기화
# 1) 다른 호스트에 hosts, cluster.json 파일에 해당 제거 호스트 정보 삭제
# 2) hosts 파일 초기화
# 3) ablestack.json 초기화
# 4) cluster.json 초기화
# 5) vmconfig 초기화
def remove(args):
    try:
        current_hostname = socket.gethostname()
        json_data = openClusterJson()

        # 다른 cube host에 삭제되는 호스트 정보 삭제
        for f_val in json_data["clusterConfig"]["hosts"]:
            if current_hostname != f_val["hostname"]:
                cmd = "python3 "+pluginpath + "/python/cluster/cluster_config.py remove -rh "+current_hostname+" -co withScvm"
                ret = json.loads(ssh('-o', 'StrictHostKeyChecking=no', f_val["ablecube"], cmd))
                if ret["code"] != 200:
                    return createReturn(code=500, val="python3 cluster_config.py remove error : Please check if CUBEs and SCVMs are running.")

        # cube host remove 실행한 해당 호스트에서는 설정정보 초기화
        with open(hosts_file_path, 'w') as outfile:
            outfile.write("127.0.0.1       localhost localhost.localdomain localhost4 localhost4.localdomain4\n")
            outfile.write("::1     localhost localhost.localdomain localhost6 localhost6.localdomain6")


        with open(ablecloud_file_path, 'w') as outfile:
            outfile.write('{\n')
            outfile.write('    "bootstrap": {\n')
            outfile.write('        "scvm": "true",\n')
            outfile.write('        "ccvm": "true"\n')
            outfile.write('    },\n')
            outfile.write('    "monitoring": {\n')
            outfile.write('        "wall": "true"\n')
            outfile.write('    }\n')
            outfile.write('}')

        with open(cluster_file_path, 'w') as outfile:
            outfile.write('{\n')
            outfile.write('    "clusterConfig": {\n')
            outfile.write('        "ccvm": {\n')
            outfile.write('            "ip": ""\n')
            outfile.write('        },\n')
            outfile.write('        "mngtNic": {\n')
            outfile.write('            "cidr": "",\n')
            outfile.write('            "gw": "",\n')
            outfile.write('            "dns": ""\n')
            outfile.write('        },\n')
            outfile.write('        "pcsCluster": {\n')
            outfile.write('            "hostname1": "",\n')
            outfile.write('            "hostname2": "",\n')
            outfile.write('            "hostname3": ""\n')
            outfile.write('        },\n')
            outfile.write('        "hosts": [\n')
            outfile.write('        ]\n')
            outfile.write('    }\n')
            outfile.write('}\n')

        os.system("rm -rf "+ccvm_config_path)
        os.system("rm -rf "+scvm_config_path)

        return createReturn(code=200, val="Cluster Config insert Success")

    except Exception as e:
        # 결과값 리턴
        return createReturn(code=500, val=" : "+e)

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
    if args.action == 'remove':
        ret = remove(args)
        print(ret)