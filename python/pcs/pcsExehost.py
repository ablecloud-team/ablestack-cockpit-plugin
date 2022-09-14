'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : 클러스터 설정 파일 cluster.json을 기준으로 pcs 실행이 가능한 호스트명을 구하는 프로그램
최초 작성일 : 2022. 09. 14
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
    parser = argparse.ArgumentParser(description='클러스터 설정 파일 cluster.json을 기준으로 pcs 실행이 가능한 호스트명을 구하는 프로그램',
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

def openClusterJson():
    try:
        with open(json_file_path, 'r') as json_file:
            ret = json.load(json_file)
    except Exception as e:
        ret = createReturn(code=500, val='cluster.json read error')
        print ('EXCEPTION : ',e)

    return ret

# cluster.json에서  무조건 바꾸는 함수 (동일한 값이 있으면 변경, 없으면 추가)
def selectPcsExeHost(args):
    try:
        # cluster.json 파일 읽어오기
        json_data = openClusterJson()
        hostname = socket.gethostname()
        
        for f_key in json_data["clusterConfig"]["pcsCluster"]:
            pcs_host = json_data["clusterConfig"]["pcsCluster"][f_key]
            if pcs_host == hostname:
                return createReturn(code=200, val=pcs_host)
        
        for f_key in json_data["clusterConfig"]["pcsCluster"]:
            pcs_host = json_data["clusterConfig"]["pcsCluster"][f_key]
            if pcs_host != "":
                ret = ssh('-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=1', pcs_host, "echo ok").stdout.strip().decode()
                if ret == 'ok':
                    return createReturn(code=200, val=pcs_host)

        return createReturn(code=200, val=hostname)
    except Exception as e:
        # 결과값 리턴
        return createReturn(code=500, val="Please check the \"cluster.json\" file.")

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
    ret = selectPcsExeHost(args)
    print(ret)