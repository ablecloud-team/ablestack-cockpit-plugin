#!/usr/bin/env python3

import sys
import argparse
import json
import logging

from subprocess import check_output
from subprocess import run
from ablestack import *

def parseArgs():
    parser = argparse.ArgumentParser(description='Storage Cluster maintenance Mode Setting',
                                     epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')
    
    parser.add_argument('action', choices=['set_noout', 'unset_noout'], help="Maintenance action")
    
    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐)
    parser.add_argument("-v", "--verbose", action='count', default=0, help="increase output verbosity")

    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    parser.add_argument("-H", "--Human", action='store_const', dest='H', const=True, help="Human readable")

    # Version 추가
    parser.add_argument("-V", "--Version", action='version', version="%(prog)s 1.0")
    
    return parser.parse_args()

#유지보수모드 
def onMaintenance():

        
    try:
        
        #run(['ceph', 'osd', 'set', 'noout'], universal_newlines=True)
        #run(['ceph', 'osd', 'set', 'nobackfill'], universal_newlines=True)
        #run(['ceph', 'osd', 'set', 'norecover'], universal_newlines=True)

        ret = createReturn(code=200, val='success', retname='Maintenance Mode On')         


    except Exception as e:
        ret = createReturn(code=500, val='ERROR', retname='Maintenance Mode On')
        #print ('EXCEPTION : ',e)
                
    return print(json.dumps(json.loads(ret), indent=4))


#유지보수모드 해제
def offMaintenance():  
        
    try:
        #run(['ceph', 'osd', 'unset', 'noout'], universal_newlines=True)
        #run(['ceph', 'osd', 'unset', 'nobackfill'], universal_newlines=True)
        #run(['ceph', 'osd', 'unset', 'norecover'], universal_newlines=True)    
        
        ret = createReturn(code=200, val='success', retname='Maintenance Mode Off')

    except Exception as e:
        ret = createReturn(code=500, val='ERROR', retname='Maintenance Mode Off')
        #print ('EXCEPTION : ',e)
    
    return print(json.dumps(json.loads(ret), indent=4))
    


if __name__ == '__main__':

    # parser 생성
    args = parseArgs()
    ##print(args);

    verbose = (5 - args.verbose) * 10

    # 로깅을 위한 logger 생성, 모든 인자에 default 인자가 있음.
    #logger = createLogger(verbosity=logging.CRITICAL, file_log_level=logging.ERROR, log_file='test.log')

    if args.action == 'set_noout':        
        ret = onMaintenance();    
    
    elif args.action == 'unset_noout':
        ret = offMaintenance();    
        

    #print(ret)
    

