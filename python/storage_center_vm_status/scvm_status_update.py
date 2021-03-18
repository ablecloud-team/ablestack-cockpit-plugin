#!/usr/bin/env python3

import sys
import argparse
import json
import logging

from subprocess import check_output
from subprocess import run
from ablestack import *

def parseArgs():
    parser = argparse.ArgumentParser(description='Storage Center VM action ',
                                     epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')
    
    parser.add_argument('action', choices=['start', 'stop', 'delete'], help="Storage Center VM action")
    
    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐)
    parser.add_argument("-v", "--verbose", action='count', default=0, help="increase output verbosity")

    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    parser.add_argument("-H", "--Human", action='store_const', dest='H', const=True, help="Human readable")

    # Version 추가
    parser.add_argument("-V", "--Version", action='version', version="%(prog)s 1.0")
    
    return parser.parse_args()

#스토리지 VM 시작 
def StartStroageVM():
        
    try:        
        #run(['virsh', 'start', 'scvm1'], universal_newlines=True)

        ret = createReturn(code=200, val='success', retname='Storage Center VM Start')

    except Exception as e:
        ret = createReturn(code=500, val='ERROR', retname='Storage Center VM Start Error')
        #print ('EXCEPTION : ',e)
                
    return print(json.dumps(json.loads(ret), indent=4))


#스토리지 VM 정지
def StopStroageVM():  
        
    try:
        #run(['virsh', 'start', 'scvm1'], universal_newlines=True)  
        
        ret = createReturn(code=200, val='success', retname='Storage Center VM Stop')

    except Exception as e:
        ret = createReturn(code=500, val='ERROR', retname='Storage Center VM Stop Error')
        #print ('EXCEPTION : ',e)
    
    return print(json.dumps(json.loads(ret), indent=4))
    
#스토리지 VM 삭제
def DeleteStroageVM():  
        
    try:
        #run(['virsh', 'destroy', 'scvm1'], universal_newlines=True)
        
        ret = createReturn(code=200, val='success', retname='Storage Center VM Delete')

    except Exception as e:
        ret = createReturn(code=500, val='ERROR', retname='Storage Center VM Delete Error')
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
        ret = StartStroageVM();    
    
    elif args.action == 'stop':
        ret = StopStroageVM();    
    
    elif args.action == 'delete':
        ret = DeleteStroageVM();    
        

    #print(ret)
    

