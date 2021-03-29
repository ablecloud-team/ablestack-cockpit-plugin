# Copyright (c) 2021 ABLECLOUD Co. Ltd

# 스토리지 가상머신 상태 상태 변경을 위한 파일입니다.
# 최초 작성일 : 2021. 03. 19

import sys
import argparse
import json
import logging
import os
import bs4

import subprocess
from subprocess import check_output
from subprocess import call
from ablestack import *

env=os.environ.copy()
env['LANG']="en_US.utf-8"
env['LANGUAGE']="en"

'''
함수명 : parseArgs
이 함수는 python library argparse를 시용하여 함수를 실행될 때 필요한 파라미터를 입력받고 파싱하는 역할을 수행합니다.
예를들어 action을 요청하면 해당 action일 때 요구되는 파라미터를 입력받고 해당 코드를 수행합니다.
'''
def parseArgs():
    parser = argparse.ArgumentParser(description='Storage Center VM action ',
                                     epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')
    
    parser.add_argument('action', choices=['start', 'stop', 'delete', 'resource'], help="Storage Center VM action")

    parser.add_argument('-c', '--cpu', metavar='[cpu cores]', type=int, help='input Value to cpu cores')
    parser.add_argument('-m', '--memory', metavar='[memory gb]', type=int, help='input Value to memory GB')
    
    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐)
    parser.add_argument("-v", "--verbose", action='count', default=0, help="increase output verbosity")

    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    parser.add_argument("-H", "--Human", action='store_const', dest='H', const=True, help="Human readable")

    # Version 추가
    parser.add_argument("-V", "--Version", action='version', version="%(prog)s 1.0")
    
    return parser.parse_args()

# 함수명 : startStorageVM
# 주요 기능 : 스토리지 VM 시작 
def startStorageVM():

    try:
        rc = call(['virsh start scvm'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)  
        
        if rc == 0: # ok
            retVal = True
            retCode = 200
        else : # not ok
            retVal = False
            retCode = 500

        ret = createReturn(code=retCode, val=retVal, retname='Storage Center VM Start')

    except Exception as e:
        ret = createReturn(code=500, val='virsh start error', retname='Storage Center VM Start Error')
        #print ('EXCEPTION : ',e)
                
    return print(json.dumps(json.loads(ret), indent=4))

# 함수명 : stopStorageVM
# 주요 기능 : 스토리지 VM 정지
def stopStorageVM():  
        
    try:
        rc = call(['virsh shutdown scvm'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)  
        
        if rc == 0: # ok
            retVal = True
            retCode = 200
        else : # not ok
            retVal = False
            retCode = 500
         
        
        ret = createReturn(code=retCode, val=retVal, retname='Storage Center VM Stop')

    except Exception as e:
        ret = createReturn(code=retCode, val='virsh shutdown error', retname='Storage Center VM Stop Error')
        #print ('EXCEPTION : ',e)
    
    return print(json.dumps(json.loads(ret), indent=4))
    
# 함수명 : deleteStorageVM
# 주요 기능 : 스토리지 VM 삭제
def deleteStorageVM():   

    try:

        rc = call(['virsh destroy scvm'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)  
        if rc == 0: # 
            rc = call(['virsh undefine scvm'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)          
            if rc == 0: # ok
                retVal = True
                retCode = 200
            else : # not ok
                retVal = False
                retCode = 500
        else : # not ok
            retVal = False
            retCode = 500
        
        ret = createReturn(code=retCode, val=retVal, retname='Storage Center VM Delete')

    except Exception as e:
        ret = createReturn(code=500, val='virsh destroy, undefine error', retname='Storage Center VM Delete Error')
        #print ('EXCEPTION : ',e)
    
    return print(json.dumps(json.loads(ret), indent=4))


# 함수명 : updateStorageVM
# 주요 기능 : 스토리지 VM 자원변경
def updateStorageVM(cpu, memory):

    memory = memory * 1024 #MiB 형태로 변경    
    
    try:

        # #값이 없을때 
        if cpu > 0 :
            rc = call(['virt-xml scvm --edit --vcpus maxvcpus=' + str(cpu)], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)          
            
            if rc == 0: # ok
                retVal = True
                retCode = 200
            else : # not ok
                retVal = False
                retCode = 500            
            
        if memory > 0 :
            rc = call(['virt-xml scvm --edit --memory ' + str(memory) + ',maxmemory=' + str(memory)], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)  
            
            if rc == 0: # ok                
                retVal = True
                retCode = 200                
            else : # not ok
                retVal = False
                retCode = 500
                 
        ret = createReturn(code=retCode, val=retVal, retname='Storage Center VM UPDATE')

    except Exception as e:
        ret = createReturn(code=500, val='virsh destroy, undefine error', retname='Storage Center VM UPDATE Error')
        #print ('EXCEPTION : ',e)
    
    return print(json.dumps(json.loads(ret), indent=4))


if __name__ == '__main__':

    # parser 생성
    args = parseArgs()
    ##print(args);

    verbose = (5 - args.verbose) * 10

    # 로깅을 위한 logger 생성, 모든 인자에 default 인자가 있음.
    #logger = createLogger(verbosity=logging.CRITICAL, file_log_level=logging.ERROR, log_file='test.log')

    if args.action == 'start':        
        ret = startStorageVM();    
    
    elif args.action == 'stop':
        ret = stopStorageVM();    
    
    elif args.action == 'delete':
        ret = deleteStorageVM();    
    
    elif args.action == 'resource':
        ret = updateStorageVM(args.cpu, args.memory); 

    #print(ret)
    

