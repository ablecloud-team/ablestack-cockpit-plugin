'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : 클라우드센터 가상머신 이중화하는 프로그램
최초 작성일 : 2022. 12. 18
'''

#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import logging
import sys
import fileinput
import random
import os
import json

from ablestack import *
from sh import python3

def createArgumentParser():
    '''
    입력된 argument를 파싱하여 dictionary 처럼 사용하게 만들어 주는 parser를 생성하는 함수
    :return: argparse.ArgumentParser
    '''
    # 참조: https://docs.python.org/ko/3/library/argparse.html
    # 프로그램 설명
    parser = argparse.ArgumentParser(description='클라우드센터 가상머신 이중화하는 프로그램',
                                        epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™',
                                        usage='%(prog)s arguments')

    # 인자 추가: https://docs.python.org/ko/3/library/argparse.html#the-add-argument-method
    parser.add_argument('-mi', '--mngt-ip', metavar='[ccvm duplication management IP]', type=str, help='input Value to ccvm duplication management IP')

    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐):
    parser.add_argument('-v', '--verbose', action='count', default=0, help='increase output verbosity')
    
    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    parser.add_argument('-H', '--Human', action='store_const', dest='flag_readerble', const=True, help='Human readable')
    # Version 추가
    parser.add_argument('-V', '--Version', action='version', version='%(prog)s 1.0')

    return parser

json_file_path = pluginpath+"/tools/properties/cluster.json"
def openClusterJson():
    try:
        with open(json_file_path, 'r') as json_file:
            ret = json.load(json_file)
    except Exception as e:
        ret = createReturn(code=500, val='cluster.json read error')
        print ('EXCEPTION : ',e)

    return ret

ccvm_config_path = pluginpath+"/tools/vmconfig/ccvm"
ccvm_config_file = pluginpath+"/tools/vmconfig/ccvm/ccvm.xml"
ccvm_dup_config_path = pluginpath+"/tools/vmconfig/ccvm_dup"
ccvm_dup_config_file = pluginpath+"/tools/vmconfig/ccvm_dup/ccvm_dup.xml"
def createDupCcvm(args):
    try:
        # 기존 가상머신 xml 편집 (가상머신명, cloudinit.iso 경로, rbd 경로 파일 명)
        os.system("rm -rf "+ccvm_dup_config_path)
        os.system("mkdir "+ccvm_dup_config_path)
        os.system("cp -f "+ccvm_config_file+" "+ccvm_dup_config_file)
        
        with open(ccvm_dup_config_file, "rt") as file:
            x = file.read()
            
        with open(ccvm_dup_config_file, "wt") as file:
            x = x.replace("ccvm", "ccvm_dup")
            file.write(x)

        # ccvm_dup-cloudinit.iso 생성
        hosts_file = "/etc/hosts"
        privkey = "/root/.ssh/id_rsa"
        pubkey = "/root/.ssh/id_rsa.pub"
        mngt_nic = "bridge0"

        json_data = openClusterJson()
        mgmt_prefix = str(json_data["clusterConfig"]["mngtNic"]["cidr"])
        mgmt_gw = json_data["clusterConfig"]["mngtNic"]["gw"]
        dns = json_data["clusterConfig"]["mngtNic"]["dns"]

        if mgmt_gw == None:
            if dns == None:
                result = json.loads(python3(pluginpath + '/tools/cloudinit/gencloudinit.py','--hostname','ccvm_dup','--hosts',hosts_file,'--privkey',privkey,'--pubkey',pubkey,'--mgmt-nic',mngt_nic,'--mgmt-ip',args.mngt_ip,'--mgmt-prefix',mgmt_prefix,'--iso-path',pluginpath+'/tools/vmconfig/ccvm/ccvm-cloudinit.iso','ccvm').stdout.decode())
            else:
                result = json.loads(python3(pluginpath + '/tools/cloudinit/gencloudinit.py','--hostname','ccvm_dup','--hosts',hosts_file,'--privkey',privkey,'--pubkey',pubkey,'--mgmt-nic',mngt_nic,'--mgmt-ip',args.mngt_ip,'--mgmt-prefix',mgmt_prefix,'--dns',dns,'--iso-path',pluginpath+'/tools/vmconfig/ccvm/ccvm-cloudinit.iso','ccvm').stdout.decode())
        else:
            if dns == None:
                result = json.loads(python3(pluginpath + '/tools/cloudinit/gencloudinit.py','--hostname','ccvm_dup','--hosts',hosts_file,'--privkey',privkey,'--pubkey',pubkey,'--mgmt-nic',mngt_nic,'--mgmt-ip',args.mngt_ip,'--mgmt-prefix',mgmt_prefix,'--mgmt-gw', mgmt_gw,'--iso-path',pluginpath+'/tools/vmconfig/ccvm/ccvm-cloudinit.iso','ccvm').stdout.decode())
            else:
                result = json.loads(python3(pluginpath + '/tools/cloudinit/gencloudinit.py','--hostname','ccvm_dup','--hosts',hosts_file,'--privkey',privkey,'--pubkey',pubkey,'--mgmt-nic',mngt_nic,'--mgmt-ip',args.mngt_ip,'--mgmt-prefix',mgmt_prefix,'--mgmt-gw', mgmt_gw,'--dns', dns,'--iso-path',pluginpath+'/tools/vmconfig/ccvm/ccvm-cloudinit.iso','ccvm').stdout.decode())  

        # 결과값 리턴
        return createReturn(code=200, val={})        

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
    logger = createLogger(verbosity=logging.CRITICAL, file_log_level=logging.ERROR, log_file='test.log')

    # 실제 로직 부분 호출 및 결과 출력
    ret = createDupCcvm(args)
    print(ret)