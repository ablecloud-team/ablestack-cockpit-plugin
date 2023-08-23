'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
이 파일은 스토리지 및 클라우드 센터 관련 연결 주소를 생성하는 기능을 수행합니다.
최초 작성일 : 2021. 03. 30
'''
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import argparse
import json
import logging
import sh

from subprocess import check_output
from ablestack import *

# 함수명 : parseArgs
# 주요기능 : 입련된 argument를 파싱하여 dictionary처럼 사용하게 만들어 주는 parser 생성
def parseArgs():

    parser = argparse.ArgumentParser(description='Card Cloud Cluster Status',
                                     epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')
    
    parser.add_argument('action', choices=['pcsDetail','pcsStart','pcsStop','pcsCleanup','pcsMigration'])
    parser.add_argument('--target', metavar='name', type=str, help='Target hostname to migrate Cloud Center VM')
    
    return parser.parse_args()

# 함수명 : pcsDetail
# 주요기능 : pcs 클러스터의 상세정보를 조회
def pcsDetail():
    try:
        ret = sh.python3(pluginpath + "/python/pcs/main.py","status", "--resource", "cloudcenter_res")
    except Exception as e:
        ret = createReturn(code=500, val='ERROR')
        print ('EXCEPTION : ',e)
    
    return ret

def pcsStart():
    try:
        ret = sh.python3(pluginpath + "/python/pcs/main.py","enable", "--resource", "cloudcenter_res")
        while True:
            retPcsStatusJson = json.loads(sh.python3(pluginpath + "/python/pcs/main.py","status", "--resource", "cloudcenter_res"))
            if retPcsStatusJson['val']['role'] == 'Started':
                break
    except Exception as e:
        ret = createReturn(code=500, val='ERROR')
        print ('EXCEPTION : ',e)
    
    return ret    

# 함수명 : pcsStop
# 주요기능 : pcs 클러스터를 정지
def pcsStop():
    try:
        ret = sh.python3(pluginpath + "/python/pcs/main.py","disable", "--resource", "cloudcenter_res")
        while True:
            retPcsStatusJson = json.loads(sh.python3(pluginpath + "/python/pcs/main.py","status", "--resource", "cloudcenter_res"))
            if retPcsStatusJson['val']['role'] == 'Stopped':
                break
    except Exception as e:
        ret = createReturn(code=500, val='ERROR')
        print ('EXCEPTION : ',e)
    
    return ret

# 함수명 : pcsCleanup
# 주요기능 : pcs 클러스터를 클린업
def pcsCleanup():
    try:
        ret = sh.python3(pluginpath + "/python/pcs/main.py","cleanup", "--resource", "cloudcenter_res")
    except Exception as e:
        ret = createReturn(code=500, val='ERROR')
        print ('EXCEPTION : ',e)
    
    return ret

# 함수명 : pcsCleanup
# 주요기능 : pcs 클러스터에서 운영중인 CloudCenter VM을 입력반은 호스트로 마이그레이션
def pcsMigration():
    try:
        ret = sh.python3(pluginpath + "/python/pcs/main.py","move", "--resource", "cloudcenter_res", "--target",  args.target)
        while True:
            retPcsStatusJson = json.loads(sh.python3(pluginpath + "/python/pcs/main.py","status", "--resource", "cloudcenter_res"))
            if retPcsStatusJson['val']['role'] == 'Started':
                break
        sh.python3(pluginpath + "/python/pcs/main.py","cleanup", "--resource", "cloudcenter_res")
    except Exception as e:
        ret = createReturn(code=500, val='ERROR')
        print ('EXCEPTION : ',e)
    
    return ret 



if __name__ == '__main__':

    # parser 생성
    args = parseArgs()
    # 파라미터에 따른 함수 호출
    if args.action == 'pcsDetail':
        ret = pcsDetail()
        print(ret)
    elif args.action == 'pcsStart':
        ret = pcsStart()
        print(ret)
    elif args.action == 'pcsStop':
        ret = pcsStop()
        print(ret)
    elif args.action == 'pcsCleanup':
        ret = pcsCleanup()
        print(ret)
    elif args.action == 'pcsMigration':
        ret = pcsMigration()
        print(ret)