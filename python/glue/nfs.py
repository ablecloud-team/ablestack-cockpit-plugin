'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : nfs 클러스터 및 export 액션을 관리
최초 작성일 : 2023. 05.25
'''

#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import logging
import os
import json
import sh
import requests
import cryptocode

from ablestack import *
from sh import ssh
from subprocess import check_output
from requests.packages.urllib3.exceptions import InsecureRequestWarning

env=os.environ.copy()
env['LANG']='en_US.utf-8'
env['LANGUAGE']='en'

def createArgumentParser():
    """
    입력된 argument를 파싱하여 dictionary 처럼 사용하게 만들어 주는 parser를 생성하는 함수

    :return: argparse.ArgumentParser
    """
    # 참조: https://docs.python.org/ko/3/library/argparse.html
    # 프로그램 설명
    tmp_parser = argparse.ArgumentParser(description='NFS 관련 기능을 수행하는 프로그램',
                                         epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')

    # 인자 추가: https://docs.python.org/ko/3/library/argparse.html#the-add-argument-method

    # 선택지 추가(동작 선택)
    tmp_parser.add_argument('action', choices=['config', 'destroy', 'status', 'create', 'delete', 'edit', 'list', 'detail', 'daemon'], help='nfs 클러스터 and nfs export action')
    tmp_parser.add_argument('--id', metavar='export id', type=int, help='nfs export ID')
    tmp_parser.add_argument('--access-type', metavar='access type', type=str, default='RW', help='nfs 옵션 RW, RO, NONE')
    tmp_parser.add_argument('--squash',metavar='squash', type=str, default='no_root_squash', help='nfs 옵션 no_root_squash, root_id_squash, root_squash, all_squash')
    tmp_parser.add_argument('--quota', metavar='nfs quota max bytes', default='', help='nfs 쿼터 최대 크기 (Bytes)')
    tmp_parser.add_argument('--control',metavar='daemon control', type=str, help='nfs Daemon 서비스 제어')

    # output 민감도 추가(v갯수에 따라 output및 log가 많아짐)
    tmp_parser.add_argument('-v', '--verbose', action='count', default=0,
                            help='increase output verbosity')

    # flag 추가(샘플임, 테스트용으로 json이 아닌 plain text로 출력하는 플래그 역할)
    tmp_parser.add_argument('-H', '--Human', action='store_const',
                            dest='flag_readerble', const=True,
                            help='Human readable')

    # Version 추가
    tmp_parser.add_argument('-V', '--Version', action='version',
                            version='%(prog)s 1.0')
    return tmp_parser

# glue 대시보드 url 조회
def glueUrl(): 
    try:
        cmd = ssh('-o', 'StrictHostKeyChecking=no', 'ablecube', 'python3', pluginpath+ '/python/url/create_address.py', 'storageCenter').stdout.decode().splitlines()
        dashboard = json.loads(cmd[0])
        if dashboard["code"] != 200:
            return createReturn(code=500, val='nfs.py url error :'+dashboard["val"])
        else:
            return dashboard["val"]
    except Exception as e:
        return createReturn(code=500, val='nfs.py url error :'+e)

# token 생성
def createToken():
    try:
        key = 'Agf3+7aN/pQg0Hw=*NI6nvNtR8v6Oq48oFRifVA==*s3Oqft8USRW87+hxxQ6ZSQ==*8ey7/oGt1bvN5qFJPDHP5A=='
        pw = cryptocode.decrypt(key, 'ablecloud')
        headers = {
            'Accept': 'application/vnd.ceph.api.v1.0+json',
            'Content-Type': 'application/json',
        }
        json_data = {
            'username': 'ablecloud',
            'password': pw,
        }
        url = glueUrl()
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        response = requests.post(url+'/api/auth', headers=headers, json=json_data, verify=False)
        if response.status_code == 201:
            return response.json()['token']
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))
    except Exception as e:
        return createReturn(code=500, val='nfs.py createToken error :'+e)
    
# 이미지 사이즈 변환
def convert_to_bytes(size):
    symbols = 'BKMGTPEZY'
    letter = size[-1:].strip().upper()
    if letter.isdigit():
        letter = 'B'
        num = size
    else:
        num = size[:-1]
    assert num.isdigit() and letter in symbols
    num = float(num)
    prefix = {symbols[0]:1}
    for i, size in enumerate(symbols[1:]):
        prefix[size] = 1 << (i+1)*10
    return int(num * prefix[letter]) 

# task 조회
def taskList():
    try:
        token = createToken()
        headers = {
            'Accept': 'application/vnd.ceph.api.v1.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        url = glueUrl()
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        response = requests.get(url+'/api/task', headers=headers, verify=False)
        if response.status_code == 200:
            return createReturn(code=200, val=json.dumps(response.json(), indent=2))
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))
    except Exception as e:
        return createReturn(code=500, val='nfs.py taskList error :'+e)

# daemon 조회
def daemonList():
    try:
        token = createToken()
        headers = {
            'Accept': 'application/vnd.ceph.api.v1.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        params = {
            'service_name': 'nfs.nfs'
        }
        url = glueUrl()
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        response = requests.get(url+'/api/service/service_name/daemons', headers=headers, params=params, verify=False)
        if response.status_code == 200:
            return createReturn(code=200, val=json.dumps(response.json(), indent=2))
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))
    except Exception as e:
        return createReturn(code=500, val='nfs.py daemonList error :'+e)

# nfs 클러스터 서비스 생성       
def configNfsCluster(args):
    try:
        token = createToken()
        headers = {
            'Accept': 'application/vnd.ceph.api.v1.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        json_data = {
            'service_name': 'nfs.nfs',
            'service_spec': {
                'service_type': 'nfs',
                'placement': {
                    'hosts':['gwvm']
                    },
                'service_id':'nfs'
                }
        }
        url = glueUrl()
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        response = requests.post(url+'/api/service', headers=headers, json=json_data, verify=False)
        if response.status_code == 201:
            return createReturn(code=200, val='nfs service '+args.action+' control success')
        elif response.status_code == 202:
            global cnt
            cnt = 0
            task = json.loads(taskList()).get('val')
            task_json = json.loads(task).get('executing_tasks')
            if len(task_json) > 0:
                while True:
                    for job in task_json:
                        if 'service/create' in job['name']:
                            cnt = cnt+1
                    if cnt == 0:
                        break
            return createReturn(code=200, val='nfs service '+args.action+' control success')
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))
    except Exception as e:
        return createReturn(code=500, val='nfs.py configNfsCluster error :'+e)

# nfs 클러스터 서비스 삭제
def destroyNfsCluster(args):
    try:
        token = createToken()
        exportInfo = json.loads(listNfsExport(args)).get('val')
        nfs = json.loads(exportInfo)
        for num in nfs:
            if '/nfs' in num['path']:
                id = num['export_id']
        # nfs export 삭제
        if id is not None:
            deleteStatus = json.loads(deleteNfsExport(args))
            delCode = deleteStatus.get('code')
            delVal = deleteStatus.get('val')
            if delCode ==200:
                headers = {
                    'Accept': 'application/vnd.ceph.api.v1.0+json',
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
                params = {
                    'service_name': 'nfs.nfs'
                }
                url = glueUrl()
                requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
                response = requests.delete(url+'/api/service/service_name', headers=headers, params=params, verify=False)
                if response.status_code == 204:
                    return createReturn(code=200, val='nfs service '+args.action+' control success')
                elif response.status_code == 202:
                    global cnt
                    cnt = 0      
                    task = json.loads(taskList()).get('val')
                    task_json = json.loads(task).get('executing_tasks')
                    if len(task_json) > 0:
                        while True:
                            for job in task_json:
                                if 'service/delete' in job['name']:
                                    cnt = cnt+1
                            if cnt == 0:
                                break
                    return createReturn(code=200, val='nfs service '+args.action+' control success')
                else:
                    return createReturn(code=500, val=json.dumps(response.json(), indent=2))
            else:
                return createReturn(code=500, val=delVal)
    except Exception as e:
        return createReturn(code=500, val='nfs.py destroyNfsCluster error :'+e)

# nfs 클러스터 서비스 상태 조회
def statusNfsCluster(args):
    try:        
        token = createToken()
        headers = {
            'Accept': 'application/vnd.ceph.api.v1.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        params = {
            'service_name': 'nfs.nfs'
        }
        url = glueUrl()
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        response = requests.get(url+'/api/service', headers=headers, params=params, verify=False)
        if response.status_code == 200:
            return createReturn(code=200, val=json.dumps(response.json(), indent=2))
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))
    except Exception as e:
        return createReturn(code=500, val='nfs.py statusNfsCluster error :'+e)

# nfs export 생성
def createNfsExport(args):
    try:
        token = createToken()
        headers = {
            'Accept': 'application/vnd.ceph.api.v2.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        json_data = {
            'fsal': {
                'name': 'CEPH',
                'fs_name': 'fs',
                'sec_label_xattr': ''
            },
            'cluster_id': 'nfs',
            'path': '/nfs',
            'pseudo': '/nfs',
            'access_type': args.access_type,
            'squash': args.squash,
            'clients':[],
            'security_label': False,
            'protocols': [4],
            'transports': ['TCP']
        }
        url = glueUrl()
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        response = requests.post(url+'/api/nfs-ganesha/export', headers=headers, json=json_data, verify=False)
        if response.status_code == 201:
            if args.quota is not None:
                #fs = check_output(['python3 gluefs.py quota --path /nfs --quota '+args.quota], universal_newlines=True, shell=True, env=env)
                fs = sh.python3(pluginpath + '/python/ceph/gluefs.py','quota', '--path', '/nfs', '--quota', args.quota).stdout.decode()
            return createReturn(code=200, val='nfs service '+args.action+' control success')
        elif response.status_code == 202:
            global cnt
            cnt = 0       
            task = json.loads(taskList()).get('val')
            task_json = json.loads(task).get('executing_tasks')
            if len(task_json) > 0:
                while True:
                    for job in task_json:
                        if 'nfs/create' in job['name']:
                            cnt = cnt+1
                    if cnt == 0:
                        break
            if args.quota is not None:
                #fs = check_output(['python3 gluefs.py quota --path /nfs --quota '+args.quota], universal_newlines=True, shell=True, env=env)
                fs = sh.python3(pluginpath + '/python/ceph/gluefs.py','quota', '--path', '/nfs', '--quota', args.quota).stdout.decode()
            return createReturn(code=200, val='nfs service '+args.action+' control success')
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))    
    except Exception as e:
        return createReturn(code=500, val='nfs.py createNfsExport error :'+e)

# nfs export 삭제
def deleteNfsExport(args):
    try:
        exportInfo = json.loads(listNfsExport(args)).get('val')
        nfs = json.loads(exportInfo)
        for num in nfs:
            if '/nfs' in num['path']:
                id = num['export_id']
        token = createToken()
        headers = {
            'Accept': 'application/vnd.ceph.api.v2.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        params = {
            'cluster_id': 'nfs',
            'export_id': id
        }
        url = glueUrl()
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        response = requests.delete(url+'/api/nfs-ganesha/export/cluster_id/export_id', headers=headers, params=params, verify=False)
        if response.status_code == 204:
            return createReturn(code=200, val='nfs service '+args.action+' control success')
        elif response.status_code == 202:
            global cnt
            cnt = 0       
            task = json.loads(taskList()).get('val')
            task_json = json.loads(task).get('executing_tasks')
            if len(task_json) > 0:
                while True:
                    for job in task_json:
                        if 'nfs/delete' in job['name']:
                            cnt = cnt+1
                    if cnt == 0:
                        break
            return createReturn(code=200, val='nfs service '+args.action+' control success')
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))
    except Exception as e:
        return createReturn(code=500, val='nfs.py deleteNfsExport error :'+e)

# nfs export 편집
def editNfsExport(args):
    try:
        exportInfo = json.loads(listNfsExport(args)).get('val')
        nfs = json.loads(exportInfo)
        for num in nfs:
            if '/nfs' in num['path']:
                id = num['export_id']
        token = createToken()
        headers = {
            'Accept': 'application/vnd.ceph.api.v2.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        params = {
            'cluster_id': 'nfs',
            'export_id': id
        }
        json_data = {
            'fsal': {
                'name': 'CEPH',
                'fs_name': 'fs',
                'sec_label_xattr': ''
            },
            'path': '/nfs',
            'pseudo': '/nfs',
            'access_type': args.access_type,
            'squash': args.squash,
            'clients':[],
            'security_label': False,
            'export_id': id,
            'protocols': [4],
            'transports': ['TCP']
        }
        url = glueUrl()
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        response = requests.put(url+'/api/nfs-ganesha/export/cluster_id/export_id', headers=headers, params=params, json=json_data, verify=False)
        if response.status_code == 200:
            if args.quota is not None:
                #fs = check_output(['python3 gluefs.py quota --path /nfs --quota '+args.quota], universal_newlines=True, shell=True, env=env)
                fs = sh.python3(pluginpath + '/python/ceph/gluefs.py','quota', '--path', '/nfs', '--quota', args.quota).stdout.decode()
            return createReturn(code=200, val='nfs service '+args.action+' control success')
        elif response.status_code == 202:
            global cnt
            cnt = 0        
            task = json.loads(taskList()).get('val')
            task_json = json.loads(task).get('executing_tasks')
            if len(task_json) > 0:
                while True:
                    for job in task_json:
                        if 'nfs/edit' in job['name']:
                            cnt = cnt+1
                    if cnt == 0:
                        break
            if args.quota is not None:
                #fs = check_output(['python3 gluefs.py quota --path /nfs --quota '+args.quota], universal_newlines=True, shell=True, env=env)
                fs = sh.python3(pluginpath + '/python/ceph/gluefs.py','quota', '--path', '/nfs', '--quota', args.quota).stdout.decode()
            return createReturn(code=200, val='nfs service '+args.action+' control success')
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))    
    except Exception as e:
        return createReturn(code=500, val='nfs.py editNfsExport error :'+e)

# nfs export 목록 조회
def listNfsExport(args):
    try:        
        token = createToken()
        headers = {
            'Accept': 'application/vnd.ceph.api.v1.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        url = glueUrl()
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        response = requests.get(url+'/api/nfs-ganesha/export', headers=headers, verify=False)
        if response.status_code == 200:
            return createReturn(code=200, val=json.dumps(response.json(), indent=2))
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))
    except Exception as e:
        return createReturn(code=500, val='nfs.py listNfsExport error :'+e)

# nfs export 상세 조회 
def detailNfsExport(args):
    try:
        exportInfo = json.loads(listNfsExport(args)).get('val')
        nfs = json.loads(exportInfo)
        for num in nfs:
            if '/nfs' in num['path']:
                id = num['export_id']
        token = createToken() 
        headers = {
            'Accept': 'application/vnd.ceph.api.v1.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        params = {
            'cluster_id': 'nfs',
            'export_id': id
        }
        url = glueUrl()
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        response = requests.get(url+'/api/nfs-ganesha/export/cluster_id/export_id', headers=headers, params=params, verify=False)
        if response.status_code == 200:
            return createReturn(code=200, val=json.dumps(response.json(), indent=2))
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))  
    except Exception as e:
        return createReturn(code=500, val='nfs.py detailNfsExport error :'+e)

# nfs 서비스 제어    
def controlDaemon(args):
    try:        
        token = createToken()
        headers = {
            'Accept': 'application/vnd.ceph.api.v0.1+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        daemonInfo = json.loads(daemonList()).get('val')
        daemon = json.loads(daemonInfo)
        for num in daemon:
            status = num['status_desc']
            name = num['daemon_name']
        params = {
            'daemon_name': name
        }
        json_data = {
            'action': args.control,
            'container_image': ''
        }
        url = glueUrl()
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        response = requests.put(url+'/api/daemon/daemon_name', headers=headers, params=params, json=json_data, verify=False)
        if response.status_code == 200:
            return createReturn(code=200, val=json.dumps(response.json(), indent=2))
        elif response.status_code == 202:
            global cnt
            cnt = 0    
            while True:
                redaemonInfo = json.loads(daemonList()).get('val')
                redaemon = json.loads(redaemonInfo)
                for renum in redaemon:
                    if status != renum['status_desc']:
                        cnt = cnt+1
                if cnt != 0:
                    break
            return createReturn(code=200, val='nfs service '+args.action+' control success')     
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))
    except Exception as e:
        return createReturn(code=500, val='nfs.py controlDaemon error :'+e)

# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    # parser 생성
    parser = createArgumentParser()
    # input 파싱
    args = parser.parse_args()
    # 파싱된 argument 출력

    verbose = (5 - args.verbose) * 10

    # 로깅을 위한 logger 생성, 모든 인자에 default 인자가 있음.
    logger = createLogger(loggername='nfs', verbosity=verbose, log_file='nfs.log',
                          file_log_level=logging.ERROR)

    # 실제 로직 부분 호출 및 결과 출력
    if (args.action) == 'config':
        print(configNfsCluster(args))
    elif (args.action) == 'destroy':
        print(destroyNfsCluster(args))
    elif (args.action) == 'status':
        print(statusNfsCluster(args))
    elif (args.action) == 'create':
        print(createNfsExport(args))
    elif (args.action) == 'delete':
        print(deleteNfsExport(args))
    elif (args.action) == 'edit':
        print(editNfsExport(args))
    elif (args.action) == 'list':
        print(listNfsExport(args))
    elif (args.action) == 'detail':
        print(detailNfsExport(args))
    elif (args.action) == 'daemon':
        print(controlDaemon(args))
