'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : 게이트웨이 가상머신에 사용할 cloudinit iso를 생성하는 프로그램
최초 작성일 : 2023. 05. 15
'''

#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import logging
import json
import sys
import os

from ablestack import *
from sh import python3

def createArgumentParser():
    '''
    입력된 argument를 파싱하여 dictionary 처럼 사용하게 만들어 주는 parser를 생성하는 함수
    :return: argparse.ArgumentParser
    '''
    # 참조: https://docs.python.org/ko/3/library/argparse.html
    # 프로그램 설명
    parser = argparse.ArgumentParser(description='게이트웨이 가상머신에 사용할 cloudinit iso를 생성하는 프로그램',
                                        epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™',
                                        usage='%(prog)s arguments')

    # 인자 추가: https://docs.python.org/ko/3/library/argparse.html#the-add-argument-method

    #parser.add_argument('action', choices=['reset'], help='choose one of the actions')

    parser.add_argument('-f1', '--file1', metavar='[hosts file location]', type=str, help='input Value to hosts file location and name', required=True)
    parser.add_argument('-f2', '--file2', metavar='[private key file2 location]', type=str, help='input Value to private key file location and name', required=True)
    parser.add_argument('-f3', '--file3', metavar='[public key file3 location]', type=str, help='input Value to public key file location and name', required=True)
    parser.add_argument('--hostname', metavar='hostname', help="VM의 이름")
    parser.add_argument('--mgmt-ip', metavar='Management IP', help="관리 네트워크 IP")
    parser.add_argument('--mgmt-nic', metavar='Management NIC', help="관리 네트워크 NIC")
    parser.add_argument('--mgmt-prefix', metavar='Management prefix', help="관리 네트워크 prefix")
    parser.add_argument('--mgmt-gw', metavar='Management gw', help="관리 네트워크 gw")
    parser.add_argument('--dns',metavar='DNS', help="서버 DNS 주소")
    parser.add_argument('--sn-ip', metavar='Storage IP', help="스토리지 네트워크 IP")
    parser.add_argument('--sn-nic', metavar='Storage nic', help="스토리지 네트워크 nic")
    parser.add_argument('--sn-prefix', metavar='Storage prefix', help="스토리지 네트워크 prefix")
    # parser.add_argument('--sn-gw', metavar='Storage gw', help="스토리지 네트워크 gw")
    # parser.add_argument('--sn-dns',metavar='Storage DNS', help="스토리지 DNS 주소")
    parser.add_argument('-hns', '--host-names', metavar=('[hostname1]','[hostname2]','[hostname3]'), type=str, nargs=3, help='input Value to three host names', required=True)

    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐):
    parser.add_argument('-v', '--verbose', action='count', default=0, help='increase output verbosity')

    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    parser.add_argument('-H', '--Human', action='store_const', dest='flag_readerble', const=True, help='Human readable')

    # Version 추가
    parser.add_argument('-V', '--Version', action='version', version='%(prog)s 1.0')

    return parser

def createGwvmCloudinit(args):

    success_bool = True

    # cloudinit iso 생성 (/usr/share/cockpit/ablestack/tools/vmconfig/gwvm/gwvm-cloudinit.iso)
    # result = json.loads(python3(pluginpath + '/tools/cloudinit/gencloudinit.py','--hostname',args.hostname,'--hosts',args.file1,'--privkey',args.file2,'--pubkey',args.file3,'--mgmt-nic',args.mgmt_nic,'--mgmt-ip',args.mgmt_ip,'--mgmt-prefix',args.mgmt_prefix,'--sn-nic',args.sn_nic,'--sn-ip',args.sn_ip,'--sn-prefix',args.sn_prefix,'--iso-path',pluginpath+'/tools/vmconfig/gwvm/gwvm-cloudinit.iso','gwvm'))
    if args.mgmt_gw == None:
        if args.dns == None:
            result = json.loads(python3(pluginpath + '/tools/cloudinit/gencloudinit.py','--hostname',args.hostname,'--hosts',args.file1,'--privkey',args.file2,'--pubkey',args.file3,'--mgmt-nic',args.mgmt_nic,'--mgmt-ip',args.mgmt_ip,'--mgmt-prefix',args.mgmt_prefix,'--sn-nic',args.sn_nic,'--sn-ip',args.sn_ip,'--sn-prefix',args.sn_prefix,'--iso-path',pluginpath+'/tools/vmconfig/gwvm/gwvm-cloudinit.iso','gwvm'))
        else:
            result = json.loads(python3(pluginpath + '/tools/cloudinit/gencloudinit.py','--hostname',args.hostname,'--hosts',args.file1,'--privkey',args.file2,'--pubkey',args.file3,'--mgmt-nic',args.mgmt_nic,'--mgmt-ip',args.mgmt_ip,'--mgmt-prefix',args.mgmt_prefix,'--dns',args.dns,'--sn-nic',args.sn_nic,'--sn-ip',args.sn_ip,'--sn-prefix',args.sn_prefix,'--iso-path',pluginpath+'/tools/vmconfig/gwvm/gwvm-cloudinit.iso','gwvm'))
    else:
        if args.dns == None:
            result = json.loads(python3(pluginpath + '/tools/cloudinit/gencloudinit.py','--hostname',args.hostname,'--hosts',args.file1,'--privkey',args.file2,'--pubkey',args.file3,'--mgmt-nic',args.mgmt_nic,'--mgmt-ip',args.mgmt_ip,'--mgmt-prefix',args.mgmt_prefix,'--mgmt-gw',args.mgmt_gw,'--sn-nic',args.sn_nic,'--sn-ip',args.sn_ip,'--sn-prefix',args.sn_prefix,'--iso-path',pluginpath+'/tools/vmconfig/gwvm/gwvm-cloudinit.iso','gwvm'))
        else:
            result = json.loads(python3(pluginpath + '/tools/cloudinit/gencloudinit.py','--hostname',args.hostname,'--hosts',args.file1,'--privkey',args.file2,'--pubkey',args.file3,'--mgmt-nic',args.mgmt_nic,'--mgmt-ip',args.mgmt_ip,'--mgmt-prefix',args.mgmt_prefix,'--mgmt-gw',args.mgmt_gw,'--dns',args.dns,'--sn-nic',args.sn_nic,'--sn-ip',args.sn_ip,'--sn-prefix',args.sn_prefix,'--iso-path',pluginpath+'/tools/vmconfig/gwvm/gwvm-cloudinit.iso','gwvm'))

    if result['code'] not in [200]:
        success_bool = False
    else:
        for host_name in args.host_names:
            ret_num = 0

            # pcs 클러스터 호스트에 /vmconfig/gwvm 폴더생성 명령 실패
            for i in [1,2,3]:
                ret_num = os.system("ssh root@"+host_name+" 'mkdir -p "+pluginpath+"/tools/vmconfig/gwvm'")
                if ret_num == 0:
                    break

            if ret_num != 0:
                return createReturn(code=500, val=host_name + " : pcs 클러스터 호스트에 /vmconfig/gwvm 폴더생성 명령 실패")

            # /gwvm/gwvm-cloudinit.iso 복사 실패
            for i in [1,2,3]:
                ret_num = os.system("scp -q "+pluginpath+"/tools/vmconfig/gwvm/gwvm-cloudinit.iso root@"+host_name+":"+pluginpath+"/tools/vmconfig/gwvm/gwvm-cloudinit.iso")
                if ret_num == 0:
                    break

            if ret_num != 0:
                return createReturn(code=500, val=host_name + " : pcs 클러스터 호스트에 /gwvm/gwvm-cloudinit.iso 복사 실패")

    # 결과값 리턴
    if success_bool:
        return createReturn(code=200, val="gwvm cloudinit iso create success")
    else:
        return createReturn(code=500, val="gwvm cloudinit iso create fail")

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
    ret = createGwvmCloudinit(args)
    print(ret)
