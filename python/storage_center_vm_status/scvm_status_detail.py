import sys
import argparse
import json
import logging
import os

from subprocess import check_output
from ablestack import *

env=os.environ.copy()
env['LANG']="en_US.utf-8"
env['LANGUAGE']="en"


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
    
    try:
        #run("ls | grep ablestack", universal_newlines=True,  shell=True)
    
        # vm 상태조회
        output = check_output(["virsh domstate scvm"], universal_newlines=True, shell=True, env=env)    
        scvm_status = output.strip()
        #print(scvm_status)

        output = check_output(["virsh vcpuinfo --domain scvm"], universal_newlines=True, shell=True, env=env)    
        vcpu = output.count('VCPU')
        #print(vcpu)
        
        output = check_output(["virsh dominfo scvm | sed -n 8p | cut -f 2 -d ':' | sed 's/ KiB//g'"], universal_newlines=True, shell=True, env=env)    
        memory = output.strip()
        memory_mib = int(memory) / 1024  #KiB => MiB
        memory_gib = 0
        memory_tib = 0
        if memory_mib < 1024:
            memory = str(memory_mib) + " MiB"
        elif memory_mib >=1024:
            memory_gib = memory_mib / 1024
            memory = str(memory_gib) + " GiB"
        elif memory_gib >=1024:
            memory_tib = memory_gib / 1024
            memory = str(memory_tib) + " TiB"    
       
        ##임시 테스트 데이터사용, 실제 qcow2 파일 사용시 수정해야함.
        output = check_output(["virsh vol-info --pool default --vol scvm.qcow2 | grep Capacity"], universal_newlines=True, shell=True, env=env)    
        rdisk = output.split("Capacity:")[1].strip()
        #print(rdisk)

        ##임시 테스트 데이터사용, 실제 nic명 고정될시 수정해야함. (enp1s20)
        output = check_output(["virsh domifaddr --domain scvm --source agent --full | grep ipv4 | grep -E 'enp1s0|bond0'"], universal_newlines=True, shell=True, env=env)    
        manageNicMacAddr = ' '.join(output.split()).split()[1]
        manageNicIp = ' '.join(output.split()).split()[3]
        #print(manageNicIp)

        output = check_output(["virsh domiflist --domain scvm | grep " + manageNicMacAddr], universal_newlines=True, shell=True, env=env)    
        manageNicParent = ' '.join(output.split()).split()[2]
        manageNicType = ' '.join(output.split()).split()[3]  
        #print(manageNicIp)


        ##임시 테스트 데이터사용, 실제 nic명 고정될시 수정해야함. (enp1s21)
        output = check_output(["virsh domifaddr --domain scvm --source agent --full | grep ipv4 | grep -E 'enp8s0|bond0'"], universal_newlines=True, shell=True, env=env)    
        storageServerNicMacAddr = ' '.join(output.split()).split()[1]
        storageServerNicIp = ' '.join(output.split()).split()[3]
        #print(manageNicIp)

        output = check_output(["virsh domiflist --domain scvm | grep " + storageServerNicMacAddr], universal_newlines=True, shell=True, env=env)    
        storageServerNicParent = ' '.join(output.split()).split()[2]
        storageServerNicType = ' '.join(output.split()).split()[3]  
        #print(manageNicIp)


        ##임시 테스트 데이터사용, 실제 nic명 고정될시 수정해야함. (enp1s22)
        output = check_output(["virsh domifaddr --domain scvm --source agent --full | grep ipv4 | grep -E 'enp9s0|bond1'"], universal_newlines=True, shell=True, env=env)    
        storageReplicationNicMacAddr = ' '.join(output.split()).split()[1]
        storageReplicationNicIp = ' '.join(output.split()).split()[3]
        #print(manageNicIp)

        output = check_output(["virsh domiflist --domain scvm | grep " + storageReplicationNicMacAddr], universal_newlines=True, shell=True, env=env)    
        storageReplicationNicParent = ' '.join(output.split()).split()[2]
        storageReplicationNicType = ' '.join(output.split()).split()[3]  
        #print(manageNicIp)







        ################################################임시데이터
        #scvm_status = "Running"
        #vcpu = 8
        socket = "XXX"
        core = "XXX"

        #memory= "16GB"
        #rdisk = "128GB"

        #manageNicType = "VirtIO"
        #manageNicParent = "br0"
        #manageNicIp = "10.10.0.100"
        manageNicGw = "XXX"


        #storageNicType = "VirtIO"
        #storageNicParent = "br1"
        #storageNicServerIp = "100.100.0.1"
        #storageNicReplicationIp = "100.100.0.100"
        dataDiskType = "XXX"

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
            'storageServerNicType': storageServerNicType,
            'storageServerNicParent': storageServerNicParent,
            'storageServerNicIp': storageServerNicIp,
            'storageReplicationNicType': storageReplicationNicType,
            'storageReplicationNicParent': storageReplicationNicParent,
            'storageReplicationNicIp': storageReplicationNicIp,
            'dataDiskType': dataDiskType
            }

        ret = createReturn(code=200, val=ret_val, retname='Storage Center VM Status Detail' )

    except Exception as e:
        ret_val = {
            'scvm_status': 'no signal', 
            'vcpu': 'N/A', 
            'socket': 'N/A', 
            'core': 'N/A',
            'memory': 'N/A',
            'rdisk': 'N/A',
            'manageNicType': 'N/A',
            'manageNicParent': 'N/A',
            'manageNicIp': 'N/A',
            'manageNicGw': 'N/A',
            'storageServerNicType': 'N/A',
            'storageServerNicParent': 'N/A',
            'storageServerNicIp': 'N/A',
            'storageReplicationNicType': 'N/A',
            'storageReplicationNicParent': 'N/A',
            'storageReplicationNicIp': 'N/A',
            'dataDiskType': 'N/A'
            }
        ret = createReturn(code=500, val=ret_val, retname='Storage Center VM Status Detail')
        #print ('EXCEPTION : ',e)
    
    return print(json.dumps(json.loads(ret), indent=4))
    




if __name__ == '__main__':

    # parser 생성
    args = parseArgs()
    ##print(args);

    if args.action == 'detail':        
        ret = statusDeteil()
    
    #print(ret)
    

