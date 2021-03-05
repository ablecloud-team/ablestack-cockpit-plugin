#!/usr/bin/python3
# -*- coding: utf-8 -*-

import json
from subprocess import call

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

        call(['echo', 'pcs', 'host', 'auth', '-u', 'hacluster', '-p', 'password', *hostnames])
        call(['echo', 'pcs', 'cluster', 'setup', self.cluster_name, *hostnames])
        call(['echo', 'pcs', 'cluster', 'start', '--all'])
        call(['echo', 'systemctl', 'enable', 'corosync.service'])
        call(['echo', 'systemctl', 'enable', 'pacemaker.service'])
        call(['echo', 'pcs', 'property', 'set', 'stonith-enabled=false'])

        # print ('pcs host auth -u hacluster -p,', password, *hostnames)
        # print ('pcs cluster setup --name', cluster_name, *hostnames)
        # print ('pcs cluster start --all')
        # print ('systemctl enable corosync.service')
        # print ('systemctl enable pacemaker.service')
        # print ('pcs property set stonith-enabled=false')

    def makeResource(self, resource_name, xml_path):
        self.resource_name = resource_name
        self.xml_path = xml_path

        call(['echo', 'pcs', 'resource', 'create', self.resource_name, 'VirtualDomain', 'hypervisor="qemu:///system"', 
        'config=', self.xml_path, 'migration_transport=ssh', 'op', 'start', 'timeout="120s"', 'op', 'monitor', 'timeout="30"', 
        'nterval="10"', 'meta', 'allow-migrate="true"', 'priority="100"'])

    def enableResource(self, resource_name):
        self.resource_name = resource_name
        # call(['echo', 'pcs', 'resource', 'failcount', 'reset', resource_name])
        # call(['echo', 'pcs', 'resource', 'cleanup', resource_name])
        call(['echo', 'pcs', 'resource', 'enable', self.resource_name])

    def disableResource(self, resource_name):
        self.resource_name = resource_name
        call(['echo', 'pcs', 'resource', 'disable', self.resource_name])

    def moveResource(self, resource_name, target_host):
        self.resource_name = resource_name
        self.target_host = target_host
        call(['echo', 'pcs', 'resource', 'move', self.resource_name, self.target_host])

    def cleanupResource(self, resource_name):
        self.resource_name = resource_name
        call(['echo', 'pcs', 'resource', 'failcount', 'reset', self.resource_name])
        call(['echo', 'pcs', 'resource', 'cleanup', self.resource_name])


a = Pacemaker()
a.hostnames = ['host1', 'host2', 'host3']
# print('======================================== configCluster ========================================')
# a.configCluster('cloudcenter_cluster', *a.hostnames)
# print('======================================== makeResource ========================================')
# a.makeResource('cloudcenter_res', '/opt/ablestack/cloudcenter.xml')
# print('======================================== enableResource ========================================')
# a.enableResource('cloudcenter_res')
# print('======================================== disableResource ========================================')
# a.disableResource('cloudcenter_res')
# print('======================================== moveResource ========================================')
# a.moveResource('cloudcenter_res', a.hostnames[2])
# print('======================================== cleanupResource ========================================')
# a.cleanupResource('cloudcenter_res')