'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : 스토리지 센터 가상머신 xml 생성하는 프로그램
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

from ablestack import *

def createArgumentParser():
    '''
    입력된 argument를 파싱하여 dictionary 처럼 사용하게 만들어 주는 parser를 생성하는 함수
    :return: argparse.ArgumentParser
    '''
    # 참조: https://docs.python.org/ko/3/library/argparse.html
    # 프로그램 설명
    parser = argparse.ArgumentParser(description='스토리지 센터 가상머신 xml 생성하는 프로그램',
                                        epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™',
                                        usage='%(prog)s arguments')

    # 인자 추가: https://docs.python.org/ko/3/library/argparse.html#the-add-argument-method

    #--cpu 4 --memory 16                                 | 1택, 필수
    parser.add_argument('-c', '--cpu', metavar='[cpu cores]', type=int, help='input Value to cpu cores', required=True)
    parser.add_argument('-m', '--memory', metavar='[memory gb]', type=int, help='input Value to memory GB', required=True)
    
    #--disk-type { raid_passthrough or lun_passthrough }            | 1택, 선택, 필수   
    parser.add_argument('-dt', '--disk-type', metavar='[raid_passthrough or lun_passthrough]', choices=['raid_passthrough', 'lun_passthrough'], type=str, help='storage center VM disk type choice', required=True)
    
    #--raid-passthrough-list raid1 raid2                                    | 다중선택, 조건부 필수 (disk-type가 raid_passthrough 일 경우)
    parser.add_argument('-rpl', '--raid-passthrough-list', metavar='[raid pci]', type=str, nargs='+', help='input Value to raid pic list')
    
    #--lun-passthrough-list disk1 disk2                                 | 다중선택, 조건부 필수 (disk-type가 lun_passthrough 일 경우)
    parser.add_argument('-lpl', '--lun-passthrough-list', metavar='[lum]', type=str, nargs='+', help='input Value to LUN list')
    
    #--management-network-bridge br0                                        | 1택, 필수
    parser.add_argument('-mnb', '--management-network-bridge', metavar='[bridge name]', type=str, help='input Value to bridge name of the management network', required=True)
    
    #--storage-traffic-network-type { nic_passthrough or nic_passthrough_bonding or bridge }    | 1택, 선택, 필수
    parser.add_argument('-stnt', '--storage-traffic-network-type', metavar='[nic_passthrough or nic_passthrough_bonding or bridge]', choices=['nic_passthrough', 'nic_passthrough_bonding', 'bridge'], type=str, help='storage traffic network type choice', required=True)
    
    #--server-nic-passthrough nic1                                      | 1택, 조건부 필수 (storage-traffic-network-type가 nic_passthrough일 경우)
    parser.add_argument('-snp', '--server-nic-passthrough', metavar='[pic id]', type=str, help='input Value to network device PCI ID of the storage traffic server network')

    #--replication-nic-passthrough nic2                                 | 1택, 조건부 필수 (storage-traffic-network-type가 nic_passthrough일 경우)
    parser.add_argument('-rnp', '--replication-nic-passthrough', metavar='[pic id]', type=str, help='input Value to network device PCI ID of the storage traffic replication network')

    #--server-nic-passthrough-bonding-list nic1 nic2                    | 2택, 조건부 필수 (storage-traffic-network-type가 nic_passthrough_bonding일 경우)    
    parser.add_argument('-snpbl', '--server-nic-passthrough-bonding-list', metavar=('[pci1 id]','[pci2 id]'), type=str, nargs=2, help='input Value to two network device PCI IDs of the storage traffic server network')

    #--replication-nic-passthrough-bonding-list nic3 nic4           | 2택, 조건부 필수 (storage-traffic-network-type가 nic_passthrough_bonding일 경우)
    parser.add_argument('-rnpbl', '--replication-nic-passthrough-bonding-list', metavar=('[pci1 id]','[pci2 id]'), type=str, nargs=2, help='input Value to two network device PCI IDs of the storage traffic replication network')    

    #--storage-traffic-server-network-bridge br1                        | 1택, 조건부 필수 (storage-traffic-network-type가 bridge 일 경우)
    parser.add_argument('-snb', '--server-network-bridge', metavar='[bridge name]', type=str, help='input Value to bridge name of storage traffic server network')

    #--storage-traffic-replication-network-bridge br2               | 1택, 조건부 필수 (storage-traffic-network-type가 bridge 일 경우)
    parser.add_argument('-rnb', '--replication-network-bridge', metavar='[bridge name]', type=str, help='input Value to bridge name of storage traffic replication network')

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

def createScvmXml(args):
    try:
        alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',]
        slot_hex_num = generateDecToHex()
        host_dev_num = 0
        br_num = 0
        
        # 생성할 가상머신 xml 템플릿
        os.system("yes|cp -f "+pluginpath+"/tools/xml-template/scvm-xml-template.xml "+pluginpath+"/tools/vmconfig/scvm/scvm-temp.xml")
            
        template_file = pluginpath+'/tools/vmconfig/scvm/scvm-temp.xml'

        with fileinput.FileInput(template_file, inplace=True, backup='.bak' ) as fi:

            for line in fi:

                if '<!--memory-->' in line:
                    line = line.replace('<!--memory-->', str(args.memory))
                elif '<!--cpu-->' in line:
                    line = line.replace('<!--cpu-->', str(args.cpu))
                elif '<!--scvm_cloudinit-->' in line:
                    sci_txt = "    <disk type='file' device='cdrom'>\n"
                    sci_txt += "      <driver name='qemu' type='raw'/>\n"
                    sci_txt += "      <source file='"+pluginpath+"/tools/vmconfig/scvm/scvm-cloudinit.iso'/>\n"
                    sci_txt += "      <target dev='sdz' bus='sata'/>\n"
                    sci_txt += "      <readonly/>\n"
                    sci_txt += "      <shareable/>\n"
                    sci_txt += "      <address type='drive' controller='0' bus='0' target='0' unit='0'/>\n"
                    sci_txt += "    </disk>"

                    line = line.replace('<!--scvm_cloudinit-->', sci_txt)
                elif '<!--lun_passthrough-->' in line:
                    if 'lun_passthrough' == args.disk_type:
                        lpl_txt = ""
                        num = 0
                        for lun in args.lun_passthrough_list:
                            lpl_txt += "    <disk type='block' device='lun'>\n"
                            lpl_txt += "      <driver name='qemu' type='raw'/>\n"
                            lpl_txt += "      <source dev='" + lun + "'/>\n"
                            lpl_txt += "      <target dev='sd"+ alphabet[num] +"' bus='scsi'/>\n"
                            lpl_txt += "      <alias name='scsi0-0-0-"+ str(num) +"'/>\n"
                            lpl_txt += "      <address type='drive' controller='0' bus='0' target='0' unit='"+ str(num) +"'/>\n"
                            lpl_txt += "    </disk>\n"
                            num += 1

                        line = line.replace('<!--lun_passthrough-->', lpl_txt)
                    else:
                        # <!--lun_passthrough--> 주석제거
                        line = ''
                elif '<!--management_network_bridge-->' in line:
                    mnb_txt = "    <interface type='bridge'>\n"
                    mnb_txt += "      <mac address='" + generateMacAddress() + "'/>\n"
                    mnb_txt += "      <source bridge='" + args.management_network_bridge + "'/>\n"
                    mnb_txt += "      <target dev='vnet" + str(br_num) + "'/>\n"
                    mnb_txt += "      <model type='virtio'/>\n"
                    mnb_txt += "      <alias name='net" + str(br_num) + "'/>\n"
                    mnb_txt += "      <address type='pci' domain='0x0000' bus='0x00' slot='" + slot_hex_num.pop(0) + "' function='0x0'/>\n"
                    mnb_txt += "    </interface>\n"

                    br_num += 1
                    line = line.replace('<!--management_network_bridge-->', mnb_txt)
                elif '<!--server_network_bridge-->' in line:
                    if 'bridge' == args.storage_traffic_network_type:
                        snb_txt = "    <interface type='bridge'>\n"
                        snb_txt += "      <mac address='" + generateMacAddress() + "'/>\n"
                        snb_txt += "      <source bridge='" + args.server_network_bridge + "'/>\n"
                        snb_txt += "      <target dev='vnet" + str(br_num) + "'/>\n"
                        snb_txt += "      <model type='virtio'/>\n"
                        snb_txt += "      <alias name='net" + str(br_num) + "'/>\n"
                        snb_txt += "      <address type='pci' domain='0x0000' bus='0x00' slot='" + slot_hex_num.pop(0) + "' function='0x0'/>\n"
                        snb_txt += "    </interface>\n"
                        
                        br_num += 1
                        line = line.replace('<!--server_network_bridge-->', snb_txt)
                    else:
                        # <!--server_network_bridge--> 주석제거
                        line = ''

                elif '<!--replication_network_bridge-->' in line:
                    if 'bridge' == args.storage_traffic_network_type:
                        rnb_txt = "    <interface type='bridge'>\n"
                        rnb_txt += "      <mac address='" + generateMacAddress() + "'/>\n"
                        rnb_txt += "      <source bridge='" + args.replication_network_bridge + "'/>\n"
                        rnb_txt += "      <target dev='vnet" + str(br_num) + "'/>\n"
                        rnb_txt += "      <model type='virtio'/>\n"
                        rnb_txt += "      <alias name='net" + str(br_num) + "'/>\n"
                        rnb_txt += "      <address type='pci' domain='0x0000' bus='0x00' slot='" + slot_hex_num.pop(0) + "' function='0x0'/>\n"
                        rnb_txt += "    </interface>\n"
                        
                        br_num += 1
                        line = line.replace('<!--replication_network_bridge-->', rnb_txt)
                    else:    
                        # <!--replication_network_bridge--> 주석제거
                        line = ''
                
                elif '<!--raid_passthrough-->' in line:
                    if 'raid_passthrough' == args.disk_type:
                        
                        rpl_txt = ""
                        for rpl in args.raid_passthrough_list:
                            # rpl 변수의 값 pci 예시는 00:00.0 (bus:slot.function) 규칙으로 입력됨
                            rpl1 = rpl.split(':') # bus와 slot.function 으로 분리
                            rpl2 = rpl1[1].split('.') # slot과 function 으로 분리
                            
                            bus_num = rpl1[0]
                            slot_num = rpl2[0]
                            fun_num = rpl2[1]
                            
                            rpl_txt += "    <hostdev mode='subsystem' type='pci' managed='yes'>\n"
                            rpl_txt += "      <driver name='vfio'/>\n"
                            rpl_txt += "      <source>\n"
                            rpl_txt += "        <address domain='0x0000' bus='0x"+ bus_num +"' slot='0x"+ slot_num +"' function='0x"+ fun_num +"'/>\n"
                            rpl_txt += "      </source>\n"
                            rpl_txt += "      <alias name='hostdev"+ str(host_dev_num) +"'/>\n"
                            rpl_txt += "      <address type='pci' domain='0x0000' bus='0x00' slot='"+ slot_hex_num.pop(0) +"' function='0x0'/>\n"
                            rpl_txt += "    </hostdev>\n"
                            host_dev_num += 1
                        line = line.replace('<!--raid_passthrough-->', rpl_txt)
                    else:    
                        # <!--raid_passthrough--> 주석제거
                        line = ''

                elif '<!--nic_passthrough-->' in line:
                    # nic card가 1개 일 경우 ( bonding을 하지 않을 경우)
                    if 'nic_passthrough' == args.storage_traffic_network_type:
                        
                        # args.server_nic_passthrough 변수의 값 pci 예시는 0000:00:00.0 (domain:bus:slot.function) 규칙으로 입력됨
                        snp1 = args.server_nic_passthrough.split(":") # domain과 bus와 slot.function 으로 분리
                        snp2 = snp1[2].split('.') # slot과 function 으로 분리
                        
                        snp_domain_num = snp1[0]
                        snp_bus_num = snp1[1]
                        snp_slot_num = snp2[0]
                        snp_fun_num = snp2[1]

                        # args.replication_nic_passthrough 변수의 값 pci 예시는 0000:00:00.0 (domain:bus:slot.function) 규칙으로 입력됨
                        rnp1 = args.replication_nic_passthrough.split(":") # domain과 bus와 slot.function 으로 분리
                        rnp2 = rnp1[2].split('.') # slot과 function 으로 분리
                        
                        rnp_domain_num = rnp1[0]
                        rnp_bus_num = rnp1[1]
                        rnp_slot_num = rnp2[0]
                        rnp_fun_num = rnp2[1]

                        np_txt = "    <hostdev mode='subsystem' type='pci' managed='yes'>\n"
                        np_txt += "      <driver name='vfio'/>\n"
                        np_txt += "      <source>\n"
                        np_txt += "        <address domain='0x" + snp_domain_num + "' bus='0x"+ snp_bus_num +"' slot='0x"+ snp_slot_num +"' function='0x"+ snp_fun_num +"'/>\n"
                        np_txt += "      </source>\n"
                        np_txt += "      <alias name='hostdev"+ str(host_dev_num) +"'/>\n"
                        np_txt += "      <address type='pci' domain='0x0000' bus='0x00' slot='"+ slot_hex_num[0] +"' function='0x0'/>\n"
                        np_txt += "    </hostdev>\n"
                        host_dev_num += 1
                        slot_hex_num.pop(0)

                        np_txt += "    <hostdev mode='subsystem' type='pci' managed='yes'>\n"
                        np_txt += "      <driver name='vfio'/>\n"
                        np_txt += "      <source>\n"
                        np_txt += "        <address domain='0x" + rnp_domain_num + "' bus='0x"+ rnp_bus_num +"' slot='0x"+ rnp_slot_num +"' function='0x"+ rnp_fun_num +"'/>\n"
                        np_txt += "      </source>\n"
                        np_txt += "      <alias name='hostdev"+ str(host_dev_num) +"'/>\n"
                        np_txt += "      <address type='pci' domain='0x0000' bus='0x00' slot='"+ slot_hex_num[0] +"' function='0x0'/>\n"
                        np_txt += "    </hostdev>\n"
                        host_dev_num += 1
                        slot_hex_num.pop(0)

                        line = line.replace('<!--nic_passthrough-->', np_txt)

                    elif 'nic_passthrough_bonding' == args.storage_traffic_network_type:
                        npb_txt = ""
                        for i in range(0,2):
                            # args.server_nic_passthrough_bonding_list[i] 변수의 값 pci 예시는 0000:00:00.0 (domain:bus:slot.function) 규칙으로 입력됨
                            snp1 = args.server_nic_passthrough_bonding_list[i].split(":") # domain과 bus와 slot.function 으로 분리
                            snp2 = snp1[2].split('.') # slot과 function 으로 분리
                            
                            snp_domain_num = snp1[0]
                            snp_bus_num = snp1[1]
                            snp_slot_num = snp2[0]
                            snp_fun_num = snp2[1]

                            # args.replication_nic_passthrough_bonding_list[i] 변수의 값 pci 예시는 0000:00:00.0 (domain:bus:slot.function) 규칙으로 입력됨
                            rnp1 = args.replication_nic_passthrough_bonding_list[i].split(":") # domain과 bus와 slot.function 으로 분리
                            rnp2 = rnp1[2].split('.') # slot과 function 으로 분리
                            
                            rnp_domain_num = rnp1[0]
                            rnp_bus_num = rnp1[1]
                            rnp_slot_num = rnp2[0]
                            rnp_fun_num = rnp2[1]

                            npb_txt += "    <hostdev mode='subsystem' type='pci' managed='yes'>\n"
                            npb_txt += "      <driver name='vfio'/>\n"
                            npb_txt += "      <source>\n"
                            npb_txt += "        <address domain='0x" + snp_domain_num + "' bus='0x"+ snp_bus_num +"' slot='0x"+ snp_slot_num +"' function='0x"+ snp_fun_num +"'/>\n"
                            npb_txt += "      </source>\n"
                            npb_txt += "      <alias name='hostdev"+ str(host_dev_num) +"'/>\n"
                            npb_txt += "      <address type='pci' domain='0x0000' bus='0x00' slot='"+ slot_hex_num[0] +"' function='0x0'/>\n"
                            npb_txt += "    </hostdev>\n"
                            host_dev_num += 1
                            slot_hex_num.pop(0)
                            
                            npb_txt += "    <hostdev mode='subsystem' type='pci' managed='yes'>\n"
                            npb_txt += "      <driver name='vfio'/>\n"
                            npb_txt += "      <source>\n"
                            npb_txt += "        <address domain='0x" + rnp_domain_num + "' bus='0x"+ rnp_bus_num +"' slot='0x"+ rnp_slot_num +"' function='0x"+ rnp_fun_num +"'/>\n"
                            npb_txt += "      </source>\n"
                            npb_txt += "      <alias name='hostdev"+ str(host_dev_num) +"'/>\n"
                            npb_txt += "      <address type='pci' domain='0x0000' bus='0x00' slot='"+ slot_hex_num[0] +"' function='0x0'/>\n"
                            npb_txt += "    </hostdev>\n"
                            host_dev_num += 1
                            slot_hex_num.pop(0)

                        line = line.replace('<!--nic_passthrough-->', npb_txt)

                    else:    
                        # <!--nic_passthrough--> 주석제거
                        line = ''
                # 라인 수정
                sys.stdout.write(line)
            
        # 작업파일 삭제 및 이름 변경
        os.system("mv "+pluginpath+"/tools/vmconfig/scvm/scvm-temp.xml "+pluginpath+"/tools/vmconfig/scvm/scvm.xml")
        os.system("rm -f "+pluginpath+"/tools/vmconfig/scvm/scvm-temp.xml.bak")

        # 폴더 권한 수정
        os.system("chmod 755 -R "+pluginpath+"/tools/vmconfig/scvm")

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

    # 실제 로직 부분 호출 및 결과 출력
    ret = createScvmXml(args)
    print(ret)
