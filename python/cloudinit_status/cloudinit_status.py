#!/usr/bin/env python3
# -*- coding: utf-8 -*-
'''
Copyright (c) 2021 ABLECLOUD Co. Ltd.

SCVM, CCVM의 cloud-init 실행 및 완료 여부 확인하는 스크립트

최초작성일 : 2021-03-15
'''
import os
import argparse
import subprocess
from subprocess import call
from ablestack import *
from sh import ssh

from ablestack import *

env = os.environ.copy()
env['LANG'] = "en_US.utf-8"
env['LANGUAGE'] = "en"

# 함수명 : parseArgs
# 주요기능 : 입련된 argument를 파싱하여 dictionary처럼 사용하게 만들어 주는 parser 생성
def parseArgs():

    parser = argparse.ArgumentParser(description='Cloud-Init status check',
                                     epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')
    parser.add_argument('action', choices=['status','ping'], help='choose one of the actions')
    parser.add_argument('--target', metavar='name', type=str, help='Target hostname to cloud-init status')

    return parser.parse_args()


def cloudinitStatus():
    try:
        ret_val = ssh('-o', 'StrictHostKeyChecking=no', args.target, '/usr/bin/cloud-init', 'status').stdout.decode().splitlines()
        ret = createReturn(code=200, val=ret_val)
    except Exception as e:
        ret = createReturn(code=500, val='ERROR')
        print ('EXCEPTION : ',e)

    return ret

def guestvmPing():
    try:
        ping_cmd = 'ping -c 1 ' + args.target
        rc = call([ping_cmd], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        if (rc == 0):
            ret_val = {}
            ret_val['host'] = args.target
            ret_val['ping'] = 'OK'
            ret = createReturn(code=200, val=ret_val)

    except Exception as e:
        ret = createReturn(code=500, val='ERROR')
        print ('EXCEPTION : ',e)

    return ret

if __name__ == '__main__':
    # parser 생성
    args = parseArgs()
    if (args.action) == 'status':
        ret = cloudinitStatus()
        print(ret)
    if (args.action) == 'ping':
        ret = guestvmPing()
        print(ret)