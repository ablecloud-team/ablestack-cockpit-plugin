import sys
import argparse
import json
import logging

from subprocess import check_output
from subprocess import Popen
from ablestack import *


def parseArgs():
    parser = argparse.ArgumentParser(description='Storage Center VM Status Details',
                                     epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')
    
    parser.add_argument('action', choices=['detail'])
    
    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐)
    parser.add_argument("-v", "--verbose", action='count', default=0, help="increase output verbosity")

    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    parser.add_argument("-H", "--Human", action='store_const', dest='H', const=True, help="Human readable")

    # Version 추가
    parser.add_argument("-V", "--Version", action='version', version="%(prog)s 1.0")
    return parser.parse_args()


def statusDeteil():        
    

    #run("ls | grep ablestack", universal_newlines=True,  shell=True)
    
    stat = check_output(['virsh list | grep jschoi-dev'], universal_newlines=True, shell=True )
    
    try:
        
        #res_output = check_output(['ceph', '-s'], universal_newlines=True)
    
       
        ################################################임시데이터
        scvm_status = "Running"
        vcpu = 8
        socket = 1
        core = 4

        memory= "16GB"
        rdisk = "128GB"

        manageNicType = "VirtIO"
        manageNicParent = "br0"
        manageNicIp = "10.10.0.100"
        manageNicGw = "10.10.0.1"


        storageNicType = "VirtIO"
        storageNicParent = "br1"
        storageNicServerIp = "100.100.0.1"
        storageNicReplicationIp = "100.100.0.100"
        dataDiskType = "SSD"

        ################################################
        
        # 실제 데이터 세팅
        ret_val = {
            'scvm_status': scvm_status, 
            'vcpu': vcpu, 
            'socket': socket, 
            'core': core,
            'memory': memory,
            'rdisk': rdisk,
            'manageNicType': manageNicType,
            'manageNicParent': manageNicParent,
            'manageNicIp': manageNicIp,
            'manageNicGw': manageNicGw,
            'storageNicType': storageNicType,
            'storageNicParent': storageNicParent,
            'storageNicServerIp': storageNicServerIp,
            'storageNicReplicationIp': storageNicReplicationIp,
            'dataDiskType': dataDiskType
            }

        ret = createReturn(code=200, val=ret_val, retname='Storage Center VM Status Detail' )

    except Exception as e:
        ret = createReturn(code=500, val='ERROR', retname='Storage Center VM Status Detail')
        #print ('EXCEPTION : ',e)
    
    return print(json.dumps(json.loads(ret), indent=4))
    




if __name__ == '__main__':

    # parser 생성
    args = parseArgs()
    ##print(args);

    if args.action == 'detail':        
        ret = statusDeteil()
    
    #print(ret)
    

