#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import json
import logging
import sys

from ablestack import *
import sh
import os
lsblk_cmd=sh.Command('/usr/bin/lsblk')
lspci_cmd=sh.Command('/usr/bin/lspci')

env=os.environ.copy()
env['LANG']="en_US.utf-8"
env['LANGUAGE']="en"
def createArgumentParser():
    """
    입력된 argument를 파싱하여 dictionary 처럼 사용하게 만들어 주는 parser를 생성하는 함수

    :return: argparse.ArgumentParser
    """
    # 참조: https://docs.python.org/ko/3/library/argparse.html
    # 프로그램 설명
    tmp_parser = argparse.ArgumentParser(description='NIC 목록을 출력하는 프로그',
                                         epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')

    # 인자 추가: https://docs.python.org/ko/3/library/argparse.html#the-add-argument-method

    # 선택지 추가(동작 선택)
    tmp_parser.add_argument('action', choices=['list', ], help="disk action")


    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐)
    tmp_parser.add_argument("-v", "--verbose", action='count', default=0,
                            help="increase output verbosity")

    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    tmp_parser.add_argument("-H", "--Human", action='store_const',
                            dest='H', const=True,
                            help="Human readable")

    # Version 추가
    tmp_parser.add_argument("-V", "--Version", action='version',
                            version="%(prog)s 1.0")
    return tmp_parser

def listPCIInterface(classify=None):
    list_output = lspci_cmd('-vmm', '-k').stdout.decode().splitlines()
    if classify == None:
        list_pci = []
        newpci = {}
        for output in list_output:
            try:
                (k, v) = output.split(':', 1)
                newpci[k] = v.strip()
            except ValueError as e:
                list_pci.append(newpci)
                newpci = {}
    else:
        list_pci = {}
        newpci = {}
        for output in list_output:
            try:
                (k, v) = output.split(':', 1)
                newpci[k] = v.strip()
            except ValueError as e:

                if newpci[classify] in list_pci:
                    list_pci[newpci[classify]].append(newpci)
                else:
                    list_pci[newpci[classify]] = [newpci]
                newpci = {}
    return list_pci

def listDiskInterface(H=False, classify=None):
    # output = nmcli_cmd('-c', 'no', '-f', 'TYPE,ACTIVE,DEVICE,STATE,SLAVE', 'con', 'show')
    # output = nmcli_cmd('-c', 'no', '-f', 'ALL', 'con', 'show')
    # outputs = output.splitlines()
    #for out in outputs:
    #    print(out.split())

    item = json.loads(lsblk_cmd(J=True, o="name,path,rota,model,size,state,group,type,tran,subsystems").stdout.decode())
    bd = item['blockdevices']
    newbd = []
    for dev in bd:
        if 'loop' not in dev['type']:
            newbd.append(dev)

    item['blockdevices']=newbd
    # print(output)


    list_pci=listPCIInterface()
    item['raidcontrollers'] = [
        # testdevice
        {
                "Slot": "00:00.0",
                "Class": "Raid",
                "Vendor": "Advanced Micro Devices, Inc. [AMD]",
                "Device": "Raid",
                "SVendor": "Advanced Micro Devices, Inc. [AMD]",
                "SDevice": "testRaid"
            }
    ]
    for pci in list_pci:
        if 'raid' in pci['Device'].lower():
            item['raidcontrollers'].append(pci)

    if H:
        return json.dumps(indent=4, obj=json.loads(createReturn(code=200, val=item)))
    return createReturn(code=200, val=item)


def diskAction(action, H):
    if action == 'list':
        return listDiskInterface(H=H)


if __name__ == '__main__':
    parser = createArgumentParser()
    args = parser.parse_args()
    verbose = (5 - args.verbose) * 10

    # 로깅을 위한 logger 생성, 모든 인자에 default 인자가 있음.
    logger = createLogger(verbosity=logging.CRITICAL, file_log_level=logging.ERROR, log_file='test.log')

    # 실제 로직 부분 호출 및 결과 출력
    ret = diskAction(args.action, H=args.H)
    print(ret)
