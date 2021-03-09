#!/usr/bin/python3
#-*- coding: utf-8 -*-

import argparse
import json
import sys
from subprocess import call
from subprocess import check_output


def parseArgs():
    parser = argparse.ArgumentParser(
        description='Pacemaker cluster')
    
    parser.add_argument('action', choices=['config','create','enable', 'disable','move','cleanup'])
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

        call(['echo', 'pcs', 'host', 'auth', '-u', 'hacluster', '-p', 'password', *hostnames])
        call(['echo', 'pcs', 'cluster', 'setup', self.cluster_name, *hostnames])
        call(['echo', 'pcs', 'cluster', 'start', '--all'])
        call(['echo', 'systemctl', 'enable', '--now', 'corosync.service'])
        call(['echo', 'systemctl', 'enable', '--now', 'pacemaker.service'])
        call(['echo', 'pcs', 'property', 'set', 'stonith-enabled=false'])


    def createResource(self, resource_name, xml_path):
        self.resource_name = resource_name
        self.xml_path = xml_path

        call(['echo', 'pcs', 'resource', 'create', self.resource_name, 'VirtualDomain', 'hypervisor="qemu:///system"', 
        'config=', self.xml_path, 'migration_transport=ssh', 'op', 'start', 'timeout="120s"', 'op', 'monitor', 'timeout="30"', 
        'nterval="10"', 'meta', 'allow-migrate="true"', 'priority="100"'])

    def enableResource(self, resource_name):
        self.resource_name = resource_name
        
        call(['echo', 'pcs', 'resource', 'cleanup', resource_name])
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
        
        call(['echo', 'pcs', 'resource', 'cleanup', self.resource_name])
        
        
    def statusResource(self, resource_name):
        self.resource_name = resource_name
        
        call(['echo', 'pcs', 'status', 'resources', '|grep', self.resource_name])


a = Pacemaker()
s = a.statusResource('dd')
d = check_output(s)
