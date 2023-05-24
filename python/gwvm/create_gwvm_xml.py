'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : 장애조치 클러스터를 구성할 1,2,3 호스트에 게이트웨이 가상머신 xml을 생성하는 프로그램
최초 작성일 : 2023. 05. 15
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
    
    #--storage-network-bridge br1                                           | 1택, 조건부 필수
    parser.add_argument('-snb', '--storage-network-bridge', metavar='[bridge name]', type=str, help='input Value to bridge name of the storage network')

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

    for host_name in host_names:
        ret_num = os.system("ssh root@"+host_name+" 'sh "+pluginpath+"/shell/host/virsh_secret_key.sh'")
        # 쉘 스크립트 실행 실패
        if ret_num != 0 :
            return createReturn(code=500, val=host_name+" : pcs 클러스터 secret.xm 설정 실패 ")
    
    return createReturn(code=200, val="pcs 클러스터 secret.xm 설정 성공")

def createGwvmXml(args):
    try:
        # 템플릿 파일을 /usr/share/cockpit/ablestack/tools/vmconfig/gwvm 경로로 복사
        slot_hex_num = generateDecToHex()
        br_num = 0

        os.system("mkdir "+pluginpath+"/tools/vmconfig/gwvm")
        os.system("yes|cp -f "+pluginpath+"/tools/xml-template/gwvm-xml-template.xml "+pluginpath+"/tools/vmconfig/gwvm/gwvm-temp.xml")
        
        template_file = pluginpath+'/tools/vmconfig/gwvm/gwvm-temp.xml'

        with fileinput.FileInput(template_file, inplace=True, backup='.bak' ) as fi:

            for line in fi:

                if '<!--memory-->' in line:
                    line = line.replace('<!--memory-->', str(args.memory))
                elif '<!--cpu-->' in line:
                    line = line.replace('<!--cpu-->', str(args.cpu))
                elif '<!--gwvm_cloudinit-->' in line:
                    cci_txt = "    <disk type='file' device='cdrom'>\n"
                    cci_txt += "      <driver name='qemu' type='raw'/>\n"
                    cci_txt += "      <source file='"+pluginpath+"/tools/vmconfig/gwvm/gwvm-cloudinit.iso'/>\n"
                    cci_txt += "      <target dev='sdz' bus='sata'/>\n"
                    cci_txt += "      <readonly/>\n"
                    cci_txt += "      <shareable/>\n"
                    cci_txt += "      <address type='drive' controller='0' bus='0' target='0' unit='0'/>\n"
                    cci_txt += "    </disk>"
                    
                    line = line.replace('<!--gwvm_cloudinit-->', cci_txt)
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
                elif '<!--storage_network_bridge-->' in line:
                    if args.storage_network_bridge is not None:
                        snb_txt = "    <interface type='bridge'>\n"
                        snb_txt += "      <mac address='" + generateMacAddress() + "'/>\n"
                        snb_txt += "      <source bridge='" + args.storage_network_bridge + "'/>\n"
                        snb_txt += "      <target dev='vnet" + str(br_num) + "'/>\n"
                        snb_txt += "      <model type='virtio'/>\n"
                        snb_txt += "      <alias name='net" + str(br_num) + "'/>\n"
                        snb_txt += "      <address type='pci' domain='0x0000' bus='0x00' slot='" + slot_hex_num.pop(0) + "' function='0x0'/>\n"
                        snb_txt += "    </interface>"

                        br_num += 1
                        line = line.replace('<!--storage_network_bridge-->', snb_txt)
                    else:
                        # <!--storage_network_bridge--> 주석제거
                        line = ''
                
                # 라인 수정
                sys.stdout.write(line)

        for host_name in args.host_names:
            ret_num = 0
            # pcs 클러스터 호스트에 gwvm.xml 복사 실패
            for i in [1,2,3]:
                ret_num = os.system("scp -q "+pluginpath+"/tools/vmconfig/gwvm/gwvm-temp.xml root@"+host_name+":"+pluginpath+"/tools/vmconfig/gwvm/gwvm.xml")
                if ret_num == 0:
                    break
                    
            if ret_num != 0:
                return createReturn(code=500, val="pcs 클러스터 호스트에 gwvm.xml 복사 실패")

            # pcs 클러스터 할 호스트 전체의 폴더 권한 수정
            for i in [1,2,3]:
                ret_num = os.system("ssh root@"+host_name+" 'chmod 755 -R "+pluginpath+"/tools/vmconfig/gwvm'")
                if ret_num == 0:
                    break

            if ret_num != 0:
                return createReturn(code=500, val="pcs 클러스터 할 호스트 전체의 폴더 권한 수정 실패")

            # pcs 클러스터 할 호스트 설정 백업전 폴더 생성
            for i in [1,2,3]:
                ret_num = os.system("ssh root@"+host_name+" 'mkdir -p /usr/share/ablestack/vmconfig'")
                if ret_num == 0:
                    break

            if ret_num != 0:
                return createReturn(code=500, val="pcs 클러스터 할 호스트 설정 백업전 폴더 생성 실패")


            # pcs 클러스터 할 호스트 설정 복제
            for i in [1,2,3]:
                ret_num = os.system("ssh root@"+host_name+" 'cp -rf "+pluginpath+"/tools/vmconfig/gwvm /usr/share/ablestack/vmconfig/'")
                if ret_num == 0:
                    break

            if ret_num != 0:
                return createReturn(code=500, val="pcs 클러스터 할 호스트 설정 복제 실패")

        #작업파일 지우기
        os.system("rm -f "+pluginpath+"/tools/vmconfig/gwvm/gwvm-temp.xml "+pluginpath+"/tools/vmconfig/gwvm/gwvm.xml.bak "+pluginpath+"/tools/vmconfig/gwvm/gwvm-temp.xml.bak")

        # 결과값 리턴
        return createReturn(code=200, val="클라우드센터 가상머신 xml 생성 성공")        

    except Exception as e:
        # 결과값 리턴
        # print(e)
        return createReturn(code=500, val="클라우드센터 가상머신 xml 생성 에러 : " + e)

# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    # parser 생성
    parser = createArgumentParser()
    # input 파싱
    args = parser.parse_args()

    verbose = (5 - args.verbose) * 10

    # 로깅을 위한 logger 생성, 모든 인자에 default 인자가 있음.
    logger = createLogger(verbosity=logging.CRITICAL, file_log_level=logging.ERROR, log_file='test.log')

    ret = createGwvmXml(args)
    print(ret)

    # 실제 로직 부분 호출 및 결과 출력
    
    
