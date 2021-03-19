import sys
import argparse
import json
import logging

from subprocess import check_output
from able_return import *


def parseArgs():
    parser = argparse.ArgumentParser(description='Card Cloud Cluster Status',
                                     epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')
    
    parser.add_argument('action', choices=['pcsDetail','pcsStart','pcsStop','pcsCleanup','pcsMigration'])
    
    return parser.parse_args()


def pcsDeteil():
    try:
        ret_val = {
            'pcsClusterStatus': 'Health_OK',
            'nodeConfig': {
                'host1': '172.16.0.11',
                'host2': '172.16.0.12',
                'host3': '172.16.0.13'
                },
            'resourceStatus': 'ENABLE',
            'executionNode': '172.16.0.11'
        } 
        ret = createReturn(code=200, val=ret_val)
    except Exception as e:
        ret = createReturn(code=500, val='ERROR')
        print ('EXCEPTION : ',e)
    
    return ret

def pcsStart():
    try:
        ret_val = {
            'pcsClusterStatus': 'Health_OK',
            'nodeConfig': {
                'host1': '172.16.0.11',
                'host2': '172.16.0.12',
                'host3': '172.16.0.13'
                },
            'resourceStatus': 'ENABLE',
            'executionNode': '172.16.0.11'
        } 
        ret = createReturn(code=200, val=ret_val)
    except Exception as e:
        ret = createReturn(code=500, val='ERROR')
        print ('EXCEPTION : ',e)
    
    return ret    
    
def pcsStop():
    try:
        ret_val = {
            'pcsClusterStatus': 'Health_OK',
            'nodeConfig': {
                'host1': '172.16.0.11',
                'host2': '172.16.0.12',
                'host3': '172.16.0.13'
                },
            'resourceStatus': 'DISABLE',
            'executionNode': 'N/A'
        } 
        ret = createReturn(code=200, val=ret_val)
    except Exception as e:
        ret = createReturn(code=500, val='ERROR')
        print ('EXCEPTION : ',e)
    
    return ret 



if __name__ == '__main__':

    # parser 생성
    args = parseArgs()
    ##print(args);
    if args.action == 'pcsDetail':
        ret = pcsDeteil()
        print(ret)
    elif args.action == 'pcsStart':
        ret = pcsStart()
        print(ret)
    elif args.action == 'pcsStop':
        ret = pcsStop()
        print(ret)
    elif args.action == 'pcsMigration':
        ret = pcsMigration()
        print(ret)
    elif args.action == 'CCConnection':
        ret = CCConnection()
        print(ret)