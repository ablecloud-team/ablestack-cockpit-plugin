#!/usr/bin/env python3

import argparse
import logging
import sys
import fileinput
import random

from ablestack import *

def createArgumentParser():
    '''
    입력된 argument를 파싱하여 dictionary 처럼 사용하게 만들어 주는 parser를 생성하는 함수
    :return: argparse.ArgumentParser
    '''
    # 참조: https://docs.python.org/ko/3/library/argparse.html
    # 프로그램 설명
    parser = argparse.ArgumentParser(description='클라우드 센터 가상머신 xml 생성하는 프로그램',
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

def createCcvmXml(args):
    try:
        slot_hex_num = generateDecToHex()
        br_num = 0
        
        # 생성할 가상머신 xml 템플릿
        template_file = '/usr/share/cockpit/cockpit-plugin-ablestack/tools/xml-template/ccvm.xml'

        with fileinput.FileInput(template_file, inplace=True, backup='.bak' ) as fi:

            for line in fi:

                if '<!--memory-->' in line:
                    line = line.replace('<!--memory-->', str(args.memory))
                elif '<!--cpu-->' in line:
                    line = line.replace('<!--cpu-->', str(args.cpu))
                elif '<!--management_network_bridge-->' in line:
                    mnb_txt = "\t\t<interface type='bridge'>\n"
                    mnb_txt += "\t\t\t<mac address='" + generateMacAddress() + "'/>\n"
                    mnb_txt += "\t\t\t<source bridge='" + args.management_network_bridge + "'/>\n"
                    mnb_txt += "\t\t\t<target dev='vnet" + str(br_num) + "'/>\n"
                    mnb_txt += "\t\t\t<model type='virtio'/>\n"
                    mnb_txt += "\t\t\t<alias name='net" + str(br_num) + "'/>\n"
                    mnb_txt += "\t\t\t<address type='pci' domain='0x0000' bus='0x00' slot='" + slot_hex_num.pop(0) + "' function='0x0'/>\n"
                    mnb_txt += "\t\t</interface>\n"

                    br_num += 1
                    line = line.replace('<!--management_network_bridge-->', mnb_txt)
                elif '<!--service_network_bridge-->' in line:
                    snb_txt = "\t\t<interface type='bridge'>\n"
                    snb_txt += "\t\t\t<mac address='" + generateMacAddress() + "'/>\n"
                    snb_txt += "\t\t\t<source bridge='" + args.service_network_bridge + "'/>\n"
                    snb_txt += "\t\t\t<target dev='vnet" + str(br_num) + "'/>\n"
                    snb_txt += "\t\t\t<model type='virtio'/>\n"
                    snb_txt += "\t\t\t<alias name='net" + str(br_num) + "'/>\n"
                    snb_txt += "\t\t\t<address type='pci' domain='0x0000' bus='0x00' slot='" + slot_hex_num.pop(0) + "' function='0x0'/>\n"
                    snb_txt += "\t\t</interface>\n"

                    br_num += 1
                    line = line.replace('<!--service_network_bridge-->', snb_txt)
                
                # 라인 수정
                sys.stdout.write(line)

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
    ret = createCcvmXml(args)
    print(ret)