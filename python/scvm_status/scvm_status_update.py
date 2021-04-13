# Copyright (c) 2021 ABLECLOUD Co. Ltd

# 스토리지센터 가상머신 상태 변경을 위한 파일입니다.
# 최초 작성일 : 2021. 03. 19
import sys
import argparse
import json
import logging
import os
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
    parser = argparse.ArgumentParser(description='Storage Center VM action ', epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')    
    parser.add_argument('action', choices=['start', 'stop', 'delete', 'resource'], help="Storage Center VM action")    
    ''' cpu parameter 값 '''
    parser.add_argument('-c', '--cpu', metavar='[cpu cores]', type=int, help='input Value to cpu cores')
    ''' memory parameter 값 '''
    parser.add_argument('-m', '--memory', metavar='[memory gb]', type=int, help='input Value to memory GB')
    '''output 민감도 추가(v갯수에 따라 output및 log가 많아짐)'''
    parser.add_argument("-v", "--verbose", action='count', default=0, help="increase output verbosity")
    '''flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)'''
    parser.add_argument("-H", "--Human", action='store_const', dest='H', const=True, help="Human readable")
    '''Version 추가'''
    parser.add_argument("-V", "--Version", action='version', version="%(prog)s 1.0")
    return parser.parse_args()

'''
함수명 : startStorageVM
주요 기능 : 스토리지 VM 시작 
'''
def startStorageVM():
    try:
        '''스토리지 가상머신 시작 명령 후 리턴값 0은 정상, 아닐경우 비정상'''
        rc = call(['virsh start scvm'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)        
        if rc == 0:                
            while True:
                output = check_output(["virsh domstate scvm"], universal_newlines=True, shell=True, env=env)
                if output.strip() == "running" :
                    break;                
            retVal = True
            retCode = 200                
        else :
            retVal = False
            retCode = 500
        ret = createReturn(code=retCode, val=retVal, retname='Storage Center VM Start')
    except Exception as e:
        ret = createReturn(code=500, val='virsh start error', retname='Storage Center VM Start Error')
    return print(json.dumps(json.loads(ret), indent=4))

'''
함수명 : stopStorageVM
주요 기능 : 스토리지 VM 정지
'''
def stopStorageVM():        
    try:
        '''스토리지 가상머신 정지 명령 후 리턴값 0은 정상, 아닐경우 비정상'''
        rc = call(['virsh shutdown scvm'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)          
        if rc == 0:
            while True:   
                output = check_output(["virsh domstate scvm"], universal_newlines=True, shell=True, env=env)
                if output.strip() == "shut off" :
                    break;                
            retVal = True
            retCode = 200
        else :
            retVal = False
            retCode = 500
        ret = createReturn(code=retCode, val=retVal, retname='Storage Center VM Stop')
    except Exception as e:
        ret = createReturn(code=retCode, val='virsh shutdown error', retname='Storage Center VM Stop Error')
    return print(json.dumps(json.loads(ret), indent=4))
    
'''
함수명 : deleteStorageVM
주요 기능 : 스토리지 VM 삭제
'''
def deleteStorageVM():
    try:
        '''스토리지 가상머신 강제 정지 명령 후 리턴값 0은 정상, 아닐경우 이미 정지 상태거나 없는경우'''
        call(['virsh destroy scvm'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        '''스토리지 가상머신 삭제 명령 후 리턴값 0은 정상, 아닐경우 비정상'''
        call(['virsh undefine scvm'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        while True:   
            rc = call(['virsh domstate scvm'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
            if rc > 0 :
                break;

        rc = call(['ls /etc/ceph/'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        if rc == 0:
            call(["rm -rf /etc/ceph/*"], universal_newlines=True, shell=True, env=env)            
            retVal = True
            retCode = 200
        else :
            retVal = False
            retCode = 500

        ret = createReturn(code=retCode, val=retVal, retname='Storage Center VM Delete')
    except Exception as e:
        ret = createReturn(code=500, val='virsh destroy, undefine error', retname='Storage Center VM Delete Error')    
    return print(json.dumps(json.loads(ret), indent=4))

'''
함수명 : updateStorageVM
주요 기능 : 스토리지 VM 자원변경
'''
def updateStorageVM(cpu, memory):
    '''MiB 형태로 변경'''
    memory = memory * 1024     
    try:
        ''' cpu 파라미터 값이 있을경우 ''' 
        if cpu > 0 :
            ''' domain xml 의 cpu값 수정 명령 후 리턴값 0이면 정상, 아닐경우 비정상''' 
            rc = call(['virt-xml scvm --edit --vcpus maxvcpus=' + str(cpu)], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)            
            if rc == 0:
                retVal = True
                retCode = 200
            else :
                retVal = False
                retCode = 500
        ''' memory 파라미터 값이 있을경우 '''
        if memory > 0 :
            ''' domain xml 의 memory값 수정 명령 후 리턴값 0이면 정상, 아닐경우 비정상''' 
            rc = call(['virt-xml scvm --edit --memory ' + str(memory) + ',maxmemory=' + str(memory)], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)            
            if rc == 0:
                retVal = True
                retCode = 200                
            else :
                retVal = False
                retCode = 500                 
        ret = createReturn(code=retCode, val=retVal, retname='Storage Center VM UPDATE')
    except Exception as e:
        ret = createReturn(code=500, val='virsh destroy, undefine error', retname='Storage Center VM UPDATE Error')    
    return print(json.dumps(json.loads(ret), indent=4))

if __name__ == '__main__':
    '''parser 생성'''
    args = parseArgs()
    verbose = (5 - args.verbose) * 10

    '''로깅을 위한 logger 생성, 모든 인자에 default 인자가 있음.'''
    '''logger = createLogger(verbosity=logging.CRITICAL, file_log_level=logging.ERROR, log_file='test.log')'''

    if args.action == 'start':
        '''스토리지 가상머신 시작 요청'''
        startStorageVM();    
    elif args.action == 'stop':
        '''스토리지 가상머신 정지 요청'''
        stopStorageVM();
    elif args.action == 'delete':
        '''스토리지 가상머신 삭제 요청'''
        deleteStorageVM();
    elif args.action == 'resource':
        '''스토리지 가상머신 자원변경 요청'''
        updateStorageVM(args.cpu, args.memory); 
    '''print(ret)'''