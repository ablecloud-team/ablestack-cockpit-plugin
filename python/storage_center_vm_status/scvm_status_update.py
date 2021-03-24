#!/usr/bin/env python3

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
import libvirt


env=os.environ.copy()
env['LANG']="en_US.utf-8"
env['LANGUAGE']="en"

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

#스토리지 VM 시작 
def startStorageVM():

    try:
        rc = call(['virsh start jsdev'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)  
        
        if rc == 0: # ok
            retVal = True
            retCode = 200
        elif rc == 1: # not ok
            retVal = False
            retCode = 500

        ret = createReturn(code=retCode, val=retVal, retname='Storage Center VM Start')

    except Exception as e:
        ret = createReturn(code=500, val='virsh start error', retname='Storage Center VM Start Error')
        #print ('EXCEPTION : ',e)
                
    return print(json.dumps(json.loads(ret), indent=4))


#스토리지 VM 정지
def stopStorageVM():  
        
    try:
        rc = call(['virsh shutdown jsdev'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)  
        
        if rc == 0: # ok
            retVal = True
            retCode = 200
        elif rc == 1: # not ok
            retVal = False
            retCode = 500
         
        
        ret = createReturn(code=retCode, val=retVal, retname='Storage Center VM Stop')

    except Exception as e:
        ret = createReturn(code=retCode, val='virsh shutdown error', retname='Storage Center VM Stop Error')
        #print ('EXCEPTION : ',e)
    
    return print(json.dumps(json.loads(ret), indent=4))
    
#스토리지 VM 삭제
def deleteStorageVM():   

    try:

        rc = call(['virsh destroy jsdev'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)  
        if rc == 0: # 
            rc = call(['virsh undefine jsdev'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)          
            if rc == 0: # ok
                retVal = True
                retCode = 200
            elif rc == 1: # not ok
                retVal = False
                retCode = 500

        elif rc == 1: # not ok
            retVal = False
            retCode = 500

        
        ret = createReturn(code=retCode, val=retVal, retname='Storage Center VM Delete')

    except Exception as e:
        ret = createReturn(code=500, val='virsh destroy, undefine error', retname='Storage Center VM Delete Error')
        #print ('EXCEPTION : ',e)
    
    return print(json.dumps(json.loads(ret), indent=4))


#스토리지 VM 삭제
def updateStorageVM(cpu, memory):

    memory = memory * 1024
    
    try:

        # #값이 없을때 
        if cpu > 0 :
            rc = call(['virt-xml jsdev --edit --vcpus maxvcpus=' + str(cpu)], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)          
            
            if rc == 0: # ok
                retVal = True
                retCode = 200
            elif rc == 1: # not ok
                retVal = False
                retCode = 500
            
            
        if memory > 0 :
            rc = call(['virt-xml jsdev --edit --memory ' + str(memory) + ',maxmemory=' + str(memory)], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)  
            
            if rc == 0: # ok                
                retVal = True
                retCode = 200
            elif rc == 1: # not ok
                retVal = False
                retCode = 500
                 
        ret = createReturn(code=200, val='adf', retname='Storage Center VM UPDATE')

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
    

