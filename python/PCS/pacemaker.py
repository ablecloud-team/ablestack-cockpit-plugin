#!/usr/bin/python3
# -*- coding: utf-8 -*-

import argparse
from subprocess import check_output
from able_return import *
from sh import pcs
from sh import systemctl
import sys

def parseArgs():
    parser = argparse.ArgumentParser(description='Pacemaker cluster',
                                     epilog='copyrightⓒ 2021 All rights reserved by ABLECLOUD™')
    
    parser.add_argument('action', choices=['config', 'create', 'enable', 'disable', 'move', 'cleanup', 'status'])
    parser.add_argument('--cluster', metavar='name', type=str, help='create cluster name')
    #parser.add_argument('--hosts', metavar='name', type=str, help='cluster host name')
    parser.add_argument('hosts', metavar='name', type=str, help='cluster host name', nargs='+')
    parser.add_argument('--resource', metavar='name', type=str, help='pcs resource name')
    parser.add_argument('--xml', metavar='name', type=str, help='xml path')
    parser.add_argument('--target', metavar='name', type=str, help='move target host name')
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

        ret_val = {'cluster name :':self.cluster_name, 'hosts': *self.hostnames}
        ret = createReturn(code=200, val=ret_val)
        print(json.dumps(json.loads(ret), indent=4))

        return ret       


    def createResource(self, resource_name, xml_path):
        self.resource_name = resource_name
        self.xml_path = xml_path

        pcs('resource', 'create', self.resource_name, 'VirtualDomain', 'hypervisor="qemu:///system"', 
        'config=', self.xml_path, 'migration_transport=ssh', 'op', 'start', 'timeout="120s"', 'op', 'monitor', 'timeout="30"', 
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

        status_output = pcs('status').stdout.decode().splitlines()
        nodes_output = pcs('status', 'nodes', 'corosync').stdout.decode().splitlines()

        for line in status_output:
            if self.resource_name in line:
                current_host = line.split(' ')[-1]
                status_pcs = line.split(' ')[-2]

        for line in nodes_output:
            if "Online" in line:
                online_host = line.split(':')[-1]
            if "Offline" in line:
                offline_host = line.split(':')[-1]
        corosync_hosts = (online_host + offline_host).strip()

        ret_val = {'status':status_pcs, 'started':current_host, 'hosts': corosync_hosts}
        ret = createReturn(code=200, val=ret_val)
        print(json.dumps(json.loads(ret), indent=4))

        return ret