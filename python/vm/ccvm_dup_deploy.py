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
import time

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

def generateMacAddress():

    # The first line is defined for specified vendor
    
    mac = [ 0x00, 0x24, 0x81,
        random.randint(0x00, 0x7f),
        random.randint(0x00, 0xff),
        random.randint(0x00, 0xff) ]

    mac_address = ':'.join(map(lambda x: "%02x" % x, mac))

    return mac_address

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
ccvm_dup_bootstrap_file = pluginpath+"/shell/host/ccvm_dup_bootstrap.sh"
def createDupCcvm(args):
    try:
        success_bool = True

        # ceph rbd 이미지 삭제
        result = os.system("rbd ls -p rbd | grep ccvm_dup > /dev/null")
        if result == 0:
            os.system("rbd rm rbd/ccvm_dup")

        # 기존 가상머신 xml 편집 (가상머신명, cloudinit.iso 경로, rbd 경로 파일 명)
        os.system("rm -rf "+ccvm_dup_config_path)
        os.system("mkdir "+ccvm_dup_config_path)
        os.system("cp -f "+ccvm_config_file+" "+ccvm_dup_config_file)
        
        with open(ccvm_dup_config_file, "rt") as file:
            x = file.read()
            
        with open(ccvm_dup_config_file, "wt") as file:
            x = x.replace("ccvm", "ccvm_dup")
            file.write(x)
        
        with fileinput.FileInput(ccvm_dup_config_file, inplace=True, backup='.bak' ) as fi:
            for line in fi:
                if '<mac address=' in line:
                    line = "      <mac address='"+generateMacAddress()+"'/>\n"

                sys.stdout.write(line)

        # ccvm_dup-cloudinit.iso 생성
        hosts_file = "/etc/hosts"
        privkey = "/root/.ssh/id_rsa"
        pubkey = "/root/.ssh/id_rsa.pub"
        mngt_nic = "enp0s20"

        json_data = openClusterJson()
        mgmt_prefix = str(json_data["clusterConfig"]["mngtNic"]["cidr"])
        mgmt_gw = json_data["clusterConfig"]["mngtNic"]["gw"]
        dns = json_data["clusterConfig"]["mngtNic"]["dns"]
        ccvm_ip = json_data["clusterConfig"]["ccvm"]["ip"]

        with open(ccvm_dup_bootstrap_file, "rt") as file:
            x = file.read()
            
        with open(ccvm_dup_bootstrap_file, "wt") as file:
            x = x.replace("DBSERVERIP",ccvm_ip)
            file.write(x)

        if mgmt_gw == None:
            if dns == None:
                result = json.loads(python3(pluginpath + '/tools/cloudinit/gencloudinit.py','--hostname','ccvm_dup','--hosts',hosts_file,'--privkey',privkey,'--pubkey',pubkey,'--mgmt-nic',mngt_nic,'--mgmt-ip',args.mngt_ip,'--mgmt-prefix',mgmt_prefix,'--iso-path',pluginpath+'/tools/vmconfig/ccvm_dup/ccvm_dup-cloudinit.iso','ccvm_dup').stdout.decode())
            else:
                result = json.loads(python3(pluginpath + '/tools/cloudinit/gencloudinit.py','--hostname','ccvm_dup','--hosts',hosts_file,'--privkey',privkey,'--pubkey',pubkey,'--mgmt-nic',mngt_nic,'--mgmt-ip',args.mngt_ip,'--mgmt-prefix',mgmt_prefix,'--dns',dns,'--iso-path',pluginpath+'/tools/vmconfig/ccvm_dup/ccvm_dup-cloudinit.iso','ccvm_dup').stdout.decode())
        else:
            if dns == None:
                result = json.loads(python3(pluginpath + '/tools/cloudinit/gencloudinit.py','--hostname','ccvm_dup','--hosts',hosts_file,'--privkey',privkey,'--pubkey',pubkey,'--mgmt-nic',mngt_nic,'--mgmt-ip',args.mngt_ip,'--mgmt-prefix',mgmt_prefix,'--mgmt-gw', mgmt_gw,'--iso-path',pluginpath+'/tools/vmconfig/ccvm_dup/ccvm_dup-cloudinit.iso','ccvm_dup').stdout.decode())
            else:
                result = json.loads(python3(pluginpath + '/tools/cloudinit/gencloudinit.py','--hostname','ccvm_dup','--hosts',hosts_file,'--privkey',privkey,'--pubkey',pubkey,'--mgmt-nic',mngt_nic,'--mgmt-ip',args.mngt_ip,'--mgmt-prefix',mgmt_prefix,'--mgmt-gw', mgmt_gw,'--dns', dns,'--iso-path',pluginpath+'/tools/vmconfig/ccvm_dup/ccvm_dup-cloudinit.iso','ccvm_dup').stdout.decode())

        # 설정파일 각 호스트에 복사
        for host_name in json_data["clusterConfig"]["hosts"]:
            for i in [1,2,3]:
                ret_num = os.system("ssh root@"+host_name["hostname"]+" 'ssh-keygen -R "+args.mngt_ip+" > /dev/null 2>&1'")
                ret_num = os.system("scp -q -r "+pluginpath+"/tools/vmconfig/ccvm_dup root@"+host_name["hostname"]+":"+pluginpath+"/tools/vmconfig/")
                if ret_num == 0:
                    break
                    
            if ret_num != 0:
                return createReturn(code=500, val=host_name + " : ccvm_dup 설정파일 복사 실패")

        # ceph 이미지 등록
        os.system("qemu-img convert -f qcow2 -O rbd /var/lib/libvirt/images/ablestack-template-back.qcow2 rbd:rbd/ccvm_dup")
        # ccvm image resize
        os.system("rbd resize -s 500G ccvm_dup")

        result = json.loads(python3(pluginpath+'/python/pcs/main.py', 'create', '--resource', 'cloudcenter_res_dup', '--xml', pluginpath+'/tools/vmconfig/ccvm_dup/ccvm_dup.xml' ).stdout.decode())
        if result['code'] not in [200]:
            success_bool = False

        #ccvm이 정상적으로 생성 되었는지 확인
        domid_check = 0
        cnt_num = 0
        while True:
            time.sleep(1)
            cnt_num += 1
            domid_check = os.system("ssh -o StrictHostKeyChecking=no "+args.mngt_ip+" 'echo ok > /dev/null 2>&1'")
            if domid_check == 0 or cnt_num > 300:
                break
        if domid_check != 0:
            success_bool = False

        os.system("ssh -o StrictHostKeyChecking=no "+args.mngt_ip+" 'sh /root/bootstrap.sh > /dev/null 2>&1'")

        # 결과값 리턴
        if success_bool:
            return createReturn(code=200, val="cloud center duplication setup success")
        else:
            return createReturn(code=500, val="cloud center duplication setup fail")

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