# Copyright (c) 2021 ABLECLOUD Co. Ltd

# 스토리지 클러스터상태 유지보수 상태 변경을 위한 파일입니다.count
# 최초 작성일 : 2021. 03. 19

import sys
import argparse
import json
import logging
import os
import subprocess
from subprocess import check_output
from subprocess import run
from subprocess import call
from ablestack import *

env=os.environ.copy()
env['LANG']="en_US.utf-8"
env['LANGUAGE']="en"

'''
함수명 : parseArgs
이 함수는 python library argparse를 시용하여 함수를 실행될 때 필요한 파라미터를 입력받고 파싱하는 역할을 수행합니다.
예를들어 action을 요청하면 해당 action일 때  요구되는 파라미터를 입력받고 해당 코드를 수행합니다.
'''
def parseArgs():
    parser = argparse.ArgumentParser(description='Storage Cluster maintenance Mode Setting',epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')    
    '''maintenance Mode action값 확인'''
    parser.add_argument('action', choices=['set_noout', 'unset_noout'], help="Maintenance action")    
    '''output 민감도 추가(v갯수에 따라 output및 log가 많아짐)'''
    parser.add_argument("-v", "--verbose", action='count', default=0, help="increase output verbosity")
    '''flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)'''
    parser.add_argument("-H", "--Human", action='store_const', dest='H', const=True, help="Human readable")
    '''Version 추가'''
    parser.add_argument("-V", "--Version", action='version', version="%(prog)s 1.0")    
    return parser.parse_args()

'''
함수명 : onMaintenance
주요 기능 : 스토리지 클러스트 유지보수모드 세팅
'''
def onMaintenance():        
    try:
        '''유지보수 모드 설정 noout, nobackfill, norecover 세팅'''
        rc = call(['ceph osd set noout'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        if rc == 0:
            rc = call(['ceph osd set nobackfill'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
            if rc == 0:
                rc = call(['ceph osd set norecover'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT) 
                if rc == 0:
                    ret = createReturn(code=200, val='success', retname='Maintenance Mode On')
                else :
                    ret = createReturn(code=500, val='set norecover ERROR', retname='Maintenance Mode On')   
            else :
                ret = createReturn(code=500, val='set nobackfill ERROR', retname='Maintenance Mode On')      
        else :
            ret = createReturn(code=500, val='set noout ERROR', retname='Maintenance Mode On')
           
    except Exception as e:
        ret = createReturn(code=500, val='ERROR', retname='Maintenance Mode On')        
    return print(json.dumps(json.loads(ret), indent=4))

'''
함수명 : offMaintenance
주요 기능 : 스토리지 클러스트 유지보수모드 해제
'''
def offMaintenance():          
    try:
        '''유지보수 모드 설정 noout, nobackfill, norecover 해제'''
        rc = call(['ceph osd unset noout'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        if rc == 0:
            rc = call(['ceph osd unset nobackfill'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
            if rc == 0:
                rc = call(['ceph osd unset norecover'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT) 
                if rc == 0:
                    ret = createReturn(code=200, val='success', retname='Maintenance Mode Off')
                else :
                    ret = createReturn(code=500, val='unset norecover ERROR', retname='Maintenance Mode Off')   
            else :
                ret = createReturn(code=500, val='unset nobackfill ERROR', retname='Maintenance Mode Off')      
        else :
            ret = createReturn(code=500, val='unset noout ERROR', retname='Maintenance Mode Off')
        
        ret = createReturn(code=200, val='success', retname='Maintenance Mode Off')
    except Exception as e:
        ret = createReturn(code=500, val='ERROR', retname='Maintenance Mode Off')        
    return print(json.dumps(json.loads(ret), indent=4))

if __name__ == '__main__':
    args = parseArgs()    
    verbose = (5 - args.verbose) * 10

    if args.action == 'set_noout':
        '''유지보수 모드 설정'''
        onMaintenance()        
    elif args.action == 'unset_noout':
        '''유지보수 모드 해제'''
        offMaintenance()