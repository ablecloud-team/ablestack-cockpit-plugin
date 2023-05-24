'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : gwvm을 생성 하는 프로그램
최초 작성일 : 2023. 05. 15
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

env=os.environ.copy()

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
    parser = argparse.ArgumentParser(description='gwvm을 생성 하는 프로그램',
                                        epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™',
                                        usage='%(prog)s arguments')

    # 인자 추가: https://docs.python.org/ko/3/library/argparse.html#the-add-argument-method
    parser.add_argument('action', choices=['create'], help='choose one of the actions')
    #--management-network-bridge br0                                        | 1택, 필수
    parser.add_argument('-mnb', '--management-network-bridge', metavar='[bridge name]', type=str, help='input Value to bridge name of the management network', required=True)
    parser.add_argument('-mi', '--mngt-ip', metavar='Management IP', help="관리 네트워크 IP", required=True)
    #--service-network-bridge br1                                           | 1택, 필수
    parser.add_argument('-snb', '--storage-network-bridge', metavar='[bridge name]', type=str, help='input Value to bridge name of the storage network', required=True)
    parser.add_argument('-si', '--sn-ip', metavar='Storage IP', help="스토리지 네트워크 IP", required=True)

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

def create(args):
    
    # 하이퍼 바이저 확인
    hypervisor = "cell"

    if hypervisor == "cell":
        # 호스트의 cluster.json 파일 scvm에 복사
        os.system("scp -q -o StrictHostKeyChecking=no root@"+ablecube_host+":" + json_file_path + " " + json_file_path)

        # cluster.json 파일 읽어오기
        json_data = openClusterJson()

        host_name="gwvm"
        cpu_core = 4
        memory_gb = 8
        mngt_nic = args.management_network_bridge
        mngt_ip = args.mngt_ip

        mngt_cidr = ""
        mngt_nic_gw = ""
        mngt_nic_dns = ""
        if json_data["clusterConfig"]["mngtNic"]["cidr"] is not None:
            mngt_cidr = json_data["clusterConfig"]["mngtNic"]["cidr"]

        if json_data["clusterConfig"]["mngtNic"]["gw"] is not None:
            mngt_nic_gw = json_data["clusterConfig"]["mngtNic"]["gw"]

        if json_data["clusterConfig"]["mngtNic"]["dns"] is not None:
            mngt_nic_dns = json_data["clusterConfig"]["mngtNic"]["dns"]

        pn_nic = args.storage_network_bridge
        pn_ip = args.sn_ip
        pn_cidr = 24
        pcs_cluster_list = []
        
        # ssh-key 파일 세팅
        id_rsa = check_output(["cat /root/.ssh/id_rsa"], universal_newlines=True, shell=True, env=env)
        id_rsa_pub = check_output(["cat /root/.ssh/id_rsa.pub"], universal_newlines=True, shell=True, env=env)
        # hosts 파일 세팅
        hosts = check_output(["cat /etc/hosts"], universal_newlines=True, shell=True, env=env)

        os.system("cp -f /etc/hosts " + pluginpath+"/tools/vmconfig/gwvm/hosts")
        os.system("cp -f /root/.ssh/id_rsa " + pluginpath+"/tools/vmconfig/gwvm/id_rsa")
        os.system("cp -f /root/.ssh/id_rsa.pub " + pluginpath+"/tools/vmconfig/gwvm/id_rsa.pub")

        create_gwvm_cloudinit_cmd = []
        create_gwvm_cloudinit_cmd.append(pluginpath + "/python/gwvm/create_gwvm_cloudinit.py")
        create_gwvm_cloudinit_cmd.append("-f1")
        create_gwvm_cloudinit_cmd.append(pluginpath+"/tools/vmconfig/gwvm/hosts")
        create_gwvm_cloudinit_cmd.append("-f2")
        create_gwvm_cloudinit_cmd.append(pluginpath+"/tools/vmconfig/gwvm/id_rsa")
        create_gwvm_cloudinit_cmd.append("-f3")
        create_gwvm_cloudinit_cmd.append(pluginpath+"/tools/vmconfig/gwvm/id_rsa.pub")
        create_gwvm_cloudinit_cmd.append('--hostname')
        create_gwvm_cloudinit_cmd.append(host_name)
        create_gwvm_cloudinit_cmd.append('-hns')
        
        
        if json_data["clusterConfig"]["pcsCluster"]["hostname1"] is not None:
            pcs_cluster_list.append(json_data["clusterConfig"]["pcsCluster"]["hostname1"])
            create_gwvm_cloudinit_cmd.append(json_data["clusterConfig"]["pcsCluster"]["hostname1"])

        if json_data["clusterConfig"]["pcsCluster"]["hostname2"] is not None:
            pcs_cluster_list.append(json_data["clusterConfig"]["pcsCluster"]["hostname2"])
            create_gwvm_cloudinit_cmd.append(json_data["clusterConfig"]["pcsCluster"]["hostname2"])

        if json_data["clusterConfig"]["pcsCluster"]["hostname3"] is not None:
            pcs_cluster_list.append(json_data["clusterConfig"]["pcsCluster"]["hostname3"])
            create_gwvm_cloudinit_cmd.append(json_data["clusterConfig"]["pcsCluster"]["hostname3"])
        
        create_gwvm_cloudinit_cmd.append('--mgmt-nic')
        create_gwvm_cloudinit_cmd.append('enp0s20')
        create_gwvm_cloudinit_cmd.append('--mgmt-ip')
        create_gwvm_cloudinit_cmd.append(mngt_ip)
        create_gwvm_cloudinit_cmd.append('--mgmt-prefix')
        create_gwvm_cloudinit_cmd.append(mngt_cidr)
        
        if mngt_nic_gw != "":
            create_gwvm_cloudinit_cmd.append('--mgmt-gw')
            create_gwvm_cloudinit_cmd.append(mngt_nic_gw)
        if mngt_nic_dns != "":
            create_gwvm_cloudinit_cmd.append('--dns')
            create_gwvm_cloudinit_cmd.append(mngt_nic_dns)

        create_gwvm_cloudinit_cmd.append('--sn-nic')
        create_gwvm_cloudinit_cmd.append('enp0s21')
        create_gwvm_cloudinit_cmd.append('--sn-ip')
        create_gwvm_cloudinit_cmd.append(pn_ip)
        create_gwvm_cloudinit_cmd.append('--sn-prefix')
        create_gwvm_cloudinit_cmd.append(pn_cidr)

        result = json.loads(python3(create_gwvm_cloudinit_cmd).stdout.decode())

        # gwvm xml 생성
        result = json.loads(python3(pluginpath + '/python/gwvm/create_gwvm_xml.py', '-c', cpu_core, '-m', memory_gb, '-mnb', mngt_nic, '-snb', pn_nic, '-hns', pcs_cluster_list ).stdout.decode())
        # result로 에러 체크

        # gwvm pcs 클러스터 배포
        # result = json.loads(python3(pluginpath + 'python/pcs/pcsExehost.py' ).stdout.decode())
        # pcs_exe_ip = result.val
        pcs_exe_ip = '10.10.2.2'
        ret = ssh('-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=5', pcs_exe_ip, "python3 " + pluginpath + "/python/gwvm/create_gwvm_setup_pcs_cluster.py").stdout.strip().decode()

        # gwvm 부팅 완료 대기
        os.system("ssh-keygen -R "+mngt_ip+" > /dev/null 2>&1")
        gwvm_boot_check=0
        cnt_num = 0
        while True:
            time.sleep(1)
            cnt_num += 1
            gwvm_boot_check = os.system("ssh -q -o StrictHostKeyChecking=no -o ConnectTimeout=5 root@"+mngt_ip+" 'echo ok > /dev/null 2>&1'")
            if gwvm_boot_check == 0 or cnt_num > 30000:
                break

        # gwvm_boot_check 결과가 0이 부팅 완료, 0이 아니면 부팅 미완료
        if gwvm_boot_check != 0:
            return createReturn(code=500, val="gwvm did not boot. : "+e)

        # bootstrap.sh 실행
        ret = ssh('-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=5', mngt_ip, "sh /root/bootstrap.sh").stdout.strip().decode()

        return createReturn(code=200, val="Gateway VM Create Success")

# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    # parser 생성
    parser = createArgumentParser()
    # input 파싱
    args = parser.parse_args()

    verbose = (5 - args.verbose) * 10

    # 로깅을 위한 logger 생성, 모든 인자에 default 인자가 있음.
    logger = createLogger(verbosity=logging.CRITICAL, file_log_level=logging.ERROR, log_file='test.log')

    # secret.xml 생성 및 virsh 등록
    # secret_ret = json.loads(createSecretKey(args.host_names))
    
    # if secret_ret["code"] == 200 :
    #     ret = createCcvmXml(args)
    #     print(ret)
    # else:
    #     print(secret_ret)

    # 실제 로직 부분 호출 및 결과 출력
    if args.action == 'create':
        ret = create(args)
        print(ret)