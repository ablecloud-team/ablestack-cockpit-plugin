#!/usr/bin/python3
#-*- coding: utf-8 -*-

import argparse
from subprocess import check_output
from subprocess import run
from able_return import *

def parseArgs():
    parser = argparse.ArgumentParser(description='Pacemaker cluster')
    
    parser.add_argument('action', choices=['config', 'create', 'enable', 'disable', 'move', 'cleanup', 'status'])
    parser.add_argument('--cluster', metavar='name', type=str,
                        help='create cluster name')
    parser.add_argument('--hosts', metavar='name', type=str,
                        help='cluster host name')
    parser.add_argument('--resource', metavar='name', type=str,
                        help='pcs resource name') 
    parser.add_argument('--xml', metavar='name', type=str,
                        help='xml path')
    parser.add_argument('--target', metavar='name', type=str,
                        help='move target host name')
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

        run(['pcs', 'host', 'auth', '-u', 'hacluster', '-p', 'password', *hostnames])
        run(['pcs', 'cluster', 'setup', self.cluster_name, *hostnames])
        run(['pcs', 'cluster', 'start', '--all'])
        run(['systemctl', 'enable', '--now', 'corosync.service'])
        run(['systemctl', 'enable', '--now', 'pacemaker.service'])
        run(['pcs', 'property', 'set', 'stonith-enabled=false'])

        ret_val = {'cluster name :':self.cluster_name, 'hosts': hostnames}
        ret = createReturn(code=200, val=ret_val)
        print(json.dumps(json.loads(ret), indent=4))

        return ret       


    def createResource(self, resource_name, xml_path):
        self.resource_name = resource_name
        self.xml_path = xml_path

        run(['pcs', 'resource', 'create', self.resource_name, 'VirtualDomain', 'hypervisor="qemu:///system"', 
        'config=', self.xml_path, 'migration_transport=ssh', 'op', 'start', 'timeout="120s"', 'op', 'monitor', 'timeout="30"', 
        'nterval="10"', 'meta', 'allow-migrate="true"', 'priority="100"'])
        
        ret_val = {'resource name :':self.resource_name, 'hypervisor':'qemu:///system', 'config':self.xml_path, 'migration_transport':'ssh'}
        ret = createReturn(code=200, val=ret_val)
        print(json.dumps(json.loads(ret), indent=4))

        return ret

    def enableResource(self, resource_name):
        self.resource_name = resource_name
        
        run(['pcs', 'resource', 'cleanup', resource_name])
        run(['pcs', 'resource', 'enable', self.resource_name])
        
        ret = createReturn(code=200, val='enable')
        print(json.dumps(json.loads(ret), indent=4))

        return ret

    def disableResource(self, resource_name):
        self.resource_name = resource_name
        
        run(['pcs', 'resource', 'disable', self.resource_name])
        
        ret = createReturn(code=200, val='disable')
        print(json.dumps(json.loads(ret), indent=4))

        return ret

    def moveResource(self, resource_name, target_host):
        self.resource_name = resource_name
        self.target_host = target_host
        res_output = check_output(['pcs', 'status', 'resources'], universal_newlines=True)
        
        current_host = res_output.split()[-1].strip('()') # current host
        
        run(['pcs', 'resource', 'move', self.resource_name, self.target_host])
        ret_val = {'current host :':current_host, 'target host':self.target_host}
        
        ret = createReturn(code=200, val=ret_val)
        print(json.dumps(json.loads(ret), indent=4))

        return ret

    def cleanupResource(self, resource_name):
        self.resource_name = resource_name
        
        run(['pcs', 'resource', 'cleanup', self.resource_name])
        
        ret = createReturn(code=200, val='cleanup')
        print(json.dumps(json.loads(ret), indent=4))

        return ret
        
        
    def statusResource(self):
        
        try:
            res_output = check_output(['pcs', 'status', 'resources'], universal_newlines=True)
            nodes_output = check_output(['pcs', 'status', 'nodes'], universal_newlines=True)
        
            res_output.split()[-2] # Started / Stop
            res_output.split()[-1].strip('()') # host
            nodes_output.splitlines()[1].split(':')[-1] # online
            nodes_output.splitlines()[5].split(':')[-1] # offline
            nodes = (nodes_output.splitlines()[1].split(':')[-1] + nodes_output.splitlines()[5].split(':')[-1]).strip()
            ret_val = {'status':res_output.split()[-2], 'started':res_output.split()[-1].strip('()'), 'hosts': nodes}
            ret = createReturn(code=200, val=ret_val)
            print(json.dumps(json.loads(ret), indent=4))

        except Exception as e:
            ret = createReturn(code=500, val='ERROR')
            print ('EXCEPTION')

        return ret