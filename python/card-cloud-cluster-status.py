import sys
import argparse
import json
import logging
import sh

from subprocess import check_output
from able_return import *




def parseArgs():
    parser = argparse.ArgumentParser(description='Card Cloud Cluster Status',
                                     epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')
    
    parser.add_argument('action', choices=['pcsDetail','pcsStart','pcsStop','pcsCleanup','pcsMigration'])
    parser.add_argument('--target', metavar='name', type=str, help='Target hostname to migrate Cloud Center VM')
    
    return parser.parse_args()


def pcsDetail():
    try:
        ret = sh.python3("/usr/share/cockpit/ablestack/python/pcs/main.py","status", "--resource", "cloudcenter_res").stdout.decode()
    except Exception as e:
        ret = createReturn(code=500, val='ERROR')
        print ('EXCEPTION : ',e)
    
    return ret

def pcsStart():
    try:
        ret = sh.python3("/usr/share/cockpit/ablestack/python/pcs/main.py","enable", "--resource", "cloudcenter_res").stdout.decode()
        while True:
            retPcsStatusJson = json.loads(sh.python3("/usr/share/cockpit/ablestack/python/pcs/main.py","status", "--resource", "cloudcenter_res").stdout.decode())
            if retPcsStatusJson['val']['role'] == 'Started':
                break
    except Exception as e:
        ret = createReturn(code=500, val='ERROR')
        print ('EXCEPTION : ',e)
    
    return ret    
    
def pcsStop():
    try:
        ret = sh.python3("/usr/share/cockpit/ablestack/python/pcs/main.py","disable", "--resource", "cloudcenter_res").stdout.decode()
        while True:
            retPcsStatusJson = json.loads(sh.python3("/usr/share/cockpit/ablestack/python/pcs/main.py","status", "--resource", "cloudcenter_res").stdout.decode())
            if retPcsStatusJson['val']['role'] == 'Stopped':
                break
    except Exception as e:
        ret = createReturn(code=500, val='ERROR')
        print ('EXCEPTION : ',e)
    
    return ret

def pcsCleanup():
    try:
        ret = sh.python3("/usr/share/cockpit/ablestack/python/pcs/main.py","cleanup", "--resource", "cloudcenter_res").stdout.decode()
    except Exception as e:
        ret = createReturn(code=500, val='ERROR')
        print ('EXCEPTION : ',e)
    
    return ret

def pcsMigration():
    try:
        ret = sh.python3("/usr/share/cockpit/ablestack/python/pcs/main.py","move", "--resource", "cloudcenter_res", "--target",  args.target).stdout.decode()
        while True:
            retPcsStatusJson = json.loads(sh.python3("/usr/share/cockpit/ablestack/python/pcs/main.py","status", "--resource", "cloudcenter_res").stdout.decode())
            if retPcsStatusJson['val']['role'] == 'Started':
                break
        sh.python3("/usr/share/cockpit/ablestack/python/pcs/main.py","cleanup", "--resource", "cloudcenter_res").stdout.decode()
    except Exception as e:
        ret = createReturn(code=500, val='ERROR')
        print ('EXCEPTION : ',e)
    
    return ret 



if __name__ == '__main__':

    # parser 생성
    args = parseArgs()
    ##print(args);
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
    elif args.action == 'CCConnection':
        ret = CCConnection()
        print(ret)