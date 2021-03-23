'''
Copyright (c) 2021 ABLECLOUD Co. Ltd

이 파일은 pcs를 구성하고 시작, 정지 등의 기능을 수행할 수 있는 함수를 정의합니다.
최초 작성일 : 2021. 03. 19
'''

#!/usr/bin/python3
# -*- coding: utf-8 -*-

import argparse
import sys
import json
import lxml

from ablestack import *
from sh import pcs
from sh import systemctl
from bs4 import BeautifulSoup

'''
함수명 : parseArgs
이 함수는 python library argparse를 시용하여 함수를 실행될 때 필요한 파라미터를 입력받고 파싱하는 역할을 수행합니다.
예를들어 action을 요청하면 해당 action일 때 요구되는 파라미터를 입력받고 해당 코드를 수행합니다.
'''

def parseArgs():
    parser = argparse.ArgumentParser(description='Pacemaker cluster for Cloud Center VM',
                                     epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')
    
    parser.add_argument('action', choices=['config', 'create', 'enable', 'disable', 'move', 'cleanup', 'status', 'remove', 'destroy'], help='choose one of the actions')
    parser.add_argument('--cluster', metavar='name', type=str, help='The name of the cluster to be created')
    parser.add_argument('--hosts', metavar='name', type=str, nargs='*', help='Hostnames to form a cluster')
    parser.add_argument('--resource', metavar='name', type=str, help='The name of the resource to be created')
    parser.add_argument('--xml', metavar='name', type=str, help='Cloud Center VM\'s xml file PATH')
    parser.add_argument('--target', metavar='name', type=str, help='Target hostname to migrate Cloud Center VM')
    return parser.parse_args()

'''
클래스명 : Pacemaker
이 클래스에는 pcs를 구성하거나 조작하기 위한 기능이 함수별로 정의되어 있습니다.
'''
class Pacemaker:
    # 함수명 : __init__
    # 주요 기능 : 클래스에서 사용하는 변수 초기화
    def __init__(self):
        self.cluster_name = None
        self.hostnames = []
        self.resource_name = None
        self.xml_path = None
        self.target_host = None
    
    # 함수명 : configCluster
    # 주요 기능 : pcs cluster 구성
    def configCluster(self, cluster_name, *hostnames):
        self.cluster_name = cluster_name
        self.hostnames = hostnames

        #pcs cluster 구성 command
        pcs('host', 'auth', '-u', 'hacluster', '-p', 'password', *self.hostnames)
        pcs('cluster', 'setup', self.cluster_name, *self.hostnames)
        pcs('cluster', 'start', '--all')
        systemctl('enable', '--now', 'corosync.service')
        systemctl('enable', '--now', 'pacemaker.service')
        pcs('property', 'set', 'stonith-enabled=false')

        ret_val = {'cluster name :':self.cluster_name, 'hosts': self.hostnames}
        ret = createReturn(code=200, val=ret_val)
        print(json.dumps(json.loads(ret), indent=4))

        return ret       

    # 함수명 : createResource
    # 주요 기능 : pcs resource 생성
    def createResource(self, resource_name, xml_path):
        self.resource_name = resource_name
        self.xml_path = xml_path

        #pcs resource 생성 command
        pcs('resource', 'create', self.resource_name, 'VirtualDomain', 'hypervisor=qemu:///system', 
        f'config={self.xml_path}', 'migration_transport=ssh',
        'meta', 'allow-migrate=true', 'priority=100',
        'op', 'start', 'timeout=120s',
        'op', 'stop', 'timeout=120s',
        'op', 'monitor', 'timeout=30', 'interval=10')
        
        ret_val = {'resource name :':self.resource_name, 'hypervisor':'qemu:///system', 'config':self.xml_path, 'migration_transport':'ssh'}
        ret = createReturn(code=200, val=ret_val)
        print(json.dumps(json.loads(ret), indent=4))

        return ret

    # 함수명 : enableResource
    # 주요 기능 : pcs resource 시작
    def enableResource(self, resource_name):
        self.resource_name = resource_name
        
        pcs('resource', 'cleanup', resource_name)
        pcs('resource', 'enable', self.resource_name)
        
        ret = createReturn(code=200, val='enable')
        print(json.dumps(json.loads(ret), indent=4))

        return ret

    # 함수명 : disableResource
    # 주요 기능 : pcs resource 정지
    def disableResource(self, resource_name):
        self.resource_name = resource_name
        
        pcs('resource', 'disable', self.resource_name)
        
        ret = createReturn(code=200, val='disable')
        print(json.dumps(json.loads(ret), indent=4))

        return ret

    # 함수명 : moveResource
    # 주요 기능 : pcs resource 이동(마이그레이션)
    def moveResource(self, resource_name, target_host):
        self.resource_name = resource_name
        self.target_host = target_host
        current_host = None

        xml = pcs('status', 'xml').stdout.decode()
        soup = BeautifulSoup(xml, 'lxml')
        soup_nodes = soup.find('nodes').select('node')
        soup_resource = soup.select_one(f'#{self.resource_name}')
        
        # pcs resource가 실행 중인 경우
        if soup_resource['nodes_running_on'] == '1':
            current_host = soup.select_one(f'#{self.resource_name}').select_one("node")['name']

        if current_host == self.target_host:
            # print('현재 호스트로 마이그레이션 할 수 없습니다.')
            ret = createReturn(code=500, val='cannot be migrated to the same host.')
            print(json.dumps(json.loads(ret), indent=4))

            sys.exit(1)

        elif current_host == None:
            # print('정지 상태에서는 다른 호스트로 마이그레이션 할 수 없습니다.')
            ret = createReturn(code=501, val='Migration is not possible while stopped.')
            print(json.dumps(json.loads(ret), indent=4))

            sys.exit(1)

        else:
            pcs('resource', 'move', self.resource_name, self.target_host)
        
            ret_val = {'current host':current_host, 'target host':self.target_host}
            ret = createReturn(code=200, val=ret_val)
            print(json.dumps(json.loads(ret), indent=4))

        return ret

    # 함수명 : clenaupResource
    # 주요 기능 : pcs resource를 클린업 하는 기능 (pcs resoure 상태를 초기화)
    def cleanupResource(self, resource_name):
        self.resource_name = resource_name
        
        pcs('resource', 'cleanup', self.resource_name)
        
        ret = createReturn(code=200, val='cleanup')
        print(json.dumps(json.loads(ret), indent=4))

        return ret

    # 함수명 : removeResource
    # 주요 기능 : 현재 resource를 삭제하는 기능
    def removeResource(self, resource_name):
        self.resource_name = resource_name
        
        try:
            pcs('resource', 'cleanup', self.resource_name)
            pcs('resource', 'disable', self.resource_name)
            pcs('resource', 'remove', self.resource_name)
            pcs('resource', 'refresh')
            
            ret = createReturn(code=200, val='remove')
            print(json.dumps(json.loads(ret), indent=4))
            
        except:
            ret = createReturn(code=400, val='resource not found.')
            print(json.dumps(json.loads(ret), indent=4))

        return ret
    
    # 함수명 : destroyCluster
    # 주요 기능 : 현재 cluster를 삭제하는 기능
    def destroyCluster(self):
        try:
            pcs('cluster', 'destroy', '--all')
            
            ret = createReturn(code=200, val='destroy')
            print(json.dumps(json.loads(ret), indent=4))
        except:
            ret = createReturn(code=400, val='cluster not found.')
            print(json.dumps(json.loads(ret), indent=4))
            
        return ret
    
    # 함수명 : statusResource
    # 주요 기능 : 현재 resource의 클러스터 호스트 정보, resource 리소스 실행 여부, block이나 fail 상태 여부 등을 조회하는 기능
    #          이 기능은 두개 이상의 리소스를 가진 클러스터에서도 조회 할 수 있음
    def statusResource(self, resource_name):
        self.resource_name = resource_name
        
        resource = []
        res={}
        nodes = []
        node_list = []
        current_host = None
        
        try:
            xml = pcs('status', 'xml').stdout.decode()
            soup = BeautifulSoup(xml, 'lxml')
            soup_nodes = soup.find('nodes').select('node')
            soup_resource = soup.select_one(f'#{self.resource_name}')
        except:
            ret = createReturn(code=400, val='cluster is not configured.')
            print(json.dumps(json.loads(ret), indent=4))
            sys.exit(1)
            
        try:
            if soup_resource['nodes_running_on'] == '1':
                current_host = soup.select_one(f'#{self.resource_name}').select_one("node")['name']
        except:
            ret = createReturn(code=400, val='resource not found.')
            print(json.dumps(json.loads(ret), indent=4))
            sys.exit(1)
 
        for soup_node in soup_nodes:
            node = {}
            node['host'] = soup_node['name']
            node['online'] = soup_node['online']
            node['resources_running'] = soup_node['resources_running']
            nodes.append(node)

        for i in range(0, len(nodes)):
            clustered_hosts = nodes[i].get('host')
            node_list.append(clustered_hosts)

        res_active = res['active'] = soup_resource['active']
        res_blocked = res['blocked'] = soup_resource['blocked']
        res_failed = res['failed'] = soup_resource['failed']
        res_role = res['role'] = soup_resource['role']
        res['resource'] = soup_resource['id']
        resource.append(res)

        ret_val = {'clustered_host':node_list, 'started':current_host, 'role':res_role, 'active': res_active, 'blocked': res_blocked, 'failed': res_failed}
        ret = createReturn(code=200, val=ret_val)
        print(json.dumps(json.loads(ret), indent=4))

        return ret