#!/usr/bin/env python3
# -*- coding: utf-8 -*-
'''
Copyright (c) 2021 ABLECLOUD Co. Ltd.

libvirt domain 용으로 작성된 xml 파일을 수정하는 스크립트입니다.
인자로 cpu, memory, xml 파일명을 받아 수정합니다.

최초작성일 : 2021-03-22
'''

import argparse
import json
import logging
import sys

from ablestack import *
import sh
import os
import bs4

env=os.environ.copy()
env['LANG']="en_US.utf-8"
env['LANGUAGE']="en"

'''
입력된 argument를 파싱하여 dictionary 처럼 사용하게 만들어 주는 parser를 생성하는 함수
Parameter: None
참조: https://docs.python.org/ko/3/library/argparse.html
:return: argparse.ArgumentParser
'''
def createArgumentParser():
    # 프로그램 설명
    tmp_parser = argparse.ArgumentParser(description='VM의 CPU와 Memory를 변경하는 프로그램',
                                         epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')

    # 인자 추가: https://docs.python.org/ko/3/library/argparse.html#the-add-argument-method

    # 선택지 추가(동작 선택)
    tmp_parser.add_argument('action', choices=['edit', ], help="action")
    tmp_parser.add_argument('--cpu', help="Number of vCPU")
    tmp_parser.add_argument('--memory', help="Size of Memory")
    tmp_parser.add_argument('--xml', help="xml file path")
    

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


'''
cpu, memory, xml파일을 입력받아 수정하는 함수
Parameter: cpu: int cpu코어수
Parameter: memory: int memory용량(GiB)
Parameter: xml: str xml파일의 경로
:return: json
'''
def editVMOffering(cpu, memory, xml='/usr/share/cockpit/ablestack/tools/vmconfig/ccvm/ccvm.xml', H=False):
    soup = ""
    with open(xml, 'rt') as fp:
        soup = bs4.BeautifulSoup(fp, features='xml')
    cpuitem = soup.select_one('vcpu')
    memitem = soup.select_one('memory')
    cmemitem = soup.select_one('currentMemory')


    cpuitem.string.replace_with(cpu)
    memitem.string.replace_with(memory)
    memitem['unit'] = 'GiB'
    cmemitem.string.replace_with(memory)
    cmemitem['unit'] = 'GiB'
    logger.debug(soup.prettify())
    with open(xml, "w", encoding='utf-8') as file:
        file.write(soup.decode())
    item = {
        'cpu': cpu,
        'memory': memory,
        'xml': xml
    }
    if H:
        return json.dumps(indent=4, obj=json.loads(createReturn(code=200, val=item)))
    return createReturn(code=200, val=item)


'''
cpu, memory, xml파일을 입력받아 수정하는 스크립트입니다.
example: python3 virshedit.py --cpu 4 --memory 16 --xml /opt/ablestack/scvm.xml
Parameter: cpu: int cpu코어수
Parameter: memory: int memory용량(GiB)
Parameter: xml: str xml파일의 경로
:return: json
'''
if __name__ == '__main__':
    parser = createArgumentParser()
    args = parser.parse_args()
    verbose = (5 - args.verbose) * 10

    # 로깅을 위한 logger 생성, 모든 인자에 default 인자가 있음.
    fverbose = verbose-40
    if fverbose < 10: fverbose=10
    logger = createLogger(verbosity=verbose, file_log_level=fverbose)

    # 실제 로직 부분 호출 및 결과 출력
    if args.action == 'edit':
        print(editVMOffering(cpu=args.cpu, memory=args.memory, xml=args.xml, H=args.H))
