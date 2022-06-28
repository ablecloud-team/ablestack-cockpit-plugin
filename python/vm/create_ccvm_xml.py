'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : 장애조치 클러스터를 구성할 1,2,3호스트에 클라우드센터 가상머신 xml과 secret key를 생성하는 프로그램
최초 작성일 : 2021. 03. 31
'''

#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import logging
import sys
import fileinput
import random
import os
import subprocess

from ablestack import *

def createArgumentParser():
    '''
    입력된 argument를 파싱하여 dictionary 처럼 사용하게 만들어 주는 parser를 생성하는 함수
    :return: argparse.ArgumentParser
    '''
    # 참조: https://docs.python.org/ko/3/library/argparse.html
    # 프로그램 설명
    parser = argparse.ArgumentParser(description='장애조치 클러스터를 구성할 1,2,3호스트에 클라우드센터 가상머신 xml과 secret key를 생성하는 프로그램',
                                        epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™',
                                        usage='%(prog)s arguments')

    # 인자 추가: https://docs.python.org/ko/3/library/argparse.html#the-add-argument-method

    #--cpu 4 --memory 16                                 | 1택, 필수
    parser.add_argument('-c', '--cpu', metavar='[cpu cores]', type=int, help='input Value to cpu cores', required=True)
    parser.add_argument('-m', '--memory', metavar='[memory gb]', type=int, help='input Value to memory GB', required=True)
     
    #--management-network-bridge br0                                        | 1택, 필수
    parser.add_argument('-mnb', '--management-network-bridge', metavar='[bridge name]', type=str, help='input Value to bridge name of the management network', required=True)
    
    #--service-network-bridge br1                                           | 1택, 조건부 필수
    parser.add_argument('-snb', '--service-network-bridge', metavar='[bridge name]', type=str, help='input Value to bridge name of the service network')

    # three host names
    parser.add_argument('-hns', '--host-names', metavar=('[hostname1]','[hostname2]','[hostname3]'), type=str, nargs=3, help='input Value to three host names', required=True)

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

def generateDecToHex():
    #10진수 20~100까지의 값을 16진수로 변환하여 리스트에 저장후 반환
    hex_list = []
    for num in range(20,101):
        hex_list.append(hex(num))
    return hex_list

def createSecretKey(host_names):
    
    # secret.xml 생성
    cmd = "cat > "+pluginpath+"/tools/vmconfig/ccvm/secret.xml <<EOF\n"
    cmd += "<secret ephemeral='no' private='no'>\n"
    cmd += "    <uuid>11111111-1111-1111-1111-111111111111</uuid>\n"
    cmd += "    <usage type='ceph'>\n"
    cmd += "        <name>client.admin secret</name>\n"
    cmd += "    </usage>\n"
    cmd += "</secret>\n"
    cmd += "EOF\n"
    os.system(cmd)

    # 이미 3대의 호스트 /usr/share/cockpit/ablestack/tools/vmconfig/secret/secret.xml 경로에 secret.xml이 존재 한다고 가정

    for host_name in host_names:    

        os.system("scp "+pluginpath+"/tools/vmconfig/ccvm/secret.xml root@"+host_name+":"+pluginpath+"/tools/vmconfig/ccvm/secret.xml")

        # virsh secret-list 11111111-1111-1111-1111-111111111111 값이 존재하는지 확인
        secret_val = subprocess.Popen("ssh {user}@{host} {cmd}".format(user='root', host=host_name, cmd='virsh secret-list | grep  11111111-1111-1111-1111-111111111111'), shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()

        # ceph_admin_key를 받아오기 위한 변수
        ceph_admin_key = subprocess.Popen("ssh {user}@{host} {cmd}".format(user='root', host=host_name, cmd='ceph auth get-key client.admin'), shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()
        ecret_set_value_cmd = 'virsh secret-set-value --secret 11111111-1111-1111-1111-111111111111 --base64 ' + ceph_admin_key[0].decode()

        if secret_val[0].decode() == '': # secret이 정의되어 있지 않으면 생성

            subprocess.Popen("ssh {user}@{host} {cmd}".format(user='root', host=host_name, cmd='virsh secret-define '+pluginpath+'/tools/vmconfig/ccvm/secret.xml'), shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()
            subprocess.Popen("ssh {user}@{host} {cmd}".format(user='root', host=host_name, cmd=ecret_set_value_cmd), shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()
        else: # secret이 정의되어 있으면 삭제후 재생성
            subprocess.Popen("ssh {user}@{host} {cmd}".format(user='root', host=host_name, cmd='virsh secret-undefine 11111111-1111-1111-1111-111111111111'), shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()
            subprocess.Popen("ssh {user}@{host} {cmd}".format(user='root', host=host_name, cmd='virsh secret-define '+pluginpath+'/tools/vmconfig/ccvm/secret.xml'), shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()
            subprocess.Popen("ssh {user}@{host} {cmd}".format(user='root', host=host_name, cmd=ecret_set_value_cmd), shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()

def createCcvmXml(args):
    try:
        # 템플릿 파일을 /usr/share/cockpit/ablestack/tools/vmconfig/ccvm 경로로 복사
        slot_hex_num = generateDecToHex()
        br_num = 0
        
        os.system("yes|cp -f "+pluginpath+"/tools/xml-template/ccvm-xml-template.xml "+pluginpath+"/tools/vmconfig/ccvm/ccvm-temp.xml")
        
        template_file = pluginpath+'/tools/vmconfig/ccvm/ccvm-temp.xml'

        with fileinput.FileInput(template_file, inplace=True, backup='.bak' ) as fi:

            for line in fi:

                if '<!--memory-->' in line:
                    line = line.replace('<!--memory-->', str(args.memory))
                elif '<!--cpu-->' in line:
                    line = line.replace('<!--cpu-->', str(args.cpu))
                elif '<!--ccvm_cloudinit-->' in line:
                    cci_txt = "    <disk type='file' device='cdrom'>\n"
                    cci_txt += "      <driver name='qemu' type='raw'/>\n"
                    cci_txt += "      <source file='"+pluginpath+"/tools/vmconfig/ccvm/ccvm-cloudinit.iso'/>\n"
                    cci_txt += "      <target dev='sda' bus='sata'/>\n"
                    cci_txt += "      <readonly/>\n"
                    cci_txt += "      <shareable/>\n"
                    cci_txt += "      <address type='drive' controller='0' bus='0' target='0' unit='0'/>\n"
                    cci_txt += "    </disk>"
                    
                    line = line.replace('<!--ccvm_cloudinit-->', cci_txt)
                elif '<!--management_network_bridge-->' in line:
                    mnb_txt = "    <interface type='bridge'>\n"
                    mnb_txt += "      <mac address='" + generateMacAddress() + "'/>\n"
                    mnb_txt += "      <source bridge='" + args.management_network_bridge + "'/>\n"
                    mnb_txt += "      <target dev='vnet" + str(br_num) + "'/>\n"
                    mnb_txt += "      <model type='virtio'/>\n"
                    mnb_txt += "      <alias name='net" + str(br_num) + "'/>\n"
                    mnb_txt += "      <address type='pci' domain='0x0000' bus='0x00' slot='" + slot_hex_num.pop(0) + "' function='0x0'/>\n"
                    mnb_txt += "    </interface>"

                    br_num += 1
                    line = line.replace('<!--management_network_bridge-->', mnb_txt)
                elif '<!--service_network_bridge-->' in line:
                    if args.service_network_bridge is not None:
                        snb_txt = "    <interface type='bridge'>\n"
                        snb_txt += "      <mac address='" + generateMacAddress() + "'/>\n"
                        snb_txt += "      <source bridge='" + args.service_network_bridge + "'/>\n"
                        snb_txt += "      <target dev='vnet" + str(br_num) + "'/>\n"
                        snb_txt += "      <model type='virtio'/>\n"
                        snb_txt += "      <alias name='net" + str(br_num) + "'/>\n"
                        snb_txt += "      <address type='pci' domain='0x0000' bus='0x00' slot='" + slot_hex_num.pop(0) + "' function='0x0'/>\n"
                        snb_txt += "    </interface>"

                        br_num += 1
                        line = line.replace('<!--service_network_bridge-->', snb_txt)
                    else:
                        # <!--service_network_bridge--> 주석제거
                        line = ''
                
                # 라인 수정
                sys.stdout.write(line)

        # 클러스터 구성한 호스트에 파일 복사
        for host_name in args.host_names:

            os.system("scp "+pluginpath+"/tools/vmconfig/ccvm/ccvm-temp.xml root@"+host_name+":"+pluginpath+"/tools/vmconfig/ccvm/ccvm.xml")

            # pcs 클러스터 할 호스트 전체의 폴더 권한 수정
            os.system("ssh root@"+host_name+" 'chmod 755 -R "+pluginpath+"/tools/vmconfig/ccvm'")

        #작업파일 지우기
        os.system("rm -f "+pluginpath+"/tools/vmconfig/ccvm/ccvm-temp.xml "+pluginpath+"/tools/vmconfig/ccvm/ccvm.xml.bak "+pluginpath+"/tools/vmconfig/ccvm/ccvm-temp.xml.bak")

        # 결과값 리턴
        return createReturn(code=200, val={})        

    except Exception as e:
        # 결과값 리턴
        print(e)
        return createReturn(code=500, val={})

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
    createSecretKey(args.host_names)

    # 실제 로직 부분 호출 및 결과 출력
    ret = createCcvmXml(args)
    print(ret)
