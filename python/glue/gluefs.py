'''
Copyright (c) 2021 ABLECLOUD Co. Ltd
설명 : 파일시스템 및 glueFS 액션을 관리
최초 작성일 : 2023. 05.25
'''

#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import logging
import os
import json
import sh
import socket
import requests

from ablestack import *
from sh import ssh
from subprocess import check_output
from requests.packages.urllib3.exceptions import InsecureRequestWarning

env=os.environ.copy()
env['LANG']='en_US.utf-8'
env['LANGUAGE']='en'
cluster_file_path = pluginpath+"/tools/properties/cluster.json"

def createArgumentParser():
    """
    입력된 argument를 파싱하여 dictionary 처럼 사용하게 만들어 주는 parser를 생성하는 함수

    :return: argparse.ArgumentParser
    """
    # 참조: https://docs.python.org/ko/3/library/argparse.html
    # 프로그램 설명
    tmp_parser = argparse.ArgumentParser(description='glueFS 관련 기능을 수행하는 프로그램',
                                         epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')

    # 인자 추가: https://docs.python.org/ko/3/library/argparse.html#the-add-argument-method

    # 선택지 추가(동작 선택)
    tmp_parser.add_argument('action', choices=['config', 'destroy', 'status', 'list', 'detail', 'delete', 'edit', 'quota', 'mount'], help='glueFS action')
    tmp_parser.add_argument('--type', metavar='fs type', type=str, help='gluefs, smb, nfs 중 파일시스템 타입')
    tmp_parser.add_argument('--path', metavar='gluefs path', type=str, help='gluefs 경로')
    tmp_parser.add_argument('--quota', metavar='gluefs quota max bytes', default='0', help='gluefs 쿼터 최대 크기 (Bytes)')
    tmp_parser.add_argument('--target', metavar='mount target', type=str, help='host, gwvm 중 마운트 대상')
    tmp_parser.add_argument('--mount-path', metavar='mount path', type=str, help='마운트 경로')

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
            return createReturn(code=500, val='gluefs.py url error :'+dashboard["val"])
        else:
            return dashboard["val"]
    except Exception as e:
        return createReturn(code=500, val='gluefs.py url error :'+e)

# token 생성
def createToken():
    try:
        headers = {
            'Accept': 'application/vnd.ceph.api.v1.0+json',
            'Content-Type': 'application/json',
        }
        json_data = {
            'username': 'ablecloud',
            'password': 'Ablecloud1!',
        }
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
        url = glueUrl()
        response = requests.post(url+'/api/auth', headers=headers, json=json_data, verify=False)
        if response.status_code == 201:
            return response.json()['token']
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))
    except Exception as e:
        return createReturn(code=500, val='gluefs.py createToken error :'+e)
    
# cluster.json 파일의 호스트 정보
def openClusterJson():
    try:
        host_list=[]
        cmd = ssh('-o', 'StrictHostKeyChecking=no', 'ablecube', 'cat', cluster_file_path, '|', 'grep', '-w', 'hostname', '|', 'awk', "'{print $2}'").stdout.decode().splitlines()
        for line in cmd:
            host = str(line).strip(',''""')
            host_list.append(host)
        return host_list
    except Exception as e:
        return createReturn(code=500, val='cluster.json read error :'+e)

# fs 구성 (nfs, smb, gluefs 구성하는 경우)      
def configFs(args):
    try:
        ########### 구성 여부 확인  ###########
        # MDS 상태 확인 (MDS Running 수)
        mds_cnt = 0
        mds = json.loads(statusFs(args)).get('val')
        mds_json = json.loads(mds)
        for num in mds_json:
            if num['service_name'] is not None:
                if 'mds.fs' in num['service_name']:
                    mds_cnt = num['status']['running']
        # 파일 시스템 리스트 확인 (fs 생성 되어있는 경우 1, 생성 되어있지 않은 경우 0)
        fs_cnt = 0
        fs = json.loads(listFs(args)).get('val')
        fs_json = json.loads(fs)
        for num in fs_json:
            if 'fs' in num['mdsmap']['fs_name']:
                fs_cnt = 1
        # 호스트 정보 조회
        json_data = openClusterJson()
        ########### 초기 구성인 경우  ###########
        if mds_cnt == 0 and fs_cnt == 0:
            # MDS, FS생성
            fs = check_output(['ceph fs volume create fs --placement="2 label:scvm"'], universal_newlines=True, shell=True, env=env)
            # MDS 상태 확인
            while True:
                mds_status = json.loads(statusFs(args)).get('val')
                mds_st = json.loads(mds_status)
                for num in mds_st:
                    if num['service_name'] is not None:
                        if 'mds.fs' in num['service_name']:
                            cnt = num['status']['running']
                if cnt == 2:
                    break
            # 초기 구성 - gluefs 구성
            if args.type == 'gluefs':
                # 호스트 ceph 마운트하여 /gluefs 디폴트 경로 생성한후 마운트 해제
                ssh('-o', 'StrictHostKeyChecking=no', 'ablecube', 'mkdir', '-p', args.mount_path).stdout.decode().splitlines()
                ssh('-o', 'StrictHostKeyChecking=no', 'ablecube', 'mount', '-t', 'ceph', 'admin@.fs=/', args.mount_path).stdout.decode().splitlines()
                ssh('-o', 'StrictHostKeyChecking=no', 'ablecube', 'mkdir', '-p', args.mount_path+'/gluefs').stdout.decode().splitlines()
                ssh('-o', 'StrictHostKeyChecking=no', 'ablecube', 'umount', '-f', '-l',args.mount_path).stdout.decode().splitlines()
                ssh('-o', 'StrictHostKeyChecking=no', 'ablecube', 'rm', '-rf', args.mount_path).stdout.decode().splitlines()
                secret = ssh('-o', 'StrictHostKeyChecking=no', 'ablecube', 'cat', '/etc/ceph/ceph.client.admin.keyring', '|', 'awk', "'{print $3}'").stdout.decode().splitlines()
                cmd = socket.gethostbyname('scvm1')+':6789,'+socket.gethostbyname('scvm2')+':6789,'+socket.gethostbyname('scvm3')+':6789:/gluefs\t'+args.mount_path+'\tceph\tname=admin,secret='+secret[1]+',noatime,_netdev\t0 0'
                # gluefs의 경우 모든 호스트에 마운트 경로 생성, ceph 마운트, /etc/fstab 추가
                for host in json_data:
                    ssh('-o', 'StrictHostKeyChecking=no', host, 'mkdir', '-p', args.mount_path).stdout.decode().splitlines()
                    ssh('-o', 'StrictHostKeyChecking=no', host, 'mount', '-t', 'ceph', 'admin@.fs=/gluefs', args.mount_path).stdout.decode().splitlines()
                    ssh('-o', 'StrictHostKeyChecking=no', host, 'sed', '-i', "'$ a "+cmd+"'", '/etc/fstab').stdout.decode().splitlines()
            # 초기 구성 - nfs, smb 구성
            else:
                # gwvm ceph 마운트
                ssh('-o', 'StrictHostKeyChecking=no', 'gwvm-mngt', 'mkdir', '-p', '/fs').stdout.decode().splitlines()
                ssh('-o', 'StrictHostKeyChecking=no', 'gwvm-mngt', 'mount', '-t', 'ceph', 'admin@.fs=/', '/fs').stdout.decode().splitlines()
                # 마운트 상태 체크
                while True:
                    status = ssh('-o', 'StrictHostKeyChecking=no', 'gwvm-mngt', '/usr/bin/df', '-Th', '|', 'grep', 'ceph','|', 'awk', "'{print $7}'").stdout.decode().splitlines()
                    if len(status) != 0:
                        break
                # 디렉토리 생성
                ssh('-o', 'StrictHostKeyChecking=no', 'gwvm-mngt', 'mkdir', '-p', '/fs/gluefs').stdout.decode().splitlines()
                ssh('-o', 'StrictHostKeyChecking=no', 'gwvm-mngt', 'mkdir', '-p', '/fs/nfs').stdout.decode().splitlines()
                ssh('-o', 'StrictHostKeyChecking=no', 'gwvm-mngt', 'mkdir', '-p', '/fs/smb').stdout.decode().splitlines()
                # /etc/fstab 추가
                secret = ssh('-o', 'StrictHostKeyChecking=no', 'gwvm-mngt', 'cat', '/etc/ceph/ceph.client.admin.keyring', '|', 'awk', "'{print $3}'").stdout.decode().splitlines()
                cmd = socket.gethostbyname('scvm1')+':6789,'+socket.gethostbyname('scvm2')+':6789,'+socket.gethostbyname('scvm3')+':6789:/gluefs\t/fs\tceph\tname=admin,secret='+secret[1]+',noatime,_netdev\t0 0'
                ssh('-o', 'StrictHostKeyChecking=no', 'gwvm-mngt', 'sed', '-i', "'$ a "+cmd+"'", '/etc/fstab').stdout.decode().splitlines()
            # quota 지정
            if args.quota is not None:
                args.path = '/'+args.type
                job = json.loads(quotaFs(args))
                code = job.get('code')
                value = job.get('val')
                if code != 200:
                    return createReturn(code=500, val=value)
            return createReturn(code=200, val='gluefs service '+args.action+' control success')
        ########### fs가 생성되어 있는 경우  ###########
        if fs_cnt == 1 and mds_cnt >= 1: 
            if args.type == 'gluefs':
                secret = ssh('-o', 'StrictHostKeyChecking=no', 'ablecube', 'cat', '/etc/ceph/ceph.client.admin.keyring', '|', 'awk', "'{print $3}'").stdout.decode().splitlines()
                cmd = socket.gethostbyname('scvm1')+':6789,'+socket.gethostbyname('scvm2')+':6789,'+socket.gethostbyname('scvm3')+':6789:/gluefs\t'+args.mount_path+'\tceph\tname=admin,secret='+secret[1]+',noatime,_netdev\t0 0'
                # gluefs의 경우 모든 호스트에 마운트 경로 생성, ceph 마운트, /etc/fstab 추가
                for host in json_data:
                    ssh('-o', 'StrictHostKeyChecking=no', host, 'mkdir', '-p', args.mount_path).stdout.decode().splitlines()
                    ssh('-o', 'StrictHostKeyChecking=no', host, 'mount', '-t', 'ceph', 'admin@.fs=/gluefs', args.mount_path).stdout.decode().splitlines()
                    ssh('-o', 'StrictHostKeyChecking=no', host, 'sed', '-i', "'$ a "+cmd+"'", '/etc/fstab').stdout.decode().splitlines()           
            else:
                # gwvm 마운트 상태 조회
                mount = ssh('-o', 'StrictHostKeyChecking=no', 'gwvm-mngt', '/usr/bin/df', '-Th', '|', 'grep', 'ceph','|', 'awk', "'{print $7}'").stdout.decode().splitlines()
                if len(mount) == 0:
                    ### nfs, smb의 경우 gwvm ceph 마운트
                    ssh('-o', 'StrictHostKeyChecking=no', 'gwvm-mngt', 'mkdir', '-p', '/fs').stdout.decode().splitlines()
                    ssh('-o', 'StrictHostKeyChecking=no', 'gwvm-mngt', 'mount', '-t', 'ceph', 'admin@.fs=/', '/fs').stdout.decode().splitlines()
                    # 마운트 상태 체크
                    while True:
                        status = ssh('-o', 'StrictHostKeyChecking=no', 'gwvm-mngt', '/usr/bin/df', '-Th', '|', 'grep', 'ceph','|', 'awk', "'{print $7}'").stdout.decode().splitlines()
                        if len(status) != 0:
                            break
                    # 디렉토리 생성
                    ssh('-o', 'StrictHostKeyChecking=no', 'gwvm-mngt', 'mkdir', '-p', '/fs/nfs').stdout.decode().splitlines()
                    ssh('-o', 'StrictHostKeyChecking=no', 'gwvm-mngt', 'mkdir', '-p', '/fs/smb').stdout.decode().splitlines()
                    # /etc/fstab 추가
                    secret = ssh('-o', 'StrictHostKeyChecking=no', 'gwvm-mngt', 'cat', '/etc/ceph/ceph.client.admin.keyring', '|', 'awk', "'{print $3}'").stdout.decode().splitlines()
                    cmd = socket.gethostbyname('scvm1')+':6789,'+socket.gethostbyname('scvm2')+':6789,'+socket.gethostbyname('scvm3')+':6789:/gluefs\t/fs\tceph\tname=admin,secret='+secret[1]+',noatime,_netdev\t0 0'
                    ssh('-o', 'StrictHostKeyChecking=no', 'gwvm-mngt', 'sed', '-i', "'$ a "+cmd+"'", '/etc/fstab').stdout.decode().splitlines()
            # quota 지정
            if args.quota is not None:
                args.path = '/'+args.type
                job = json.loads(quotaFs(args))
                code = job.get('code')
                value = job.get('val')
                if code != 200:
                    return createReturn(code=500, val=value)
            return createReturn(code=200, val='gluefs service '+args.action+' control success')
    except Exception as e:
        # 에러 시 fs 제거
        destroyFs(args)
        return createReturn(code=500, val='gluefs.py configFs error :'+e)

# fs 제거
def destroyFs(args):
    try:
        check_output(['ceph config set mon mon_allow_pool_delete true'], universal_newlines=True, shell=True, env=env)
        check_output(['ceph fs volume rm fs --yes-i-really-mean-it'], universal_newlines=True, shell=True, env=env)
    except Exception as e:
        return createReturn(code=500, val='gluefs.py destroyFs error :'+e)

# MDS 서비스 상태 조회  
def statusFs(args):
    try:
        token = createToken()
        headers = {
            'Accept': 'application/vnd.ceph.api.v1.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        params = {
            'service_name': 'mds.fs'
        }
        url = glueUrl()
        response = requests.get(url+'/api/service', headers=headers, params=params, verify=False)
        if response.status_code == 200:
            return createReturn(code=200, val=json.dumps(response.json(), indent=2))
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))
    except Exception as e:
        return createReturn(code=500, val='gluefs.py statusFs error :'+e)

# fs 조회
def listFs(args):
    try: 
        token = createToken()
        headers = {
            'Accept': 'application/vnd.ceph.api.v1.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        url = glueUrl()
        response = requests.get(url+'/api/cephfs', headers=headers, verify=False)
        if response.status_code == 200:
            return createReturn(code=200, val=json.dumps(response.json(), indent=2))
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))
    except Exception as e:
        return createReturn(code=500, val='gluefs.py listFs error :'+e)
    
# fs 상세 조회
def detailFs(args):
    try:
        fsInfo = json.loads(listFs(args)).get('val')
        fs = json.loads(fsInfo)
        for num in fs:
            if 'fs' in num['mdsmap']['fs_name']:
                id = num['id']
        token = createToken()
        headers = {
            'Accept': 'application/vnd.ceph.api.v1.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        params = {
            'fs_id': id,
        }
        url = glueUrl()
        response = requests.get(url+'/api/cephfs/fs_id', headers=headers, params=params, verify=False)
        if response.status_code == 200:
            return createReturn(code=200, val=json.dumps(response.json(), indent=2))
        else:
            return createReturn(code=500, val=json.dumps(response.json(), indent=2))
    except Exception as e:
        return createReturn(code=500, val='gluefs.py detailFs error :'+e)

# quota 조회 및 편집
def quotaFs(args):
    try: 
        token = createToken()
        headers = {
            'Accept': 'application/vnd.ceph.api.v1.0+json',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        # quota 조회
        if args.path is None:
            fsInfo = json.loads(detailFs(args)).get('val')
            id = json.loads(fsInfo)['cephfs']['id']
            params = {
                'fs_id': id,
                'path': '/',
                'depth': 1
            }
            url = glueUrl()
            response = requests.get(url+'/api/cephfs/fs_id/ls_dir', headers=headers, params=params, verify=False)
            if response.status_code == 200:
                return createReturn(code=200, val=json.dumps(response.json(), indent=2))
            else:
                return createReturn(code=500, val=json.dumps(response.json(), indent=2))
        # quota 편집
        else:
            if args.path != '/gluefs':
                ssh('-o', 'StrictHostKeyChecking=no', 'gwvm-mngt', 'setfattr -n ceph.quota.max_bytes -v '+args.quota+ ' /fs/'+args.path).stdout.decode().splitlines()  
            else:
                path = mouontGlueFs(args)
                if path != '':
                    ssh('-o', 'StrictHostKeyChecking=no', 'ablecube', 'setfattr -n ceph.quota.max_bytes -v '+args.quota+' '+path).stdout.decode().splitlines()
                else:
                    return createReturn(code=500, val='gluefs.py quotaFs error : ceph is not mounted on the host.')
            return createReturn(code=200, val='gluefs service '+args.action+' control success')
    except Exception as e:
        return createReturn(code=500, val='gluefs.py quotaFs error :'+str(e))

# glueFS 마운트 경로 조회
def mouontGlueFs(args):
    try:
        path = ssh('-o', 'StrictHostKeyChecking=no', 'ablecube', '/usr/bin/df', '-Th', '|', 'grep', 'ceph','|', 'awk', "'{print $7}'").stdout.decode().splitlines()
        if len(path) != 0:
            return path[0]
        else:
            return ''
    except Exception as e:
        return createReturn(code=500, val='gluefs.py mouontGlueFs error :'+e)

# gluefs 편집
def editGlueFs(args):
    try:
        json_data = openClusterJson()
        # 모든 호스트 마운트 경로 및 /etc/fstab 수정
        if args.mount_path is not None:
            path = mouontGlueFs(args)
            for host in json_data:
                ssh('-o', 'StrictHostKeyChecking=no', host, 'umount', '-f', '-l', path).stdout.decode().splitlines()
                ssh('-o', 'StrictHostKeyChecking=no', host, 'mkdir', '-p', args.mount_path).stdout.decode().splitlines()
                ssh('-o', 'StrictHostKeyChecking=no', host, 'mount', '-t', 'ceph', 'admin@.fs=/gluefs', args.mount_path).stdout.decode().splitlines()
                ssh('-o', 'StrictHostKeyChecking=no', host, 'sed', '-i', "'s|"+path+"|"+args.mount_path+"|g'", '/etc/fstab').stdout.decode().splitlines()
        # quota 변경
        if args.quota is not None:
            args.path = '/gluefs'
            job = json.loads(quotaFs(args))
            code = job.get('code')
            value = job.get('val')
            if code != 200:
                return createReturn(code=500, val=value)
        return createReturn(code=200, val='gluefs service '+args.action+' control success')
    except Exception as e:
        return createReturn(code=500, val='gluefs.py editGlueFs error :'+str(e))

# gluefs 삭제
def deleteGlueFs(args):
    try:
        json_data = openClusterJson()
        # 디렉토리 비우는 작업, 모든 호스트 마운트 해제 및 /etc/fstab 삭제
        path = mouontGlueFs(args)
        for host in json_data:
            ssh('-o', 'StrictHostKeyChecking=no', host, 'rm', '-rf', path+'/*').stdout.decode().splitlines()
            ssh('-o', 'StrictHostKeyChecking=no', host, 'umount', '-f', '-l', path).stdout.decode().splitlines()
            ssh('-o', 'StrictHostKeyChecking=no', host, 'sed', '-i', '/ceph/d', '/etc/fstab').stdout.decode().splitlines()
        return createReturn(code=200, val='gluefs service '+args.action+' control success')
    except Exception as e:
        return createReturn(code=500, val='gluefs.py deleteGlueFs error :'+e)

# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    # parser 생성
    parser = createArgumentParser()
    # input 파싱
    args = parser.parse_args()
    # 파싱된 argument 출력

    verbose = (5 - args.verbose) * 10

    # 로깅을 위한 logger 생성, 모든 인자에 default 인자가 있음.
    logger = createLogger(loggername='gluefs', verbosity=verbose, log_file='gluefs.log',
                          file_log_level=logging.ERROR)

    # 실제 로직 부분 호출 및 결과 출력
    if (args.action) == 'config':
        print(configFs(args))
    elif (args.action) == 'destroy':
        print(destroyFs(args))
    elif (args.action) == 'status':
        print(statusFs(args))  
    elif (args.action) == 'detail':
        print(detailFs(args))
    elif (args.action) == 'list':
        print(listFs(args))
    elif (args.action) == 'quota':
        print(quotaFs(args))
    elif (args.action) == 'mount':
        print(mouontGlueFs(args))
    elif (args.action) == 'edit':
        print(editGlueFs(args))
    elif (args.action) == 'delete':
        print(deleteGlueFs(args))
    
    
