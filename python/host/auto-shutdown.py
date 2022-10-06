# Copyright (c) 2022 ABLECLOUD Co. Ltd

# 전체 호스트의 전원을 정상적으로 종료하기 위한 파일입니다.
# 최초 작성일 : 2022. 09. 20
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
    parser.add_argument('action', choices=['check_mount', 'stop_scvms', 'shutdown_hosts'], help="Storage Center VM action")    
    '''output 민감도 추가(v갯수에 따라 output및 log가 많아짐)'''
    parser.add_argument("-v", "--verbose", action='count', default=0, help="increase output verbosity")
    '''flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)'''
    parser.add_argument("-H", "--Human", action='store_const', dest='H', const=True, help="Human readable")
    '''Version 추가'''
    parser.add_argument("-V", "--Version", action='version', version="%(prog)s 1.0")
    return parser.parse_args()

'''
함수명 : checkMount
주요 기능 : 전체 시스템 종료 전, 호스트에 mount되어있는 볼륨이 umount되었는지 체크하고 필요 시 umount를 실행합니다. 
'''
def checkMount():
    try:
        #호스트 리스트 추출 (hosts 파일에서 특정 단어 "-pn"을 포함한 2열 값 출력)
        output_host_list = subprocess.check_output("grep '\-pn' /etc/hosts | awk '{print $2}'", shell=True)
        data_host_list = output_host_list.decode('utf8')
        hosts = data_host_list.splitlines()

        #현재 호스트 추출(hosts 파일에서 3열의 값이 ablecloud-pn인 행을 찾은 후, 그 행의 2열 값을 출력)
        output_hostname = subprocess.check_output("awk '{ if ( $3 == \"ablecube-pn\" ) print ($2) }' /etc/hosts", shell=True)
        data_hostname = output_hostname.decode('utf8')
        hostname = data_hostname.splitlines()

        #마운트 해제(/etc/fstab 파일에 UUID로 시작되는 마운트 경로 검색한 후 해제)
        
        for host in hosts:
            if hostname[0] != host:
                # 명령을 내린 호스트를 제외한 호스트의 마운트 해제
                mount_path_list = subprocess.check_output("ssh root@"+host+" grep -v ^# /etc/fstab | grep ^UUID | awk '{print $1}'", universal_newlines=True, shell=True, env=env)
                mount_path_list = mount_path_list[:-1]
                # UUID로 시작되는 마운트 경로가 존재할 경우 마운트 해제
                if "UUID" in mount_path_list:
                    mount_path_list = mount_path_list.splitlines()
                    for mount_path in mount_path_list:
                        # rc = call(['ssh root@'+host+' umount ' +mount_path], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
                        rc = call(['ssh root@'+host+' echo ' +mount_path+ '\">>\" /root/test.txt'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
                    if rc == 0:
                        retVal = True
                        retCode = 200
                    else :
                        retVal = False
                        retCode = 500
                else :
                    retVal = True
                    retCode = 200
        # 명령을 내린 호스트를 가장 마지막에 실행
        mount_path_list = subprocess.check_output("ssh root@"+hostname[0]+" grep -v ^# /etc/fstab | grep ^UUID | awk '{print $1}'", universal_newlines=True, shell=True, env=env)
        mount_path_list = mount_path_list[:-1]
        if "UUID" in mount_path_list:
            mount_path_list = mount_path_list.splitlines()
            for mount_path in mount_path_list:
                # rc = call(['ssh root@'+hostname[0]+' umount ' +mount_path], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
                rc = call(['ssh root@'+hostname[0]+' echo ' +mount_path+ '\">>\" /root/test.txt'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
            if rc == 0:
                retVal = True
                retCode = 200
            else :
                retVal = False
                retCode = 500
        else :
            retVal = True
            retCode = 200
        ret = createReturn(code=retCode, val=retVal, retname='Umount Volume')
    except Exception as e:
        ret = createReturn(code=retCode, val='Umount Volume Error', retname='Umount Volume Error')
    return print(json.dumps(json.loads(ret), indent=4))
    return print('end')

'''
함수명 : stopStorageVMs
주요 기능 : 스토리지 VM 정지
'''
def stopStorageVMs():
    try:
        #호스트 리스트 추출 (hosts 파일에서 특정 단어 "-pn"을 포함한 2열 값 출력)
        output_host_list = subprocess.check_output("grep '\-pn' /etc/hosts | awk '{print $2}'", shell=True)
        data_host_list = output_host_list.decode('utf8')
        hosts = data_host_list.splitlines()

        #현재 호스트 추출(hosts 파일에서 3열의 값이 ablecloud-pn인 행을 찾은 후, 그 행의 2열 값을 출력)
        output_hostname = subprocess.check_output("awk '{ if ( $3 == \"ablecube-pn\" ) print ($2) }' /etc/hosts", shell=True)
        data_hostname = output_hostname.decode('utf8')
        hostname = data_hostname.splitlines()

        # 각 호스트의 실행 결과를 리스트에 추가
        result_code_list = []
        for host in hosts:
            if hostname[0] != host:
                # 명령을 내린 호스트를 제외한 스토리지센터 가상머신 종료
                result = check_output(["ssh root@" + host + " 'python3 python/scc_status/scvm_status_update.py stop'"], universal_newlines=True, shell=True, env=env)
                json_data = json.loads(result)
                result_code_list.append(json_data["code"])
        # 명령을 내린 호스트를 가장 마지막에 실행
        result = check_output(["ssh root@" + hostname[0] + " 'python/scc_status/scvm_status_update.py stop'"], universal_newlines=True, shell=True, env=env)
        '''스토리지 가상머신 정지 명령 후 리턴값 0은 정상, 아닐경우 비정상'''
        json_data = json.loads(result)
        result_code_list.append(json_data["code"])

        # 실행 결과 리스트에 오류코드가 존재하지 않으면 정상 코드 200 반환
        if 500 not in result_code_list:
            retVal = True
            retCode = 200
        else:
            retVal = False
            retCode = 500
        ret = createReturn(code=retCode, val=retVal, retname='Storage Center VM Stop')
    except Exception as e:
        ret = createReturn(code=retCode, val='virsh shutdown error', retname='Storage Center VM Stop Error')
    return print(json.dumps(json.loads(ret), indent=4))
    return print('end')

'''
함수명 : shutDownHosts
주요 기능 : 호스트 종료
'''
def shutdownHosts():
    try:
        #호스트 리스트 추출 (hosts 파일에서 특정 단어 "-pn"을 포함한 2열 값 출력)
        output_host_list = subprocess.check_output("grep '\-pn' /etc/hosts | awk '{print $2}'", shell=True)
        data_host_list = output_host_list.decode('utf8')
        hosts = data_host_list.splitlines()

        #현재 호스트 추출(hosts 파일에서 3열의 값이 ablecloud-pn인 행을 찾은 후, 그 행의 2열 값을 출력)
        output_hostname = subprocess.check_output("awk '{ if ( $3 == \"ablecube-pn\" ) print ($2) }' /etc/hosts", shell=True)
        data_hostname = output_hostname.decode('utf8')
        hostname = data_hostname.splitlines()

        for host in hosts:
            if hostname[0] != host:
                # 명령을 내린 호스트를 제외한 호스트의 시스템 종료
                rc = call(['ssh root@'+host +' shutdown -h -t 5'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
                if rc == 0:
                    retVal = True
                    retCode = 200
                else :
                    retVal = False
                    retCode = 500
        # 명령을 내린 호스트를 가장 마지막에 실행
        rc = call(['ssh root@'+hostname[0] +' shutdown -h -t 5'], universal_newlines=True, shell=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        if rc == 0:
            retVal = True
            retCode = 200
        else :
            retVal = False
            retCode = 500
        ret = createReturn(code=retCode, val=retVal, retname='Hosts Shutdown')
    except Exception as e:
        ret = createReturn(code=retCode, val='host shutdown error', retname='Hosts Shutdown Error')
    return print(json.dumps(json.loads(ret), indent=4))
    return print('end')

if __name__ == '__main__':
    '''parser 생성'''
    args = parseArgs()
    verbose = (5 - args.verbose) * 10

    '''로깅을 위한 logger 생성, 모든 인자에 default 인자가 있음.'''
    '''logger = createLogger(verbosity=logging.CRITICAL, file_log_level=logging.ERROR, log_file='test.log')'''

    if args.action == 'check_mount':
        '''secondary storage nfs체크 요청'''
        checkMount();
    elif args.action == 'stop_scvms':
        '''스토리지 가상머신 테스트 요청'''
        stopStorageVMs();
    elif args.action == 'shutdown_hosts':
        '''스토리지 가상머신 테스트 요청'''
        shutdownHosts();