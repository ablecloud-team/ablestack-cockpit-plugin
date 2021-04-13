# Copyright (c) 2021 ABLECLOUD Co. Ltd

# 스토리지센터 가상머신 상태 상세조회를 위한 파일입니다.
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
    parser = argparse.ArgumentParser(description='Storage Center VM Status Details', epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')    
    parser.add_argument('action', choices=['detail'])    
    '''output 민감도 추가(v갯수에 따라 output및 log가 많아짐)'''
    parser.add_argument("-v", "--verbose", action='count', default=0, help="increase output verbosity")
    '''flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)'''
    parser.add_argument("-H", "--Human", action='store_const', dest='H', const=True, help="Human readable")
    '''Version 추가'''
    parser.add_argument("-V", "--Version", action='version', version="%(prog)s 1.0")    
    return parser.parse_args()

'''
함수명 : statusDeteil
주요 기능 : 스토리지 가상머신 상태 상세조회
'''
def statusDeteil():
    scvm_status = 'HEALTH_ERR'
    vcpu = 'N/A'
    socket = 'N/A'
    core = 'N/A'
    memory = 'N/A'
    rootDiskSize = 'N/A'
    rootDiskAvail = 'N/A'
    rootDiskUsePer = 'N/A'
    manageNicType = 'N/A'
    manageNicParent = 'N/A'
    manageNicIp = 'N/A'
    manageNicGw = 'N/A'
    storageServerNicType = 'N/A'
    storageServerNicParent = 'N/A'
    storageServerNicIp = 'N/A'
    storageReplicationNicType = 'N/A'
    storageReplicationNicParent = 'N/A'
    storageReplicationNicIp = 'N/A'
    dataDiskType = 'N/A'

    try:
        '''scvm 상태값 조회 시 리턴값이 0이면 정상, 아니면 비정상'''
        rc = call(['virsh domstate scvm'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)          
        if rc == 0:
            '''가상머신 상태 출력값 확인'''
            output = check_output(["virsh domstate scvm"], universal_newlines=True, shell=True, env=env)
            scvm_status = output.strip()
        else :
            scvm_status = 'HEALTH_ERR'
        
        '''scvm vCPU값 조회 시 리턴값 0이면 정상, 아니면 비정상'''
        rc = call(['virsh vcpuinfo --domain scvm'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)        
        if rc == 0: 
            '''vCPU 카운트 값 확인'''
            output = check_output(["virsh vcpuinfo --domain scvm"], universal_newlines=True, shell=True, env=env)
            vcpu = output.count('VCPU')
        else :
            vcpu = 'N/A'        
        
        '''scvm memory값 조회 시 리턴값 0이면 정상, 아니면 비정상'''
        rc = call(['virsh domstats scvm | grep balloon.maximum'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)        
        if rc == 0:
            '''memory 출력값 확인'''
            output = check_output(["virsh domstats scvm | grep balloon.maximum"], universal_newlines=True, shell=True, env=env)
            memory = output.split("=")[1]
            '''KiB단위에서 MiB로 단위 변경'''
            memory_mib = int(memory) / 1024  
            memory_gib = 0
            memory_tib = 0
            '''MiB, GiB, TiB로 단위 세팅'''
            if memory_mib < 1024:
                memory = str(memory_mib) + " MiB"
            elif memory_mib >=1024:
                memory_gib = memory_mib / 1024
                memory = str(round(memory_gib)) + " GiB"
            elif memory_gib >=1024:
                memory_tib = memory_gib / 1024
                memory = str(round(memory_tib)) + " TiB"    
        else :
            memory = 'N/A'

        '''scvm root disk 크기 조회 시 ssh 사용전 ping test'''                    
        rc = call(["ping -c 1 scvm"], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        if rc == 0:                
            '''scvm 에 접속해 df -h 값 세팅''' 
            rootDiskSize = check_output(["/usr/bin/ssh -o StrictHostKeyChecking=no scvm df -h | grep 'root' | awk '{print $2}'"], universal_newlines=True, shell=True, env=env)                
            if rootDiskSize == "" :
                rootDiskSize = "N/A"
            output = check_output(["/usr/bin/ssh -o StrictHostKeyChecking=no scvm df -h | grep 'root' | awk '{print $4}'"], universal_newlines=True, shell=True, env=env)
            rootDiskAvail = output.strip();
            if rootDiskAvail == "" :
                rootDiskAvail = "N/A"
            output = check_output(["/usr/bin/ssh -o StrictHostKeyChecking=no scvm df -h | grep 'root' | awk '{print $5}'"], universal_newlines=True, shell=True, env=env)
            rootDiskUsePer = output.strip();                
            if rootDiskUsePer == "" :
                rootDiskUsePer = "N/A"
            
            '''management Nic Gw정보 확인'''
            output = check_output(["/usr/bin/ssh -o StrictHostKeyChecking=no scvm /usr/sbin/route -n | grep -P '^0.0.0.0|UG' | awk '{print $2}'"], universal_newlines=True, shell=True, env=env)
            manageNicGw = output.strip();
            if manageNicGw == "" :
                manageNicGw = "N/A"
        else : 
            rootDiskSize = 'N/A'     
            rootDiskAvail = 'N/A'
            rootDiskUsePer = 'N/A'
            manageNicGw = 'N/A'
        
        '''scvm 관리 nic 확인 시 리턴값 0이면 정상, 아니면 비정상'''
        rc = call(["cat /etc/hosts | grep scvm-mngt"], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        if rc == 0:
            output = check_output(["cat /etc/hosts | grep scvm-mngt | awk '{print $1}'"], universal_newlines=True, shell=True, env=env)
            manageNicIp = output.strip()
            rc = call(["virsh domifaddr --domain scvm --source agent --full | grep -w " + manageNicIp], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
            if rc == 0:
                manageNicMacAddr = check_output(["virsh domifaddr --domain scvm --source agent --full | grep -w " + manageNicIp + "| awk '{print $2}'"], universal_newlines=True, shell=True, env=env)
                rc = call(["virsh domiflist --domain scvm | grep " + manageNicMacAddr], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)            
                if rc == 0: 
                    '''관리 nic mac address로 추가 정보 확인'''
                    output = check_output(["virsh domiflist --domain scvm | grep " + manageNicMacAddr], universal_newlines=True, shell=True, env=env)
                    manageNicParent = ' '.join(output.split()).split()[2]
                    manageNicType = ' '.join(output.split()).split()[1]
                else :                
                    manageNicParent = 'N/A'
                    manageNicType = 'N/A'
            else :
                manageNicMacAddr = 'N/A'
                manageNicParent = 'N/A'
                manageNicType = 'N/A'
        else :
            manageNicMacAddr = 'N/A'
            manageNicIp = 'N/A'
            manageNicParent = 'N/A'
            manageNicType = 'N/A'

        '''scvm 서버용 nic 확인 시 리턴값 0이면 정상, 아니면 비정상'''
        rc = call(["cat /etc/hosts | grep scvm$"], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        if rc == 0:
            output = check_output(["cat /etc/hosts | grep scvm$ | awk '{print $1}'"], universal_newlines=True, shell=True, env=env)
            storageServerNicIp = output.strip();
            rc = call(["virsh domifaddr --domain scvm --source agent --full | grep -w " + storageServerNicIp], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
            if rc == 0:
                storageServerNicMacAddr = check_output(["virsh domifaddr --domain scvm --source agent --full | grep -w " + storageServerNicIp + "| awk '{print $2}'"], universal_newlines=True, shell=True, env=env)
                rc = call(["virsh domiflist --domain scvm | grep " + storageServerNicMacAddr], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)            
                if rc == 0: 
                    '''서버용 nic mac address로 추가 정보 확인'''
                    output = check_output(["virsh domiflist --domain scvm | grep " + storageServerNicMacAddr], universal_newlines=True, shell=True, env=env)
                    storageServerNicParent = ' '.join(output.split()).split()[2]   
                    storageServerNicType = ' '.join(output.split()).split()[1]
                else :                
                    storageServerNicParent = 'N/A'
                    storageServerNicType = 'NIC Passthrough'
            else :
                storageServerNicMacAddr = 'N/A'
                storageServerNicParent = 'N/A'
                storageServerNicType = 'N/A'
        else :
            storageServerNicMacAddr = 'N/A'
            storageServerNicIp = 'N/A'
            storageServerNicParent = 'N/A'
            storageServerNicType = 'N/A'
        
        '''scvm 복제용 nic 확인 시 리턴값 0이면 정상, 아니면 비정상'''
        rc = call(["cat /etc/hosts | grep scvm-cn"], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        if rc == 0:
            output = check_output(["cat /etc/hosts | grep scvm-cn | awk '{print $1}'"], universal_newlines=True, shell=True, env=env)
            storageReplicationNicIp = output.strip();
            rc = call(["virsh domifaddr --domain scvm --source agent --full | grep -w " + storageReplicationNicIp], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
            if rc == 0:
                storageReplicationNicMacAddr = check_output(["virsh domifaddr --domain scvm --source agent --full | grep -w " + storageReplicationNicIp + "| awk '{print $2}'"], universal_newlines=True, shell=True, env=env)
                rc = call(["virsh domiflist --domain scvm | grep " + storageReplicationNicMacAddr], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)  
                if rc == 0: 
                    '''복제용 nic mac address로 추가 정보 확인'''
                    output = check_output(["virsh domiflist --domain scvm | grep " + storageReplicationNicMacAddr], universal_newlines=True, shell=True, env=env)
                    storageReplicationNicParent = ' '.join(output.split()).split()[2]   
                    storageReplicationNicType = ' '.join(output.split()).split()[1]
                else :                
                    storageReplicationNicParent = 'N/A'
                    storageReplicationNicType = 'NIC Passthrough'
            else :
                storageReplicationNicMacAddr = 'N/A'
                storageReplicationNicParent = 'N/A'
                storageReplicationNicType = 'N/A'
        else :
            storageReplicationNicMacAddr = 'N/A'
            storageReplicationNicIp = 'N/A'
            storageReplicationNicParent = 'N/A'
            storageReplicationNicType = 'N/A'
        
        '''실제 데이터 세팅'''
        ret_val = {
            'scvm_status': scvm_status, 
            'vcpu': vcpu, 
            'socket': socket, 
            'core': core,
            'memory': memory,
            'rootDiskSize': rootDiskSize,
            'rootDiskAvail': rootDiskAvail,
            'rootDiskUsePer': rootDiskUsePer,
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
        ret = createReturn(code=200, val=ret_val, retname='Storage Center VM Status Detail')
    except Exception as e:
        '''실제 데이터 세팅'''
        ret_val = {
            'scvm_status': scvm_status, 
            'vcpu': vcpu, 
            'socket': socket, 
            'core': core,
            'memory': memory,
            'rootDiskSize': rootDiskSize,
            'rootDiskAvail': rootDiskAvail,
            'rootDiskUsePer': rootDiskUsePer,
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
        ret = createReturn(code=500, val=ret_val, retname='Storage Center VM Status Detail')    
    return print(json.dumps(json.loads(ret), indent=4))

if __name__ == '__main__':
    '''parser 생성'''
    args = parseArgs()
    if args.action == 'detail':        
        '''스토리지센터 가상머신 상태 조회 action'''
        statusDeteil()    
    '''print(ret)'''