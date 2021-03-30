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
    scvm_status = ''
    vcpu = ''
    socket = 'XXX'
    core = 'XXX'
    memory = ''
    rdisk = ''
    manageNicType = ''
    manageNicParent = ''
    manageNicIp = ''
    manageNicGw = 'XXX'
    storageServerNicType = ''
    storageServerNicParent = ''
    storageServerNicIp = ''
    storageReplicationNicType = ''
    storageReplicationNicParent = ''
    storageReplicationNicIp = ''
    dataDiskType = 'XXX'

    try:
        '''scvm 상태값 조회 시 리턴값이 0이면 정상, 아니면 비정상'''
        rc = call(['virsh domstate scvm'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)          
        if rc == 0:
            '''가상머신 상태 출력값 확인'''
            output = check_output(["virsh domstate scvm"], universal_newlines=True, shell=True, env=env)
            scvm_status = output.strip()
        else :
            scvm_status = 'no signal'
        
        '''scvm vCPU값 조회 시 리턴값 0이면 정상, 아니면 비정상'''
        rc = call(['virsh vcpuinfo --domain scvm'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)        
        if rc == 0: 
            '''vCPU 카운트 값 확인'''
            output = check_output(["virsh vcpuinfo --domain scvm"], universal_newlines=True, shell=True, env=env)
            vcpu = output.count('VCPU')
        else :
            vcpu = 'undefine'        
        
        '''scvm memory값 조회 시 리턴값 0이면 정상, 아니면 비정상'''
        rc = call(['virsh dommemstat --domain scvm'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)        
        if rc == 0:
            '''memory 출력값 확인'''
            output = check_output(["virsh dommemstat --domain scvm | grep actual"], universal_newlines=True, shell=True, env=env)
            memory = output.split(" ")[1]
            '''KiB단위에서 MiB로 단위 변경'''
            memory_mib = int(memory) / 1024  
            memory_gib = 0
            memory_tib = 0
            '''MiB, GiB, TiB로 단위 세팅'''
            if memory_mib < 1024:
                memory = str(memory_mib) + " MiB"
            elif memory_mib >=1024:
                memory_gib = memory_mib / 1024
                memory = str(memory_gib) + " GiB"
            elif memory_gib >=1024:
                memory_tib = memory_gib / 1024
                memory = str(memory_tib) + " TiB"    
        else :
            memory = 'undefine'

        '''scvm root disk 크기 조회 시 리턴값 0이면 정상, 아니면 비정상'''
        rc = call(['virsh vol-info  /var/lib/libvirt/images/scvm.qcow2 | grep Capacity'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)        
        if rc == 0:
            '''디스크 크기 출력값 확인'''
            output = check_output(["virsh vol-info  /var/lib/libvirt/images/scvm.qcow2 | grep Capacity"], universal_newlines=True, shell=True, env=env)
            rdisk = output.split("Capacity:")[1].strip()
        else :
            rdisk = 'undefine'        
        
        '''scvm 관리 nic 확인 시 리턴값 0이면 정상, 아니면 비정상'''
        '''임시 테스트 데이터사용, 실제 nic명 고정될시 수정해야함. (enp1s20)'''
        rc = call(["virsh domifaddr --domain scvm --source agent --full | grep ipv4 | grep -E 'enp1s0'"], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)          
        if rc == 0:
            '''scvm 관리 nic 정보 확인'''
            output = check_output(["virsh domifaddr --domain scvm --source agent --full | grep ipv4 | grep -E 'enp1s0'"], universal_newlines=True, shell=True, env=env)
            manageNicMacAddr = ' '.join(output.split()).split()[1]
            manageNicIp = ' '.join(output.split()).split()[3]
            '''관리 nic mac address로 추가 정보 확인, 리턴값 0이면 정상, 아니면 비정상'''
            rc = call(["virsh domiflist --domain scvm | grep " + manageNicMacAddr], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)            
            if rc == 0: 
                '''관리 nic mac address로 추가 정보 확인'''
                output = check_output(["virsh domiflist --domain scvm | grep " + manageNicMacAddr], universal_newlines=True, shell=True, env=env)
                manageNicParent = ' '.join(output.split()).split()[2]   
                manageNicType = ' '.join(output.split()).split()[3]
            else :
                manageNicMacAddr = 'undefine'
                manageNicIp = 'undefine'
                manageNicParent = 'undefine'
                manageNicType = 'undefine'
        else :
            manageNicMacAddr = 'undefine'
            manageNicIp = 'undefine'
            manageNicParent = 'undefine'
            manageNicType = 'undefine'

        '''scvm 서버용 nic 확인 시 리턴값 0이면 정상, 아니면 비정상'''
        '''임시 테스트 데이터사용, 실제 nic명 고정될시 수정해야함. (enp1s21)'''
        rc = call(["virsh domifaddr --domain scvm --source agent --full | grep ipv4 | grep -E 'enp8s0|bond0'"], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)       
        if rc == 0:
            '''scvm 서버용 nic 정보 확인'''
            output = check_output(["virsh domifaddr --domain scvm --source agent --full | grep ipv4 | grep -E 'enp8s0|bond0'"], universal_newlines=True, shell=True, env=env)
            storageServerNicMacAddr = ' '.join(output.split()).split()[1]
            storageServerNicIp = ' '.join(output.split()).split()[3]            
            '''서버용 nic mac address로 추가 정보 확인, 리턴값 0이면 정상, 아니면 비정상'''
            rc = call(["virsh domiflist --domain scvm | grep " + storageServerNicMacAddr], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)            
            if rc == 0:
                '''서버용 nic mac address로 추가 정보 확인'''
                output = check_output(["virsh domiflist --domain scvm | grep " + storageServerNicMacAddr], universal_newlines=True, shell=True, env=env)
                storageServerNicParent = ' '.join(output.split()).split()[2]
                storageServerNicType = ' '.join(output.split()).split()[3]
            else :
                storageServerNicMacAddr = 'undefine'
                storageServerNicIp = 'undefine'
                storageServerNicParent = 'undefine'
                storageServerNicType = 'undefine'
        else :
            storageServerNicMacAddr = 'undefine'
            storageServerNicIp = 'undefine'
            storageServerNicParent = 'undefine'
            storageServerNicType = 'undefine'

        '''scvm 복제용 nic 확인 시 리턴값 0이면 정상, 아니면 비정상'''
        '''임시 테스트 데이터사용, 실제 nic명 고정될시 수정해야함. (enp1s21)'''
        rc = call(["virsh domifaddr --domain scvm --source agent --full | grep ipv4 | grep -E 'enp9s0|bond1'"], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)        
        if rc == 0:
            '''scvm 복제용 nic 정보 확인'''
            output = check_output(["virsh domifaddr --domain scvm --source agent --full | grep ipv4 | grep -E 'enp9s0|bond1'"], universal_newlines=True, shell=True, env=env)
            storageReplicationNicMacAddr = ' '.join(output.split()).split()[1]
            storageReplicationNicIp = ' '.join(output.split()).split()[3]
            '''복제용 nic mac address로 추가 정보 확인, 리턴값 0이면 정상, 아니면 비정상'''
            rc = call(["virsh domiflist --domain scvm | grep " + storageReplicationNicMacAddr], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)            
            if rc == 0:
                '''서버용 nic mac address로 추가 정보 확인'''
                output = check_output(["virsh domiflist --domain scvm | grep " + storageReplicationNicMacAddr], universal_newlines=True, shell=True, env=env)
                storageReplicationNicParent = ' '.join(output.split()).split()[2]
                storageReplicationNicType = ' '.join(output.split()).split()[3]
            else :
                storageReplicationNicMacAddr = 'undefine'
                storageReplicationNicIp = 'undefine'
                storageReplicationNicParent = 'undefine'
                storageReplicationNicType = 'undefine'
        else :
            storageReplicationNicMacAddr = 'undefine'
            storageReplicationNicIp = 'undefine'
            storageReplicationNicParent = 'undefine'
            storageReplicationNicType = 'undefine'        
        '''실제 데이터 세팅'''
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
        ret = createReturn(code=200, val=ret_val, retname='Storage Center VM Status Detail')
    except Exception as e:
        '''실제 데이터 세팅'''
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
        ret = createReturn(code=500, val=ret_val, retname='Storage Center VM Status Detail')    
    return print(json.dumps(json.loads(ret), indent=4))

if __name__ == '__main__':
    '''parser 생성'''
    args = parseArgs()
    if args.action == 'detail':        
        '''스토리지센터 가상머신 상태 조회 action'''
        ret = statusDeteil()    
    '''print(ret)'''