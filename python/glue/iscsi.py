'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : iscsi 게이트웨이 및 타겟 액션을 관리
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
import socket
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
    tmp_parser = argparse.ArgumentParser(description='iSCSI 관련 기능을 수행하는 프로그램',
                                         epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')

    # 인자 추가: https://docs.python.org/ko/3/library/argparse.html#the-add-argument-method

    # 선택지 추가(동작 선택)
    tmp_parser.add_argument('action', choices=['config', 'destroy', 'status', 'list', 'detail', 'create', 'delete', 'edit', 'image', 'daemon'], help='iSCSI gateway and target action')
    tmp_parser.add_argument('--iqn', metavar='target iqn', type=str, help='iSCSI target iqn')
    tmp_parser.add_argument('--name', metavar='image name', type=str, help='rbd 이미지 이름')
    tmp_parser.add_argument('--size',metavar='image size', type=str, help='rbd 이미지 크기')
    tmp_parser.add_argument('--control',metavar='daemon control', type=str, help='iSCSI Daemon 서비스 제어')

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
        if dashboard['code'] != 200:
            return createReturn(code=500, val='nfs.py url error :'+dashboard['val'])
        else:
            return dashboard['val']
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
        return createReturn(code=500, val='iscsi.py createToken error :'+e)

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
        return createReturn(code=500, val='iscsi.py taskList error :'+e)
    
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
            'service_name': 'iscsi.iscsi'
        }
        url = glueUrl()
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        response = requests.get(url+'/api/service/service_name/daemons', headers=headers, params=params, verify=False)
        if response.status_code == 200:
            return createReturn(code=200, val=json.dumps(response.json(), indent=2))
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))
    except Exception as e:
        return createReturn(code=500, val='iscsi.py daemonList error :'+e)

# iSCSI 게이트웨이 생성     
def configIscsi(args):
    try:
        token = createToken()
        headers = {
            'Accept': 'application/vnd.ceph.api.v1.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        json_data = {
            'service_name': 'iscsi.iscsi',
            'service_spec': {
                'service_type': 'iscsi',
                'service_id': 'iscsi',
                'trusted_ip_list': 'gwvm',
                'pool': 'rbd',
                'placement': {
                    'hosts': ['gwvm']
                },
                'api_password': 'Ablecloud1!',
                'api_port': '5050',
                'api_secure': False,
                'api_user': 'ablecloud'
            }
        }
        url = glueUrl()
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        response = requests.post(url+'/api/service', headers=headers, json=json_data, verify=False)
        if response.status_code == 201:
            return createReturn(code=200, val='iscsi service '+args.action+' control success')
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
            return createReturn(code=200, val='iscsi service '+args.action+' control success')
    except Exception as e:
        return createReturn(code=500, val='iscsi.py configIscsi error :'+e)

# iSCSI 게이트웨이 삭제
def destroyIscsi(args):
    try:
        token = createToken()
        headers = {
            'Accept': 'application/vnd.ceph.api.v1.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        params = {
            'service_name': 'iscsi.iscsi'
        }
        url = glueUrl()
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        response = requests.delete(url+'/api/service/service_name', headers=headers, params=params, verify=False)
        if response.status_code == 204:
            return createReturn(code=200, val='iscsi service '+args.action+' control success')
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
            return createReturn(code=200, val='iscsi service '+args.action+' control success')
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))

    except Exception as e:
        return createReturn(code=500, val='iscsi.py destroyIscsi error :'+e)

# iSCSI 서비스 상태 조회
def statusIscsi(args):
    try:        
        token = createToken()
        headers = {
            'Accept': 'application/vnd.ceph.api.v1.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        params = {
            'service_name': 'iscsi.iscsi'
        }
        url = glueUrl()
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        response = requests.get(url+'/api/service', headers=headers, params=params, verify=False)
        if response.status_code == 200:
            return createReturn(code=200, val=json.dumps(response.json(), indent=2))
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))
    except Exception as e:
        return createReturn(code=500, val='iscsi.py statusNfsCluster error :'+e)

# iSCSI Target 목록 조회
def listTarget(args):
    try:        
        token = createToken()
        headers = {
            'Accept': 'application/vnd.ceph.api.v1.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        url = glueUrl()
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        response = requests.get(url+'/api/iscsi/target', headers=headers, verify=False)
        if response.status_code == 200:
            return createReturn(code=200, val=json.dumps(response.json(), indent=2))
        else:
            # gateway 방화벽 5050 포트 열려있지 않은 경우
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))
    except Exception as e:
        return createReturn(code=500, val='iscsi.py listTarget error :'+e)

# iSCSI Target 상세 조회
def detailTarget(args):
    try:
        token = createToken() 
        headers = {
            'Accept': 'application/vnd.ceph.api.v1.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        params = {
            'target_iqn': args.iqn
        }
        url = glueUrl()
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        response = requests.get(url+'/api/iscsi/target/target_iqn', headers=headers, params=params, verify=False)
        if response.status_code == 200:
            return createReturn(code=200, val=json.dumps(response.json(), indent=2))
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))  
    except Exception as e:
        return createReturn(code=500, val='iscsi.py detailTarget error :'+e)
    
# iSCSI Target 생성
def createTarget(args):
    try:
        token = createToken()
        headers = {
            'Accept': 'application/vnd.ceph.api.v1.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        # 이미지 조회
        imageInfo = listImage(args)
        url = glueUrl()
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        # 이미지 없는 경우 생성
        if imageInfo is None:
            json_data = {
                'name': args.name,
                'pool_name': 'rbd',
                'size': convert_to_bytes(args.size),
                'namespace': '',
                'schedule_interval': '',
                'obj_size': 4194304,
                'features': [
                    'deep-flatten', 'layering', 'exclusive-lock', 'object-map', 'fast-diff'
                ],
                'stripe_unit': 4194304,
                'stripe_count': 1,
                'data_pool': '',
                'configuration': {}
            }
            response = requests.post(url+'/api/block/image', headers=headers, json=json_data, verify=False)
            if response.status_code == 201 or 202:
                while True:
                    imageInfo = listImage(args)
                    if imageInfo is not None:
                        break
            else:
                return createReturn(code=500, val=json.dumps(response.json(), indent=2))
        # target 생성
        json_data = {
            'portals': [
                { 
                    'host' : 'gwvm',
                    'ip' : socket.gethostbyname('gwvm-mngt')
                }
            ],
            'disks' :[
                {
                    'pool': 'rbd',
                    'image': args.name,
                    'backstore': 'user:rbd',
                    'controls': {},
                    'lun': 0
                }
            ],
            'target_iqn': args.iqn,
            'target_controls': {},
            'acl_enabled': False,
            'clients': [],
            'groups': [],
            'auth': {
                'user': '',
                'password': '',
                'mutual_user': '',
                'mutual_password': ''
            }
        }
        response = requests.post(url+'/api/iscsi/target', headers=headers, json=json_data, verify=False)
        if response.status_code == 201:
            return createReturn(code=200, val='iscsi service '+args.action+' control success')
        elif response.status_code == 202:
            global cnt
            cnt = 0   
            task = json.loads(taskList()).get('val')
            task_json = json.loads(task).get('executing_tasks')
            if len(task_json) > 0:
                while True:
                    for job in task_json:
                        if 'iscsi/target/create' in job['name']:
                            cnt = cnt+1
                    if cnt == 0:
                        break
            return createReturn(code=200, val='iscsi service '+args.action+' control success')
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))      
    except Exception as e:
        return createReturn(code=500, val='iscsi.py createTarget error :'+e)

# iSCSI Target 삭제 (이미지 삭제)
def deleteTarget(args):
    try:
        token = createToken()
        headers = {
            'Accept': 'application/vnd.ceph.api.v1.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        params = {
            'target_iqn': args.iqn
        }
        url = glueUrl()
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        response = requests.delete(url+'/api/iscsi/target/target_iqn', headers=headers, params=params, verify=False)
        global cnt
        cnt = 0
        if response.status_code == 204:
            if args.name is not None:
                params = {
                    'image_spec': 'rbd/'+args.name
                }
                response = requests.delete(url+'/api/block/image/image_spec', headers=headers, params=params, verify=False)
                if response.status_code == 204:
                    return createReturn(code=200, val='iscsi service '+args.action+' control success')
                elif response.status_code == 202:  
                    task = json.loads(taskList()).get('val')
                    task_json = json.loads(task).get('executing_tasks')
                    if len(task_json) > 0:
                        while True:
                            for job in task_json:
                                if 'rbd/delete' in job['name']:
                                    cnt = cnt+1
                            if cnt == 0:
                                break
                    return createReturn(code=200, val='iscsi service '+args.action+' control success')
                else:
                    return createReturn(code=500, val=json.dumps(response.json(), indent=2))
        elif response.status_code == 202:   
            task = json.loads(taskList()).get('val')
            task_json = json.loads(task).get('executing_tasks')
            if len(task_json) > 0:
                while True:
                    for job in task_json:
                        if 'iscsi/target/delete' in job['name']:
                            cnt = cnt+1
                    if cnt == 0:
                        break
            if args.name is not None:
                params = {
                    'image_spec': 'rbd/'+args.name
                }
                response = requests.delete(url+'/api/block/image/image_spec', headers=headers, params=params, verify=False)
                if response.status_code == 204:
                    return createReturn(code=200, val='iscsi service '+args.action+' control success')
                elif response.status_code == 202:   
                    task = json.loads(taskList()).get('val')
                    task_json = json.loads(task).get('executing_tasks')
                    if len(task_json) > 0:
                        while True:
                            for job in task_json:
                                if 'rbd/delete' in job['name']:
                                    cnt = cnt+1
                            if cnt == 0:
                                break
                    return createReturn(code=200, val='iscsi service '+args.action+' control success')
                else:
                    return createReturn(code=500, val=json.dumps(response.json(), indent=2))
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))    
    except Exception as e:
        return createReturn(code=500, val='iscsi.py deleteTarget error :'+e)

# iSCSI Target 편집 (이미지 크기 변경)
def editTarget(args):
    try:
        token = createToken()
        headers = {
            'Accept': 'application/vnd.ceph.api.v1.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        params = {
            'image_spec': 'rbd/'+args.name
        }
        json_data = {
            'features':[
                'deep-flatten', 'layering', 'exclusive-lock', 'object-map', 'fast-diff'
            ],
            'remove_scheduling': False,
            'name': args.name,
            'schedule_interval': '',
            'size': convert_to_bytes(args.size),
            'enable_mirror': False,
            'configuration': {}
        }
        url = glueUrl()
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        response = requests.put(url+'/api/block/image/image_spec', headers=headers, params=params, json=json_data, verify=False)
        if response.status_code == 200:
            return createReturn(code=200, val='iscsi service '+args.action+' control success')
        elif response.status_code == 202:
            global cnt
            cnt = 0    
            task = json.loads(taskList()).get('val')
            task_json = json.loads(task).get('executing_tasks')
            if len(task_json) > 0:
                while True:
                    for job in task_json:
                        if 'rbd/edit' in job['name']:
                            cnt = cnt+1
                    if cnt == 0:
                        break
            return createReturn(code=200, val='iscsi service '+args.action+' control success')
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))        
    except Exception as e:
        return createReturn(code=500, val='iscsi.py editTarget error :'+e)

# rbd 이미지 조회
def listImage(args):
    try:        
        token = createToken()
        headers = {
            'Accept': 'application/vnd.ceph.api.v2.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        params = {
            'pool_name': 'rbd',
            'offset': 0,
            'limit': -1,
            'search': args.name,
            'sort': 'name'
        }
        url = glueUrl()
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        response = requests.get(url+'/api/block/image', headers=headers, params=params, verify=False)
        if response.status_code == 200:
            # rbd 이미지 상세 조회
            if args.name is not None:
                image = json.loads(json.dumps(response.json(), indent=2))
                for dev in image:
                    for i in dev['value']:
                        if args.name == i['name']:
                            return createReturn(code=200, val=json.dumps(i, indent=2))
            else:
                return createReturn(code=200, val=json.dumps(response.json(), indent=2))
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))
    except Exception as e:
        return createReturn(code=500, val='iscsi.py listImage error :'+e)

# iscsi 서비스 제어      
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
            return createReturn(code=200, val='iscsi service '+args.action+' control success')     
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))
    except Exception as e:
        return createReturn(code=500, val='iscsi.py controlDaemon error :'+e)

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
        print(configIscsi(args))
    elif (args.action) == 'destroy':
        print(destroyIscsi(args))
    elif (args.action) == 'status':
        print(statusIscsi(args))
    elif (args.action) == 'list':
        print(listTarget(args))
    elif (args.action) == 'detail':
        print(detailTarget(args))
    elif (args.action) == 'create':
        print(createTarget(args))
    elif (args.action) == 'delete':
        print(deleteTarget(args))
    elif (args.action) == 'edit':
        print(editTarget(args))
    elif (args.action) == 'image':
        print(listImage(args))
    elif (args.action) == 'daemon':
        print(controlDaemon(args))
