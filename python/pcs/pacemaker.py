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


def parseArgs():
    parser = argparse.ArgumentParser(description='Pacemaker cluster for Cloud Center VM',
                                     epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')
    
    parser.add_argument('action', choices=['config', 'create', 'enable', 'disable', 'move', 'cleanup', 'status', 'remove'], help='choose one of the actions')
    parser.add_argument('--cluster', metavar='name', type=str, help='The name of the cluster to be created')
    parser.add_argument('--hosts', metavar='name', type=str, nargs='*', help='Hostnames to form a cluster')
    parser.add_argument('--resource', metavar='name', type=str, help='The name of the resource to be created')
    parser.add_argument('--xml', metavar='name', type=str, help='Cloud Center VM\'s xml file PATH')
    parser.add_argument('--target', metavar='name', type=str, help='Target hostname to migrate Cloud Center VM')
    return parser.parse_args()

class Pacemaker:
    def __init__(self):
        self.cluster_name = None
        self.hostnames = []
        self.resource_name = None
        self.xml_path = None
        self.target_host = None
    
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


    def enableResource(self, resource_name):
        self.resource_name = resource_name
        
        pcs('resource', 'cleanup', resource_name)
        pcs('resource', 'enable', self.resource_name)
        
        ret = createReturn(code=200, val='enable')
        print(json.dumps(json.loads(ret), indent=4))

        return ret


    def disableResource(self, resource_name):
        self.resource_name = resource_name
        
        pcs('resource', 'disable', self.resource_name)
        
        ret = createReturn(code=200, val='disable')
        print(json.dumps(json.loads(ret), indent=4))

        return ret


    def moveResource(self, resource_name, target_host):
        self.resource_name = resource_name
        self.target_host = target_host
        current_host = None

        xml = pcs('status', 'xml').stdout.decode()
        soup = BeautifulSoup(xml, 'lxml')
        soup_nodes = soup.find('nodes').select('node')
        soup_resource = soup.select_one(f'#{self.resource_name}')

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


    def cleanupResource(self, resource_name):
        self.resource_name = resource_name
        
        pcs('resource', 'cleanup', self.resource_name)
        
        ret = createReturn(code=200, val='cleanup')
        print(json.dumps(json.loads(ret), indent=4))

        return ret


    def removeResource(self, resource_name):
        self.resource_name = resource_name
        
        pcs('resource', 'cleanup', self.resource_name)
        pcs('resource', 'disable', self.resource_name)
        pcs('resource', 'remove', self.resource_name)
        pcs('resource', 'refresh')
        
        ret = createReturn(code=200, val='remove')
        print(json.dumps(json.loads(ret), indent=4))

        return ret
    
        
    def statusResource(self, resource_name):
        self.resource_name = resource_name
        
        resource = []
        res={}
        nodes = []
        node_list = []
        current_host = None

        xml = pcs('status', 'xml').stdout.decode()
        soup = BeautifulSoup(xml, 'lxml')
        soup_nodes = soup.find('nodes').select('node')
        soup_resource = soup.select_one(f'#{self.resource_name}')

        if soup_resource['nodes_running_on'] == '1':
            current_host = soup.select_one(f'#{self.resource_name}').select_one("node")['name']
 
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
        res['resource'] = soup_resource['id']
        resource.append(res)

        ret_val = {'clustered_host':node_list, 'started':current_host, 'active': res_active, 'blocked': res_blocked, 'failed': res_failed}
        ret = createReturn(code=200, val=ret_val)
        print(json.dumps(json.loads(ret), indent=4))

        return ret