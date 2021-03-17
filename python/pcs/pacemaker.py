#!/usr/bin/python3
# -*- coding: utf-8 -*-

import argparse
from ablestack import *
from sh import pcs
from sh import systemctl
import sys
import json
from bs4 import BeautifulSoup
import lxml

def parseArgs():
    parser = argparse.ArgumentParser(description='Pacemaker cluster for Cloud Center VM',
                                     epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')
    
    parser.add_argument('action', choices=['config', 'create', 'enable', 'disable', 'move', 'cleanup', 'status'], help='choose one of the actions')
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

        pcs('resource', 'create', self.resource_name, 'VirtualDomain', 'hypervisor="qemu:///system"', 
        f'config={self.xml_path}', 'migration_transport=ssh', 'op', 'start', 'timeout="120s"', 'op', 'monitor', 'timeout="30"', 
        'interval="10"', 'meta', 'allow-migrate="true"', 'priority="100"')
        
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
        res_output = pcs('status', 'resources').stdout.decode().splitlines()
        for line in res_output:
            if self.resource_name in line:
                current_host = line.split(' ')[-1]
        
        if current_host == self.target_host:
            # print('현재 호스트로 마이그레이션 할 수 없습니다.')
            ret = createReturn(code=500, val='FAIL')
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
        
        
    def statusResource(self, resource_name):
        self.resource_name = resource_name

        xml = pcs('status', 'xml').stdout.decode()
        soup = BeautifulSoup(xml, 'lxml')
        soup_resource = soup.select('resource')
        soup_nodes = soup.find('nodes').select('node')

        resources = []
        nodes = []
        host_list = []
        
        for soup_node in soup_nodes:
            node = {}
            node['host'] = soup_node['name']
            node['online'] = soup_node['online']
            node['resource_running'] = soup_node['resources_running']
            nodes.append(node)

        for soup_res in soup_resource:
            res = {}
            res['active'] = soup_res['active']
            res['blocked'] = soup_res['blocked']
            res['failed'] = soup_res['failed']
            res['resource'] = soup_res['id']
            resources.append(res)

        for i in range(0, len(nodes)):
            clustered_hosts = nodes[i].get('host')
            host_list.append(clustered_hosts)
            if nodes[i].get('resource_running') == '1':
                current_host = (nodes[i].get('host'))
            else:
                current_host = "false"

        for i in range(0, len(resources)):
            if resources[i].get('resource') == self.resource_name:
                res_active = resources[i].get('active')
                res_blocked = resources[i].get('blocked')
                res_failed = resources[i].get('failed')

                ret_val = {'clustered_host':host_list, 'started':current_host, 'active': res_active, 'blocked': res_blocked, 'failed': res_failed}
                ret = createReturn(code=200, val=ret_val)
                print(json.dumps(json.loads(ret), indent=4))
            else:
                ret = createReturn(code=500, val='Resource not found.')
                print(json.dumps(json.loads(ret), indent=4))

        return ret

        """
        기존 코드

        # self.resource_name = resource_name
        # status_list = {'Starting':'200', 'Started':'200', 'Stopping':'201', 'Stopped':'201', 'FAILED':'500'}
        # status_output = pcs('status').stdout.decode().splitlines()
        # nodes_output = pcs('status', 'nodes', 'corosync').stdout.decode().splitlines()
        # for line in status_output:
        #     if self.resource_name in line:
        #         current_host = line.split(' ')[-1]
        #         status_pcs = line.split(' ')[-2]
        # for line in nodes_output:
        #     if "Online" in line:
        #         online_host = line.split(':')[-1]
        #     if "Offline" in line:
        #         offline_host = line.split(':')[-1]
        # clustered_hosts = (online_host + offline_host).strip()
        # if status_pcs in status_list.keys():
        #     ret_val = {'status':status_pcs, 'started':current_host.strip('()'), 'hosts': corosync_hosts}
        #     ret = createReturn(code=status_list.get(status_pcs), val=ret_val)
        #     print(json.dumps(json.loads(ret), indent=4))
        # elif status_pcs not in status_list.keys():   
        #     ret_val = {'status':'Error', 'started':'Unknown', 'hosts': 'Unknown'}
        #     ret = createReturn(code=500, val=ret_val)
        #     print(json.dumps(json.loads(ret), indent=4))
        # return ret
        """